/**
 * Paystack Configuration
 * 
 * This file centralizes Paystack API key configuration to ensure
 * environment variables are properly accessed in client components.
 */

export const PAYSTACK_PUBLIC_KEY = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || '';
export const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY || '';

// Validation (client-side only)
if (typeof window !== 'undefined' && !PAYSTACK_PUBLIC_KEY) {
    console.error('❌ PAYSTACK_PUBLIC_KEY is not configured. Payment functionality will not work.');
    console.error('Please add NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY to your .env.local file');
}

// Server-side validation
if (typeof window === 'undefined' && !PAYSTACK_SECRET_KEY) {
    console.warn('⚠️ PAYSTACK_SECRET_KEY is not configured. Payment verification will fail.');
}

export const PAYSTACK_CONFIG = {
    publicKey: PAYSTACK_PUBLIC_KEY,
    currency: 'NGN',
    channels: ['card'] as const,
} as const;
