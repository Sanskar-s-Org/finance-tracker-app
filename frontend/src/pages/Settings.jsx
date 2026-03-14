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
        <div className="container" style={{ paddingTop: '1.25rem', paddingBottom: '2rem' }}>

            <style>{`
              .settings-toggle { display: none; }
              .settings-toggle-track {
                width: 44px; height: 24px; border-radius: 12px;
                background: var(--bg-tertiary); border: 2px solid var(--border);
                position: relative; cursor: pointer; transition: background 0.2s, border-color 0.2s;
                flex-shrink: 0;
              }
              .settings-toggle:checked + .settings-toggle-track { background: var(--primary); border-color: var(--primary); }
              .settings-toggle-track::after {
                content: ''; position: absolute; top: 1px; left: 1px;
                width: 18px; height: 18px; border-radius: 50%;
                background: var(--text-secondary); transition: transform 0.2s, background 0.2s;
              }
              .settings-toggle:checked + .settings-toggle-track::after { transform: translateX(20px); background: #fff; }
              .settings-tab-btn {
                padding: 0.625rem 1.125rem; background: transparent; border: none;
                border-bottom: 2px solid transparent; color: var(--text-secondary);
                cursor: pointer; font-size: 0.9rem; font-weight: 500;
                transition: var(--transition-base); white-space: nowrap;
              }
              .settings-tab-btn.active {
                color: var(--text-primary); font-weight: 700;
                border-bottom-color: var(--primary);
              }
              .settings-tab-btn:hover:not(.active) { color: var(--text-primary); }
            `}</style>

            {/* ── Header ── */}
            <div style={{ marginBottom: '1.5rem' }} className="fade-in">
                <h1 style={{ marginBottom: '0.375rem', fontSize: '1.875rem', fontWeight: '700' }}>Settings</h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', margin: 0 }}>
                    Manage your account, security, and preferences
                </p>
            </div>

            {/* ── Tabs ── */}
            <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', flexWrap: 'wrap' }}>
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`settings-tab-btn${activeTab === tab.id ? ' active' : ''}`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* ── Profile Tab ── */}
            {activeTab === 'profile' && (
                <div className="card fade-in" style={{ padding: '1.5rem', maxWidth: '540px' }}>
                    <div style={{ fontSize: '0.6875rem', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '1.25rem' }}>Profile Information</div>
                    <form onSubmit={handleProfileUpdate}>
                        <div className="form-group">
                            <label className="form-label">Full Name</label>
                            <input type="text" value={profileData.name} onChange={e => setProfileData({ ...profileData, name: e.target.value })} className="form-input" required />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Email Address</label>
                            <input type="email" value={profileData.email} onChange={e => setProfileData({ ...profileData, email: e.target.value })} className="form-input" required />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Currency</label>
                            <select value={profileData.currency} onChange={e => setProfileData({ ...profileData, currency: e.target.value })} className="form-select">
                                <option value="USD">USD — US Dollar</option>
                                <option value="EUR">EUR — Euro</option>
                                <option value="GBP">GBP — British Pound</option>
                                <option value="INR">INR — Indian Rupee</option>
                                <option value="CAD">CAD — Canadian Dollar</option>
                                <option value="AUD">AUD — Australian Dollar</option>
                                <option value="JPY">JPY — Japanese Yen</option>
                            </select>
                        </div>
                        <button type="submit" className="btn btn-primary" disabled={loading} style={{ padding: '0.75rem 1.5rem' }}>
                            {loading ? 'Saving…' : 'Save Changes'}
                        </button>
                    </form>
                </div>
            )}

            {/* ── Password Tab ── */}
            {activeTab === 'password' && (
                <div className="card fade-in" style={{ padding: '1.5rem', maxWidth: '540px' }}>
                    <div style={{ fontSize: '0.6875rem', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '1.25rem' }}>Change Password</div>
                    <form onSubmit={handlePasswordUpdate}>
                        <div className="form-group">
                            <label className="form-label">Current Password</label>
                            <input type="password" value={passwordData.currentPassword} onChange={e => setPasswordData({ ...passwordData, currentPassword: e.target.value })} className="form-input" required />
                        </div>
                        <div className="form-group">
                            <label className="form-label">New Password</label>
                            <input type="password" value={passwordData.newPassword} onChange={e => setPasswordData({ ...passwordData, newPassword: e.target.value })} className="form-input" required minLength={6} />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Confirm New Password</label>
                            <input type="password" value={passwordData.confirmPassword} onChange={e => setPasswordData({ ...passwordData, confirmPassword: e.target.value })} className="form-input" required minLength={6} />
                        </div>
                        <button type="submit" className="btn btn-primary" disabled={loading} style={{ padding: '0.75rem 1.5rem' }}>
                            {loading ? 'Updating…' : 'Update Password'}
                        </button>
                    </form>
                </div>
            )}

            {/* ── Preferences Tab ── */}
            {activeTab === 'preferences' && (
                <div className="card fade-in" style={{ padding: '1.5rem', maxWidth: '540px' }}>
                    <form onSubmit={handlePreferencesUpdate}>
                        {/* Notifications section */}
                        <div style={{ marginBottom: '1.75rem' }}>
                            <div style={{ fontSize: '0.6875rem', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '1rem' }}>Notifications</div>
                            {[
                                { id: 'emailNotifications', label: 'Email notifications', desc: 'Receive transaction summaries and alerts by email', key: 'emailNotifications' },
                                { id: 'budgetAlerts',       label: 'Budget alerts',        desc: 'Get notified when spending approaches budget limits', key: 'budgetAlerts' },
                                { id: 'weeklyReports',      label: 'Weekly reports',       desc: 'Receive a weekly summary of your financial activity', key: 'weeklyReports' },
                            ].map(item => (
                                <div key={item.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', paddingBottom: '1rem', marginBottom: '1rem', borderBottom: '1px solid var(--border)' }}>
                                    <div>
                                        <div style={{ fontWeight: '600', fontSize: '0.9375rem', marginBottom: '0.125rem' }}>{item.label}</div>
                                        <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>{item.desc}</div>
                                    </div>
                                    <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', flexShrink: 0 }}>
                                        <input type="checkbox" id={item.id} checked={preferences[item.key]} onChange={e => setPreferences({ ...preferences, [item.key]: e.target.checked })} className="settings-toggle" />
                                        <span className="settings-toggle-track" />
                                    </label>
                                </div>
                            ))}
                        </div>

                        {/* Appearance section */}
                        <div style={{ marginBottom: '1.5rem' }}>
                            <div style={{ fontSize: '0.6875rem', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '1rem' }}>Appearance</div>
                            <div className="form-group" style={{ margin: 0 }}>
                                <label className="form-label">Theme</label>
                                <select value={preferences.theme} onChange={e => setPreferences({ ...preferences, theme: e.target.value })} className="form-select">
                                    <option value="dark">Dark Mode</option>
                                    <option value="light">Light Mode</option>
                                </select>
                            </div>
                        </div>

                        <button type="submit" className="btn btn-primary" disabled={loading} style={{ padding: '0.75rem 1.5rem' }}>
                            {loading ? 'Saving…' : 'Save Preferences'}
                        </button>
                    </form>
                </div>
            )}

            {/* ── Danger Zone Tab ── */}
            {activeTab === 'danger' && (
                <div className="card fade-in" style={{ padding: '1.5rem', maxWidth: '540px', borderColor: 'var(--danger)' }}>
                    <div style={{ fontSize: '0.6875rem', fontWeight: '700', color: 'var(--danger)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '1rem' }}>Danger Zone</div>
                    <div style={{ padding: '1.25rem', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 'var(--radius-md)' }}>
                        <h4 style={{ marginBottom: '0.5rem', color: 'var(--danger)', fontSize: '1.0625rem', fontWeight: '700' }}>Delete Account</h4>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem', fontSize: '0.9rem' }}>
                            Once you delete your account, there is no going back. All your transactions, budgets, and categories will be permanently erased.
                        </p>
                        <button onClick={handleDeleteAccount} className="btn" style={{ background: 'var(--danger)', color: '#fff', padding: '0.75rem 1.5rem' }} disabled={loading}>
                            {loading ? 'Deleting…' : 'Delete My Account'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Settings;
