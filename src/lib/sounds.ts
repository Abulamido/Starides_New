/**
 * Notification Sound System
 * Generates a pleasant notification sound using the Web Audio API
 * No external audio files required - works 100% in the browser
 */

export const playNotificationSound = () => {
    try {
        // Check if Web Audio API is supported
        if (typeof window === 'undefined' || !window.AudioContext) {
            return;
        }

        // Create audio context
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();

        // Create oscillators for a pleasant two-tone notification sound
        const oscillator1 = audioContext.createOscillator();
        const oscillator2 = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        // Configure first tone (higher pitch)
        oscillator1.type = 'sine';
        oscillator1.frequency.setValueAtTime(800, audioContext.currentTime); // E5 note

        // Configure second tone (lower pitch)
        oscillator2.type = 'sine';
        oscillator2.frequency.setValueAtTime(600, audioContext.currentTime); // D5 note

        // Connect oscillators to gain node
        oscillator1.connect(gainNode);
        oscillator2.connect(gainNode);
        gainNode.connect(audioContext.destination);

        // Set volume envelope for smooth sound
        gainNode.gain.setValueAtTime(0, audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.05);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

        // Play first tone
        oscillator1.start(audioContext.currentTime);
        oscillator1.stop(audioContext.currentTime + 0.15);

        // Play second tone slightly after
        oscillator2.start(audioContext.currentTime + 0.15);
        oscillator2.stop(audioContext.currentTime + 0.5);

        // Clean up
        setTimeout(() => {
            audioContext.close();
        }, 600);

    } catch (error) {
        console.error('Error playing notification sound:', error);
    }
};

/**
 * Play a success sound (higher, more upbeat)
 */
export const playSuccessSound = () => {
    try {
        if (typeof window === 'undefined' || !window.AudioContext) return;

        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime); // C5
        oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.1); // E5
        oscillator.frequency.setValueAtTime(783.99, audioContext.currentTime + 0.2); // G5

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        gainNode.gain.setValueAtTime(0, audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.05);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.4);

        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.4);

        setTimeout(() => audioContext.close(), 500);
    } catch (error) {
        console.error('Error playing success sound:', error);
    }
};

/**
 * Play an alert sound (more urgent)
 */
export const playAlertSound = () => {
    try {
        if (typeof window === 'undefined' || !window.AudioContext) return;

        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.type = 'square';
        oscillator.frequency.setValueAtTime(440, audioContext.currentTime);
        oscillator.frequency.setValueAtTime(880, audioContext.currentTime + 0.1);

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        gainNode.gain.setValueAtTime(0, audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.2, audioContext.currentTime + 0.05);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);

        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.3);

        setTimeout(() => audioContext.close(), 400);
    } catch (error) {
        console.error('Error playing alert sound:', error);
    }
};
