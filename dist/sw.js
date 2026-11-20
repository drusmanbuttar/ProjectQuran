const CACHE='pockett-quran-reading-1.1.0-qpc-tip-header-v3';
const FILES=['./','./index.html','./style.css','./tip.css','./tip.js','./fonts/AmiriQuran.ttf','./fonts/UthmanicHafs1Ver18.woff2','./QPC-NOTICE.txt','./QPC-FONT-LICENSE.txt','./AMIRI-OFL.txt','./app.js','./icons.js','./library.js','./illumination.png','./catalog.js','./arabic.json','./english.json','./urdu.json','./metadata.json','./manifest.webmanifest','./icon.svg','./icon-192.png','./icon-512.png','./sources.json','./DATA-LICENSE.txt','./TANZIL-LICENSE.txt','./privacy.html','./support.html'];
self.addEventListener('install', event=>{
  event.waitUntil((async()=>{
    const cache=await caches.open(CACHE);
    await cache.addAll(FILES.map(file=>new Request(file,{cache:'reload'})));
    await self.skipWaiting();
  })());
});
self.addEventListener('activate',event=>{
  event.waitUntil((async()=>{
    const keys=await caches.keys();
    await Promise.all(keys.filter(key=>key.startsWith('pockett-quran-')&&key!==CACHE).map(key=>caches.delete(key)));
    await self.clients.claim();
  })());
});
self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET')return;
  const url=new URL(event.request.url);
  if(url.origin!==self.location.origin || !FILES.some(file=>new URL(file,self.registration.scope).pathname===url.pathname))return;
  event.respondWith((async()=>{
    const cache=await caches.open(CACHE);
    return await cache.match(event.request,{ignoreSearch:true}) || fetch(event.request);
  })());
});
