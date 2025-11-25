'use server';

import { revalidatePath } from 'next/cache';

// Simplified server actions for revalidation only
// Actual Firestore operations are done client-side

export async function revalidateOrderPages() {
    revalidatePath('/vendor/orders');
    revalidatePath('/customer/orders');
    revalidatePath('/rider/deliveries');
    return { success: true };
}
