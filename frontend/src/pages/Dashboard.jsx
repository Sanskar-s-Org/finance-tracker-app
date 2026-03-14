import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useFinance } from '../context/FinanceContext';
import { useAuth } from '../context/AuthContext';
import { dashboardService, budgetService } from '../services';
import DonutChart from '../components/DonutChart';
import MiniTrendChart from '../components/MiniTrendChart';

const PERIOD_LABELS = {
  thisMonth: 'This Month',
  lastMonth: 'Last Month',
  last3Months: 'Last 3 Months',
  thisYear: 'This Year',
  allTime: 'All Time',
  custom: 'Custom Range',
};

const Dashboard = () => {
  const { fetchDashboard } = useFinance();
  const { user } = useAuth();

  const [summary, setSummary] = useState(null);
  const [trends, setTrends] = useState([]);
  const [insights, setInsights] = useState(null);
  const [budgetAlerts, setBudgetAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [period, setPeriod] = useState('thisMonth');
  const [customDateRange, setCustomDateRange] = useState({
    startDate: '',
    endDate: '',
  });

  useEffect(() => {
    loadDashboard();
  }, [period]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        loadDashboard();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const loadDashboard = async () => {
    try {
      const [summaryRes, trendsRes, insightsRes, alertsRes] = await Promise.all([
        dashboardService.getSummary(period, customDateRange.startDate, customDateRange.endDate),
        dashboardService.getTrends(6),
        dashboardService.getInsights(),
        budgetService.getAlerts(),
      ]);

      setSummary(summaryRes.data);
      setTrends(trendsRes.data || []);
      setInsights(insightsRes.data);
      setBudgetAlerts(alertsRes.data || []);

      if (typeof fetchDashboard === 'function') {
        fetchDashboard();
      }
    } catch (err) {
      console.error('Error loading dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadDashboard();
    setRefreshing(false);
  };

  const formatCurrency = amount =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: user?.currency || 'USD',
    }).format(amount || 0);

  const fmtDate = date =>
    new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

  const income = summary?.summary?.income || 0;
  const expense = summary?.summary?.expense || 0;
  const balance = summary?.summary?.balance || 0;
  const transactionCount = summary?.summary?.transactionCount || 0;
  const savingsRate = income > 0 ? ((income - expense) / income) * 100 : 0;

  const expenseChartData =
    summary?.categoryBreakdown?.slice(0, 6).map(cat => ({
      label: cat.category.name,
      value: cat.total,
      color: cat.category.color,
      icon: cat.category.icon,
      formattedValue: formatCurrency(cat.total),
      percentage: cat.percentage,
    })) || [];

  if (loading) {
    return (
      <div className="container" style={{ paddingTop: '1.5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="loading-skeleton" style={{ height: '140px', borderRadius: 'var(--radius-xl)' }} />
          ))}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '1rem' }}>
          <div className="loading-skeleton" style={{ height: '320px', borderRadius: 'var(--radius-xl)' }} />
          <div className="loading-skeleton" style={{ height: '320px', borderRadius: 'var(--radius-xl)' }} />
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ paddingTop: '1.25rem', paddingBottom: '2rem' }}>
      <div className="card fade-in" style={{ marginBottom: '1.25rem', padding: '1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', flexWrap: 'wrap' }}>
          <div>
            <h1 style={{ marginBottom: '0.25rem', fontSize: '1.875rem', fontWeight: '800' }}>Financial Dashboard</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', margin: 0 }}>
              {PERIOD_LABELS[period]} overview
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <select
              value={period}
              onChange={e => {
                setPeriod(e.target.value);
                if (e.target.value !== 'custom') {
                  setCustomDateRange({ startDate: '', endDate: '' });
                }
              }}
              className="form-select"
              style={{ minWidth: '165px', fontSize: '0.875rem', padding: '0.6rem 0.9rem' }}
            >
              {Object.entries(PERIOD_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>

            {period === 'custom' && (
              <>
                <input
                  type="date"
                  className="form-input"
                  value={customDateRange.startDate}
                  onChange={e => setCustomDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                  style={{ width: '160px', fontSize: '0.8125rem' }}
                />
                <input
                  type="date"
                  className="form-input"
                  value={customDateRange.endDate}
                  onChange={e => setCustomDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                  style={{ width: '160px', fontSize: '0.8125rem' }}
                />
              </>
            )}

            <button
              onClick={handleRefresh}
              className="btn btn-outline"
              style={{ padding: '0.6rem 0.9rem', fontSize: '0.8125rem' }}
              disabled={refreshing}
            >
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
        <div className="stat-card" style={{ position: 'relative' }}>
          <p style={{ marginBottom: '0.25rem', fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Total Income</p>
          <h2 style={{ margin: 0, color: 'var(--success)', fontSize: '1.5rem' }}>{formatCurrency(income)}</h2>
          <div style={{ position: 'absolute', right: '0.75rem', bottom: '0.6rem', opacity: 0.5 }}>
            <MiniTrendChart data={trends.map(t => t.income || 0)} color="#10b981" />
          </div>
        </div>

        <div className="stat-card" style={{ position: 'relative' }}>
          <p style={{ marginBottom: '0.25rem', fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Total Expense</p>
          <h2 style={{ margin: 0, color: 'var(--danger)', fontSize: '1.5rem' }}>{formatCurrency(expense)}</h2>
          <div style={{ position: 'absolute', right: '0.75rem', bottom: '0.6rem', opacity: 0.5 }}>
            <MiniTrendChart data={trends.map(t => t.expense || 0)} color="#ef4444" />
          </div>
        </div>

        <div className="stat-card">
          <p style={{ marginBottom: '0.25rem', fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Net Balance</p>
          <h2 style={{ margin: 0, color: balance >= 0 ? 'var(--success)' : 'var(--danger)', fontSize: '1.5rem' }}>{formatCurrency(balance)}</h2>
        </div>

        <div className="stat-card">
          <p style={{ marginBottom: '0.25rem', fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Savings Rate</p>
          <h2 style={{ margin: 0, color: savingsRate >= 10 ? 'var(--success)' : 'var(--warning)', fontSize: '1.5rem' }}>
            {Number.isFinite(savingsRate) ? `${savingsRate.toFixed(1)}%` : '0.0%'}
          </h2>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '1rem', marginBottom: '1.25rem' }}>
        <div className="card">
          <h3 style={{ marginBottom: '1rem', fontSize: '1rem' }}>Expense Breakdown</h3>
          {expenseChartData.length > 0 ? (
            <DonutChart data={expenseChartData} centerValue={formatCurrency(expense)} centerLabel="Total" />
          ) : (
            <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
              No expense data yet
            </div>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="card">
            <h3 style={{ marginBottom: '1rem', fontSize: '1rem' }}>Quick Overview</h3>
            <div className="flex-between" style={{ fontSize: '0.9rem', marginBottom: '0.625rem' }}>
              <span className="text-muted">Transactions</span>
              <strong>{transactionCount}</strong>
            </div>
            <div className="flex-between" style={{ fontSize: '0.9rem', marginBottom: '0.625rem' }}>
              <span className="text-muted">Budget Alerts</span>
              <strong style={{ color: budgetAlerts.length ? 'var(--warning)' : 'var(--success)' }}>
                {budgetAlerts.length}
              </strong>
            </div>
            <div className="flex-between" style={{ fontSize: '0.9rem' }}>
              <span className="text-muted">Status</span>
              <strong style={{ color: balance >= 0 ? 'var(--success)' : 'var(--danger)' }}>
                {balance >= 0 ? 'Healthy' : 'Watch Spending'}
              </strong>
            </div>
          </div>

          <div className="card">
            <h3 style={{ marginBottom: '1rem', fontSize: '1rem' }}>Quick Actions</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <Link to="/transactions" className="btn btn-primary" style={{ textDecoration: 'none' }}>
                Add Transaction
              </Link>
              <Link to="/budgets" className="btn btn-outline" style={{ textDecoration: 'none' }}>
                Manage Budgets
              </Link>
              <Link to="/reports" className="btn btn-outline" style={{ textDecoration: 'none' }}>
                Open Reports
              </Link>
            </div>
          </div>
        </div>
      </div>

      {budgetAlerts.length > 0 && (
        <div className="card" style={{ marginBottom: '1.25rem' }}>
          <h3 style={{ marginBottom: '1rem', fontSize: '1rem' }}>Budget Alerts</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: '0.75rem' }}>
            {budgetAlerts.map((alert, index) => (
              <div
                key={`${alert.category?._id || index}`}
                style={{
                  borderRadius: 'var(--radius-lg)',
                  padding: '0.9rem',
                  border: `1px solid ${alert.isOverBudget ? 'rgba(239,68,68,0.28)' : 'rgba(245,158,11,0.25)'}`,
                  background: alert.isOverBudget ? 'rgba(239,68,68,0.08)' : 'rgba(245,158,11,0.08)',
                }}
              >
                <div className="flex-between" style={{ marginBottom: '0.375rem' }}>
                  <strong style={{ fontSize: '0.9rem' }}>
                    {alert.category?.icon} {alert.category?.name}
                  </strong>
                  <span style={{ fontSize: '0.8rem', fontWeight: '700' }}>{alert.percentageUsed}%</span>
                </div>
                <div style={{ height: '6px', background: 'var(--bg-tertiary)', borderRadius: '99px', overflow: 'hidden', marginBottom: '0.4rem' }}>
                  <div
                    style={{
                      width: `${Math.min(alert.percentageUsed, 100)}%`,
                      height: '100%',
                      background: alert.isOverBudget ? 'var(--danger)' : 'var(--warning)',
                    }}
                  />
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  {formatCurrency(alert.spent)} of {formatCurrency(alert.amount)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {insights?.insights?.length > 0 && (
        <div className="card" style={{ marginBottom: '1.25rem' }}>
          <h3 style={{ marginBottom: '1rem', fontSize: '1rem' }}>Financial Insights</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: '0.75rem' }}>
            {insights.insights.map((item, index) => (
              <div key={index} style={{ background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', padding: '0.875rem 1rem' }}>
                <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: 1.5 }}>
                  {item.message}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {summary?.recentTransactions?.length > 0 && (
        <div className="card" style={{ overflow: 'hidden' }}>
          <div className="flex-between" style={{ marginBottom: '1rem' }}>
            <h3 style={{ margin: 0, fontSize: '1rem' }}>Recent Transactions</h3>
            <Link to="/transactions" style={{ fontSize: '0.875rem', textDecoration: 'none', color: 'var(--primary)' }}>
              View all
            </Link>
          </div>
          <div className="transactions-table-wrapper" style={{ overflowX: 'auto' }}>
            <table className="data-table" style={{ minWidth: '560px' }}>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Description</th>
                  <th>Category</th>
                  <th>Type</th>
                  <th style={{ textAlign: 'right' }}>Amount</th>
                </tr>
              </thead>
              <tbody>
                {summary.recentTransactions.slice(0, 8).map(tx => (
                  <tr key={tx._id}>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.8125rem' }}>{fmtDate(tx.date)}</td>
                    <td style={{ fontWeight: '600' }}>{tx.description || tx.category?.name}</td>
                    <td>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem' }}>
                        <span>{tx.category?.icon}</span>
                        <span style={{ color: 'var(--text-secondary)' }}>{tx.category?.name}</span>
                      </span>
                    </td>
                    <td>
                      <span className={`status-badge ${tx.type}`}>{tx.type}</span>
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: '700', color: tx.type === 'income' ? 'var(--success)' : 'var(--danger)' }}>
                      {tx.type === 'income' ? '+' : '-'}
                      {formatCurrency(tx.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
