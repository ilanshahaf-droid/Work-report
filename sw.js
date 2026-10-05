const CACHE="hatchamot-v3";
const ASSETS=["./","./index.html","./manifest.json","./icon-192.png","./icon-512.png",
 "https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js",
 "https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js"];
self.addEventListener("install",e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)));self.skipWaiting();});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))));self.clients.claim();});
self.addEventListener("fetch",e=>{
  if(e.request.method!=="GET") return;
  if(e.request.mode==="navigate"){ // always try the newest version of the app first
    e.respondWith(fetch(e.request).then(r=>{ const cp=r.clone(); caches.open(CACHE).then(c=>c.put("./index.html",cp)); return r; })
      .catch(()=>caches.match("./index.html"))); return; }
  e.respondWith(caches.match(e.request).then(hit=>{
    const net=fetch(e.request).then(r=>{ if(r&&(r.ok||r.type==="opaque")){const cp=r.clone();caches.open(CACHE).then(c=>c.put(e.request,cp));} return r; }).catch(()=>hit);
    return hit||net;
  }));
});
