const CACHE = 'keeper-553d44fce5';
const FILES = ['./', 'index.html', 'manifest.webmanifest', 'icon-180.png', 'icon-192.png', 'icon-512.png'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(ks => Promise.all(ks.filter(k => k.startsWith('keeper-') && k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const r = e.request;
  if (r.method !== 'GET' || new URL(r.url).origin !== self.location.origin) return;
  const fromCache = () => caches.match(r, { ignoreSearch: true })
    .then(m => m || (r.mode === 'navigate' ? caches.match('index.html') : Response.error()));
  const net = fetch(r).then(res => {
    if (res.ok) { const cp = res.clone(); caches.open(CACHE).then(c => c.put(r, cp)); }
    return res;
  });
  const slow = new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), 5000));
  e.respondWith(Promise.race([net, slow]).catch(fromCache));
});
