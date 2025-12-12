'use client';

import { Button } from '@/components/ui/button';
import { useUser } from '@/firebase';
import { createNotification, NotificationTemplates } from '@/lib/notifications';
import { playNotificationSound } from '@/lib/sounds';

export default function NotificationTestPage() {
    const { user } = useUser();

    const testNotification = async (type: 'order' | 'success' | 'error') => {
        if (!user) {
            alert('Please log in first');
            return;
        }

        try {
            playNotificationSound();

            if (type === 'order') {
                await createNotification({
                    userId: user.uid,
                    ...NotificationTemplates.orderReady('TEST123456'),
                });
            } else if (type === 'success') {
                await createNotification({
                    userId: user.uid,
                    title: 'Test Success Notification',
                    message: 'This is a test success notification with a longer message to see how it looks in the notification center.',
                    type: 'success',
                });
            } else if (type === 'error') {
                await createNotification({
                    userId: user.uid,
                    title: 'Test Error Notification',
                    message: 'This is a test error notification.',
                    type: 'error',
                });
            }

            alert('Notification created! Check the bell icon.');
        } catch (error) {
            console.error(error);
            alert('Error creating notification');
        }
    };

    return (
        <div className="container mx-auto p-8 space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Notification System Test</h1>
                <p className="text-muted-foreground">Test the notification system and sounds</p>
            </div>

            <div className="grid gap-4 max-w-md">
                <Button onClick={() => testNotification('order')} className="w-full">
                    Test Order Notification
                </Button>
                <Button onClick={() => testNotification('success')} className="w-full" variant="outline">
                    Test Success Notification
                </Button>
                <Button onClick={() => testNotification('error')} className="w-full" variant="destructive">
                    Test Error Notification
                </Button>
                <Button onClick={() => playNotificationSound()} className="w-full" variant="secondary">
                    Test Sound Only
                </Button>
            </div>

            <div className="mt-8 p-4 border rounded-lg">
                <h2 className="font-semibold mb-2">Instructions:</h2>
                <ol className="list-decimal list-inside space-y-2 text-sm">
                    <li>Click any button above to create a test notification</li>
                    <li>Look at the bell icon in the top right corner</li>
                    <li>You should see a red badge with the number of unread notifications</li>
                    <li>Click the bell icon to see your notifications</li>
                    <li>You should hear a sound when clicking the buttons</li>
                </ol>
            </div>
        </div>
    );
}
