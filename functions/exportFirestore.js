const admin = require('firebase-admin');

// Force Firebase Admin SDK to use the Auth Emulator based on Google's latest documentation
process.env.FIREBASE_AUTH_EMULATOR_HOST = '127.0.0.1:9099';

// Initialize Firebase Admin explicitly for the emulator
admin.initializeApp({ projectId: 'fijo-help-beta' });

const auth = admin.auth();




const { getFirestore } = require('firebase-admin/firestore');

// Explicitly tell Firebase Admin SDK to use the emulator
process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8080';



const fs = require('fs');


const db = getFirestore();


async function exportFirestore() {
    const collections = await db.listCollections();
    let data = {};

    for (const collection of collections) {
        const snapshot = await collection.get();
        data[collection.id] = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    }

    fs.writeFileSync('firestore-export.json', JSON.stringify(data, null, 2));
    console.log('✅ Firestore data exported successfully to firestore-export.json');
}

exportFirestore();
