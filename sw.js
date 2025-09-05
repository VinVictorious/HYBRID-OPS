const CACHE_NAME = 'hybrid-ops-cache-v3';
const urlsToCache = [
    '/',
    '/index.html',
    '/styles.css',
    '/app.js',
    '/manifest.json',
    // App icons
    '/icons/app-icon-32.png',
    '/icons/app-icon-180.png',
    '/icons/app-icon-192.png',
    '/icons/app-icon-512.png',
    '/icons/app-icon-maskable-512.png',
    // Onboarding/difficulty icons
    '/icons/spark.png',
    '/icons/dumbbell.png',
    '/icons/lightning.png',
    // Program day icons
    '/icons/strength.png',
    '/icons/run.png',
    '/icons/circuit.png',
    '/icons/mobility.png',
    '/icons/recovery.png',
    '/icons/test.png',
    // Timer and UI icons
    '/icons/play.png',
    '/icons/stop.png',
    '/icons/reset.png',
    '/icons/stopwatch.png',
    '/icons/countdown.png',
    '/icons/chevron-left.png',
    '/icons/close.png',
    '/icons/check.png',
    '/icons/home.png',
    '/icons/analytics.png',
    '/icons/settings.png',
    // Legacy svgs (if referenced anywhere)
    '/icons/home.svg',
    '/icons/analytics.svg',
    '/icons/settings.svg',
    'https://cdn.tailwindcss.com',
    'https://cdn.jsdelivr.net/npm/chart.js',
    'https://fonts.googleapis.com/css2?family=Changa:wght@600;700&family=Roboto+Mono:wght@400;500&display=swap'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Opened cache');
                return cache.addAll(urlsToCache);
            })
    );
});

self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(keys => Promise.all(
            keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
        ))
    );
});

self.addEventListener('fetch', event => {
    event.respondWith(
        fetch(event.request)
            .then(response => {
                // Check if we received a valid response
                if (!response || response.status !== 200 || response.type !== 'basic') {
                    return response;
                }

                const responseToCache = response.clone();

                caches.open(CACHE_NAME)
                    .then(cache => {
                        cache.put(event.request, responseToCache);
                    });

                return response;
            })
            .catch(() => {
                return caches.match(event.request)
                    .then(response => {
                        if (response) {
                            return response;
                        }
                    });
            })
    );
});
