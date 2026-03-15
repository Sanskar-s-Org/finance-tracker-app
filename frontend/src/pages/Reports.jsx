import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import api from '../services/api';

const Reports = () => {
    const { user } = useAuth();
    const { showSuccess, showError } = useNotification();
    const [loading, setLoading] = useState(false);
    const [filters, setFilters] = useState({
        startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
            .toISOString()
            .split('T')[0],
        endDate: new Date().toISOString().split('T')[0],
        category: '',
        type: '',
    });
    const [summary, setSummary] = useState(null);
    const [categories, setCategories] = useState([]);

    useEffect(() => {
        loadCategories();
        loadSummary();
    }, []);

    const loadCategories = async () => {
        try {
            const response = await api.get('/categories');
            setCategories(response.data.data);
        } catch {
            // non-critical — category filter will just be empty
        }
    };

    const loadSummary = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (filters.startDate) params.append('startDate', filters.startDate);
            if (filters.endDate) params.append('endDate', filters.endDate);
            if (filters.category) params.append('category', filters.category);
            if (filters.type) params.append('type', filters.type);

            const response = await api.get(`/transactions?${params.toString()}`);
            const transactions = response.data.data;

            const income = transactions
                .filter(t => t.type === 'income')
                .reduce((sum, t) => sum + t.amount, 0);
            const expense = transactions
                .filter(t => t.type === 'expense')
                .reduce((sum, t) => sum + t.amount, 0);

            setSummary({
                income,
                expense,
                balance: income - expense,
                count: transactions.length,
            });
        } catch (err) {
            showError('Failed to load report summary');
        } finally {
            setLoading(false);
        }
    };

    const handleExportCSV = async () => {
        try {
            const params = new URLSearchParams();
            if (filters.startDate) params.append('startDate', filters.startDate);
            if (filters.endDate) params.append('endDate', filters.endDate);
            if (filters.category) params.append('category', filters.category);
            if (filters.type) params.append('type', filters.type);

            const response = await api.get(`/export/transactions/csv?${params.toString()}`, {
                responseType: 'blob',
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `transactions_${new Date().toISOString().split('T')[0]}.csv`);
            document.body.appendChild(link);
            link.click();
            link.remove();

            showSuccess('CSV exported successfully!');
        } catch (err) {
            showError('Failed to export CSV');
        }
    };

    const handleExportPDF = async () => {
        try {
            const params = new URLSearchParams();
            if (filters.startDate) params.append('startDate', filters.startDate);
            if (filters.endDate) params.append('endDate', filters.endDate);
            if (filters.category) params.append('category', filters.category);
            if (filters.type) params.append('type', filters.type);

            // Fetch via axios so the Authorization header is sent, then open as a blob URL
            const response = await api.get(`/export/report/pdf?${params.toString()}`, {
                responseType: 'blob',
            });

            const blob = new Blob([response.data], { type: 'text/html' });
            const blobUrl = window.URL.createObjectURL(blob);
            const newWindow = window.open(blobUrl, '_blank');

            if (!newWindow) {
                window.URL.revokeObjectURL(blobUrl);
                showError('Please allow popups to view the PDF report');
                return;
            }

            // Revoke the object URL after the window has had time to load it
            setTimeout(() => window.URL.revokeObjectURL(blobUrl), 15000);

            showSuccess('Report opened in new window — use Print (Ctrl+P) to save as PDF');
        } catch (err) {
            showError('Failed to generate report. Please try again.');
        }
    };

    const formatCurrency = amount => {
        return new Intl.NumberFormat(navigator.language || 'en-IN', {
            style: 'currency',
            currency: user?.currency || 'INR',
        }).format(amount);
    };

    const IconCalendar = (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
        </svg>
    );
    const IconRefresh = (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/>
            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
        </svg>
    );
    const IconCSV = (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
            <line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="16" y2="17"/><polyline points="10 9 9 9 8 9"/>
        </svg>
    );
    const IconPDF = (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
            <path d="M9 15h1.5a1.5 1.5 0 0 0 0-3H9v6m5-6h2m-2 3h2"/>
        </svg>
    );

    return (
        <div className="container" style={{ paddingTop: '1.25rem', paddingBottom: '2rem' }}>

            {/* ── Header ── */}
            <div style={{ marginBottom: '1.75rem' }} className="fade-in">
                <h1 style={{ marginBottom: '0.375rem', fontSize: '1.875rem', fontWeight: '800', letterSpacing: '-0.02em' }}>Reports & Export</h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0 }}>
                    Generate custom financial reports and export your data
                </p>
            </div>

            {/* ── Filters Card ── */}
            <div className="card" style={{ marginBottom: '1.5rem', padding: '1.375rem 1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.125rem' }}>
                    <span style={{ color: 'var(--primary-300)' }}>{IconCalendar}</span>
                    <span style={{ fontSize: '0.6875rem', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Filter Criteria</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(175px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
                    <div className="form-group" style={{ margin: 0 }}>
                        <label className="form-label">Start Date</label>
                        <input type="date" value={filters.startDate} onChange={e => setFilters({ ...filters, startDate: e.target.value })} className="form-input" />
                    </div>
                    <div className="form-group" style={{ margin: 0 }}>
                        <label className="form-label">End Date</label>
                        <input type="date" value={filters.endDate} onChange={e => setFilters({ ...filters, endDate: e.target.value })} className="form-input" />
                    </div>
                    <div className="form-group" style={{ margin: 0 }}>
                        <label className="form-label">Category</label>
                        <select value={filters.category} onChange={e => setFilters({ ...filters, category: e.target.value })} className="form-select">
                            <option value="">All Categories</option>
                            {categories.map(cat => <option key={cat._id} value={cat._id}>{cat.name}</option>)}
                        </select>
                    </div>
                    <div className="form-group" style={{ margin: 0 }}>
                        <label className="form-label">Type</label>
                        <select value={filters.type} onChange={e => setFilters({ ...filters, type: e.target.value })} className="form-select">
                            <option value="">All Types</option>
                            <option value="income">Income</option>
                            <option value="expense">Expense</option>
                        </select>
                    </div>
                </div>
                <button onClick={loadSummary} className="btn btn-primary" disabled={loading} style={{ padding: '0.75rem 1.5rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                    {loading
                        ? <><span style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.35)', borderTop: '2px solid #fff', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.8s linear infinite' }} /> Generating…</>
                        : <>{IconRefresh} Generate Report</>}
                </button>
            </div>

            {/* ── Summary KPI Cards ── */}
            {summary && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }} className="fade-in">
                    {[
                        { label: 'Total Income',   val: formatCurrency(summary.income),  color: '#10b981', bg: 'rgba(16,185,129,0.07)' },
                        { label: 'Total Expenses', val: formatCurrency(summary.expense), color: '#ef4444', bg: 'rgba(239,68,68,0.07)' },
                        { label: 'Net Balance',    val: formatCurrency(summary.balance), color: summary.balance >= 0 ? '#10b981' : '#ef4444', bg: summary.balance >= 0 ? 'rgba(16,185,129,0.07)' : 'rgba(239,68,68,0.07)' },
                        { label: 'Transactions',   val: summary.count.toLocaleString(),  color: '#6366f1', bg: 'rgba(99,102,241,0.07)' },
                    ].map((item, i) => (
                        <div key={item.label} className="card scale-in" style={{ padding: '1.125rem 1.25rem', borderTop: `3px solid ${item.color}`, background: item.bg, animationDelay: `${i * 0.06}s` }}>
                            <div style={{ fontSize: '0.6875rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.5rem' }}>{item.label}</div>
                            <div style={{ fontSize: '1.5rem', fontWeight: '800', color: item.color, letterSpacing: '-0.02em' }}>{item.val}</div>
                        </div>
                    ))}
                </div>
            )}

            {/* ── Export Options ── */}
            <div className="card" style={{ padding: '1.375rem 1.5rem' }}>
                <div style={{ fontSize: '0.6875rem', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '1.25rem' }}>Export Data</div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem', marginBottom: '1.375rem' }}>
                    {/* CSV Card */}
                    <div className="export-option-card">
                        <div className="export-icon-box" style={{ background: 'rgba(16,185,129,0.1)', color: '#10b981', flexShrink: 0 }}>
                            {IconCSV}
                        </div>
                        <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: '700', fontSize: '1rem', marginBottom: '0.25rem' }}>Spreadsheet (CSV)</div>
                            <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '0.875rem', lineHeight: 1.5 }}>
                                Download your filtered transactions as a CSV file, ready to open in Excel or Google Sheets.
                            </div>
                            <button onClick={handleExportCSV} className="btn btn-primary" style={{ padding: '0.55rem 1.25rem', fontSize: '0.875rem' }}>
                                Download CSV
                            </button>
                        </div>
                    </div>

                    {/* PDF Card */}
                    <div className="export-option-card">
                        <div className="export-icon-box" style={{ background: 'rgba(239,68,68,0.1)', color: '#f87171', flexShrink: 0 }}>
                            {IconPDF}
                        </div>
                        <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: '700', fontSize: '1rem', marginBottom: '0.25rem' }}>Full Report (PDF)</div>
                            <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '0.875rem', lineHeight: 1.5 }}>
                                Open a printable HTML report in a new tab. Use <strong>Ctrl+P</strong> to save or print as a PDF.
                            </div>
                            <button onClick={handleExportPDF} className="btn btn-outline" style={{ padding: '0.55rem 1.25rem', fontSize: '0.875rem' }}>
                                View Report
                            </button>
                        </div>
                    </div>
                </div>

                {/* Tip */}
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', padding: '0.875rem 1rem', background: 'rgba(99,102,241,0.07)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 'var(--radius-md)', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--primary-300)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: '1px' }}>
                        <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                    </svg>
                    <span><strong style={{ color: 'var(--primary-300)' }}>Tip:</strong> Apply filters before exporting for more targeted reports. The date range and category filters are applied to both CSV and PDF exports.</span>
                </div>
            </div>
        </div>
    );
};

export default Reports;
