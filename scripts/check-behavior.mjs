import fs from 'node:fs';import vm from 'node:vm';import assert from 'node:assert/strict';import {webcrypto} from 'node:crypto';import {prophets,topics,tracks} from '../dist/catalog.js';
const data={};for(const n of ['arabic','english','urdu','metadata'])data[n]=JSON.parse(fs.readFileSync(new URL('../dist/'+n+'.json',import.meta.url)));
const nodes=new Map(),handlers={};const node=s=>{if(!nodes.has(s))nodes.set(s,{innerHTML:'',textContent:'',style:{},dataset:{},value:'',hidden:false,open:false,scrollIntoView(){},focus(){},showModal(){this.open=true},close(){this.open=false},classList:{toggle(){}},setAttribute(){},removeAttribute(){},click(){}});return nodes.get(s)};
const memory=new Map();const context=vm.createContext({prophets,topics,tracks,console,setTimeout,clearTimeout,URL,Blob,crypto:webcrypto,location:{hash:'#timeline'},history:{replaceState(a,b,h){context.location.hash=h}},localStorage:{getItem:k=>memory.get(k)||null,setItem:(k,v)=>memory.set(k,v)},navigator:{},window:{addEventListener(){},scrollTo(){}},document:{querySelector:node,querySelectorAll:()=>[],addEventListener:(k,f)=>handlers[k]=f,createElement:()=>node('a')},fetch:async url=>({ok:true,json:async()=>data[url.match(/\.\/(\w+)\.json/)[1]]})});
let source=fs.readFileSync(new URL('../dist/app.js',import.meta.url),'utf8').replace(/^import .*?;\n/,'').replace(/boot\(\);\s*$/,'');vm.runInContext(source,context);await vm.runInContext('boot()',context);
assert(node('#main').innerHTML.includes('Creation & beginnings'));
assert.equal(vm.runInContext('flat.length',context),6236);
assert.equal(vm.runInContext("refsExpand(['2:30-39','2:30']).length",context),10);
assert.throws(()=>vm.runInContext("refsExpand(['2:287'])",context));
for(const route of ['timeline','prophets','topics','reader','revelation','notebook','saved','sources']){context.location.hash='#'+route;vm.runInContext('render()',context);assert(node('#main').innerHTML.length>300,route)}
vm.runInContext("openDetail(prophets.find(p=>p.id==='musa'))",context);assert(node('#detail-body').innerHTML.includes('Musa'));assert(node('#detail-body').innerHTML.includes('20:9'));
vm.runInContext("language='ur';drawDetail()",context);assert(node('#detail-body').innerHTML.includes('lang="ur"'));assert(node('#detail-body').innerHTML.includes('Translator’s notes'));
vm.runInContext("search('2:255')",context);assert.equal(vm.runInContext('searchResults[0]',context),'2:255');
vm.runInContext("search('mercy')",context);assert(vm.runInContext('searchResults.length>0',context));
vm.runInContext("search('الرحمن')",context);assert(vm.runInContext('searchResults.length>0',context));
const backup={format:'ProjectQuran',version:1,notes:[{title:'<img src=x onerror=alert(1)>',body:'Evidence study',refs:['2:30'],topic:'creation',track:'origins'}],saved:['2:30']};context.testFile={size:1000,text:async()=>JSON.stringify(backup)};await vm.runInContext('importNotes(testFile)',context);assert.equal(vm.runInContext('notes.length',context),1);assert(node('#main').innerHTML.includes('&lt;img'));assert(!node('#main').innerHTML.includes('<img src=x'));await vm.runInContext('importNotes(testFile)',context);assert.equal(vm.runInContext('notes.length',context),1);
backup.notes[0].refs=['115:1'];await vm.runInContext('importNotes(testFile)',context);assert.equal(vm.runInContext('notes.length',context),1);
vm.runInContext("track='origins';renderTimeline()",context);assert(node('#main').innerHTML.includes('Your connected research'));
console.log('PASS: actual app functions render all views; open prophet verses; switch Urdu; search references, Arabic and English; import/deduplicate research; escape untrusted text; reject invalid imports; connect research to timelines. DOM stubs used, not a browser layout test.');
