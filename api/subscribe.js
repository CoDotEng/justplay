import admin from 'firebase-admin';

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
        })
    });
}

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: "Method not allowed" });

    const { token } = req.body;
    if (!token) return res.status(400).json({ error: "Missing token" });

    try {
        // This hooks your specific phone up to the admin radio tower
        await admin.messaging().subscribeToTopic(token, 'admin');
        return res.status(200).json({ success: true, message: "Phone officially subscribed to admin topic!" });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}
