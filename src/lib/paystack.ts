
export const verifyPaystackTransaction = async (reference: string) => {
    const secretKey = process.env.PAYSTACK_SECRET_KEY;

    if (!secretKey) {
        throw new Error('PAYSTACK_SECRET_KEY is not defined');
    }

    try {
        const response = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${secretKey}`,
                'Content-Type': 'application/json',
            },
        });

        const data = await response.json();

        if (!data.status) {
            return { success: false, message: data.message };
        }

        return { success: true, data: data.data };
    } catch (error) {
        console.error('Error verifying Paystack transaction:', error);
        return { success: false, message: 'Internal server error' };
    }
};
