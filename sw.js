const CACHE_NAME = "om-lab-v2";
const ASSETS = [
  "./",
  "./index.html",
  "./styles.css",
  "./app.js",
  "./manifest.webmanifest",
  "./assets/icon-192.png",
  "./assets/icon-512.png",
];

// 1. التثبيت - جلب الملفات وتخزينها
self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // استخدمنا map عشان لو ملف واحد فشل، الباقي يتسجل عادي وما يوقفش الخدمة
      return Promise.all(
        ASSETS.map((url) => {
          return cache
            .add(url)
            .catch((err) => console.error("فشل تحميل الملف:", url, err));
        }),
      );
    }),
  );
  self.skipWaiting(); // تفعيل الخدمة فوراً
});

// 2. التفعيل - حذف الكاش القديم تلقائياً
self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        }),
      );
    }),
  );
  self.clients.claim(); // السيطرة على الصفحة فوراً
});

// 3. جلب البيانات - استراتيجية (الكاش أولاً ثم الشبكة)
self.addEventListener("fetch", (e) => {
  // تصفية الطلبات: فقط الملفات المحلية والصفحات أو السكربتات
  if (e.request.url.startsWith(self.location.origin)) {
    e.respondWith(
      caches.match(e.request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }

        // إذا لم يكن في الكاش، اطلبه من الشبكة
        return fetch(e.request)
          .then((networkResponse) => {
            // تأكد أن الاستجابة صالحة قبل تخزينها (اختياري)
            if (!networkResponse || networkResponse.status !== 200) {
              return networkResponse;
            }
            return networkResponse;
          })
          .catch(() => {
            // إذا كان المستخدم أوفلاين والصفحة غير موجودة بالكاش
            if (e.request.mode === "navigate") {
              return caches.match("./index.html");
            }
          });
      }),
    );
  }
});
