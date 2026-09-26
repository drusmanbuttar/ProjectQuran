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
font=d/'fonts'/'AmiriQuran.ttf'; assert font.exists() and font.stat().st_size>100000
assert (d/'AMIRI-OFL.txt').exists()
css=(d/'style.css').read_text(); assert "font-family:'Amiri Quran'" in css and "fonts/AmiriQuran.ttf" in css
assert '1.0.2 light Quran-first visual system' in css, 'light UI theme missing'
assert '--accent:#18856f' in css and '--paper:#fafbf7' in css and 'backdrop-filter:blur(18px)' in css, 'light UI palette or glass navigation missing'
assert '#FAFBF7' in html, 'light browser theme color missing'
assert manifest['background_color']=='#FAFBF7' and manifest['theme_color']=='#FAFBF7', 'PWA light theme colors missing'
appjs=(d/'app.js').read_text()
assert 'MARKETING_VERSION = 1.0.2;' in (root/'ios/App/App.xcodeproj/project.pbxproj').read_text(), 'iOS marketing version must be 1.0.2'
assert 'CURRENT_PROJECT_VERSION = 16;' in (root/'ios/App/App.xcodeproj/project.pbxproj').read_text(), 'iOS build must be 16'
assert '"200011"' in (root/'android/app/build.gradle').read_text() and '"1.0.11"' in (root/'android/app/build.gradle').read_text(), 'Android beta version must be 1.0.11 / 200011'
assert 'class="mobile-nav"' in html and 'id="mobile-menu"' in html, 'mobile navigation missing'
assert 'data-mobile-more' in html and 'data-mobile-menu-close' in html, 'mobile overflow controls missing'
assert '<footer>Pockett Quran App - Muhammad Usman Buttar</footer>' in html, 'footer text is not the requested exact wording'
assert 'id="detail"' not in html and 'id="detail-body"' not in html, 'modal detail reader must be removed'
assert 'data-header-search' not in html and 'header-search' not in html, 'search bar still present in app shell'
assert 'searchForm' not in appjs and 'renderSearch' not in appjs, 'search UI logic still present'
assert 'maximum-scale=1' in html and 'user-scalable=no' in html and 'viewport-fit=cover' in html, 'mobile viewport is not locked to device width'
assert '1.0.2 build 16 mobile fit and gesture hardening' in css and 'overflow-x:hidden' in css and 'safe-area-inset-left' in css and '100dvh' in css, 'responsive mobile fit hardening missing'
assert 'function goBackInApp()' in appjs and "clientX<=28" in appjs and "dx>=72" in appjs, 'left-edge swipe-back behavior missing'
assert "'gesturestart','gesturechange','gestureend'" in appjs and "touches.length>1" in appjs, 'zoom prevention behavior missing'
assert '"zoomEnabled": false' in (root/'capacitor.config.json').read_text(), 'Capacitor zoom must be disabled'
assert '.mobile-nav{position:fixed' in css and 'safe-area-inset-bottom' in css, 'mobile navigation CSS missing'
assert "mobileMenu=$('#mobile-menu')" in appjs and "data-mobile-more" in appjs, 'mobile navigation behavior missing'
assert 'function fontSizeControl()' in appjs and 'readerControls()' in appjs and '${fontSizeControl()}' in appjs, 'Arabic size controls missing from reader'
assert 'href="#home" data-nav="home"' in html, 'homepage route missing from navigation'
assert 'function renderHome()' in appjs and "||'home'" in appjs, 'homepage renderer/default route missing'
assert 'class="home-actions"' in appjs and 'class="home-research-grid"' in appjs, 'homepage quick actions missing'
assert 'Read in context ↗' not in appjs and 'https://quran.com/${x.s}/${x.v}' not in appjs, 'external verse context link still present'
assert 'function lastReadCard()' in appjs and 'data-continue-reading' in appjs and 'data-last-read' in appjs, 'Continue Reading controls missing'
assert 'id="ayah"' in appjs and 'data-surah-step' in appjs, 'reader jump/navigation controls missing'
assert 'function pager(' not in appjs and 'data-page=' not in appjs, 'pagination UI must be removed from all ayah reading views'
assert 'function renderDetail()' in appjs and 'data-detail-back' not in appjs and 'Swipe from the left edge to go back' in appjs, 'swipe-back inline reader missing'
assert "dialog=$('#detail')" not in appjs and 'drawDetail()' not in appjs, 'legacy modal detail logic remains'
assert 'readerRefs.map(verse)' in appjs and 'detailRefs.map(verse)' in appjs and 'valid.map(verse)' in appjs, 'continuous reading missing from one or more ayah views'
assert 'Pickthall (1930)' in appjs and 'no English translation is treated' in appjs, 'English translation provenance note missing'
print('PASS: 114 surahs, 6,236 aligned Arabic/English/Urdu verses, 30 complete non-overlapping juz, local assets, PWA icons and cache manifest.')
