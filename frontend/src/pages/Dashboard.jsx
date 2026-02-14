import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useFinance } from '../context/FinanceContext';
import { useAuth } from '../context/AuthContext';
import { dashboardService, budgetService } from '../services';
import DonutChart from '../components/DonutChart';
import MiniTrendChart from '../components/MiniTrendChart';

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

  const periodLabels = {
    thisMonth: 'This Month',
    lastMonth: 'Last Month',
    last3Months: 'Last 3 Months',
    thisYear: 'This Year',
    allTime: 'All Time',
    custom: 'Custom Range',
  };

  useEffect(() => {
    loadDashboard();
  }, [period]);

  // Auto-refresh when page becomes visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        loadDashboard();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    loadDashboard();

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const loadDashboard = async () => {
    try {
      const [summaryRes, trendsRes, insightsRes, alertsRes] = await Promise.all([
        dashboardService.getSummary(
          period,
          customDateRange.startDate,
          customDateRange.endDate
        ),
        dashboardService.getTrends(6),
        dashboardService.getInsights(),
        budgetService.getAlerts(),
      ]);

      setSummary(summaryRes.data);
      setTrends(trendsRes.data);
      setInsights(insightsRes.data);
      setBudgetAlerts(alertsRes.data || []);
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

  if (loading) {
    return (
      <div className="container" style={{ paddingTop: '2rem' }}>
        <div className="grid grid-3">
          {[1, 2, 3].map(i => (
            <div
              key={i}
              className="loading-skeleton"
              style={{ height: '180px' }}
            ></div>
          ))}
        </div>
      </div>
    );
  }

  const formatCurrency = amount => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: user?.currency || 'USD',
    }).format(amount);
  };

  // Calculate quick stats
  const income = summary?.summary?.income || 0;
  const expense = summary?.summary?.expense || 0;
  const balance = summary?.summary?.balance || 0;
  const savingsRate = income > 0 ? ((income - expense) / income * 100) : 0;

  // Prepare donut chart data
  const expenseChartData = summary?.categoryBreakdown?.slice(0, 5).map(cat => ({
    label: cat.category.name,
    value: cat.total,
    color: cat.category.color,
    icon: cat.category.icon,
    formattedValue: formatCurrency(cat.total),
    percentage: cat.percentage,
  })) || [];

  return (
    <div
      className="container"
      style={{ paddingTop: '1.25rem', paddingBottom: '2rem' }}
    >
      {/* ==================== HEADER SECTION ==================== */}
      <div
        className="card fade-in"
        style={{
          marginBottom: '1.5rem',
          background: 'var(--bg-glass)',
          backdropFilter: 'blur(20px)',
          border: '1px solid var(--border)',
          padding: '1.25rem',
        }}
      >
        <div style={{ marginBottom: '1rem' }}>
          <h1 style={{ marginBottom: '0.25rem', fontSize: '1.875rem', fontWeight: '700' }}>Financial Dashboard</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', margin: 0 }}>
            {periodLabels[period]} Overview
          </p>
        </div>

        {/* Filter Controls */}
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <select
            value={period}
            onChange={(e) => {
              setPeriod(e.target.value);
              if (e.target.value !== 'custom') {
                setCustomDateRange({ startDate: '', endDate: '' });
              }
            }}
            className="form-select"
            style={{
              minWidth: '150px',
              padding: '0.75rem 1.125rem',
              fontSize: '0.875rem',
              fontWeight: '600',
            }}
          >
            <option value="thisMonth">📅 This Month</option>
            <option value="lastMonth">📅 Last Month</option>
            <option value="last3Months">📅 Last 3 Months</option>
            <option value="thisYear">📅 This Year</option>
            <option value="allTime">📅 All Time</option>
            <option value="custom">🗓️ Custom Range</option>
          </select>

          {period === 'custom' && (
            <>
              <input
                type="date"
                value={customDateRange.startDate}
                onChange={(e) => setCustomDateRange({ ...customDateRange, startDate: e.target.value })}
                className="form-input"
                style={{
                  padding: '0.75rem 1.125rem',
                  fontSize: '0.875rem',
                  width: '150px',
                }}
              />
              <span style={{ color: 'var(--text-secondary)', fontWeight: '600' }}>→</span>
              <input
                type="date"
                value={customDateRange.endDate}
                onChange={(e) => setCustomDateRange({ ...customDateRange, endDate: e.target.value })}
                className="form-input"
                style={{
                  padding: '0.75rem 1.125rem',
                  fontSize: '0.875rem',
                  width: '150px',
                }}
              />
              <button
                onClick={loadDashboard}
                className="btn btn-primary"
                style={{ padding: '0.75rem 1.25rem', fontSize: '0.875rem' }}
                disabled={!customDateRange.startDate || !customDateRange.endDate}
              >
                ✅ Apply
              </button>
            </>
          )}

          <div style={{ flex: '1' }}></div>

          <button
            onClick={handleRefresh}
            className="btn btn-outline"
            disabled={refreshing}
            style={{ padding: '0.75rem 1.25rem', fontSize: '0.875rem', fontWeight: '600' }}
          >
            {refreshing ? '🔄 Refreshing...' : '🔄 Refresh'}
          </button>
        </div>
      </div>

      {/* ==================== SUMMARY STATS ROW ==================== */}
      <div className="grid grid-3" style={{ marginBottom: '1.5rem' }}>
        {/* Income Card */}
        <div
          className="stat-card scale-in"
          style={{
            background:
              'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(5, 150, 105, 0.05) 100%)',
            borderColor: 'rgba(16, 185, 129, 0.3)',
          }}
        >
          <div className="stat-card-content">
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: '0.625rem',
              }}
            >
              <div>
                <p
                  style={{
                    color: 'var(--text-muted)',
                    fontSize: '0.75rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    marginBottom: '0.375rem',
                  }}
                >
                  Total Income
                </p>
                <h2
                  style={{
                    margin: 0,
                    fontSize: '1.875rem',
                    fontWeight: '800',
                    background:
                      'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  {formatCurrency(income)}
                </h2>
              </div>
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  borderRadius: '0.875rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.5rem',
                  boxShadow: '0 6px 12px rgba(16, 185, 129, 0.3)',
                }}
              >
                💰
              </div>
            </div>
            {summary?.trends?.income !== undefined && (
              <div style={{ marginTop: '0.5rem' }}>
                <span className={`percentage-badge ${summary.trends.income >= 0 ? 'positive' : 'negative'}`}>
                  {summary.trends.income >= 0 ? '↑' : '↓'} {Math.abs(summary.trends.income).toFixed(1)}%
                </span>
              </div>
            )}
          </div>
          {trends.length > 0 && (
            <div className="stat-card-trend">
              <MiniTrendChart
                data={trends.map(t => t.income || 0)}
                color="#10b981"
              />
            </div>
          )}
        </div>

        {/* Expense Card */}
        <div
          className="stat-card scale-in"
          style={{
            background:
              'linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(220, 38, 38, 0.05) 100%)',
            borderColor: 'rgba(239, 68, 68, 0.3)',
            animationDelay: '0.1s',
          }}
        >
          <div className="stat-card-content">
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: '0.625rem',
              }}
            >
              <div>
                <p
                  style={{
                    color: 'var(--text-muted)',
                    fontSize: '0.75rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    marginBottom: '0.375rem',
                  }}
                >
                  Total Expenses
                </p>
                <h2
                  style={{
                    margin: 0,
                    fontSize: '1.875rem',
                    fontWeight: '800',
                    background:
                      'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  {formatCurrency(expense)}
                </h2>
              </div>
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                  borderRadius: '0.875rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.5rem',
                  boxShadow: '0 6px 12px rgba(239, 68, 68, 0.3)',
                }}
              >
                💸
              </div>
            </div>
            {summary?.trends?.expense !== undefined && (
              <div style={{ marginTop: '0.5rem' }}>
                <span className={`percentage-badge ${summary.trends.expense >= 0 ? 'negative' : 'positive'}`}>
                  {summary.trends.expense >= 0 ? '↑' : '↓'} {Math.abs(summary.trends.expense).toFixed(1)}%
                </span>
              </div>
            )}
          </div>
          {trends.length > 0 && (
            <div className="stat-card-trend">
              <MiniTrendChart
                data={trends.map(t => t.expense || 0)}
                color="#ef4444"
              />
            </div>
          )}
        </div>

        {/* Net Balance Card */}
        <div
          className="stat-card scale-in"
          style={{
            background: 'var(--gradient-glass)',
            borderColor: 'var(--primary)',
            animationDelay: '0.2s',
          }}
        >
          <div className="stat-card-content">
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: '0.625rem',
              }}
            >
              <div>
                <p
                  style={{
                    color: 'var(--text-muted)',
                    fontSize: '0.75rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    marginBottom: '0.375rem',
                  }}
                >
                  Net Balance
                </p>
                <h2
                  style={{
                    margin: 0,
                    fontSize: '1.875rem',
                    fontWeight: '800',
                    background: 'var(--gradient-primary)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  {formatCurrency(balance)}
                </h2>
              </div>
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  background: 'var(--gradient-primary)',
                  borderRadius: '0.875rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.5rem',
                  boxShadow: 'var(--shadow-glow)',
                }}
              >
                📊
              </div>
            </div>
            <div style={{ marginTop: '0.5rem' }}>
              <span className={`percentage-badge ${savingsRate >= 0 ? 'positive' : 'negative'}`}>
                {savingsRate >= 20 ? '✓ Excellent' : savingsRate >= 0 ? '○ Good' : '⚠ Alert'}
              </span>
            </div>
          </div>
          {trends.length > 0 && (
            <div className="stat-card-trend">
              <MiniTrendChart
                data={trends.map(t => (t.income || 0) - (t.expense || 0))}
                color="#6366f1"
              />
            </div>
          )}
        </div>
      </div>

      {/* ==================== ANALYTICS SECTION ==================== */}
      <div className="analytics-grid" style={{ marginBottom: '1.5rem' }}>
        {/* Left Column: Expense Breakdown Chart */}
        <div className="card fade-in">
          <div className="section-header">
            <h3>📊 Expense Breakdown</h3>
            <span className="section-header-meta">Top 5 Categories</span>
          </div>

          {expenseChartData.length > 0 ? (
            <DonutChart
              data={expenseChartData}
              centerValue={formatCurrency(expense)}
              centerLabel="Total"
            />
          ) : (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
              <p>No expense data available</p>
            </div>
          )}
        </div>

        {/* Right Column: Financial Overview + Quick Actions */}
        <div className="card fade-in">
          <div className="section-header">
            <h3>📈 Financial Overview</h3>
          </div>

          {/* Compact Stats */}
          <div style={{ marginBottom: '1.5rem' }}>
            <div className="compact-stat">
              <span className="compact-stat-label">💹 Savings Rate</span>
              <span className="compact-stat-value" style={{
                color: savingsRate >= 20 ? 'var(--success)' : savingsRate >= 0 ? 'var(--warning)' : 'var(--danger)'
              }}>
                {savingsRate.toFixed(1)}%
              </span>
            </div>

            <div className="compact-stat">
              <span className="compact-stat-label">📝 Transactions</span>
              <span className="compact-stat-value">{summary?.summary?.transactionCount || 0}</span>
            </div>

            <div className="compact-stat">
              <span className="compact-stat-label">🎯 Budget Status</span>
              <span className="compact-stat-value" style={{ fontSize: '0.9375rem' }}>
                {budgetAlerts.length > 0 ? (
                  <span style={{ color: 'var(--warning)' }}>{budgetAlerts.length} alert{budgetAlerts.length > 1 ? 's' : ''}</span>
                ) : (
                  <span style={{ color: 'var(--success)' }}>On Track ✓</span>
                )}
              </span>
            </div>
          </div>

          {/* Quick Actions */}
          <div style={{ paddingTop: '1rem', borderTop: '2px solid var(--border)' }}>
            <h4 style={{ fontSize: '0.8125rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>Quick Actions</h4>
            <div style={{ display: 'grid', gap: '0.625rem' }}>
              <Link
                to="/transactions"
                className="btn btn-primary"
                style={{
                  padding: '0.75rem 1rem',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  textDecoration: 'none',
                }}
              >
                ➕ Add Transaction
              </Link>
              <Link
                to="/budgets"
                className="btn btn-outline"
                style={{
                  padding: '0.75rem 1rem',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  textDecoration: 'none',
                }}
              >
                💰 Manage Budgets
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ==================== BUDGET ALERTS SECTION ==================== */}
      {budgetAlerts.length > 0 && (
        <div style={{ marginBottom: '1.5rem' }} className="fade-in">
          <div className="section-header">
            <h3>⚠️ Budget Alerts</h3>
          </div>
          <div className="grid grid-2">
            {budgetAlerts.map((alert, index) => (
              <div
                key={index}
                className="card"
                style={{
                  padding: '1rem',
                  borderLeft: `4px solid ${alert.isOverBudget ? 'var(--danger)' : 'var(--warning)'}`,
                  background: alert.isOverBudget
                    ? 'rgba(239, 68, 68, 0.05)'
                    : 'rgba(251, 191, 36, 0.05)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '1.25rem' }}>{alert.category?.icon}</span>
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: 0, fontWeight: '700', fontSize: '0.9375rem' }}>
                      {alert.category?.name}
                    </p>
                    <p style={{ margin: 0, fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
                      {alert.isOverBudget ? 'Over budget!' : 'Approaching limit'}
                    </p>
                  </div>
                </div>
                <div style={{ fontSize: '0.8125rem', marginBottom: '0.375rem', display: 'flex', justifyContent: 'space-between' }}>
                  <span>Spent: {formatCurrency(alert.spent)}</span>
                  <span>Budget: {formatCurrency(alert.amount)}</span>
                </div>
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{
                      width: `${Math.min(alert.percentageUsed, 100)}%`,
                      background: alert.isOverBudget ? 'var(--danger)' : 'var(--warning)',
                    }}
                  ></div>
                </div>
                <p style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', marginTop: '0.25rem', textAlign: 'right', margin: 0 }}>
                  {alert.percentageUsed}% used
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ==================== INSIGHTS SECTION ==================== */}
      {insights && insights.insights?.length > 0 && (
        <div style={{ marginBottom: '1.5rem' }} className="fade-in">
          <div className="section-header">
            <h3>💡 Financial Insights</h3>
          </div>
          <div className="grid grid-2">
            {insights.insights.map((insight, index) => (
              <div
                key={index}
                className="card scale-in"
                style={{
                  borderLeft: `4px solid ${insight.type === 'success'
                    ? 'var(--success)'
                    : insight.type === 'warning'
                      ? 'var(--warning)'
                      : 'var(--info)'
                    }`,
                  animationDelay: `${index * 0.1}s`,
                  background:
                    insight.type === 'success'
                      ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, transparent 100%)'
                      : insight.type === 'warning'
                        ? 'linear-gradient(135deg, rgba(251, 191, 36, 0.1) 0%, transparent 100%)'
                        : 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, transparent 100%)',
                  padding: '1rem',
                }}
              >
                <p style={{ margin: 0, fontSize: '0.9375rem', lineHeight: '1.5' }}>
                  {insight.message}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ==================== RECENT TRANSACTIONS TABLE ==================== */}
      {summary?.recentTransactions?.length > 0 && (
        <div className="fade-in">
          <div className="section-header">
            <h3>🕒 Recent Transactions</h3>
            <span className="section-header-meta">Last {summary.recentTransactions.length} activities</span>
          </div>

          {/* Desktop Table View */}
          <div className="card transactions-table-wrapper" style={{ padding: '0', overflow: 'hidden' }}>
            <table className="data-table transactions-table">
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
                {summary.recentTransactions.slice(0, 10).map((transaction) => (
                  <tr key={transaction._id}>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.8125rem' }}>
                      {new Date(transaction.date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </td>
                    <td>
                      <div style={{ fontWeight: '600' }}>
                        {transaction.description || transaction.category.name}
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontSize: '1.25rem' }}>{transaction.category.icon}</span>
                        <span>{transaction.category.name}</span>
                      </div>
                    </td>
                    <td>
                      <span className={`status-badge ${transaction.type}`}>
                        {transaction.type}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <span
                        style={{
                          fontWeight: '800',
                          fontSize: '1rem',
                          color: transaction.type === 'income' ? 'var(--success)' : 'var(--danger)',
                        }}
                      >
                        {transaction.type === 'income' ? '+' : '-'}
                        {formatCurrency(transaction.amount)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="transactions-mobile-cards">
            {summary.recentTransactions.slice(0, 10).map((transaction) => (
              <div key={transaction._id} className="transaction-mobile-card">
                <div className="transaction-mobile-header">
                  <div className="transaction-mobile-category">
                    <span className="transaction-icon">{transaction.category.icon}</span>
                    <div>
                      <div className="transaction-description">
                        {transaction.description || transaction.category.name}
                      </div>
                      <div className="transaction-category-name">{transaction.category.name}</div>
                    </div>
                  </div>
                  <div className="transaction-mobile-amount" style={{
                    color: transaction.type === 'income' ? 'var(--success)' : 'var(--danger)',
                  }}>
                    {transaction.type === 'income' ? '+' : '-'}
                    {formatCurrency(transaction.amount)}
                  </div>
                </div>
                <div className="transaction-mobile-footer">
                  <span className="transaction-date">
                    {new Date(transaction.date).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                  <span className={`status-badge ${transaction.type}`}>
                    {transaction.type}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {summary.recentTransactions.length > 10 && (
            <div style={{ marginTop: '1rem', textAlign: 'center' }}>
              <Link to="/transactions" className="btn btn-outline">
                View All Transactions →
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
