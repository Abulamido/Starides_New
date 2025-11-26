'use server';

import { initializeFirebase } from '@/firebase';
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
        const { firestore } = initializeFirebase();

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
        const { firestore } = initializeFirebase();
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
