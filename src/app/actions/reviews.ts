'use server';

import { adminDb } from '@/firebase/admin';
import { FieldValue } from 'firebase-admin/firestore';
import { revalidatePath } from 'next/cache';
import { sendPushNotification } from './push';

interface SubmitReviewData {
    orderId: string;
    customerId: string;
    vendorId: string;
    riderId?: string;
    vendorRating: number;
    vendorReview?: string;
    riderRating?: number;
    riderReview?: string;
}

export async function submitReview(reviewData: SubmitReviewData) {
    try {
        // Check if review already exists for this order
        const reviewsRef = adminDb.collection('reviews');
        const existingReviewQuery = await reviewsRef.where('orderId', '==', reviewData.orderId).get();

        if (!existingReviewQuery.empty) {
            return { success: false, error: 'You have already reviewed this order.' };
        }

        // Create review document
        await reviewsRef.add({
            ...reviewData,
            createdAt: FieldValue.serverTimestamp(),
            updatedAt: FieldValue.serverTimestamp(),
        });

        // Mark order as reviewed
        await adminDb.collection('orders').doc(reviewData.orderId).update({
            hasReview: true,
            updatedAt: FieldValue.serverTimestamp(),
        });

        // Update vendor rating
        await calculateVendorRating(reviewData.vendorId);

        // Notify vendor
        await sendPushNotification({
            userId: reviewData.vendorId,
            title: 'New Review! ⭐',
            body: `A customer rated you ${reviewData.vendorRating} stars for order #${reviewData.orderId.slice(0, 8)}`,
            data: { orderId: reviewData.orderId, type: 'new_review' }
        });

        // Update rider rating if applicable
        if (reviewData.riderId && reviewData.riderRating) {
            await calculateRiderRating(reviewData.riderId);

            // Notify rider
            await sendPushNotification({
                userId: reviewData.riderId,
                title: 'New Review! ⭐',
                body: `A customer rated you ${reviewData.riderRating} stars for order #${reviewData.orderId.slice(0, 8)}`,
                data: { orderId: reviewData.orderId, type: 'new_review' }
            });
        }

        revalidatePath('/customer/orders'); // Optional: revalidate orders list
        return { success: true };
    } catch (error: any) {
        console.error('Error submitting review:', error);
        return { success: false, error: error.message || 'Failed to submit review' };
    }
}

export async function calculateVendorRating(vendorId: string) {
    try {
        // Get all reviews for this vendor
        const reviewsSnapshot = await adminDb.collection('reviews')
            .where('vendorId', '==', vendorId)
            .get();

        let totalRating = 0;
        let count = 0;

        reviewsSnapshot.forEach((doc) => {
            const review = doc.data();
            if (review.vendorRating) {
                totalRating += review.vendorRating;
                count++;
            }
        });

        const averageRating = count > 0 ? totalRating / count : 0;

        // Update vendor document
        await adminDb.collection('vendors').doc(vendorId).update({
            rating: Number(averageRating.toFixed(1)),
            reviewCount: count,
            updatedAt: FieldValue.serverTimestamp(),
        });

        return { success: true, rating: averageRating, count };
    } catch (error: any) {
        console.error('Error calculating vendor rating:', error);
        return { success: false, error: error.message };
    }
}

export async function calculateRiderRating(riderId: string) {
    try {
        // Get all reviews for this rider
        const reviewsSnapshot = await adminDb.collection('reviews')
            .where('riderId', '==', riderId)
            .get();

        let totalRating = 0;
        let count = 0;

        reviewsSnapshot.forEach((doc) => {
            const review = doc.data();
            if (review.riderRating) {
                totalRating += review.riderRating;
                count++;
            }
        });

        const averageRating = count > 0 ? totalRating / count : 0;

        // Update rider document
        await adminDb.collection('riders').doc(riderId).update({
            rating: Number(averageRating.toFixed(1)),
            reviewCount: count,
            updatedAt: FieldValue.serverTimestamp(),
        });

        return { success: true, rating: averageRating, count };
    } catch (error: any) {
        console.error('Error calculating rider rating:', error);
        return { success: false, error: error.message };
    }
}

export async function getVendorReviews(vendorId: string) {
    try {
        const reviewsSnapshot = await adminDb.collection('reviews')
            .where('vendorId', '==', vendorId)
            .get();

        const reviews: any[] = [];
        reviewsSnapshot.forEach((doc) => {
            reviews.push({ id: doc.id, ...doc.data() });
        });

        return { success: true, reviews };
    } catch (error: any) {
        console.error('Error fetching vendor reviews:', error);
        return { success: false, error: error.message, reviews: [] };
    }
}

export async function getRiderReviews(riderId: string) {
    try {
        const reviewsSnapshot = await adminDb.collection('reviews')
            .where('riderId', '==', riderId)
            .get();

        const reviews: any[] = [];
        reviewsSnapshot.forEach((doc) => {
            const data = doc.data();
            if (data.riderRating) {
                reviews.push({ id: doc.id, ...data });
            }
        });

        return { success: true, reviews };
    } catch (error: any) {
        console.error('Error fetching rider reviews:', error);
        return { success: false, error: error.message, reviews: [] };
    }
}
