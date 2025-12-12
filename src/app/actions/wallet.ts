'use server';

import { adminDb } from '@/firebase/admin';
import { verifyPaystackTransaction } from '@/lib/paystack';
import { FieldValue } from 'firebase-admin/firestore';

export async function getWallet(userId: string) {
    try {
        const walletDoc = await adminDb.collection('wallets').doc(userId).get();

        if (!walletDoc.exists) {
            // Create wallet if it doesn't exist
            await adminDb.collection('wallets').doc(userId).set({
                userId,
                balance: 0,
                updatedAt: FieldValue.serverTimestamp(),
            });
            return { balance: 0 };
        }

        return walletDoc.data();
    } catch (error) {
        console.error('Error fetching wallet:', error);
        throw new Error('Failed to fetch wallet');
    }
}

export async function verifyTopUp(reference: string, userId: string) {
    try {
        // 1. Verify with Paystack
        const verification = await verifyPaystackTransaction(reference);

        if (!verification.success) {
            return { success: false, message: verification.message || 'Verification failed' };
        }

        const { amount, status, reference: verifiedRef } = verification.data;

        if (status !== 'success') {
            return { success: false, message: 'Transaction was not successful' };
        }

        // Amount is in kobo, convert to Naira
        const amountNaira = amount / 100;

        // 2. Check if transaction already processed
        const transactionQuery = await adminDb.collection('transactions')
            .where('reference', '==', verifiedRef)
            .get();

        if (!transactionQuery.empty) {
            return { success: false, message: 'Transaction already processed' };
        }

        // 3. Update Wallet & Create Transaction (Atomic Batch)
        const batch = adminDb.batch();
        const walletRef = adminDb.collection('wallets').doc(userId);
        const transactionRef = adminDb.collection('transactions').doc();

        batch.set(walletRef, {
            balance: FieldValue.increment(amountNaira),
            updatedAt: FieldValue.serverTimestamp(),
        }, { merge: true });

        batch.set(transactionRef, {
            userId,
            type: 'credit',
            amount: amountNaira,
            description: 'Wallet Top-up',
            reference: verifiedRef,
            status: 'success',
            createdAt: FieldValue.serverTimestamp(),
            metadata: verification.data,
        });

        // 4. Save Card Authorization (if reusable)
        const { authorization } = verification.data;
        if (authorization && authorization.reusable && authorization.channel === 'card') {
            const cardRef = adminDb.collection('users').doc(userId).collection('savedCards').doc(authorization.authorization_code);
            batch.set(cardRef, {
                userId,
                authorizationCode: authorization.authorization_code,
                last4: authorization.last4,
                expMonth: authorization.exp_month,
                expYear: authorization.exp_year,
                cardType: authorization.card_type,
                bank: authorization.bank,
                brand: authorization.brand,
                signature: authorization.signature,
                reusable: authorization.reusable,
                updatedAt: FieldValue.serverTimestamp(),
            }, { merge: true });
        }

        await batch.commit();

        return { success: true, message: 'Wallet credited successfully', newBalance: amountNaira }; // Note: newBalance here is just the added amount, client should refetch
    } catch (error) {
        console.error('Error verifying top-up:', error);
        return { success: false, message: 'Internal server error' };
    }
}

export async function processWalletPayment(userId: string, amount: number, orderId: string) {
    try {
        const walletRef = adminDb.collection('wallets').doc(userId);

        // Run transaction to ensure atomic balance check and update
        const result = await adminDb.runTransaction(async (t) => {
            const walletDoc = await t.get(walletRef);

            if (!walletDoc.exists) {
                throw new Error('Wallet not found');
            }

            const currentBalance = walletDoc.data()?.balance || 0;

            if (currentBalance < amount) {
                throw new Error('Insufficient funds');
            }

            const transactionRef = adminDb.collection('transactions').doc();

            t.update(walletRef, {
                balance: FieldValue.increment(-amount),
                updatedAt: FieldValue.serverTimestamp(),
            });

            t.set(transactionRef, {
                userId,
                type: 'debit',
                amount: amount,
                description: `Payment for Order #${orderId}`,
                reference: orderId, // Using orderId as reference for internal payments
                status: 'success',
                createdAt: FieldValue.serverTimestamp(),
            });

            return { success: true };
        });

        return { success: true };
    } catch (error: any) {
        console.error('Error processing wallet payment:', error);
        return { success: false, message: error.message || 'Payment failed' };
    }
}
