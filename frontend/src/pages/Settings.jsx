import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import api from '../services/api';

const Settings = () => {
    const { user, updateUser, logout } = useAuth();
    const { showSuccess, showError } = useNotification();
    const [activeTab, setActiveTab] = useState('profile');
    const [loading, setLoading] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deleteConfirmText, setDeleteConfirmText] = useState('');
    const [showCurrentPw, setShowCurrentPw] = useState(false);
    const [showNewPw, setShowNewPw] = useState(false);

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
        if (deleteConfirmText !== 'DELETE') return;
        setLoading(true);
        try {
            await api.delete('/settings/account');
            showSuccess('Account deleted. Goodbye!');
            setTimeout(() => logout(), 2000);
        } catch (error) {
            showError(error.response?.data?.message || 'Failed to delete account');
        } finally {
            setLoading(false);
            setShowDeleteConfirm(false);
            setDeleteConfirmText('');
        }
    };

    const EyeIcon = ({ open }) => open ? (
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
        </svg>
    ) : (
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
            <line x1="1" y1="1" x2="23" y2="23"/>
        </svg>
    );

    const tabs = [
        {
            id: 'profile', label: 'Profile',
            icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
        },
        {
            id: 'password', label: 'Password',
            icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>,
        },
        {
            id: 'preferences', label: 'Preferences',
            icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/><line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/><line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/><line x1="1" y1="14" x2="7" y2="14"/><line x1="9" y1="8" x2="15" y2="8"/><line x1="17" y1="16" x2="23" y2="16"/></svg>,
        },
        {
            id: 'danger', label: 'Danger Zone', danger: true,
            icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
        },
    ];

    return (
        <div className="container" style={{ paddingTop: '1.25rem', paddingBottom: '2rem' }}>

            {/* ── Header ── */}
            <div style={{ marginBottom: '1.75rem' }} className="fade-in">
                <h1 style={{ marginBottom: '0.375rem', fontSize: '1.875rem', fontWeight: '800', letterSpacing: '-0.02em' }}>Settings</h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0 }}>
                    Manage your account, security, and preferences
                </p>
            </div>

            {/* ── Tabs ── */}
            <div className="settings-tab-bar" style={{ marginBottom: '1.5rem' }}>
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`settings-tab-item${activeTab === tab.id ? ' active' : ''}${tab.danger ? ' danger-tab' : ''}`}
                    >
                        {tab.icon}
                        <span>{tab.label}</span>
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
                            <div className="password-field">
                                <input type={showCurrentPw ? 'text' : 'password'} value={passwordData.currentPassword} onChange={e => setPasswordData({ ...passwordData, currentPassword: e.target.value })} className="form-input" required />
                                <button type="button" className="password-toggle-btn" onClick={() => setShowCurrentPw(v => !v)} tabIndex={-1}>
                                    <EyeIcon open={showCurrentPw} />
                                </button>
                            </div>
                        </div>
                        <div className="form-group">
                            <label className="form-label">New Password</label>
                            <div className="password-field">
                                <input type={showNewPw ? 'text' : 'password'} value={passwordData.newPassword} onChange={e => setPasswordData({ ...passwordData, newPassword: e.target.value })} className="form-input" required minLength={6} />
                                <button type="button" className="password-toggle-btn" onClick={() => setShowNewPw(v => !v)} tabIndex={-1}>
                                    <EyeIcon open={showNewPw} />
                                </button>
                            </div>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Confirm New Password</label>
                            <div className="password-field">
                                <input type={showNewPw ? 'text' : 'password'} value={passwordData.confirmPassword} onChange={e => setPasswordData({ ...passwordData, confirmPassword: e.target.value })} className="form-input" required minLength={6} />
                            </div>
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
                <div className="card fade-in" style={{ padding: '1.5rem', maxWidth: '540px', borderColor: 'rgba(239,68,68,0.4)' }}>
                    <div style={{ fontSize: '0.6875rem', fontWeight: '700', color: 'var(--danger)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '1rem' }}>Danger Zone</div>
                    <div style={{ padding: '1.25rem', background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 'var(--radius-md)' }}>
                        <h4 style={{ marginBottom: '0.5rem', color: 'var(--danger)', fontSize: '1.0625rem', fontWeight: '700' }}>Delete Account</h4>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.125rem', fontSize: '0.9rem', lineHeight: 1.6 }}>
                            Once you delete your account, there is no going back. All your transactions, budgets, and categories will be permanently erased.
                        </p>
                        {!showDeleteConfirm ? (
                            <button
                                onClick={() => setShowDeleteConfirm(true)}
                                className="btn"
                                style={{ background: 'var(--danger)', color: '#fff', padding: '0.75rem 1.5rem' }}
                                disabled={loading}
                            >
                                Delete My Account
                            </button>
                        ) : (
                            <div className="fade-in">
                                <p style={{ color: '#fca5a5', fontWeight: '600', fontSize: '0.875rem', marginBottom: '0.75rem' }}>
                                    Type <strong>DELETE</strong> below to permanently delete your account:
                                </p>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={deleteConfirmText}
                                    onChange={e => setDeleteConfirmText(e.target.value)}
                                    placeholder="Type DELETE to confirm"
                                    style={{ marginBottom: '0.875rem', borderColor: 'rgba(239,68,68,0.5)' }}
                                    autoFocus
                                />
                                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                                    <button
                                        onClick={handleDeleteAccount}
                                        className="btn"
                                        style={{ background: 'var(--danger)', color: '#fff', padding: '0.75rem 1.25rem', opacity: deleteConfirmText !== 'DELETE' ? 0.5 : 1 }}
                                        disabled={deleteConfirmText !== 'DELETE' || loading}
                                    >
                                        {loading ? 'Deleting…' : 'Confirm Delete'}
                                    </button>
                                    <button
                                        onClick={() => { setShowDeleteConfirm(false); setDeleteConfirmText(''); }}
                                        className="btn btn-outline"
                                        style={{ padding: '0.75rem 1.25rem' }}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Settings;
