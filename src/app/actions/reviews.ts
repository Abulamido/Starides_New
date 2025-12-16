'use server';

import { initializeServerFirebase } from '@/firebase/server-sdk';
import { collection, addDoc, serverTimestamp, doc, updateDoc, query, where, getDocs } from 'firebase/firestore';

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
        const { firestore: db } = initializeServerFirebase();

        // Check if review already exists for this order
        const reviewsRef = collection(db, 'reviews');
        const existingReviewQuery = query(reviewsRef, where('orderId', '==', reviewData.orderId));
        const existingReviews = await getDocs(existingReviewQuery);

        if (!existingReviews.empty) {
            return { success: false, error: 'You have already reviewed this order.' };
        }

        // Create review document
        await addDoc(reviewsRef, {
            ...reviewData,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        });

        // Mark order as reviewed
        const orderRef = doc(db, 'orders', reviewData.orderId);
        await updateDoc(orderRef, {
            hasReview: true,
            updatedAt: serverTimestamp(),
        });

        // Update vendor rating
        await calculateVendorRating(reviewData.vendorId);

        // Update rider rating if applicable
        if (reviewData.riderId && reviewData.riderRating) {
            await calculateRiderRating(reviewData.riderId);
        }

        return { success: true };
    } catch (error: any) {
        console.error('Error submitting review:', error);
        return { success: false, error: error.message || 'Failed to submit review' };
    }
}

export async function calculateVendorRating(vendorId: string) {
    try {
        const { firestore: db } = initializeServerFirebase();

        // Get all reviews for this vendor
        const reviewsRef = collection(db, 'reviews');
        const vendorReviewsQuery = query(reviewsRef, where('vendorId', '==', vendorId));
        const reviewsSnapshot = await getDocs(vendorReviewsQuery);

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
        const vendorRef = doc(db, 'vendors', vendorId);
        await updateDoc(vendorRef, {
            rating: Number(averageRating.toFixed(1)),
            reviewCount: count,
            updatedAt: serverTimestamp(),
        });

        return { success: true, rating: averageRating, count };
    } catch (error: any) {
        console.error('Error calculating vendor rating:', error);
        return { success: false, error: error.message };
    }
}

export async function calculateRiderRating(riderId: string) {
    try {
        const { firestore: db } = initializeServerFirebase();

        // Get all reviews for this rider
        const reviewsRef = collection(db, 'reviews');
        const riderReviewsQuery = query(reviewsRef, where('riderId', '==', riderId));
        const reviewsSnapshot = await getDocs(riderReviewsQuery);

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
        const riderRef = doc(db, 'riders', riderId);
        await updateDoc(riderRef, {
            rating: Number(averageRating.toFixed(1)),
            reviewCount: count,
            updatedAt: serverTimestamp(),
        });

        return { success: true, rating: averageRating, count };
    } catch (error: any) {
        console.error('Error calculating rider rating:', error);
        return { success: false, error: error.message };
    }
}

export async function getVendorReviews(vendorId: string) {
    try {
        const { firestore: db } = initializeServerFirebase();
        const reviewsRef = collection(db, 'reviews');
        const vendorReviewsQuery = query(reviewsRef, where('vendorId', '==', vendorId));
        const reviewsSnapshot = await getDocs(vendorReviewsQuery);

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
        const { firestore: db } = initializeServerFirebase();
        const reviewsRef = collection(db, 'reviews');
        const riderReviewsQuery = query(reviewsRef, where('riderId', '==', riderId));
        const reviewsSnapshot = await getDocs(riderReviewsQuery);

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
