// 这是需要预缓存的资源，也可以是appshell,可以通过webpack的插件来生成
//列表中没有的项表示要删除
const cacheList = {
    "/": 1,
    "/index.html": 1,
    "/main.css": 4,
    "/e.png": 1,
    "/pwa-fonts.png": 1,
    "/manifest.json": 1,
    "/check.html": 1,
    "/js/modernizr.js": 1
};

const len = location.origin.length - 1;

// 注册成功的时候，以版本名为key主动缓存静态资源
self.addEventListener("install", e => {
    e.waitUntil(caches.open("caches").then(cache => {
        const targetUrls = Object.keys(cacheList).map(item => item + '?' + cacheList[item]);

        return cache.keys().then(requests => {
            const cachedUrls = requests.map(request => request.url.substr(len));
            return Promise.all(cachedUrls.map(url => targetUrls.indexOf(url) < 0 ? cache.delete(url) : 0)).then(() =>
                cache.addAll(targetUrls.filter(url => cachedUrls.indexOf(url) < 0))
            );
        });
    }));
});

// 当新的serviceWorker被激活时，删除旧版本的缓存
self.addEventListener("activate", e => {
    // 立即接管所有页面，酌情处理
    // 会导致新的sw接管旧的页面，同时旧版本的缓存已被清空
    e.waitUntil(self.clients.claim());
});

// 发起请求时去根据uri去匹配缓存，无法命中缓存则发起请求
self.addEventListener("fetch", e => {
    const url = e.request.url + '?' + cacheList[(new URL(e.request.url)).pathname];
    e.respondWith(caches.match(url).then(res => res || fetch(url, {cache: 'force-cache'})));
});

self.addEventListener("message", e => {
    if (e.data === "skipWaiting") {
        self.skipWaiting().then(() => {
        });
    }
});
