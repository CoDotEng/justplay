importScripts("https://www.gstatic.com/firebasejs/10.8.1/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.8.1/firebase-messaging-compat.js");

const firebaseConfig = {
  apiKey: "AIzaSyCiuGG-yNq5LUSbVgDaOY3SjzcCD0ywXyI",
  authDomain: "justplay-booking-engine.firebaseapp.com",
  projectId: "justplay-booking-engine",
  storageBucket: "justplay-booking-engine.firebasestorage.app",
  messagingSenderId: "275838911544",
  appId: "1:275838911544:web:c23d5f7054fb4f9b5592cd"
};

const messaging = firebase.messaging();

// This runs when the admin receives a ping while the app is in the background
messaging.onBackgroundMessage((payload) => {
    console.log("Ghost script received ping: ", payload);
    const notificationTitle = payload.notification.title;
    const notificationOptions = {
        body: payload.notification.body,
        icon: "/icon.png" // The logo that shows on his lock screen
    };
    self.registration.showNotification(notificationTitle, notificationOptions);
});
