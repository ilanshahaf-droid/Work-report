const CACHE="hatchamot-v6";
const CDN=["https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js",
 "https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js",
 "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4/dist/umd/supabase.min.js",
 "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"];
const ASSETS=["./","./index.html","./manifest.json","./icon-192.png","./icon-512.png",...CDN];
self.addEventListener("install",e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)));self.skipWaiting();});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))));self.clients.claim();});
self.addEventListener("fetch",e=>{
  const req=e.request; if(req.method!=="GET") return;
  const url=new URL(req.url);
  // the app page: newest version first, cached copy when offline
  if(req.mode==="navigate"){
    e.respondWith(fetch(req).then(r=>{ const cp=r.clone(); caches.open(CACHE).then(c=>c.put("./index.html",cp)); return r; })
      .catch(()=>caches.match("./index.html"))); return; }
  // own files, libraries and fonts: cache first. Everything else (the cloud, login) goes straight to the network.
  const cacheable = url.origin===location.origin || CDN.includes(req.url) || /fonts\.(googleapis|gstatic)\.com$/.test(url.hostname);
  if(!cacheable) return;
  e.respondWith(caches.match(req).then(hit=>hit||fetch(req).then(r=>{ if(r&&(r.ok||r.type==="opaque")){const cp=r.clone();caches.open(CACHE).then(c=>c.put(req,cp));} return r; })));
});
