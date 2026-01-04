// Notification Service for Budget Alerts
class NotificationService {
    constructor() {
        this.permission = 'default';
    }

    // Request permission for browser notifications
    async requestPermission() {
        if (!('Notification' in window)) {
            console.log('Browser does not support notifications');
            return false;
        }

        if (Notification.permission === 'granted') {
            this.permission = 'granted';
            return true;
        }

        if (Notification.permission !== 'denied') {
            const permission = await Notification.requestPermission();
            this.permission = permission;
            return permission === 'granted';
        }

        return false;
    }

    // Show browser notification
    showNotification(title, options = {}) {
        if (this.permission !== 'granted') {
            console.log('Notification permission not granted');
            return;
        }

        const defaultOptions = {
            icon: '/icon-192x192.png', // You can add your app icon here
            badge: '/badge-72x72.png',
            vibrate: [200, 100, 200],
            requireInteraction: false,
        };

        try {
            const notification = new Notification(title, {
                ...defaultOptions,
                ...options,
            });

            notification.onclick = () => {
                window.focus();
                notification.close();
            };

            return notification;
        } catch (error) {
            console.error('Error showing notification:', error);
        }
    }

    // Show budget alert notification
    showBudgetAlert(budget) {
        const { category, percentageUsed, isOverBudget } = budget;

        if (isOverBudget) {
            this.showNotification(
                `⚠️ Budget Exceeded!`,
                {
                    body: `You've exceeded your ${category.name} budget by ${percentageUsed - 100}%`,
                    tag: `budget-${budget._id}`,
                    icon: category.icon,
                    requireInteraction: true,
                }
            );
        } else if (percentageUsed >= 80) {
            this.showNotification(
                `⚡ Budget Warning`,
                {
                    body: `You've used ${percentageUsed}% of your ${category.name} budget`,
                    tag: `budget-${budget._id}`,
                }
            );
        }
    }

    // Show toast notification (in-app)
    showToast(message, type = 'info') {
        // This will be used for in-app notifications
        const event = new CustomEvent('show-toast', {
            detail: { message, type },
        });
        window.dispatchEvent(event);
    }
}

export default new NotificationService();
