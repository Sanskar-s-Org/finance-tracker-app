import { createContext, useContext, useEffect } from 'react';
import toast, { Toaster } from 'react-hot-toast';

const NotificationContext = createContext();

export const useNotification = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotification must be used within NotificationProvider');
    }
    return context;
};

export const NotificationProvider = ({ children }) => {
    const showSuccess = (message) => {
        toast.success(message, {
            duration: 4000,
            position: 'top-right',
            style: {
                background: 'var(--bg-secondary)',
                color: 'var(--text-primary)',
                border: '1px solid var(--success)',
            },
            iconTheme: {
                primary: 'var(--success)',
                secondary: 'var(--bg-secondary)',
            },
        });
    };

    const showError = (message) => {
        toast.error(message, {
            duration: 5000,
            position: 'top-right',
            style: {
                background: 'var(--bg-secondary)',
                color: 'var(--text-primary)',
                border: '1px solid var(--danger)',
            },
            iconTheme: {
                primary: 'var(--danger)',
                secondary: 'var(--bg-secondary)',
            },
        });
    };

    const showWarning = (message) => {
        toast(message, {
            duration: 4500,
            position: 'top-right',
            icon: '⚠️',
            style: {
                background: 'var(--bg-secondary)',
                color: 'var(--text-primary)',
                border: '1px solid var(--warning)',
            },
        });
    };

    const showInfo = (message) => {
        toast(message, {
            duration: 4000,
            position: 'top-right',
            icon: 'ℹ️',
            style: {
                background: 'var(--bg-secondary)',
                color: 'var(--text-primary)',
                border: '1px solid var(--info)',
            },
        });
    };

    const value = {
        showSuccess,
        showError,
        showWarning,
        showInfo,
    };

    return (
        <NotificationContext.Provider value={value}>
            <Toaster />
            {children}
        </NotificationContext.Provider>
    );
};
