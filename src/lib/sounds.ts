export const playNotificationSound = () => {
    try {
        const audio = new Audio('/sounds/notification.mp3');
        audio.play().catch(error => console.log('Audio play failed:', error));
    } catch (error) {
        console.error('Error playing notification sound:', error);
    }
};
