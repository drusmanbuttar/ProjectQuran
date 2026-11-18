"""Read public Quran.com QPC Hafs word records; require complete, ordered coverage."""
import csv
import hashlib
import json
import time
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

OUT = Path('edition-audit')
OUT.mkdir(exist_ok=True)
FONT = 'https://verses.quran.foundation/fonts/quran/hafs/uthmanic_hafs/UthmanicHafs1Ver18.woff2'
BASES = ['https://api.quran.com/api/v4', 'https://api.qurancdn.com/api/qdc']
PARAMS = 'words=true&word_fields=text_qpc_hafs&per_page=50'
def get(url):
    for attempt in range(4):
        try:
            with urlopen(Request(url, headers={'User-Agent':'Pockett-Quran-Edition-Audit/1.0 (public source validation)'}), timeout=40) as r:
                return r.read()
        except (HTTPError, URLError) as e:
            if (isinstance(e, HTTPError) and e.code not in [429,500,502,503,504]) or attempt==3:
                raise
            time.sleep(min(25, int(e.headers.get('Retry-After', 2**attempt))) if isinstance(e, HTTPError) else 2**attempt)
def hashtext(t):
    return hashlib.sha256(t.encode('utf8')).hexdigest()
def bychapter(base, s, p):
    return json.loads(get(f'{base}/verses/by_chapter/{s}?{PARAMS}&page={p}'))
def word_text(word):
    return word.get('text_qpc_hafs')
def extract(v):
    words=v['words']
    assert [w['position'] for w in words]==list(range(1,len(words)+1))
    assert words[-1]['char_type_name']=='end'
    assert all(w['char_type_name']=='word' and word_text(w) and word_text(w)==word_text(w).strip() for w in words[:-1])
    return ' '.join(word_text(w) for w in words[:-1])
def main():
    legacy=json.loads(Path('dist/arabic.json').read_text())
    base=None
    for option in BASES:
        try:
            sample=json.loads(get(f'{option}/verses/by_key/2:38?{PARAMS}'))['verse']
            fields={k:v for k,v in sample['words'][6].items() if k in ('text','text_qpc_hafs','qpc_uthmani_hafs','position')}
            print(option,fields,flush=True)
            if word_text(sample['words'][6])=='مِّنِّي':
                extract(sample)
                base=option
                break
        except (KeyError, ValueError, HTTPError, URLError, AssertionError) as err:
            print(option,type(err).__name__,str(err)[:160],flush=True)
    if not base:
        raise RuntimeError('No public endpoint returned the verified Quran.com QPC Hafs field at 2:38.')
    def chapter(s):
        n=len(legacy[str(s)])
        result={}
        for p in range(1,(n+49)//50+1):
            response=bychapter(base,s,p)
            for v in response['verses']:
                key=f'{s}:{len(result)+1}'
                assert v['verse_key']==key and v['verse_number']==len(result)+1, (key,v['verse_key'])
                result[key]=extract(v)
        assert len(result)==n, (s,len(result),n)
        return result
    with ThreadPoolExecutor(max_workers=3) as pool:
        chapters=list(pool.map(chapter,range(1,115)))
    ref={k:t for ch in chapters for k,t in ch.items()}
    assert len(ref)==6236 and ref['2:38']==extract(sample)
    (OUT/'qpc-words.json').write_text(json.dumps(ref,ensure_ascii=False,separators=(',',':')))
    with (OUT/'comparison.csv').open('w',newline='') as out:
        rows=csv.writer(out)
        rows.writerow(['verse_key','app_sha256','qurancom_sha256','exact_match'])
        for k,t in ref.items():
            s,i=k.split(':')
            old=legacy[s][int(i)-1]['text']
            rows.writerow([k,hashtext(old),hashtext(t),int(old==t)])
    font=get(FONT)
    assert font[:4]==b'wOF2'
    (OUT/'UthmanicHafs1Ver18.woff2').write_bytes(font)
    metadata={'source':base,'fields':PARAMS,'font':FONT,'font_sha256':hashlib.sha256(font).hexdigest(),'references':len(ref),'qurancom_2_38':ref['2:38']}
    (OUT/'provenance.json').write_text(json.dumps(metadata,ensure_ascii=False,indent=2))
    print(metadata)
if __name__=='__main__':
    main()

