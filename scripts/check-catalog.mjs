import assert from 'node:assert/strict';
import fs from 'node:fs';
import {prophets,topics,tracks} from '../dist/catalog.js';
const ar=JSON.parse(fs.readFileSync(new URL('../dist/arabic.json',import.meta.url)));
let refs=0;
for(const item of [...prophets,...topics,...Object.values(tracks).flatMap(t=>t.events)]){
 assert(item.refs.length>0);
 for(const ref of item.refs){const match=/^(\d+):(\d+)(?:-(\d+))?$/.exec(ref);assert(match,ref);const [,s,a,b]=match;assert(+a>0&&+a<=+(b||a)&&+(b||a)<=ar[s].length,ref);refs++}
}
assert.equal(prophets.length,25);assert.equal(topics.length,30);assert.equal(new Set(prophets.map(p=>p.id)).size,25);
console.log(`PASS: ${refs} passage references resolve to valid Quranic verses across prophets, topics and all timeline paths.`);

assert.equal(new Set(topics.map(t=>t.id)).size,30);
