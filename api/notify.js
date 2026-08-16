import admin from 'firebase-admin';

// Vercel Serverless Functions can "fall asleep". This wakes Firebase up properly.
if (!admin.apps.length) {
    try {
        // We pull the secret server key from Vercel's secure vault (Environment Variables)
        const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });
    } catch (error) {
        console.error('Firebase Admin Init Error:', error);
    }
}

export default async function handler(req, res) {
    // Only allow POST requests (gamers sending data)
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { name, consoleType, timeString } = req.body;
        const db = admin.firestore();

        // 1. Fetch the Owner's phone token from Firestore
        const tokenDoc = await db.collection('admin_settings').doc('push_token').get();

        if (!tokenDoc.exists) {
            return res.status(400).json({ error: 'Admin has not enabled notifications yet.' });
        }

        const adminToken = tokenDoc.data().token;

        // 2. Build the notification that will appear on his lock screen
        const message = {
            notification: {
                title: '🚨 NEW BOOKING ALERT',
                body: `${name} just secured the ${consoleType} for ${timeString}.`,
            },
            token: adminToken,
        };

        // 3. Fire the notification through Google's servers directly to his phone
        const response = await admin.messaging().send(message);

        return res.status(200).json({ success: true, messageId: response });

    } catch (error) {
        console.error('Error sending push ping:', error);
        return res.status(500).json({ error: error.message });
    }
}
