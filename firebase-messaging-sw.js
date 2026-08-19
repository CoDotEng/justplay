try {
    // Import the background versions of Firebase
    importScripts('https://www.gstatic.com/firebasejs/10.8.1/firebase-app-compat.js');
    importScripts('https://www.gstatic.com/firebasejs/10.8.1/firebase-messaging-compat.js');

    // Initialize Firebase in the background
    firebase.initializeApp({
        apiKey: "AIzaSyCiuGG-yNq5LUSbVgDaOY3SjzcCD0ywXyI",
        authDomain: "justplay-booking-engine.firebaseapp.com",
        projectId: "justplay-booking-engine",
        storageBucket: "justplay-booking-engine.firebasestorage.app",
        messagingSenderId: "275838911544",
        appId: "1:275838911544:web:c23d5f7054fb4f9b5592cd"
    });

    const messaging = firebase.messaging();

    // THE FORCED ANTENNA: Tells the phone exactly how to draw the notification
    messaging.onBackgroundMessage((payload) => {
        console.log("Received background message: ", payload);
        const notificationTitle = payload.notification.title;
        const notificationOptions = {
            body: payload.notification.body,
            icon: '/icon.png' 
        };
        self.registration.showNotification(notificationTitle, notificationOptions);
    });

    // 🚨 THE PWA BYPASS 🚨
    // This empty listener literally just exists to trick Chrome into thinking 
    // we have offline capabilities so it gives us the "Install App" button.
    self.addEventListener('fetch', function(event) {
        // Do nothing, just exist.
    });

    console.log("Firebase Background Worker Loaded Successfully! 🚀");
} catch (error) {
    console.error("The Background Worker Crashed:", error);
}
