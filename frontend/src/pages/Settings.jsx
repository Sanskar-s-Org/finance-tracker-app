import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import api from '../services/api';

const Settings = () => {
    const { user, updateUser, logout } = useAuth();
    const { showSuccess, showError, showWarning } = useNotification();
    const [activeTab, setActiveTab] = useState('profile');
    const [loading, setLoading] = useState(false);

    const [profileData, setProfileData] = useState({
        name: '',
        email: '',
        currency: 'USD',
    });

    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });

    const [preferences, setPreferences] = useState({
        emailNotifications: true,
        budgetAlerts: true,
        weeklyReports: false,
        theme: 'dark',
    });

    useEffect(() => {
        if (user) {
            setProfileData({
                name: user.name || '',
                email: user.email || '',
                currency: user.currency || 'USD',
            });
            setPreferences({
                emailNotifications: user.preferences?.emailNotifications ?? true,
                budgetAlerts: user.preferences?.budgetAlerts ?? true,
                weeklyReports: user.preferences?.weeklyReports ?? false,
                theme: user.preferences?.theme || 'dark',
            });
        }
    }, [user]);

    const handleProfileUpdate = async e => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await api.put('/settings/profile', profileData);
            updateUser(response.data.data);
            showSuccess('Profile updated successfully!');
        } catch (error) {
            showError(error.response?.data?.message || 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordUpdate = async e => {
        e.preventDefault();

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            showError('New passwords do not match');
            return;
        }

        if (passwordData.newPassword.length < 6) {
            showError('Password must be at least 6 characters');
            return;
        }

        setLoading(true);
        try {
            await api.put('/settings/password', {
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword,
            });
            showSuccess('Password updated successfully!');
            setPasswordData({
                currentPassword: '',
                newPassword: '',
                confirmPassword: '',
            });
        } catch (error) {
            showError(error.response?.data?.message || 'Failed to update password');
        } finally {
            setLoading(false);
        }
    };

    const handlePreferencesUpdate = async e => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await api.put('/settings/preferences', { preferences });
            updateUser(response.data.data);
            showSuccess('Preferences updated successfully!');
        } catch (error) {
            showError(error.response?.data?.message || 'Failed to update preferences');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteAccount = async () => {
        const confirmed = window.confirm(
            'Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently deleted.'
        );

        if (!confirmed) return;

        const doubleConfirm = window.confirm(
            'This is your last chance! Type DELETE in the next prompt to confirm account deletion.'
        );

        if (!doubleConfirm) return;

        const finalConfirm = prompt('Type DELETE to confirm:');
        if (finalConfirm !== 'DELETE') {
            showWarning('Account deletion cancelled');
            return;
        }

        setLoading(true);
        try {
            await api.delete('/settings/account');
            showSuccess('Account deleted. Goodbye!');
            setTimeout(() => logout(), 2000);
        } catch (error) {
            showError(error.response?.data?.message || 'Failed to delete account');
        } finally {
            setLoading(false);
        }
    };

    const tabs = [
        { id: 'profile', label: '👤 Profile', icon: '👤' },
        { id: 'password', label: '🔒 Password', icon: '🔒' },
        { id: 'preferences', label: '⚙️ Preferences', icon: '⚙️' },
        { id: 'danger', label: '⚠️ Danger Zone', icon: '⚠️' },
    ];

    return (
        <div className="container" style={{ paddingTop: '2rem', paddingBottom: '3rem' }}>
            <div style={{ marginBottom: '2.5rem' }} className="fade-in">
                <h1 style={{ marginBottom: '0.5rem' }}>⚙️ Settings</h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>
                    Manage your account settings and preferences
                </p>
            </div>

            {/* Tabs */}
            <div
                style={{
                    display: 'flex',
                    gap: '1rem',
                    marginBottom: '2rem',
                    borderBottom: '1px solid var(--border)',
                    flexWrap: 'wrap',
                }}
            >
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        style={{
                            padding: '0.75rem 1.5rem',
                            background: activeTab === tab.id ? 'var(--bg-secondary)' : 'transparent',
                            border: 'none',
                            borderBottom:
                                activeTab === tab.id ? '2px solid var(--primary)' : '2px solid transparent',
                            color: activeTab === tab.id ? 'var(--text-primary)' : 'var(--text-secondary)',
                            cursor: 'pointer',
                            fontSize: '1rem',
                            fontWeight: activeTab === tab.id ? '600' : '400',
                            transition: 'var(--transition-base)',
                        }}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Profile Tab */}
            {activeTab === 'profile' && (
                <div className="card fade-in">
                    <h3 style={{ marginBottom: '1.5rem' }}>Profile Information</h3>
                    <form onSubmit={handleProfileUpdate}>
                        <div className="form-group">
                            <label>Name</label>
                            <input
                                type="text"
                                value={profileData.name}
                                onChange={e => setProfileData({ ...profileData, name: e.target.value })}
                                className="input"
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Email</label>
                            <input
                                type="email"
                                value={profileData.email}
                                onChange={e => setProfileData({ ...profileData, email: e.target.value })}
                                className="input"
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Currency</label>
                            <select
                                value={profileData.currency}
                                onChange={e => setProfileData({ ...profileData, currency: e.target.value })}
                                className="input"
                            >
                                <option value="USD">USD - US Dollar</option>
                                <option value="EUR">EUR - Euro</option>
                                <option value="GBP">GBP - British Pound</option>
                                <option value="INR">INR - Indian Rupee</option>
                                <option value="CAD">CAD - Canadian Dollar</option>
                                <option value="AUD">AUD - Australian Dollar</option>
                            </select>
                        </div>
                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            {loading ? 'Updating...' : '💾 Save Changes'}
                        </button>
                    </form>
                </div>
            )}

            {/* Password Tab */}
            {activeTab === 'password' && (
                <div className="card fade-in">
                    <h3 style={{ marginBottom: '1.5rem' }}>Change Password</h3>
                    <form onSubmit={handlePasswordUpdate}>
                        <div className="form-group">
                            <label>Current Password</label>
                            <input
                                type="password"
                                value={passwordData.currentPassword}
                                onChange={e =>
                                    setPasswordData({ ...passwordData, currentPassword: e.target.value })
                                }
                                className="input"
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>New Password</label>
                            <input
                                type="password"
                                value={passwordData.newPassword}
                                onChange={e => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                className="input"
                                required
                                minLength={6}
                            />
                        </div>
                        <div className="form-group">
                            <label>Confirm New Password</label>
                            <input
                                type="password"
                                value={passwordData.confirmPassword}
                                onChange={e =>
                                    setPasswordData({ ...passwordData, confirmPassword: e.target.value })
                                }
                                className="input"
                                required
                                minLength={6}
                            />
                        </div>
                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            {loading ? 'Updating...' : '🔒 Update Password'}
                        </button>
                    </form>
                </div>
            )}

            {/* Preferences Tab */}
            {activeTab === 'preferences' && (
                <div className="card fade-in">
                    <h3 style={{ marginBottom: '1.5rem' }}>Preferences</h3>
                    <form onSubmit={handlePreferencesUpdate}>
                        <div style={{ marginBottom: '2rem' }}>
                            <h4 style={{ marginBottom: '1rem' }}>Notifications</h4>
                            <div className="form-group" style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <input
                                    type="checkbox"
                                    id="emailNotifications"
                                    checked={preferences.emailNotifications}
                                    onChange={e =>
                                        setPreferences({ ...preferences, emailNotifications: e.target.checked })
                                    }
                                    style={{ width: 'auto', marginRight: '0.75rem' }}
                                />
                                <label htmlFor="emailNotifications" style={{ margin: 0 }}>
                                    Enable email notifications
                                </label>
                            </div>
                            <div className="form-group" style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <input
                                    type="checkbox"
                                    id="budgetAlerts"
                                    checked={preferences.budgetAlerts}
                                    onChange={e => setPreferences({ ...preferences, budgetAlerts: e.target.checked })}
                                    style={{ width: 'auto', marginRight: '0.75rem' }}
                                />
                                <label htmlFor="budgetAlerts" style={{ margin: 0 }}>
                                    Budget alerts
                                </label>
                            </div>
                            <div className="form-group" style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <input
                                    type="checkbox"
                                    id="weeklyReports"
                                    checked={preferences.weeklyReports}
                                    onChange={e =>
                                        setPreferences({ ...preferences, weeklyReports: e.target.checked })
                                    }
                                    style={{ width: 'auto', marginRight: '0.75rem' }}
                                />
                                <label htmlFor="weeklyReports" style={{ margin: 0 }}>
                                    Weekly summary reports
                                </label>
                            </div>
                        </div>

                        <div style={{ marginBottom: '2rem' }}>
                            <h4 style={{ marginBottom: '1rem' }}>Appearance</h4>
                            <div className="form-group">
                                <label>Theme</label>
                                <select
                                    value={preferences.theme}
                                    onChange={e => setPreferences({ ...preferences, theme: e.target.value })}
                                    className="input"
                                >
                                    <option value="dark">🌙 Dark Mode</option>
                                    <option value="light">☀️ Light Mode</option>
                                </select>
                            </div>
                        </div>

                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            {loading ? 'Saving...' : '💾 Save Preferences'}
                        </button>
                    </form>
                </div>
            )}

            {/* Danger Zone Tab */}
            {activeTab === 'danger' && (
                <div className="card fade-in" style={{ borderColor: 'var(--danger)' }}>
                    <h3 style={{ marginBottom: '1.5rem', color: 'var(--danger)' }}>⚠️ Danger Zone</h3>
                    <div
                        style={{
                            padding: '1.5rem',
                            background: 'rgba(239, 68, 68, 0.1)',
                            borderRadius: 'var(--radius-md)',
                            marginBottom: '1.5rem',
                        }}
                    >
                        <h4 style={{ marginBottom: '0.5rem', color: 'var(--danger)' }}>Delete Account</h4>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                            Once you delete your account, there is no going back. All your data, transactions,
                            budgets, and categories will be permanently deleted.
                        </p>
                        <button
                            onClick={handleDeleteAccount}
                            className="btn"
                            style={{
                                background: 'var(--danger)',
                                color: 'white',
                            }}
                            disabled={loading}
                        >
                            {loading ? 'Deleting...' : '🗑️ Delete My Account'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Settings;
