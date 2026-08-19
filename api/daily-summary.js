import admin from 'firebase-admin';

// Initialize Firebase Admin (Same as your other API route)
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
    // DEBUG MODE: Find out exactly what is failing
    if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
        return res.status(401).json({ 
            error: "Authentication Failed",
            whatWeReceivedFromCronJob: req.headers.authorization || "Absolutely Nothing",
            didVercelLoadThePassword: process.env.CRON_SECRET ? "YES" : "NO, IT IS MISSING"
        });
    }

    try {
        const db = admin.firestore();
        
        // Get today's date in IST (Indian Standard Time)
        const now = new Date();
        const options = { timeZone: 'Asia/Kolkata', year: 'numeric', month: '2-digit', day: '2-digit' };
        const formatter = new Intl.DateTimeFormat('en-CA', options); // Formats as YYYY-MM-DD
        const todayString = formatter.format(now);

        // Fetch all bookings for TODAY
        const snapshot = await db.collection('bookings').where('date', '==', todayString).get();

        // The Pricing Engine
        const RATES = { "PC": 110, "PS5_42": 130, "PS5_65": 160, "SIM": 200 };
        let totals = { "PC": 0, "PS5_42": 0, "PS5_65": 0, "SIM": 0, "Grand": 0 };

        // Do the Math
        snapshot.forEach(doc => {
            const data = doc.data();
            const rate = RATES[data.console] || 100;
            const bill = rate * data.duration;
            
            if (totals[data.console] !== undefined) {
                totals[data.console] += bill;
            }
            totals.Grand += bill;
        });

        // Format the Push Notification Text
        const messageBody = `💰 Total: ₹${totals.Grand}\n🖥️ PC: ₹${totals.PC} | 🎮 42": ₹${totals.PS5_42}\n📺 65": ₹${totals.PS5_65} | 🏎️ SIM: ₹${totals.SIM}`;

        // Send Push Notification to the Admin Topic
        await admin.messaging().send({
            topic: 'admin', // Ensure your service worker subscribes the owner to this topic!
            notification: {
                title: '📈 Daily Revenue Summary',
                body: messageBody,
            }
        });

        return res.status(200).json({ success: true, message: "Summary sent to owner", totals });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: error.message });
    }
}
