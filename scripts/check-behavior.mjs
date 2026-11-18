import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {prophets,topics,tracks} from '../dist/catalog.js';
import {icon} from '../dist/icons.js';
import {fold,parseRef,expandReferences,makeIndex,findPassages} from '../dist/library.js';

const data=Object.fromEntries(['arabic','english','urdu','metadata'].map(name=>[name,JSON.parse(fs.readFileSync(new URL('../dist/'+name+'.json',import.meta.url)))]));
const db={ar:data.arabic,en:data.english,ur:data.urdu}, index=makeIndex(db,data.metadata);
assert.equal(index.verses.length,6236);
assert.equal(index.byJuz[30].at(-1).ref,'114:6');
for(const q of ['2:38','٢:٣٨','۲:۳۸'])assert.equal(findPassages(q,db,index,data.metadata).verses[0].ref,'2:38');
assert.equal(findPassages('2:287',db,index,data.metadata).verses.length,0);
for(const q of ['mercy','الرحمن','اللہ'])assert.ok(findPassages(q,db,index,data.metadata).verses.length>0,q);
assert.equal(findPassages('الفاتحة',db,index,data.metadata).chapters[0].id,1);
assert.throws(()=>expandReferences(['114:7'],db.ar));

const nodes=new Map(),memory=new Map(),handlers={};
const node=selector=>{
  if(!nodes.has(selector))nodes.set(selector,{innerHTML:'',style:{setProperty(){}},dataset:{},classList:{add(){},remove(){}},querySelector(){return null;},focus(){},setAttribute(){},scrollIntoView(){}});
  return nodes.get(selector);
};
memory.set('pq-last-read','"2:38"');memory.set('pq-saved','["1:1","2:38","999:1"]');memory.set('pq-language','"ur"');memory.set('pq-arabic-size','40');
const context=vm.createContext({prophets,topics,tracks,icon,fold,parseRef,expandReferences,makeIndex,findPassages,console,URLSearchParams,location:{hash:'#home',protocol:'file:'},navigator:{},window:{addEventListener(){},scrollTo(){}},document:{documentElement:node('html'),querySelector:node,querySelectorAll:()=>[],getElementById:node,addEventListener:(k,f)=>handlers[k]=f},requestAnimationFrame:f=>f(),localStorage:{getItem:k=>memory.get(k),setItem:(k,v)=>memory.set(k,v)},setTimeout,clearTimeout,fetch:async path=>({ok:true,json:async()=>data[path.split('/').pop().split('.')[0]]})});
const src=fs.readFileSync(new URL('../dist/app.js',import.meta.url),'utf8').replace(/^import .*?;$/gm,'').replace(/boot\(\);\s*$/,'');
vm.runInContext(src,context);
const run=expr=>vm.runInContext(expr,context);
await run('boot()');
function route(hash){context.location.hash=hash;run('render()');return node('#main').innerHTML;}
assert.match(route('#home'),/Resume reading/);
assert.match(route('#home'),/2:38/);
assert.equal(run('arabicSize'),40);assert.equal(run('language'),'ur');
assert.equal(run('saved.size'),2);
assert.match(route('#reader?surah=2&ayah=2:38'),/id="v-2:38"/);
assert.equal((node('#main').innerHTML.match(/class="verse"/g)||[]).length,286);
const readerHtml=node('#main').innerHTML;
assert.ok(readerHtml.includes('lang="ur"'));assert.ok(!readerHtml.includes('lang="en"'));
assert.ok(readerHtml.includes(data.arabic['2'][37].text));
assert.equal((route('#reader?juz=30').match(/class="verse"/g)||[]).length,index.byJuz[30].length);
for(const section of ['#index','#find','#study','#timeline','#revelation','#saved','#sources','#prophets','#topics'])assert.ok(route(section).length>120,section);
assert.match(route('#prophets?item=musa'),/id="v-20:9"/);
assert.match(route('#topics?item=charity'),/class="verse"/);
assert.match(route('#timeline?path=origins&item='+tracks.origins.events[0].id),/class="verse"/);
assert.match(route('#revelation?period=medinan'),/Al-Baqara/);
assert.match(route('#saved'),/id="v-2:38"/);
assert.match(route('#reader?surah=114'),/id="v-114:6"/);
assert.match(route('#unknown'),/Reading room/);
assert.match(route('#sources'),/QuranEnc.com/);
console.log('PASS: production view functions, direct links, old bookmarks and pin, Urdu selection, Arabic sizing, three-script search, all study routes, continuous Surah and Juz reading.');
