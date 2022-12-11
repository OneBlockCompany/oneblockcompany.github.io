'use strict';
const MANIFEST = 'flutter-app-manifest';
const TEMP = 'flutter-temp-cache';
const CACHE_NAME = 'flutter-app-cache';
const RESOURCES = {
  "version.json": "288319cdf52665c11f6b587f4886f868",
"index.html": "597a3357fe95bee4e1d59a8398639cef",
"/": "597a3357fe95bee4e1d59a8398639cef",
"main.dart.js": "23e059ce43e7796a96bb5b7ad9db8e35",
"assets/AssetManifest.json": "d0f068288082320388cc3d8f231bff6e",
"assets/NOTICES": "671c810e43ff72a869d7ac90347a8af6",
"assets/FontManifest.json": "1f16cfa271c12a877b6d712698defd5f",
"assets/packages/cupertino_icons/assets/CupertinoIcons.ttf": "6d342eb68f170c97609e9da345464e5e",
"assets/packages/fluttertoast/assets/toastify.js": "e7006a0a033d834ef9414d48db3be6fc",
"assets/packages/fluttertoast/assets/toastify.css": "a85675050054f179444bc5ad70ffc635",
"assets/shaders/ink_sparkle.frag": "6b43715d7821f1973d5a28e5705b4169",
"assets/fonts/MaterialIcons-Regular.otf": "95db9098c58fd6db106f1116bae85a0b",
"assets/assets/image/mbti/esfj.jpg": "cc72dc84c382782c29fcfdb7cb849207",
"assets/assets/image/mbti/isfj.jpg": "d9b8a98b010f68e29abe3fcfc50f4128",
"assets/assets/image/mbti/infj.jpg": "a54ab6a2254fe079bf61d5cf1661f0f8",
"assets/assets/image/mbti/enfj.jpg": "4a4d9c4ea048297064d5fd86828d0064",
"assets/assets/image/mbti/intj.jpg": "007b0133a70c1bfd0e68bf3879c8a0cb",
"assets/assets/image/mbti/entj.jpg": "1454182f0e831919070e0cbbac32907b",
"assets/assets/image/mbti/estj.jpg": "82b75c2008861225d68491ed7ca29614",
"assets/assets/image/mbti/istj.jpg": "29910a16ebe563ba77517c5dd9239a4c",
"assets/assets/image/mbti/istp.jpg": "07908aff97d401ea103ab020ab832d55",
"assets/assets/image/mbti/entp.jpg": "38dbf49b4cef0914fd249e728c84556e",
"assets/assets/image/mbti/intp.jpg": "1563f92e0b87264a76d7fd94a50f55e1",
"assets/assets/image/mbti/enfp.jpg": "1a179354860ec7f460f247b44043af4b",
"assets/assets/image/mbti/infp.jpg": "70aa7134af1d7bc43ccba5ceca567c41",
"assets/assets/image/mbti/isfp.jpg": "bcd90f7b1ec2868103f0e8c63f07f81e",
"assets/assets/image/mbti/esfp.jpg": "95c95247f05274b33dfc003e96afa0f5",
"assets/assets/fonts/NanumBarunGothic.ttf": "0384532820e984ca0dc4a140d11b12d4",
"assets/assets/share/download.png": "ebab612e3b189fe56eeb5dd98e93cf4d",
"assets/assets/share/instagram.png": "cfe83be980a6a9e0aa67cb61053654c9",
"assets/assets/share/file.png": "90d16c727634ffb07b7b2f704d789d5d",
"assets/assets/share/kakao.png": "5a072b9a0536e70e6199125f93b8fd87",
"assets/assets/share/facebook.png": "921179cceac720d8982c802c9e6fb2a7",
"canvaskit/canvaskit.js": "2bc454a691c631b07a9307ac4ca47797",
"canvaskit/profiling/canvaskit.js": "38164e5a72bdad0faa4ce740c9b8e564",
"canvaskit/profiling/canvaskit.wasm": "95a45378b69e77af5ed2bc72b2209b94",
"canvaskit/canvaskit.wasm": "bf50631470eb967688cca13ee181af62"
};

// The application shell files that are downloaded before a service worker can
// start.
const CORE = [
  "main.dart.js",
"index.html",
"assets/AssetManifest.json",
"assets/FontManifest.json"];
// During install, the TEMP cache is populated with the application shell files.
self.addEventListener("install", (event) => {
  self.skipWaiting();
  return event.waitUntil(
    caches.open(TEMP).then((cache) => {
      return cache.addAll(
        CORE.map((value) => new Request(value, {'cache': 'reload'})));
    })
  );
});

// During activate, the cache is populated with the temp files downloaded in
// install. If this service worker is upgrading from one with a saved
// MANIFEST, then use this to retain unchanged resource files.
self.addEventListener("activate", function(event) {
  return event.waitUntil(async function() {
    try {
      var contentCache = await caches.open(CACHE_NAME);
      var tempCache = await caches.open(TEMP);
      var manifestCache = await caches.open(MANIFEST);
      var manifest = await manifestCache.match('manifest');
      // When there is no prior manifest, clear the entire cache.
      if (!manifest) {
        await caches.delete(CACHE_NAME);
        contentCache = await caches.open(CACHE_NAME);
        for (var request of await tempCache.keys()) {
          var response = await tempCache.match(request);
          await contentCache.put(request, response);
        }
        await caches.delete(TEMP);
        // Save the manifest to make future upgrades efficient.
        await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
        return;
      }
      var oldManifest = await manifest.json();
      var origin = self.location.origin;
      for (var request of await contentCache.keys()) {
        var key = request.url.substring(origin.length + 1);
        if (key == "") {
          key = "/";
        }
        // If a resource from the old manifest is not in the new cache, or if
        // the MD5 sum has changed, delete it. Otherwise the resource is left
        // in the cache and can be reused by the new service worker.
        if (!RESOURCES[key] || RESOURCES[key] != oldManifest[key]) {
          await contentCache.delete(request);
        }
      }
      // Populate the cache with the app shell TEMP files, potentially overwriting
      // cache files preserved above.
      for (var request of await tempCache.keys()) {
        var response = await tempCache.match(request);
        await contentCache.put(request, response);
      }
      await caches.delete(TEMP);
      // Save the manifest to make future upgrades efficient.
      await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
      return;
    } catch (err) {
      // On an unhandled exception the state of the cache cannot be guaranteed.
      console.error('Failed to upgrade service worker: ' + err);
      await caches.delete(CACHE_NAME);
      await caches.delete(TEMP);
      await caches.delete(MANIFEST);
    }
  }());
});

// The fetch handler redirects requests for RESOURCE files to the service
// worker cache.
self.addEventListener("fetch", (event) => {
  if (event.request.method !== 'GET') {
    return;
  }
  var origin = self.location.origin;
  var key = event.request.url.substring(origin.length + 1);
  // Redirect URLs to the index.html
  if (key.indexOf('?v=') != -1) {
    key = key.split('?v=')[0];
  }
  if (event.request.url == origin || event.request.url.startsWith(origin + '/#') || key == '') {
    key = '/';
  }
  // If the URL is not the RESOURCE list then return to signal that the
  // browser should take over.
  if (!RESOURCES[key]) {
    return;
  }
  // If the URL is the index.html, perform an online-first request.
  if (key == '/') {
    return onlineFirst(event);
  }
  event.respondWith(caches.open(CACHE_NAME)
    .then((cache) =>  {
      return cache.match(event.request).then((response) => {
        // Either respond with the cached resource, or perform a fetch and
        // lazily populate the cache only if the resource was successfully fetched.
        return response || fetch(event.request).then((response) => {
          if (response && Boolean(response.ok)) {
            cache.put(event.request, response.clone());
          }
          return response;
        });
      })
    })
  );
});

self.addEventListener('message', (event) => {
  // SkipWaiting can be used to immediately activate a waiting service worker.
  // This will also require a page refresh triggered by the main worker.
  if (event.data === 'skipWaiting') {
    self.skipWaiting();
    return;
  }
  if (event.data === 'downloadOffline') {
    downloadOffline();
    return;
  }
});

// Download offline will check the RESOURCES for all files not in the cache
// and populate them.
async function downloadOffline() {
  var resources = [];
  var contentCache = await caches.open(CACHE_NAME);
  var currentContent = {};
  for (var request of await contentCache.keys()) {
    var key = request.url.substring(origin.length + 1);
    if (key == "") {
      key = "/";
    }
    currentContent[key] = true;
  }
  for (var resourceKey of Object.keys(RESOURCES)) {
    if (!currentContent[resourceKey]) {
      resources.push(resourceKey);
    }
  }
  return contentCache.addAll(resources);
}

// Attempt to download the resource online before falling back to
// the offline cache.
function onlineFirst(event) {
  return event.respondWith(
    fetch(event.request).then((response) => {
      return caches.open(CACHE_NAME).then((cache) => {
        cache.put(event.request, response.clone());
        return response;
      });
    }).catch((error) => {
      return caches.open(CACHE_NAME).then((cache) => {
        return cache.match(event.request).then((response) => {
          if (response != null) {
            return response;
          }
          throw error;
        });
      });
    })
  );
}
