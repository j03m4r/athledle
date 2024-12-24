import admin from 'firebase-admin';
import fs from 'fs/promises';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const serviceAccount = require('./athledle-firebase-adminsdk-mr10f-450b8a4ebb.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

const athletes = JSON.parse(await fs.readFile('./athletes_full.json', 'utf8'));

async function uploadDocuments() {
  const collectionName = 'athletes';

  const today = new Date();
  for (let idx = 0; idx < athletes.length; idx++) {
    if (athletes[idx]["team"] == "NA") continue;
    const doc = athletes[idx]
    const athledleDate = new Date(today);
    athledleDate.setDate(today.getDate() + idx);
    const date_str = athledleDate.toISOString().split('T')[0];
    try {
      await db.collection(collectionName).doc(date_str).set(doc);
    } catch (error) {
      console.error(`Error uploading document:`, error);
    }
  }

  console.log('All documents uploaded.');
}

// Run the Script
uploadDocuments().catch(console.error);

