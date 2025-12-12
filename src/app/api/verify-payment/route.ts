import { NextRequest, NextResponse } from 'next/server';
import { verifyPaystackTransaction } from '@/lib/paystack';

/**
 * API Route: Verify Paystack Payment
 * 
 * This endpoint verifies a Paystack transaction on the server-side
 * to prevent fraud and ensure payment was actually completed.
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { reference } = body;

        if (!reference) {
            return NextResponse.json(
                { success: false, message: 'Payment reference is required' },
                { status: 400 }
            );
        }

        // Verify with Paystack API
        const result = await verifyPaystackTransaction(reference);

        return NextResponse.json(result);
    } catch (error) {
        console.error('Error in verify-payment API:', error);
        return NextResponse.json(
            { success: false, message: 'Internal server error' },
            { status: 500 }
        );
    }
}
