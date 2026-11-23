/* Service Worker · BM CRM. Solo guarda en caché los archivos de la app.
   NUNCA toca IndexedDB: actualizar la app no borra clientes ni eventos.
   Para publicar una actualización, cambia el número de VERSION. */
const VERSION='bm-crm-v3';
const SHELL=['./','./index.html','./manifest.json'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(VERSION).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(n=>n!==VERSION).map(n=>caches.delete(n)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
  const r=e.request,u=new URL(r.url);
  if(r.method!=='GET'||u.origin!==location.origin)return; /* Google y demás: directo a la red */
  e.respondWith(caches.match(r,{ignoreSearch:true}).then(hit=>{
    const net=fetch(r).then(res=>{if(res&&res.ok){const cp=res.clone();caches.open(VERSION).then(c=>c.put(r,cp))}return res}).catch(()=>null);
    if(hit){e.waitUntil(net);return hit}
    return net.then(res=>res||(r.mode==='navigate'?caches.match('./index.html'):Response.error()))
  }))
});
