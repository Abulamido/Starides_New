export async function sendEmail(to: string, subject: string, html: string) {
    console.log(`[Mock Email Service] Sending email to ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`Body: ${html}`);

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));

    return { success: true };
}

export async function sendOrderConfirmationEmail(to: string, orderId: string, total: number) {
    return sendEmail(
        to,
        `Order Confirmation #${orderId.substring(0, 7)}`,
        `<p>Thank you for your order! Your total is ₦${total.toLocaleString()}.</p>`
    );
}

export async function sendWelcomeEmail(to: string, name: string) {
    return sendEmail(
        to,
        'Welcome to Starides',
        `<p>Hi ${name}, welcome to Starides! We're excited to have you.</p>`
    );
}
