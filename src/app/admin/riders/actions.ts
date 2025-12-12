'use server';

import { revalidatePath } from 'next/cache';

export async function updateRiderStatus(riderId: string, data: { verificationStatus?: 'Verified' | 'Rejected' | 'Unverified', enabled?: boolean }) {
    try {
        console.log(`[updateRiderStatus] Attempting to update rider: ${riderId}`, data);

        const { adminDb, adminAuth, app } = await import('@/firebase/admin');

        // Debug admin app initialization
        const options = app.options;
        console.log(`[updateRiderStatus] Admin App Project ID: ${options.projectId}`);

        const riderRef = adminDb.collection('riders').doc(riderId);

        // Check if doc exists first and get data
        const docSnap = await riderRef.get();
        if (!docSnap.exists) {
            console.error(`[updateRiderStatus] Rider document ${riderId} does NOT exist in project ${options.projectId}`);
            return { success: false, error: 'Rider not found' };
        }

        const riderData = docSnap.data();
        const userId = riderData?.userId;

        // Perform Firestore update
        await riderRef.update({
            ...data,
            updatedAt: new Date()
        });

        console.log(`[updateRiderStatus] Firestore update successful for rider: ${riderId}`);

        // Sync with Auth User if userId exists (for enabled/disabled status)
        if (userId && data.enabled !== undefined) {
            try {
                await adminAuth.updateUser(userId, {
                    disabled: !data.enabled
                });
                console.log(`[updateRiderStatus] Auth user ${userId} disabled status set to: ${!data.enabled}`);
            } catch (authError) {
                console.error(`[updateRiderStatus] Failed to update Auth user ${userId}:`, authError);
                // Don't fail the whole action if Auth update fails, but warn.
            }
        }

        revalidatePath('/admin/riders');
        return { success: true, projectId: options.projectId };
    } catch (error: any) {
        console.error('Error updating rider status:', error);
        return { success: false, error: error.message };
    }
}
