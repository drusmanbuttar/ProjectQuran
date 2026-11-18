"""Verify every public HTML verse against the selected Quran.com edition and translation bundles."""
import csv
import hashlib
import json
import time
from concurrent.futures import ThreadPoolExecutor
from html.parser import HTMLParser
from pathlib import Path
from urllib.request import urlopen

class ReaderPage(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.rows = {}
        self.verse = None
        self.language = None

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == 'article' and attrs.get('class') == 'verse':
            self.verse = int(attrs['id'].removeprefix('ayah-'))
            assert self.verse not in self.rows
            self.rows[self.verse] = {}
        if tag == 'p' and self.verse and attrs.get('lang') in ['ar','en','ur']:
            language = attrs['lang']
            if language not in self.rows[self.verse]:
                self.language = language
                self.rows[self.verse][language] = ''

    def handle_data(self, text):
        if self.language:
            self.rows[self.verse][self.language] += text

    def handle_endtag(self, tag):
        if tag == 'p':
            self.language = None
        elif tag == 'article':
            self.verse = None

source = json.loads(Path('edition-audit/qpc-words.json').read_text())
english, urdu = [json.loads(Path(f'dist/{name}.json').read_text()) for name in ('english','urdu')]
app = json.loads(Path('dist/arabic.json').read_text())
root = 'https://usmanbuttar.com/apps/pockett-quran/'

def check(surah):
    url = root if surah==1 else f'{root}surah/{surah}/'
    for attempt in range(3):
        try:
            with urlopen(url, timeout=30) as response:
                assert response.status==200
                html = response.read().decode('utf-8')
            break
        except OSError:
            if attempt==2:
                raise
            time.sleep(2**attempt)
    page = ReaderPage()
    page.feed(html)
    number = str(surah)
    assert list(page.rows)==list(range(1,len(app[number])+1)), number
    result=[]
    for ayah, data in page.rows.items():
        key = f'{surah}:{ayah}'
        assert data['ar']==app[number][ayah-1]['text']==source[key], key
        assert data['en']==english[number][ayah-1]['text'], key
        assert data['ur']==urdu[number][ayah-1]['text'], key
        result.append([key, hashlib.sha256(data['ar'].encode()).hexdigest(), True, True, True])
    return result

with ThreadPoolExecutor(max_workers=3) as pool:
    reports = list(pool.map(check,range(1,115)))
assert sum(map(len,reports))==len(source)==6236
with Path('edition-audit/live-website-verification.csv').open('w', newline='') as out:
    writer=csv.writer(out)
    writer.writerow(['ayah','qurancom_sha256','live_arabic_match','live_english_match','live_urdu_match'])
    for rows in reports:
        writer.writerows(rows)
print('LIVE PASS: 114 public pages, 6,236 exact Quran.com Arabic records and 12,472 aligned English and Urdu records.')

