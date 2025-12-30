const express = require('express');
const admin = require('firebase-admin');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

let fcmInitialized = false;

function initializeFirebase() {
    if (fcmInitialized) return;

    try {
        const serviceAccount = require('./firebase-service-account.json');

        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });

        fcmInitialized = true;
        console.log('Firebase Admin initialized successfully');
    } catch (error) {
        console.error('Error initializing Firebase Admin:', error.message);
        console.log('Make sure firebase-service-account.json is present');
    }
}

initializeFirebase();

app.get('/', (req, res) => {
    res.json({
        message: 'FCM Notification Server',
        endpoints: {
            '/send': 'POST - Send a notification to a device',
            '/send-to-topic': 'POST - Send a notification to a topic'
        }
    });
});

app.post('/send', async (req, res) => {
    if (!fcmInitialized) {
        return res.status(500).json({
            success: false,
            error: 'Firebase not initialized. Check firebase-service-account.json'
        });
    }

    const { token, title, body, data } = req.body;

    if (!token) {
        return res.status(400).json({
            success: false,
            error: 'Device token is required'
        });
    }

    const message = {
        notification: {
            title: title || 'Test Notification',
            body: body || 'This is a test notification from the server'
        },
        data: data || {
            timestamp: new Date().toISOString()
        },
        token: token
    };

    try {
        const response = await admin.messaging().send(message);
        console.log('Successfully sent message:', response);

        res.json({
            success: true,
            messageId: response,
            sentAt: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error sending message:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

app.post('/send-to-topic', async (req, res) => {
    if (!fcmInitialized) {
        return res.status(500).json({
            success: false,
            error: 'Firebase not initialized. Check firebase-service-account.json'
        });
    }

    const { topic, title, body, data } = req.body;

    if (!topic) {
        return res.status(400).json({
            success: false,
            error: 'Topic is required'
        });
    }

    const message = {
        notification: {
            title: title || 'Test Notification',
            body: body || 'This is a test notification from the server'
        },
        data: data || {
            timestamp: new Date().toISOString()
        },
        topic: topic
    };

    try {
        const response = await admin.messaging().send(message);
        console.log('Successfully sent message to topic:', response);

        res.json({
            success: true,
            messageId: response,
            sentAt: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error sending message:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

app.listen(PORT, () => {
    console.log(`\n🚀 FCM Notification Server running on http://localhost:${PORT}`);
    console.log(`\nEndpoints:`);
    console.log(`  GET  / - Server info`);
    console.log(`  POST /send - Send notification to a device`);
    console.log(`  POST /send-to-topic - Send notification to a topic\n`);
});
