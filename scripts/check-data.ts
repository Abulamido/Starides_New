/**
 * Check Firestore Data - Simple diagnostic script
 */

import * as admin from 'firebase-admin';
import * as fs from 'fs';
import * as path from 'path';

const serviceAccountPath = path.join(process.cwd(), 'service-account-key.json');
const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function checkData() {
    console.log('🔍 Checking Firestore data...\n');

    // Check vendors
    const vendorsSnapshot = await db.collection('vendors').get();
    console.log(`📊 Found ${vendorsSnapshot.size} vendors:\n`);

    for (const vendorDoc of vendorsSnapshot.docs) {
        const vendor = vendorDoc.data();
        console.log(`Vendor: ${vendor.name || 'Unnamed'}`);
        console.log(`  Document ID: ${vendorDoc.id}`);
        console.log(`  User ID: ${vendor.userId || '❌ MISSING'}`);
        console.log('');
    }

    // Check products
    const productsSnapshot = await db.collection('products').limit(5).get();
    console.log(`\n📦 Sample products (showing first 5):\n`);

    for (const productDoc of productsSnapshot.docs) {
        const product = productDoc.data();
        console.log(`Product: ${product.name}`);
        console.log(`  vendorId: ${product.vendorId}`);
        console.log('');
    }

    // Check orders
    const ordersSnapshot = await db.collection('orders').limit(5).get();
    console.log(`\n📋 Sample orders (showing first 5):\n`);

    for (const orderDoc of ordersSnapshot.docs) {
        const order = orderDoc.data();
        console.log(`Order: ${orderDoc.id.substring(0, 8)}...`);
        console.log(`  vendorId: ${order.vendorId}`);
        console.log(`  customerId: ${order.customerId}`);
        console.log('');
    }

    await admin.app().delete();
}

checkData().catch(console.error);
