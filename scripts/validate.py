"""Validate exact Quran source integrity, corpus structure, assets, and juz coverage."""
import json,re,hashlib
from pathlib import Path

root=Path(__file__).resolve().parents[1]
d=root/'dist'
load=lambda n:json.loads((d/n).read_text(encoding='utf-8'))
ar,en,ur,meta=[load(n+'.json') for n in ['arabic','english','urdu','metadata']]

# Pin the exact Tanzil Uthmani v1.1 source used to generate the app corpus.
source_path=root/'sources'/'tanzil'/'quran-uthmani-v1.1-2026.txt'
source_bytes=source_path.read_bytes()
git_blob_sha=hashlib.sha1(b'blob '+str(len(source_bytes)).encode()+b'\0'+source_bytes).hexdigest()
assert git_blob_sha=='52cd072bb3d0f7d3da978d0501130e526633963a',git_blob_sha
source_text=source_bytes.decode('utf-8').replace('\r\n','\n')
verse_text=source_text.split('\n# PLEASE DO NOT REMOVE OR CHANGE THIS COPYRIGHT BLOCK',1)[0].rstrip('\n')
source_verses=verse_text.splitlines()
assert len(source_verses)==6236,len(source_verses)

assert len(meta['chapters'])==114
count=0
cursor=0
for c in meta['chapters']:
 s=str(c['id']); expected=c['total_verses'];count+=expected
 for corpus in [ar,en,ur]:
  assert len(corpus[s])==expected,(s,len(corpus[s]),expected)
  for v,entry in enumerate(corpus[s],1):
   assert entry['chapter']==int(s) and entry['verse']==v and isinstance(entry['text'],str) and entry['text'].strip(),(s,v)
 for v,entry in enumerate(ar[s],1):
  expected_text=source_verses[cursor]
  assert entry['text']==expected_text,f'Arabic text mismatch at {s}:{v}'
  cursor+=1

assert count==6236 and cursor==6236
assert 'Tanzil Quran Text' in ar['_license']
assert 'Version 1.1' in ar['_license']

# Explicit regression checks for the tester-reported passage and verse segmentation.
assert ar['2'][37]['text']==source_verses[44]  # Al-Baqarah 2:38
assert ar['2'][37]['text'].startswith('قُلْنَا ٱهْبِطُوا۟ مِنْهَا جَمِيعًا')
assert ar['2'][0]['text'].endswith('الٓمٓ')

refs=[(s,v) for s in range(1,115) for v in range(1,len(ar[str(s)])+1)]
starts=[(j['sura'],j['aya']) for j in meta['indexes']['juzs']]
assert len(starts)==30 and starts==sorted(starts)
assert starts[0]==(1,1) and starts[-1]==(78,1)
covered=[]
for i,start in enumerate(starts):
 part=[r for r in refs if r>=start and (i==29 or r<starts[i+1])]
 assert part
 covered.extend(part)
assert covered==refs

manifest=load('manifest.webmanifest')
assert manifest['start_url']=='./' and manifest['scope']=='./'
for icon in manifest['icons']:
 assert (d/icon['src']).exists()

html=(d/'index.html').read_text(encoding='utf-8')
for path in re.findall(r'(?:src|href)="([^"#]+)"',html):
 if not path.startswith(('http','mailto')):
  assert (d/path).exists(),path

sw=(d/'sw.js').read_text(encoding='utf-8')
assets=re.search(r'const FILES=\[(.*?)\];',sw).group(1)
for asset in re.findall(r"'([^']+)'",assets):
 assert asset=='./' or (d/asset).exists(),asset

print('PASS: exact pinned Tanzil Arabic text for all 6,236 ayahs; 114 surahs; aligned English/Urdu rows; 30 complete non-overlapping juz; local assets and offline manifest.')
