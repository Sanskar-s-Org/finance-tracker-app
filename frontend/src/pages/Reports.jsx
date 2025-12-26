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
        <div className="container" style={{ paddingTop: '2rem', paddingBottom: '3rem' }}>
            <div style={{ marginBottom: '2.5rem' }} className="fade-in">
                <h1 style={{ marginBottom: '0.5rem' }}>📊 Reports & Export</h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>
                    Generate custom reports and export your financial data
                </p>
            </div>

            {/* Filters Card */}
            <div className="card" style={{ marginBottom: '2rem' }}>
                <h3 style={{ marginBottom: '1.5rem' }}>Filter Criteria</h3>
                <div className="grid grid-2" style={{ marginBottom: '1.5rem' }}>
                    <div className="form-group">
                        <label>Start Date</label>
                        <input
                            type="date"
                            value={filters.startDate}
                            onChange={e => setFilters({ ...filters, startDate: e.target.value })}
                            className="input"
                        />
                    </div>
                    <div className="form-group">
                        <label>End Date</label>
                        <input
                            type="date"
                            value={filters.endDate}
                            onChange={e => setFilters({ ...filters, endDate: e.target.value })}
                            className="input"
                        />
                    </div>
                    <div className="form-group">
                        <label>Category</label>
                        <select
                            value={filters.category}
                            onChange={e => setFilters({ ...filters, category: e.target.value })}
                            className="input"
                        >
                            <option value="">All Categories</option>
                            {categories.map(cat => (
                                <option key={cat._id} value={cat._id}>
                                    {cat.icon} {cat.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Type</label>
                        <select
                            value={filters.type}
                            onChange={e => setFilters({ ...filters, type: e.target.value })}
                            className="input"
                        >
                            <option value="">All Types</option>
                            <option value="income">Income</option>
                            <option value="expense">Expense</option>
                        </select>
                    </div>
                </div>
                <button onClick={loadSummary} className="btn btn-primary" disabled={loading}>
                    {loading ? 'Generating...' : '🔍 Generate Report'}
                </button>
            </div>

            {/* Summary Cards */}
            {summary && (
                <div className="grid grid-3" style={{ marginBottom: '2rem' }}>
                    <div className="stat-card scale-in">
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                            Total Income
                        </p>
                        <h2 style={{ margin: 0, color: 'var(--success)' }}>{formatCurrency(summary.income)}</h2>
                    </div>
                    <div className="stat-card scale-in" style={{ animationDelay: '0.1s' }}>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                            Total Expense
                        </p>
                        <h2 style={{ margin: 0, color: 'var(--danger)' }}>{formatCurrency(summary.expense)}</h2>
                    </div>
                    <div className="stat-card scale-in" style={{ animationDelay: '0.2s' }}>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                            Net Balance
                        </p>
                        <h2
                            style={{
                                margin: 0,
                                color: summary.balance >= 0 ? 'var(--success)' : 'var(--danger)',
                            }}
                        >
                            {formatCurrency(summary.balance)}
                        </h2>
                    </div>
                </div>
            )}

            {/* Export Options */}
            <div className="card">
                <h3 style={{ marginBottom: '1.5rem' }}>Export Options</h3>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                    Export your filtered transactions and reports in various formats
                </p>
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                    <button onClick={handleExportCSV} className="btn btn-primary">
                        📄 Export as CSV
                    </button>
                    <button onClick={handleExportPDF} className="btn btn-outline">
                        📑 View PDF Report
                    </button>
                </div>
                <div
                    style={{
                        marginTop: '1.5rem',
                        padding: '1rem',
                        background: 'var(--bg-tertiary)',
                        borderRadius: 'var(--radius-md)',
                        fontSize: '0.875rem',
                        color: 'var(--text-secondary)',
                    }}
                >
                    <p style={{ margin: 0 }}>
                        <strong>💡 Tip:</strong> Use the filters above to customize your report before
                        exporting. CSV format is ideal for spreadsheet analysis. PDF report opens in a new window -
                        use your browser's Print function (Ctrl+P or Cmd+P) to save it as a PDF file.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Reports;
