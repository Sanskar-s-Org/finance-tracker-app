import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useFinance } from '../context/FinanceContext';
import { useAuth } from '../context/AuthContext';
import { dashboardService, budgetService } from '../services';
import notificationService from '../utils/notificationService';

const Dashboard = () => {
    const { fetchDashboard } = useFinance();
    const { user } = useAuth();
    const [summary, setSummary] = useState(null);
    const [trends, setTrends] = useState(null);
    const [insights, setInsights] = useState([]);
    const [budgetAlerts, setBudgetAlerts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [period, setPeriod] = useState('thisMonth');
    const [customDateRange, setCustomDateRange] = useState({
        startDate: '',
        endDate: '',
    });
    const [dashboardPage, setDashboardPage] = useState(1);
    const [dashboardPageSize] = useState(5);
    const [showNotificationPrompt, setShowNotificationPrompt] = useState(false);
    const [budgetAlertsCount, setBudgetAlertsCount] = useState(0);
    const [notificationsEnabled, setNotificationsEnabled] = useState(
        Notification.permission === 'granted'
    );

    const periodLabels = {
        thisMonth: 'This Month',
        lastMonth: 'Last Month',
        last3Months: 'Last 3 Months',
        thisYear: 'This Year',
        allTime: 'All Time',
    };

    useEffect(() => {
        loadDashboard();

        // Check notification permission status
        setNotificationsEnabled(Notification.permission === 'granted');
        if (Notification.permission === 'default') {
            setShowNotificationPrompt(true);
        }
    }, [period]);

    // Auto-refresh when page becomes visible or user navigates to dashboard
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                loadDashboard();
            }
        };

        document.addEventListener('visibilityChange', handleVisibilityChange);
        return () => \n      document.removeEventListener('visibilityChange', handleVisibilityChange);
    }, [period]);

    const loadDashboard = async () => {
        try {
            setLoading(prevLoading => prevLoading || refreshing);
            const data = await dashboardService.getDashboard(period);

            setSummary(data.summary);
            setTrends(data.trends);
            setInsights(data.insights);
            setBudgetAlerts(data.budgetAlerts || []);
            setLoading(false);
            setRefreshing(false);

            // Check for budget alerts and show notifications
            if (data.budgetAlerts && data.budgetAlerts.length > 0) {
                setBudgetAlertsCount(data.budgetAlerts.length);

                // Show notifications if permission granted
                if (Notification.permission === 'granted') {
                    data.budgetAlerts.forEach(alert => {
                        if (alert.isOverBudget || alert.percentageUsed >= 80) {
                            notificationService.showBudgetAlert(alert);
                        }
                    });
                }
            } else {
                setBudgetAlertsCount(0);
            }
        } catch (error) {
            console.error('Error loading dashboard:', error);
            setLoading(false);
            setRefreshing(false);
        }
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        await loadDashboard();
    };

    const handleEnableNotifications = async () => {
        const granted = await notificationService.requestPermission();
        setNotificationsEnabled(granted);
        setShowNotificationPrompt(false);

        if (granted) {
            // Check current budget alerts and notify
            budgetAlerts.forEach(alert => {
                if (alert.isOverBudget || alert.percentageUsed >= 80) {
                    notificationService.showBudgetAlert(alert);
                }
            });
        }
    };

    const formatCurrency = amount => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: user?.currency || 'USD',
        }).format(amount);
    };

    // Calculate quick stats
    const income = summary?.summary?.income || 0;
    const expense = summary?.summary?.expense || 0;
    const savingsRate = income > 0 ? ((income - expense) / income * 100) : 0;

    // Rest of your existing Dashboard code continues here...
    // I'm showing just the modifications for notifications for brevity
}
