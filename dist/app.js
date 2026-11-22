import {prophets, topics, tracks} from './catalog.js';
import {icon} from './icons.js';
import {fold, parseRef, expandReferences, makeIndex, findPassages} from './library.js';

const $ = selector => document.querySelector(selector);
const main = $('#main');
const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const navItems = [['home','Home','home'],['index','Index','book'],['find','Find','find'],['study','Study','study'],['saved','Saved','saved']];
const studyItems = [
  ['prophets','Prophetic narratives','25 prophets','branch'],['topics','Themes & topics','30 categories','layers'],
  ['timeline','Research timelines','4 study paths','time'],['revelation','Revelation context','Meccan & Medinan','study']
];
const state = {view:'', rows:[], mode:'surah', id:1, readerReady:false, directory:'surah', filter:'', query:'', hits:null, limit:24};
let db, meta, index, related, scrollTimer, searchTimer, theme, language, arabicSize, saved, readingPin, recent;
let navigationSerial = 0;
function read(key, fallback) {
  try {return JSON.parse(localStorage.getItem('pq-'+key)) ?? fallback;} catch {return fallback;}
}
function write(key, value, silent=false) {
  try {localStorage.setItem('pq-'+key, JSON.stringify(value)); return true;}
  catch {if (!silent) toast('Your device could not save this change.'); return false;}
}
function toast(message) {
  const el = $('#toast'); el.textContent = message; el.classList.add('visible');
  clearTimeout(toast.timer); toast.timer = setTimeout(() => el.classList.remove('visible'), 2600);
}
function restore() {
  theme = read('theme','paper') === 'night' ? 'night' : 'paper';
  language = read('language','both');
  if (!['ar','ur','en','both'].includes(language)) language = 'both';
  arabicSize = Number(read('arabic-size',34));
  if (!Number.isFinite(arabicSize) || arabicSize < 28 || arabicSize > 52) arabicSize = 34;
  const stored = read('saved',[]);
  saved = new Set(Array.isArray(stored) ? stored.map(r => parseRef(r,db.ar)).filter(Boolean) : []);
  readingPin = parseRef(read('last-read',''),db.ar);
  const previous = read('recent',null);
  recent = previous && parseRef(previous.ref,db.ar) ? {ref:parseRef(previous.ref,db.ar),mode:previous.mode==='juz'?'juz':'surah'} : null;
  applyAppearance();
}
function applyAppearance() {
  document.documentElement.dataset.theme = theme;
  document.documentElement.style.setProperty('--arabic-size', arabicSize+'px');
  $('meta[name="theme-color"]').content = theme==='night'?'#101d1b':'#f8f6ef';
  const toggle = $('button[data-theme]'); toggle.innerHTML = icon(theme==='night'?'sun':'moon');
  toggle.setAttribute('aria-label',theme==='night'?'Switch to paper mode':'Switch to night mode');
}
function navigate(hash) {
  if (location.hash===hash) render();
  else location.hash=hash;
}
function urlFor(ref, mode='surah') {
  const row = index.byRef.get(ref);
  return '#reader?'+mode+'='+(mode==='juz'?row.juz:row.s)+'&ayah='+ref;
}
function position() {return recent || {ref:readingPin || '1:1',mode:'surah'};}
function nav(active) {
  const links = navItems.map(([id,name,symbol]) => `<a href="#${id}" ${active===id?'aria-current="page"':''}>${icon(symbol)}<span>${name}</span></a>`).join('');
  for (const el of document.querySelectorAll('.desktop-nav,.mobile-nav')) el.innerHTML = links;
}
function title(heading, note='') {
  return `<div class="page-title"><h1>${esc(heading)}</h1>${note?`<p>${esc(note)}</p>`:''}</div>`;
}
function studyLinks() {
  return '<div class="study-grid">'+studyItems.map(([id,name,sub,symbol])=>`<a href="#${id}"><span class="study-icon">${icon(symbol)}</span><span><strong>${name}</strong><small>${sub}</small></span>${icon('chevron')}</a>`).join('')+'</div>';
}
function home() {
  const {ref, mode} = position(), row = index.byRef.get(ref), c = meta.chapters[row.s-1];
  const returning = Boolean(recent || readingPin);
  return title('Reading room') + `<section class="folio" aria-label="Your reading place">
    <div class="folio-ornament" aria-hidden="true"></div>
    <div class="folio-copy"><div class="eyebrow">${icon('book')}${returning?'Continue reading':'Begin reading'}</div>
    <h2>${esc(c.transliteration)}</h2>
    <p>${esc(c.translation)}<span>·</span>Ayah ${row.v} of ${c.total_verses}</p>
    <a class="gold-button" href="${returning?urlFor(ref,mode):'#reader?surah=1'}">${returning?'Resume reading':'Open the Surah'} ${icon('arrow')}</a></div>
  </section>
  ${readingPin && readingPin!==ref?`<a class="pinline" href="${urlFor(readingPin)}">${icon('pin')} Reading pin · ${readingPin}${icon('arrow')}</a>`:''}
  <div class="home-columns"><section><div class="section-head"><h2>Quran index</h2><a href="#index">View all ${icon('arrow')}</a></div>
   ${tabs(true)}<div id="directory-list">${directoryRows(true)}</div></section>
   <section><div class="section-head"><h2>Connected study</h2></div>${studyLinks()}</section></div>`;
}
function tabs(compact=false) {
  return `<div class="segment" role="group" aria-label="Browse the Quran">${['surah','juz'].map(mode=>`<button type="button" data-directory="${mode}" aria-pressed="${state.directory===mode}">${mode==='surah'?'Surahs':'Juz'} <span>${mode==='surah'?'114':'30'}</span></button>`).join('')}</div>`;
}
function chapterRow(c) {
  return `<a class="index-row" href="#reader?surah=${c.id}"><span class="ordinal">${String(c.id).padStart(2,'0')}</span><span class="row-copy"><strong>${esc(c.transliteration)}</strong><small>${esc(c.translation)} · ${c.total_verses} ayat</small></span><span class="row-ar" lang="ar" dir="rtl">${esc(c.name)}</span></a>`;
}
function directoryRows(compact) {
  const q = compact?'':fold(state.filter);
  if (state.directory==='surah') {
    const list = meta.chapters.filter(c=>!q || c.id===Number(q) || [c.transliteration,c.name,c.translation].some(x=>fold(x).includes(q)));
    return (compact?list.slice(0,4):list).map(chapterRow).join('') || empty('No matching surah','Try a chapter number, Arabic name or English name.');
  }
  const list = meta.indexes.juzs.filter(j=>!q || String(j.index)===q || fold('Juz '+j.index)===q || fold(meta.chapters[j.sura-1].transliteration).includes(q));
  return (compact?list.slice(0,4):list).map(j=>`<a class="index-row" href="#reader?juz=${j.index}"><span class="ordinal">${String(j.index).padStart(2,'0')}</span><span class="row-copy"><strong>Juz ${j.index}</strong><small>Begins in ${esc(meta.chapters[j.sura-1].transliteration)} · ${j.sura}:${j.aya}</small></span>${icon('chevron')}</a>`).join('') || empty('No matching juz','Try a number from 1 to 30.');
}
function directory() {
  return title('Quran index') + tabs() + `<label class="search-box">${icon('find')}<input id="filter" type="search" value="${esc(state.filter)}" placeholder="Filter by name or number" aria-label="Filter index"></label><div id="directory-list">${directoryRows(false)}</div>`;
}
function empty(heading, description) {return `<div class="empty"><h2>${esc(heading)}</h2><p>${esc(description)}</p></div>`;}
function finder() {
  return title('Find a passage','Search the Arabic text, English and Urdu translations, or enter an ayah reference.')+
    `<label class="search-box">${icon('find')}<input type="search" dir="auto" id="find-query" aria-label="Find a passage" placeholder="Word, phrase or 2:38" value="${esc(state.query)}"></label><div id="matches">${matches()}</div>`;
}
function matches() {
  if (!state.query.trim()) return '<div class="suggest"><span>Try</span>'+['2:38','mercy','صبر'].map(q=>`<button data-query="${q}" dir="auto">${q}</button>`).join('')+'</div>';
  const {chapters,verses} = state.hits || {chapters:[],verses:[]};
  if (!chapters.length && !verses.length) return empty('No matches','Try another spelling, a shorter phrase or a reference such as 2:38.');
  const q = fold(state.query);
  const results=verses.slice(0,state.limit).map(row=>{
    const lang=['ar','en','ur'].find(key=>fold(row[key]).includes(q)) || (language==='ur'?'ur':language==='ar'?'ar':'en');
    return `<a class="match" href="${urlFor(row.ref)}"><strong>${esc(meta.chapters[row.s-1].transliteration)} · ${row.ref}</strong><p lang="${lang}" dir="${lang==='en'?'ltr':'rtl'}">${esc(row[lang])}</p></a>`;
  }).join('');
  return `<p class="result-count" role="status">${chapters.length} surahs · ${verses.length} matching ayat</p>${chapters.map(chapterRow).join('')}${results}${verses.length>state.limit?'<button class="outline" data-more>Show more ayat</button>':''}`;
}
function updateSearch(q) {
  state.query=q;state.limit=24;state.hits=findPassages(q,db,index,meta);$('#matches').innerHTML=matches();
}
function readingSettings() {
  return `<div class="settings"><label>Translation<select id="language">${[['both','English + Urdu'],['ar','Arabic only'],['en','English · Pickthall'],['ur','Urdu · Junagarhi']].map(([id,text])=>`<option value="${id}" ${language===id?'selected':''}>${text}</option>`).join('')}</select></label>
    <div><span class="field-label">Arabic text size</span><div class="zoom"><button data-size="-2" aria-label="Decrease Arabic size" ${arabicSize<=28?'disabled':''}>A−</button><output>${arabicSize} px</output><button data-size="2" aria-label="Increase Arabic size" ${arabicSize>=52?'disabled':''}>A+</button></div></div></div>`;
}
let recitation;
function closeRecitation() {
  if (!recitation) return;
  const {audio, panel, button} = recitation;
  recitation = null;
  audio.pause();
  audio.removeAttribute('src');
  audio.load();
  panel.remove();
  button.setAttribute('aria-expanded', 'false');
}
function listen(button) {
  const same = recitation?.button === button;
  closeRecitation();
  if (same) return;
  const panel = document.createElement('div');
  const caption = document.createElement('p');
  const audio = document.createElement('audio');
  audio.controls = true;
  audio.style.maxWidth = '100%';
  panel.append(caption, audio);
  const queue = [...button.closest('main').querySelectorAll('[data-listen]')];
  let position = queue.indexOf(button);
  function playVerse(current) {
    const row = index.byRef.get(current.dataset.listen);
    current.closest('.verse-head').after(panel);
    current.setAttribute('aria-expanded', 'true');
    recitation = {audio, panel, button: current};
    caption.textContent = 'Abdul Rahman Al-Sudais · AlQuran Cloud · ' + row.ref;
    audio.setAttribute('aria-label', 'Recitation of ayah ' + row.ref);
    audio.src = 'https://cdn.islamic.network/quran/audio/64/ar.abdurrahmaansudais/' + row.audioNumber + '.mp3';
    audio.play().catch(() => {
      if (recitation?.button === current && !audio.error) toast('Tap play to resume recitation.');
    });
  }
  audio.addEventListener('ended', () => {
    if (recitation?.audio !== audio) return;
    const next = queue[++position];
    if (!next?.isConnected) { closeRecitation(); return; }
    recitation.button.setAttribute('aria-expanded', 'false');
    playVerse(next);
  });
  audio.addEventListener('error', () => {
    if (recitation?.audio === audio) caption.textContent = 'Audio unavailable for ' + recitation.button.dataset.listen + '. Check your connection and try again.';
  });
  playVerse(button);
}
function verse(row) {
  const {ref}=row, isSaved=saved.has(ref), isPin=readingPin===ref;
  const chips=related.get(ref)||[];
  return `<article class="verse" id="v-${ref}" data-ref="${ref}" aria-label="Ayah ${ref}">
    <div class="verse-head"><a class="verse-id" href="${urlFor(ref)}" aria-label="Read ayah ${ref} in its surah">${ref}</a><div class="verse-actions">
    <button class="icon-button" data-listen="${ref}" aria-expanded="false" aria-label="Listen to ayah ${ref} with Al-Sudais" title="Listen with Al-Sudais">▶</button>
    <button class="icon-button" data-pin="${ref}" aria-pressed="${isPin}" aria-label="Set reading pin at ${ref}" title="Pin reading place">${icon('pin')}</button>
    <button class="icon-button" data-save="${ref}" aria-pressed="${isSaved}" aria-label="${isSaved?'Remove saved':'Save'} ayah ${ref}" title="${isSaved?'Remove saved ayah':'Save ayah'}">${icon('saved')}</button></div></div>
    <p class="arabic" lang="ar" dir="rtl">${esc(row.ar)}</p>
    ${language==='both'||language==='en'?`<div class="translation"><small>English · Pickthall</small><p lang="en">${esc(row.en)}</p></div>`:''}
    ${language==='both'||language==='ur'?`<div class="translation urdu"><small>Urdu · Junagarhi</small><p lang="ur" dir="rtl">${esc(row.ur)}</p></div>`:''}
    ${chips.length?`<div class="chips">${chips.map(t=>`<a href="#topics?item=${t.id}">${esc(t.name)}</a>`).join('')}</div>`:''}</article>`;
}
function reader(params) {
  const requested = parseRef(params.get('ayah')||'',db.ar);
  const mode = params.has('juz')?'juz':'surah';
  const group = mode==='juz'?index.byJuz:index.bySurah;
  const number = Number(params.get(mode)) || (requested?index.byRef.get(requested)[mode==='juz'?'juz':'s']:1);
  const id=Number.isInteger(number)&&group[number]?number:1;
  state.rows=group[id];state.id=id;state.mode=mode;
  const c=meta.chapters[state.rows[0].s-1], isSurah=mode==='surah', label=isSurah?'Surah':'Juz';
  state.target=requested && state.rows.some(r=>r.ref===requested)?requested:'';
  const name=isSurah?c.transliteration:'Juz '+id;
  const end=state.rows[state.rows.length-1];
  return `<div class="reader-nav"><a href="#index">${icon('back')} Quran index</a><a href="#find">${icon('find')} Find</a></div>
    <header class="chapter-head"><div class="eyebrow">${label} ${String(id).padStart(2,'0')}${isSurah?' · '+esc(c.type):''}</div>
      <h1>${esc(name)}</h1><p>${isSurah?esc(c.translation):'From '+state.rows[0].ref+' to '+end.ref} · ${state.rows.length} ayat</p>
      ${isSurah?`<div class="chapter-ar" lang="ar" dir="rtl">${esc(c.name)}</div>`:''}</header>
    <div class="reader-tools"><details id="reader-settings"><summary>${icon('settings')} Reading settings</summary>${readingSettings()}</details>
    <details id="reader-jump"><summary>${icon('book')} Go to ayah</summary><form id="jump"><label>${isSurah?'Ayah number':'Surah:ayah in this juz'}<input id="ayah" ${isSurah?'inputmode="numeric"':''} autocomplete="off" required placeholder="${isSurah?'1–'+state.rows.length:'e.g. '+state.rows[0].ref}"></label><button class="solid">Go</button></form></details></div>
    <div class="verses">${state.rows.map(verse).join('')}</div><div class="stepper">
    ${id>1?`<a href="#reader?${mode}=${id-1}">${icon('back')} Previous ${mode}</a>`:''}
    ${id<group.length-1?`<a href="#reader?${mode}=${id+1}">Next ${mode} ${icon('arrow')}</a>`:''}</div>`;
}
function studyView(view, params) {
  if (view==='study') return title('Connected study','Follow a name, theme or event back to its Quranic passages.')+studyLinks()+'<a class="text-link" href="#sources">Sources &amp; research method '+icon('arrow')+'</a>';
  const trackId=Object.prototype.hasOwnProperty.call(tracks,params.get('path'))?params.get('path'):'origins';
  const path=tracks[trackId];
  const items=view==='prophets'?prophets:view==='topics'?topics:view==='timeline'?path.events:[];
  const item=items.find(x=>x.id===params.get('item'));
  const base='#'+view+(view==='timeline'?'?path='+trackId:'');
  if (item) {
    const refs=expandReferences(item.refs,db.ar);
    return `<a class="back" href="${base}">${icon('back')} ${studyItems.find(x=>x[0]===view)[1]}</a>`+
      title(item.title||item.name,item.description||'Selected passages from the Quran.')+
      `<p class="source-refs">${item.refs.map(esc).join(' · ')}</p>
      ${(item.hadith||[]).map(h=>`<aside class="note"><strong>Related hadith</strong><p><a href="${esc(h.url)}" target="_blank" rel="noopener">${esc(h.label)}</a> · ${esc(h.note)}</p></aside>`).join('')}
      <details class="inline-settings"><summary>${icon('settings')} Reading settings</summary>${readingSettings()}</details><div class="verses">${refs.map(ref=>verse(index.byRef.get(ref))).join('')}</div>`;
  }
  const back='<a class="back" href="#study">'+icon('back')+' Connected study</a>';
  if (view==='revelation') {
    const period=['meccan','medinan'].includes(params.get('period'))?params.get('period'):'all';
    return back+title('Revelation context','Traditional surah-level classifications. Individual passages can belong to a different period, and scholarly classifications can differ.')+
      '<div class="segment">'+['all','meccan','medinan'].map(p=>`<a href="#revelation?period=${p}" ${p===period?'aria-current="true"':''}>${p[0].toUpperCase()+p.slice(1)}</a>`).join('')+'</div>'+
      meta.chapters.filter(c=>period==='all'||c.type===period).map(chapterRow).join('');
  }
  const headings={prophets:['Prophetic narratives','Selected passages for 25 prophets. The directory is not a chronology. Dhul-Kifl is included in the commonly taught list; scholars discuss his identity and status.'],topics:['Themes & topics','30 editorial starting points. Categories overlap, and the index covers selected ayat.'],timeline:['Research timelines','Follow the passages in a study path. Dates are left open where the sources do not establish them.']};
  const tabs=view==='timeline'?'<div class="path-tabs">'+Object.entries(tracks).map(([key,t])=>`<a href="#timeline?path=${key}" ${key===trackId?'aria-current="true"':''}>${esc(t.name)}</a>`).join('')+'</div>'+titleSmall(path.name,path.description):'';
  return back+title(...headings[view])+tabs+'<div class="study-list">'+items.map(x=>`<a href="${base}${base.includes('?')?'&':'?'}item=${x.id}"><span><strong>${esc(x.title||x.name)}</strong><small>${esc(x.description || (x.alias!==x.name?x.alias+' · ':'')+x.refs.length+' linked passages')}</small></span>${x.ar?`<span class="row-ar" lang="ar" dir="rtl">${esc(x.ar)}</span>`:icon('chevron')}</a>`).join('')+'</div>';
}
function titleSmall(heading, description) {return '<h2>'+esc(heading)+'</h2><p class="muted">'+esc(description)+'</p>';}
function savedView() {
  const pin=readingPin?`<a href="${urlFor(readingPin)}" class="pinline">${icon('pin')} Reading pin · ${readingPin}${icon('arrow')}</a>`:'';
  return title('Saved ayat','Your collection on this device.')+pin+
    (saved.size?`<details class="inline-settings"><summary>${icon('settings')} Reading settings</summary>${readingSettings()}</details><div class="verses">${[...saved].map(ref=>verse(index.byRef.get(ref))).join('')}</div>`:
    empty('Keep a passage here','Tap the bookmark beside an ayah to add it to your collection.')+'<a class="text-link" href="#index">Open the Quran index '+icon('arrow')+'</a>');
}
function sourceView() {
  const links=[
    ['Arabic Quran','QPC Hafs from the King Fahd Glorious Quran Printing Complex. Every numbered ayah is checked character for character against the Quran.com word records.','Edition and source','QPC-NOTICE.txt'],
    ['English interpretation','Marmaduke Pickthall, The Meaning of the Glorious Koran (1930). Translations present the meanings of the Arabic text.','Dataset provenance','sources.json'],
    ['Urdu interpretation','Muhammad Junagarhi, distributed by QuranEnc.com, version 1.1.3.','QuranEnc edition','https://quranenc.com/en/browse/urdu_junagarhi'],
    ['Arabic typography','QPC Hafs renders the ayat offline. Amiri Quran is used for headings. Surah and juz metadata comes from Tanzil.','QPC font licence','QPC-FONT-LICENSE.txt'],
    ['Connected study','Muhammad Usman Buttar began this research project in 2015. Its prophetic narratives, timelines and themes form a selective editorial index. Some ayat appear under several themes. Each entry links to its source passages.','Dataset licence','DATA-LICENSE.txt']
  ];
  return title('Sources & method')+links.map(([h,body,label,href])=>`<section class="source-block"><h2>${h}</h2><p>${body}</p><a href="${href}" target="_blank" rel="noopener">${label} ↗</a></section>`).join('')+
    '<a class="text-link" href="TANZIL-LICENSE.txt" target="_blank">Tanzil metadata notice ↗</a> · <a class="text-link" href="AMIRI-OFL.txt" target="_blank">Amiri heading font licence ↗</a>';
}
function setRecent(ref) {
  if (!ref || (recent?.ref===ref && recent?.mode===state.mode)) return;
  recent={ref,mode:state.mode}; write('recent',recent,true);
}
function topVerse() {
  const rows=document.querySelectorAll('.verse[data-ref]');
  let lo=0, hi=rows.length-1;
  if (rows.length && window.scrollY+window.innerHeight>=document.documentElement.scrollHeight-2) return rows[rows.length-1].dataset.ref;
  const line=Math.min(window.innerHeight*0.33,240);
  while(lo<hi) {const mid=(lo+hi)>>1;if(rows[mid].getBoundingClientRect().bottom<=line)lo=mid+1;else hi=mid;}
  return rows[lo]?.dataset.ref;
}
function rememberVisible() {if(state.readerReady && state.view==='reader') setRecent(topVerse());}
function render() {
  if (!index) return;
  closeRecitation();
  clearTimeout(scrollTimer); clearTimeout(searchTimer);
  const serial=++navigationSerial;
  const [raw='', query='']=location.hash.slice(1).split('?');
  const routes=['home','reader','index','find','study','prophets','topics','timeline','revelation','saved','sources'];
  const firstView=document.documentElement.dataset.startView==='reader'?'reader':'home';
  const view=routes.includes(raw)?raw:firstView, params=new URLSearchParams(query);
  state.view=view;state.readerReady=false;state.target='';
  const views={home,index:directory,find:finder,saved:savedView,sources:sourceView,reader:()=>reader(params)};
  main.innerHTML=views[view]?views[view]():studyView(view,params);
  nav(view==='reader'?'index':studyItems.some(i=>i[0]===view)?'study':view);
  document.title=(main.querySelector('h1')?.textContent||'Home')+' · Pockett Quran';
  window.scrollTo(0,0);
  main.focus({preventScroll:true});
  if(view==='reader'){
    const target=state.target;
    const settle=()=>{
      if(serial!==navigationSerial)return;
      if(target){const el=document.getElementById('v-'+target);el?.scrollIntoView({block:'start'});el?.classList.add('arrived');}
      state.readerReady=true;setRecent(target||state.rows[0].ref);
    };
    Promise.resolve(document.fonts?.ready).then(()=>requestAnimationFrame(settle));
  }
}
function redrawVerses() {
  const active=document.activeElement;
  for (const el of document.querySelectorAll('.verse')) el.outerHTML=verse(index.byRef.get(el.dataset.ref));
  if(active?.isConnected) active.focus({preventScroll:true});
}
document.addEventListener('click', e=>{
  const sameAnchor=e.target.closest('a[href^="#"]');
  if(sameAnchor?.hash==='#main'){e.preventDefault();main.focus();return;}
  if(sameAnchor && state.view==='reader') rememberVisible();
  const b=e.target.closest('button');if(!b || !index)return;
  if (b.dataset.listen) {listen(b);return;}
  if (b.hasAttribute('data-theme')) {theme=theme==='night'?'paper':'night';write('theme',theme);applyAppearance();return;}
  if (b.dataset.directory) {
    state.directory=b.dataset.directory;state.filter='';const filter=$('#filter');if(filter)filter.value='';
    document.querySelectorAll('[data-directory]').forEach(el=>el.setAttribute('aria-pressed',el.dataset.directory===state.directory));
    $('#directory-list').innerHTML=directoryRows(state.view==='home');return;
  }
  if (b.dataset.query) {$('#find-query').value=b.dataset.query;updateSearch(b.dataset.query);return;}
  if (b.hasAttribute('data-more')) {state.limit+=24;const n=$('#matches').querySelectorAll('.match').length;$('#matches').innerHTML=matches();$('#matches').querySelectorAll('.match')[n]?.focus();return;}
  if (b.dataset.save) {
    const ref=b.dataset.save, next=new Set(saved);if(next.has(ref))next.delete(ref);else next.add(ref);
    if(!write('saved',[...next]))return;saved=next;
    if(state.view==='saved'){closeRecitation();const article=b.closest('article');const neighbor=article.nextElementSibling||article.previousElementSibling;const nextRef=neighbor?.dataset.ref;main.innerHTML=savedView();if(nextRef)document.querySelector('[data-save="'+nextRef+'"]')?.focus();else main.focus();}
    else {b.setAttribute('aria-pressed',saved.has(ref));b.setAttribute('aria-label',(saved.has(ref)?'Remove saved':'Save')+' ayah '+ref);b.title=saved.has(ref)?'Remove saved ayah':'Save ayah';}
    toast(saved.has(ref)?'Ayah '+ref+' saved.':'Ayah '+ref+' removed from Saved.');return;
  }
  if(b.dataset.pin) {
    if(!write('last-read',b.dataset.pin))return;readingPin=b.dataset.pin;
    if(state.view==='reader')setRecent(readingPin);
    document.querySelectorAll('[data-pin]').forEach(el=>el.setAttribute('aria-pressed',el.dataset.pin===readingPin));
    toast('Reading pin set at '+readingPin+'.');return;
  }
  if(b.dataset.size) {
    arabicSize=Math.max(28,Math.min(52,arabicSize+Number(b.dataset.size)));write('arabic-size',arabicSize);applyAppearance();
    const zoom=b.closest('.zoom');zoom.querySelector('output').textContent=arabicSize+' px';
    zoom.querySelector('[data-size="-2"]').disabled=arabicSize<=28;zoom.querySelector('[data-size="2"]').disabled=arabicSize>=52;
  }
});
document.addEventListener('input',e=>{
  if(e.target.id==='filter'){state.filter=e.target.value;$('#directory-list').innerHTML=directoryRows(false);}
  if(e.target.id==='find-query'){const q=e.target.value;clearTimeout(searchTimer);searchTimer=setTimeout(()=>updateSearch(q),120);}
});
document.addEventListener('change',e=>{
  if(e.target.id==='language'){language=e.target.value;write('language',language);redrawVerses();}
});
document.addEventListener('submit', e=>{
  if(e.target.id!=='jump')return;e.preventDefault();
  const input=$('#ayah'),value=fold(input.value), ref=parseRef(state.mode==='surah'?state.id+':'+value:value,db.ar);
  if(!state.rows.some(r=>r.ref===ref)){toast('Enter an ayah within this '+state.mode+'.');input.focus();return;}
  navigate(urlFor(ref,state.mode));
});
// Native webviews may not provide a browser Back button. Leave pinch gestures to the OS.
let edgeStart;
document.addEventListener('touchstart',event=>{
  const t=event.touches[0];
  edgeStart=window.Capacitor?.isNativePlatform?.() && event.touches.length===1 && t.clientX<=24 ? {x:t.clientX,y:t.clientY}:null;
},{passive:true});
document.addEventListener('touchcancel',()=>{edgeStart=null;},{passive:true});
document.addEventListener('touchend',event=>{
  const t=event.changedTouches[0], start=edgeStart;edgeStart=null;
  if(!start || !t || event.touches.length || t.clientX-start.x<80 || Math.abs(t.clientY-start.y)>55 || state.view==='home')return;
  if(history.length>1)history.back();else navigate('#home');
},{passive:true});
window.addEventListener('hashchange',render);
window.addEventListener('scroll',()=>{if(!state.readerReady)return;clearTimeout(scrollTimer);scrollTimer=setTimeout(rememberVisible,200);},{passive:true});
window.addEventListener('pagehide',()=>{rememberVisible();closeRecitation();});
document.addEventListener('visibilitychange',()=>{if(document.hidden)rememberVisible();});
async function boot(){
  try {
    const files=await Promise.all(['arabic','english','urdu','metadata'].map(async name=>{
      const response=await fetch('./'+name+'.json');if(!response.ok)throw Error(name);return response.json();
    }));
    db={ar:files[0],en:files[1],ur:files[2]};meta=files[3];index=makeIndex(db,meta);related=new Map();
    for(const t of topics)for(const ref of expandReferences(t.refs,db.ar)){if(!related.has(ref))related.set(ref,[]);related.get(ref).push(t);}
    restore();render();
    if('serviceWorker' in navigator && ['http:','https:'].includes(location.protocol) && !window.Capacitor?.isNativePlatform?.()){
      navigator.serviceWorker.register('./sw.js').catch(()=>{});
    }
  } catch(error) {
    main.innerHTML=empty('The Quran text could not open','Please reopen the app or try again.')+'<button class="outline" id="retry">Try again</button>';
    $('#retry').onclick=boot;
  }
}
boot();
