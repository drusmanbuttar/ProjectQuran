"""Validate corpus structure, assets, and complete juz coverage."""
import json,re,hashlib
from pathlib import Path
root=Path(__file__).resolve().parents[1]; d=root/'dist'
load=lambda n:json.loads((d/n).read_text())
ar,en,ur,meta=[load(n+'.json') for n in ['arabic','english','urdu','metadata']]
assert len(meta['chapters'])==114
count=0
for c in meta['chapters']:
 s=str(c['id']); expected=c['total_verses'];count+=expected
 for corpus in [ar,en,ur]:
  assert len(corpus[s])==expected,(s,len(corpus[s]),expected)
  for v,entry in enumerate(corpus[s],1):
   assert entry['chapter']==int(s) and entry['verse']==v and isinstance(entry['text'],str) and entry['text'].strip(),(s,v)
assert count==6236
refs=[(s,v) for s in range(1,115) for v in range(1,len(ar[str(s)])+1)]
starts=[(j['sura'],j['aya']) for j in meta['indexes']['juzs']]
assert len(starts)==30 and starts==sorted(starts)
assert starts[0]==(1,1) and starts[-1]==(78,1)
covered=[]
for i,start in enumerate(starts):
 part=[r for r in refs if r>=start and (i==29 or r<starts[i+1])];assert part;covered.extend(part)
assert covered==refs
manifest=load('manifest.webmanifest')
assert manifest['start_url']=='./' and manifest['scope']=='./'
for icon in manifest['icons']:assert (d/icon['src']).exists()
html=(d/'index.html').read_text()
for path in re.findall(r'(?:src|href)="([^"#]+)"',html):
 if not path.startswith(('http','mailto')):assert (d/path).exists(),path
sw=(d/'sw.js').read_text()
assets=re.search(r'const FILES=\[(.*?)\];',sw).group(1)
for asset in re.findall(r"'([^']+)'",assets):
 assert asset=='./' or (d/asset).exists(),asset
assert 'Tanzil' in ar['_license']
print('PASS: 114 surahs, 6,236 aligned Arabic/English/Urdu verses, 30 complete non-overlapping juz, local assets, PWA icons and cache manifest.')
