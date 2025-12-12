'use server';

import { initializeServerFirebase } from '@/firebase/server-sdk';
import { collection, addDoc, query, where, getDocs, orderBy, serverTimestamp, Timestamp } from 'firebase/firestore';
import { revalidatePath } from 'next/cache';

export interface PayoutRequest {
    id?: string;
    userId: string;
    userType: 'vendor' | 'rider';
    amount: number;
    status: 'pending' | 'approved' | 'rejected' | 'processed';
    bankDetails: {
        bankName: string;
        accountNumber: string;
        accountName: string;
    };
    requestedAt: any; // Timestamp
    processedAt?: any; // Timestamp
    notes?: string;
}

export async function requestPayout(
    userId: string,
    userType: 'vendor' | 'rider',
    amount: number,
    bankDetails: PayoutRequest['bankDetails']
) {
    try {
        const { firestore } = initializeServerFirebase();

        // Basic validation
        if (amount <= 0) {
            return { success: false, error: 'Invalid amount' };
        }

        if (!bankDetails.bankName || !bankDetails.accountNumber || !bankDetails.accountName) {
            return { success: false, error: 'Incomplete bank details' };
        }

        const payoutData = {
            userId,
            userType,
            amount,
            status: 'pending',
            bankDetails,
            requestedAt: serverTimestamp(),
        };

        await addDoc(collection(firestore, 'payouts'), payoutData);

        revalidatePath(`/${userType}/earnings`);
        return { success: true };
    } catch (error: any) {
        console.error('Error requesting payout:', error);
        return { success: false, error: error.message };
    }
}

export async function getPayoutHistory(userId: string) {
    try {
        const { firestore } = initializeServerFirebase();
        const payoutsRef = collection(firestore, 'payouts');
        const q = query(
            payoutsRef,
            where('userId', '==', userId),
            orderBy('requestedAt', 'desc')
        );

        const snapshot = await getDocs(q);
        const payouts = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            // Convert timestamps to serializable format if needed, or handle in component
            requestedAt: doc.data().requestedAt?.toDate?.() || doc.data().requestedAt,
            processedAt: doc.data().processedAt?.toDate?.() || doc.data().processedAt,
        })) as PayoutRequest[];

        return { success: true, data: payouts };
    } catch (error: any) {
        console.error('Error fetching payout history:', error);
        return { success: false, error: error.message };
    }
}

export async function getAllPayoutRequests() {
    try {
        const { adminDb } = await import('@/firebase/admin');
        const payoutsRef = adminDb.collection('payouts');
        const snapshot = await payoutsRef.orderBy('requestedAt', 'desc').get();

        const payouts = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            requestedAt: doc.data().requestedAt?.toDate ? doc.data().requestedAt.toDate() : doc.data().requestedAt,
            processedAt: doc.data().processedAt?.toDate ? doc.data().processedAt.toDate() : doc.data().processedAt,
        })) as PayoutRequest[];

        return { success: true, data: payouts };
    } catch (error: any) {
        console.error('Error fetching all payout requests:', error);
        return { success: false, error: error.message };
    }
}

export async function processPayout(
    payoutId: string,
    status: 'processed' | 'rejected',
    notes?: string
) {
    try {
        const { adminDb } = await import('@/firebase/admin');
        const payoutRef = adminDb.collection('payouts').doc(payoutId);

        const payoutDoc = await payoutRef.get();
        if (!payoutDoc.exists) {
            return { success: false, error: 'Payout request not found' };
        }

        const payoutData = payoutDoc.data();
        const userId = payoutData?.userId;

        await payoutRef.update({
            status,
            processedAt: new Date(),
            notes: notes || null,
        });

        // Create notification for the user
        if (userId) {
            await adminDb.collection('users').doc(userId).collection('notifications').add({
                title: `Payout ${status === 'processed' ? 'Approved' : 'Rejected'}`,
                body: status === 'processed'
                    ? `Your payout request for ₦${payoutData?.amount} has been processed.`
                    : `Your payout request for ₦${payoutData?.amount} was rejected. Note: ${notes}`,
                read: false,
                createdAt: new Date(),
                type: 'payout_update',
                payoutId: payoutId
            });
        }

        revalidatePath('/admin/payouts');
        revalidatePath('/vendor/earnings');
        revalidatePath('/rider/earnings');

        return { success: true };
    } catch (error: any) {
        console.error('Error processing payout:', error);
        return { success: false, error: error.message };
    }
}
