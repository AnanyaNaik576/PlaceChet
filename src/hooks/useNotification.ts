'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

export function useNotification() {
    const [permission, setPermission] = useState<NotificationPermission>('default');

    useEffect(() => {
        // Check current permission
        if (typeof window !== 'undefined' && 'Notification' in window) {
            setPermission(Notification.permission);
        }
    }, []);

    const requestPermission = useCallback(async () => {
        if (typeof window === 'undefined' || !('Notification' in window)) {
            console.warn('Notifications not supported');
            return false;
        }

        if (Notification.permission === 'granted') {
            setPermission('granted');
            return true;
        }

        if (Notification.permission !== 'denied') {
            const result = await Notification.requestPermission();
            setPermission(result);
            return result === 'granted';
        }

        return false;
    }, []);

    const sendNotification = useCallback((title: string, body: string) => {
        if (typeof window === 'undefined' || !('Notification' in window)) {
            return;
        }

        if (Notification.permission === 'granted') {
            // Create notification - works even when tab is not focused
            const notification = new Notification(title, {
                body,
                icon: '/favicon.ico',
                tag: 'chat-message', // Prevents duplicate notifications
                requireInteraction: false,
            });

            // Auto close after 4 seconds
            setTimeout(() => notification.close(), 4000);

            // Focus window when notification is clicked
            notification.onclick = () => {
                window.focus();
                notification.close();
            };
        }
    }, []);

    return {
        permission,
        requestPermission,
        sendNotification,
    };
}
