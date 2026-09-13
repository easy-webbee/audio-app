// messaging.onBackgroundMessage((payload) => {
//   alert("[firebase-messaging-sw.js] Background message", payload);

//   const title = payload.notification?.title || "Stock Alert";

//   const options = {
//     body: payload.notification?.body || "New alert",
//     icon: "/assets/icons/icon-192x192.png",
//     badge: "/assets/icons/icon-192x192.png",
//     data: payload.data || {},
//   };

//   self.registration.showNotification(title, options);
// });
importScripts(
  "https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js"
);
importScripts(
  "https://www.gstatic.com/firebasejs/10.14.1/firebase-messaging-compat.js"
);

firebase.initializeApp({
  apiKey: "AIzaSyDhblBArQO8aPgn10DS4hEIIsuHmq_q4Zk",
  authDomain: "mymusicplayers.firebaseapp.com",
  databaseURL: "https://mymusicplayers-default-rtdb.firebaseio.com",
  projectId: "mymusicplayers",
  storageBucket: "mymusicplayers.firebasestorage.app",
  messagingSenderId: "350321423491",
  appId: "1:350321423491:web:0eb892669e74947623d7b6",
  measurementId: "G-SMQS7ZY1JR",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const notification = payload.notification || {};

  self.registration.showNotification(notification.title || "Notification", {
    body: notification.body || "",
    icon: "/assets/icons/icon-192x192.png",
    data: {
      channelId: payload.data?.channelId,
      messageId: payload.data?.messageId,
      ticker: payload.data?.ticker,
    },
  });
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  event.waitUntil(
    self.registration.showNotification("CLICK WORKED", {
      body: "notificationclick fired",
      tag: "click-test"
    })
  );
});
