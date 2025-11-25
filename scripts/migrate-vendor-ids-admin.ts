/**
 * Admin Migration Script: Update vendorId to use user.uid
 * 
 * This version uses Firebase Admin SDK to bypass security rules.
 * 
 * IMPORTANT: This requires a service account key file.
 * 
 * Setup:
 * 1. Go to Firebase Console → Project Settings → Service Accounts
 * 2. Click "Generate New Private Key"
 * 3. Save as `service-account-key.json` in project root
 * 4. Add to .gitignore
 * 
 * Usage:
 *   npm run migrate:admin
 */

import * as admin from 'firebase-admin';
import * as fs from 'fs';
import * as path from 'path';

// Check for service account key
const serviceAccountPath = path.join(process.cwd(), 'service-account-key.json');

if (!fs.existsSync(serviceAccountPath)) {
    console.error('❌ ERROR: service-account-key.json not found!');
    console.error('\nTo fix this:');
    console.error('1. Go to Firebase Console → Project Settings → Service Accounts');
    console.error('2. Click "Generate New Private Key"');
    console.error('3. Save as service-account-key.json in project root');
    console.error('4. Run this script again\n');
    process.exit(1);
}

// Initialize Firebase Admin
const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

interface MigrationStats {
    vendorsProcessed: number;
    vendorsSkipped: number;
    productsUpdated: number;
    ordersUpdated: number;
    errors: string[];
}

async function migrateVendorIds(): Promise<MigrationStats> {
    const stats: MigrationStats = {
        vendorsProcessed: 0,
        vendorsSkipped: 0,
        productsUpdated: 0,
        ordersUpdated: 0,
        errors: []
    };

    console.log('🚀 Starting vendorId migration (Admin SDK)...\n');

    try {
        // Get all vendors
        console.log('📋 Fetching all vendors...');
        const vendorsSnapshot = await db.collection('vendors').get();
        console.log(`Found ${vendorsSnapshot.size} vendors\n`);

        // Process each vendor
        for (const vendorDoc of vendorsSnapshot.docs) {
            const vendor = vendorDoc.data();
            const vendorDocId = vendorDoc.id;
            const vendorUserId = vendor.userId;

            console.log(`\n📦 Processing vendor: ${vendor.name || vendorDocId}`);
            console.log(`   Document ID: ${vendorDocId}`);

            // Check if vendor has userId
            if (!vendorUserId) {
                const error = `⚠️  Vendor ${vendorDocId} has no userId field`;
                console.log(`   ${error}`);
                console.log(`   ℹ️  SKIPPING - Please add userId field manually`);
                console.log(`   💡 Tip: userId should be the Firebase Auth UID of the vendor owner`);
                stats.vendorsSkipped++;
                stats.errors.push(error);
                continue;
            }

            console.log(`   User ID: ${vendorUserId}`);

            // Update products for this vendor
            try {
                console.log('   🔍 Searching for products with old vendorId...');
                const productsSnapshot = await db.collection('products')
                    .where('vendorId', '==', vendorDocId)
                    .get();

                if (productsSnapshot.size > 0) {
                    console.log(`   ✏️  Updating ${productsSnapshot.size} products...`);

                    const batch = db.batch();

                    for (const productDoc of productsSnapshot.docs) {
                        batch.update(productDoc.ref, { vendorId: vendorUserId });
                    }

                    await batch.commit();
                    stats.productsUpdated += productsSnapshot.size;
                    console.log(`   ✅ Updated ${productsSnapshot.size} products`);
                } else {
                    console.log('   ℹ️  No products found with old vendorId format');
                }
            } catch (error) {
                const errorMsg = `Error updating products for vendor ${vendorDocId}: ${error}`;
                console.error(`   ❌ ${errorMsg}`);
                stats.errors.push(errorMsg);
            }

            // Update orders for this vendor
            try {
                console.log('   🔍 Searching for orders with old vendorId...');
                const ordersSnapshot = await db.collection('orders')
                    .where('vendorId', '==', vendorDocId)
                    .get();

                if (ordersSnapshot.size > 0) {
                    console.log(`   ✏️  Updating ${ordersSnapshot.size} orders...`);

                    const batch = db.batch();

                    for (const orderDoc of ordersSnapshot.docs) {
                        batch.update(orderDoc.ref, { vendorId: vendorUserId });
                    }

                    await batch.commit();
                    stats.ordersUpdated += ordersSnapshot.size;
                    console.log(`   ✅ Updated ${ordersSnapshot.size} orders`);
                } else {
                    console.log('   ℹ️  No orders found with old vendorId format');
                }
            } catch (error) {
                const errorMsg = `Error updating orders for vendor ${vendorDocId}: ${error}`;
                console.error(`   ❌ ${errorMsg}`);
                stats.errors.push(errorMsg);
            }

            stats.vendorsProcessed++;
        }

        // Print summary
        console.log('\n' + '='.repeat(60));
        console.log('📊 MIGRATION SUMMARY');
        console.log('='.repeat(60));
        console.log(`✅ Vendors processed: ${stats.vendorsProcessed}`);
        console.log(`⚠️  Vendors skipped: ${stats.vendorsSkipped}`);
        console.log(`✅ Products updated: ${stats.productsUpdated}`);
        console.log(`✅ Orders updated: ${stats.ordersUpdated}`);

        if (stats.errors.length > 0) {
            console.log(`\n⚠️  Issues encountered: ${stats.errors.length}`);
            stats.errors.forEach(error => console.log(`   - ${error}`));
        }

        if (stats.vendorsSkipped > 0) {
            console.log('\n💡 ACTION REQUIRED:');
            console.log('   Some vendors are missing the userId field.');
            console.log('   Please add this field manually in Firestore Console:');
            console.log('   1. Go to Firestore → vendors collection');
            console.log('   2. For each vendor, add field: userId = <Firebase Auth UID>');
        }

        if (stats.errors.length === 0 && stats.vendorsSkipped === 0) {
            console.log('\n🎉 Migration completed successfully with no errors!');
        }

        return stats;

    } catch (error) {
        console.error('\n❌ FATAL ERROR during migration:', error);
        throw error;
    }
}

async function main() {
    console.log('╔═══════════════════════════════════════════════════════════╗');
    console.log('║    STARIDES VENDORID MIGRATION SCRIPT (ADMIN SDK)         ║');
    console.log('╚═══════════════════════════════════════════════════════════╝\n');

    try {
        console.log('⚠️  WARNING: This will modify your Firestore data!');
        console.log('   Make sure you have a backup before proceeding.\n');
        console.log('   Press Ctrl+C to cancel, or wait 5 seconds to continue...\n');

        await new Promise(resolve => setTimeout(resolve, 5000));

        const stats = await migrateVendorIds();

        if (stats.errors.length > 0 || stats.vendorsSkipped > 0) {
            console.log('\n⚠️  Migration completed with warnings. Please review the log above.');
            process.exit(1);
        } else {
            console.log('\n✅ Migration completed successfully!');
            process.exit(0);
        }

    } catch (error) {
        console.error('\n💥 Migration failed:', error);
        process.exit(1);
    } finally {
        // Cleanup
        await admin.app().delete();
    }
}

main();
