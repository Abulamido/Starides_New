/**
 * Fix Vendor Missing userId
 * 
 * This script adds the userId field to the vendor that's missing it.
 * For vendors where userId is missing, we'll set userId = document ID
 * (assuming the vendor's Firebase Auth UID matches their document ID)
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

async function fixVendorUserId() {
    console.log('🔧 Fixing vendor userId fields...\n');

    const vendorsSnapshot = await db.collection('vendors').get();

    let fixed = 0;
    let skipped = 0;

    for (const vendorDoc of vendorsSnapshot.docs) {
        const vendor = vendorDoc.data();
        const vendorDocId = vendorDoc.id;

        if (!vendor.userId) {
            console.log(`📝 Fixing vendor: ${vendor.name || vendorDocId}`);
            console.log(`   Document ID: ${vendorDocId}`);
            console.log(`   Setting userId = ${vendorDocId}`);

            await vendorDoc.ref.update({
                userId: vendorDocId
            });

            console.log(`   ✅ Fixed!\n`);
            fixed++;
        } else {
            console.log(`✓ Vendor ${vendor.name || vendorDocId} already has userId\n`);
            skipped++;
        }
    }

    console.log('='.repeat(60));
    console.log(`✅ Fixed: ${fixed} vendors`);
    console.log(`✓ Skipped: ${skipped} vendors (already had userId)`);
    console.log('='.repeat(60));

    await admin.app().delete();
}

fixVendorUserId().catch(console.error);
