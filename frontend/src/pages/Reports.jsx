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
        } catch (err) {
            console.error('Error loading categories:', err);
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

            // Open the HTML report in a new window
            // User can then use browser's Print function (Ctrl+P) to save as PDF
            const url = `${api.defaults.baseURL}/export/report/pdf?${params.toString()}`;
            const newWindow = window.open(url, '_blank');

            if (!newWindow) {
                showError('Please allow popups to view the PDF report');
                return;
            }

            showSuccess('Report opened in new window - use Print (Ctrl+P) to save as PDF');
        } catch (err) {
            showError('Failed to export PDF');
        }
    };

    const formatCurrency = amount => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: user?.currency || 'USD',
        }).format(amount);
    };

    return (
        <div className="container" style={{ paddingTop: '1.25rem', paddingBottom: '2rem' }}>

            {/* ── Header ── */}
            <div style={{ marginBottom: '1.5rem' }} className="fade-in">
                <h1 style={{ marginBottom: '0.375rem', fontSize: '1.875rem', fontWeight: '700' }}>Reports & Export</h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', margin: 0 }}>
                    Generate custom financial reports and export your data
                </p>
            </div>

            {/* ── Filters Card ── */}
            <div className="card" style={{ marginBottom: '1.5rem', padding: '1.25rem 1.5rem' }}>
                <div style={{ fontSize: '0.6875rem', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '1rem' }}>Filter Criteria</div>
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
                            {categories.map(cat => <option key={cat._id} value={cat._id}>{cat.icon} {cat.name}</option>)}
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
                <button onClick={loadSummary} className="btn btn-primary" disabled={loading} style={{ padding: '0.75rem 1.5rem' }}>
                    {loading ? 'Generating…' : 'Generate Report'}
                </button>
            </div>

            {/* ── Summary KPI Cards ── */}
            {summary && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }} className="fade-in">
                    {[
                        { label: 'Total Income',    val: formatCurrency(summary.income),   color: '#10b981', accent: 'rgba(16,185,129,0.08)' },
                        { label: 'Total Expenses',  val: formatCurrency(summary.expense),  color: '#ef4444', accent: 'rgba(239,68,68,0.08)' },
                        { label: 'Net Balance',     val: formatCurrency(summary.balance),  color: summary.balance >= 0 ? '#10b981' : '#ef4444', accent: summary.balance >= 0 ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.08)' },
                        { label: 'Transactions',    val: summary.count.toLocaleString(),   color: '#6366f1', accent: 'rgba(99,102,241,0.08)' },
                    ].map((item, i) => (
                        <div key={item.label} className="card scale-in" style={{ padding: '1.125rem 1.25rem', borderLeft: `3px solid ${item.color}`, background: item.accent, animationDelay: `${i * 0.06}s` }}>
                            <div style={{ fontSize: '0.6875rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.5rem' }}>{item.label}</div>
                            <div style={{ fontSize: '1.625rem', fontWeight: '800', color: item.color }}>{item.val}</div>
                        </div>
                    ))}
                </div>
            )}

            {/* ── Export Options ── */}
            <div className="card" style={{ padding: '1.25rem 1.5rem' }}>
                <div style={{ fontSize: '0.6875rem', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.375rem' }}>Export Data</div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '1.25rem', marginTop: '0.25rem' }}>
                    Export your filtered transactions and reports in various formats.
                </p>
                <div style={{ display: 'flex', gap: '0.875rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
                    <button onClick={handleExportCSV} className="btn btn-primary" style={{ padding: '0.75rem 1.5rem' }}>
                        Download CSV
                    </button>
                    <button onClick={handleExportPDF} className="btn btn-outline" style={{ padding: '0.75rem 1.5rem' }}>
                        View PDF Report
                    </button>
                </div>
                <div style={{ padding: '0.875rem 1rem', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', fontSize: '0.8125rem', color: 'var(--text-secondary)', borderLeft: '3px solid var(--primary)' }}>
                    <strong>Tip:</strong> Apply filters before exporting for targeted reports. PDF report opens in a new window — use <strong>Ctrl+P</strong> to save as PDF.
                </div>
            </div>
        </div>
    );
};

export default Reports;
