'use server';

import { revalidatePath } from 'next/cache';

export interface ProductFormData {
    name: string;
    description: string;
    price: number;
    category: string;
    image?: string;
    available?: boolean;
}

// Note: These are placeholder server actions
// The actual Firestore operations will be done client-side
// due to Next.js limitations with Firebase Admin in server components

export async function revalidateProductPages() {
    revalidatePath('/vendor/products');
    revalidatePath('/customer');
    return { success: true };
}
