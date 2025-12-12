/**
 * Migration Script: Update vendorId to use user.uid
 * 
 * This script updates all products and orders in Firestore to use the vendor's
 * Firebase Auth user.uid instead of the vendor document ID.
 * 
 * IMPORTANT: Run this script ONCE to migrate existing data.
 * 
 * Usage:
 *   npx tsx scripts/migrate-vendor-ids.ts
 */

import { initializeApp } from 'firebase/app';
import {
    getFirestore,
    collection,
    getDocs,
    doc,
    updateDoc,
    query,
    where,
    writeBatch
} from 'firebase/firestore';
import { firebaseConfig } from '../src/firebase/config';

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app);

interface MigrationStats {
    vendorsProcessed: number;
    productsUpdated: number;
    ordersUpdated: number;
    errors: string[];
}

async function migrateVendorIds(): Promise<MigrationStats> {
    const stats: MigrationStats = {
        vendorsProcessed: 0,
        productsUpdated: 0,
        ordersUpdated: 0,
        errors: []
    };

    console.log('🚀 Starting vendorId migration...\n');

    try {
        // Get all vendors
        console.log('📋 Fetching all vendors...');
        const vendorsSnapshot = await getDocs(collection(firestore, 'vendors'));
        console.log(`Found ${vendorsSnapshot.size} vendors\n`);

        // Process each vendor
        for (const vendorDoc of vendorsSnapshot.docs) {
            const vendor = vendorDoc.data();
            const vendorDocId = vendorDoc.id;
            const vendorUserId = vendor.userId;

            if (!vendorUserId) {
                const error = `⚠️  Vendor ${vendorDocId} (${vendor.name}) has no userId field - SKIPPING`;
                console.log(error);
                stats.errors.push(error);
                continue;
            }

            console.log(`\n📦 Processing vendor: ${vendor.name}`);
            console.log(`   Document ID: ${vendorDocId}`);
            console.log(`   User ID: ${vendorUserId}`);

            // Update products for this vendor
            try {
                console.log('   🔍 Searching for products with old vendorId...');
                const productsSnapshot = await getDocs(
                    query(
                        collection(firestore, 'products'),
                        where('vendorId', '==', vendorDocId)
                    )
                );

                if (productsSnapshot.size > 0) {
                    console.log(`   ✏️  Updating ${productsSnapshot.size} products...`);

                    // Use batch for better performance
                    const batch = writeBatch(firestore);

                    for (const productDoc of productsSnapshot.docs) {
                        batch.update(doc(firestore, 'products', productDoc.id), {
                            vendorId: vendorUserId
                        });
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
                const ordersSnapshot = await getDocs(
                    query(
                        collection(firestore, 'orders'),
                        where('vendorId', '==', vendorDocId)
                    )
                );

                if (ordersSnapshot.size > 0) {
                    console.log(`   ✏️  Updating ${ordersSnapshot.size} orders...`);

                    // Use batch for better performance
                    const batch = writeBatch(firestore);

                    for (const orderDoc of ordersSnapshot.docs) {
                        batch.update(doc(firestore, 'orders', orderDoc.id), {
                            vendorId: vendorUserId
                        });
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
        console.log(`✅ Products updated: ${stats.productsUpdated}`);
        console.log(`✅ Orders updated: ${stats.ordersUpdated}`);

        if (stats.errors.length > 0) {
            console.log(`\n⚠️  Errors encountered: ${stats.errors.length}`);
            stats.errors.forEach(error => console.log(`   - ${error}`));
        } else {
            console.log('\n🎉 Migration completed successfully with no errors!');
        }

        return stats;

    } catch (error) {
        console.error('\n❌ FATAL ERROR during migration:', error);
        throw error;
    }
}

// Verification function to check if migration is needed
async function checkMigrationNeeded(): Promise<boolean> {
    console.log('🔍 Checking if migration is needed...\n');

    const vendorsSnapshot = await getDocs(collection(firestore, 'vendors'));

    for (const vendorDoc of vendorsSnapshot.docs) {
        const vendor = vendorDoc.data();
        const vendorDocId = vendorDoc.id;
        const vendorUserId = vendor.userId;

        if (!vendorUserId) {
            console.log(`⚠️  Vendor ${vendorDocId} has no userId - migration cannot proceed`);
            continue;
        }

        // Check for products with old format
        const productsSnapshot = await getDocs(
            query(
                collection(firestore, 'products'),
                where('vendorId', '==', vendorDocId)
            )
        );

        if (productsSnapshot.size > 0) {
            console.log(`✓ Found ${productsSnapshot.size} products needing migration for vendor ${vendor.name}`);
            return true;
        }

        // Check for orders with old format
        const ordersSnapshot = await getDocs(
            query(
                collection(firestore, 'orders'),
                where('vendorId', '==', vendorDocId)
            )
        );

        if (ordersSnapshot.size > 0) {
            console.log(`✓ Found ${ordersSnapshot.size} orders needing migration for vendor ${vendor.name}`);
            return true;
        }
    }

    console.log('✅ No migration needed - all data is already in correct format\n');
    return false;
}

// Main execution
async function main() {
    console.log('╔═══════════════════════════════════════════════════════════╗');
    console.log('║         STARIDES VENDORID MIGRATION SCRIPT                ║');
    console.log('╚═══════════════════════════════════════════════════════════╝\n');

    try {
        // Check if migration is needed
        const needsMigration = await checkMigrationNeeded();

        if (!needsMigration) {
            console.log('🎉 No migration needed. Exiting...');
            process.exit(0);
        }

        // Ask for confirmation (in a real scenario, you'd use a prompt library)
        console.log('\n⚠️  WARNING: This will modify your Firestore data!');
        console.log('   Make sure you have a backup before proceeding.\n');
        console.log('   Press Ctrl+C to cancel, or wait 5 seconds to continue...\n');

        // Wait 5 seconds
        await new Promise(resolve => setTimeout(resolve, 5000));

        // Run migration
        const stats = await migrateVendorIds();

        // Exit with appropriate code
        if (stats.errors.length > 0) {
            console.log('\n⚠️  Migration completed with errors. Please review the log above.');
            process.exit(1);
        } else {
            console.log('\n✅ Migration completed successfully!');
            process.exit(0);
        }

    } catch (error) {
        console.error('\n💥 Migration failed:', error);
        process.exit(1);
    }
}

// Run the script
main();
