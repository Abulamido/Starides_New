'use server';

import { revalidatePath } from 'next/cache';

// Simplified server actions for revalidation only
// Actual Firestore operations are done client-side

export async function revalidateDeliveryPages() {
    revalidatePath('/rider/deliveries');
    revalidatePath('/customer/orders');
    revalidatePath('/vendor/orders');
    return { success: true };
}
