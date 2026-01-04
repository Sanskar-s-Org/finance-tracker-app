import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useFinance } from '../context/FinanceContext';
import { useAuth } from '../context/AuthContext';
import { dashboardService, budgetService } from '../services';

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
  const [dashboardPage, setDashboardPage] = useState(1);
  const [dashboardPageSize] = useState(5);
  const [showNotificationPrompt, setShowNotificationPrompt] = useState(false);
  const [budgetAlertsCount, setBudgetAlertsCount] = useState(0);

  const periodLabels = {
    thisMonth: 'This Month',
    lastMonth: 'Last Month',
    last3Months: 'Last 3 Months',
    thisYear: 'This Year',
    allTime: 'All Time',
  };

  useEffect(() => {
    loadDashboard();

    // Request notification permission on first load
    if (Notification.permission === 'default') {
      setTimeout(() => setShowNotificationPrompt(true), 2000);
    }
  }, [period]);

  // Auto-refresh when page becomes visible or user navigates to dashboard
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        loadDashboard();
      }
    };

    // Listen for visibility changes (tab switches)
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Refresh on mount (when user navigates to dashboard)
    loadDashboard();

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []); // Empty deps - only on mount/unmount

  const loadDashboard = async () => {
    try {
      const [summaryRes, trendsRes, insightsRes, alertsRes] = await Promise.all([
        dashboardService.getSummary(period),
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
  const savingsRate = income > 0 ? ((income - expense) / income * 100) : 0;

  // Calculate days in period for avg daily spending
  const getDaysInPeriod = () => {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();

    switch (period) {
      case 'lastMonth': {
        const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
        const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
        return new Date(lastMonthYear, lastMonth + 1, 0).getDate();
      }
      case 'last3Months':
        return 90;
      case 'thisYear':
        const dayOfYear = Math.floor((today - new Date(currentYear, 0, 0)) / 1000 / 60 / 60 / 24);
        return dayOfYear;
      case 'allTime':
        return summary?.summary?.transactionCount || 1;
      case 'thisMonth':
      default:
        return today.getDate();
    }
  };

  const avgDailySpending = expense / (getDaysInPeriod() || 1);
  const topCategory = summary?.categoryBreakdown?.[0];

  return (
    <div
      className="container"
      style={{ paddingTop: '1.25rem', paddingBottom: '2rem' }}
    >
      {/* Enhanced Header with Premium Filter Controls */}
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

        {/* Filter Controls Row */}
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
                onClick={() => period === 'custom' && customDateRange.startDate && customDateRange.endDate && loadDashboard()}
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
            {refreshing ? '🔄 Refreshing...' : '🔄 Refresh Data'}
          </button>
        </div>
      </div>

      {/* Main Stats - First Row */}
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
          <p
            style={{
              color: 'var(--success)',
              fontSize: '0.8125rem',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem',
            }}
          >
            <span>↑ {periodLabels[period]}</span>
            {summary?.trends?.income && (
              <span style={{ opacity: 0.8 }}>
                {summary.trends.income > 0 ? '+' : ''}{summary.trends.income.toFixed(1)}%
              </span>
            )}
          </p>
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
          <p
            style={{
              color: 'var(--danger)',
              fontSize: '0.8125rem',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem',
            }}
          >
            <span>↓ {periodLabels[period]}</span>
            {summary?.trends?.expense && (
              <span style={{ opacity: 0.8 }}>
                {summary.trends.expense > 0 ? '+' : ''}{summary.trends.expense.toFixed(1)}%
              </span>
            )}
          </p>
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
                {formatCurrency(summary?.summary?.balance || 0)}
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
          <p
            style={{
              color: 'var(--text-secondary)',
              fontSize: '0.8125rem',
              fontWeight: '600',
            }}
          >
            {income > expense ? '✓ Saving money' : expense > income ? '⚠ Deficit' : 'Breaking even'}
          </p>
        </div>
      </div>

      {/* Second Row: Overview & Alerts */}
      <div className="grid grid-2" style={{ marginBottom: '1.5rem' }}>
        {/* Financial Overview Card */}
        <div className="card" style={{ animationDelay: '0.3s' }}>
          <h3 style={{ marginBottom: '1rem', fontSize: '1.125rem' }}>📈 Financial Overview</h3>

          {/* Key Metrics */}
          <div style={{ marginBottom: '1rem' }}>
            <div style={{ marginBottom: '0.75rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.125rem' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.8125rem' }}>Savings Rate</span>
                <span style={{ fontSize: '1.125rem', fontWeight: '700', color: savingsRate >= 20 ? 'var(--success)' : savingsRate >= 0 ? 'var(--warning)' : 'var(--danger)' }}>
                  {savingsRate.toFixed(1)}%
                </span>
              </div>
              <p style={{ fontSize: '0.6875rem', color: 'var(--text-secondary)', margin: 0 }}>
                {savingsRate >= 20 ? 'Excellent! Keep it up' : savingsRate >= 0 ? 'Good, aim for 20%+' : 'Warning: Spending exceeds income'}
              </p>
            </div>

            <div style={{ marginBottom: '0.75rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.125rem' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.8125rem' }}>Daily Average</span>
                <span style={{ fontSize: '1.125rem', fontWeight: '700' }}>
                  {formatCurrency(avgDailySpending)}
                </span>
              </div>
              <p style={{ fontSize: '0.6875rem', color: 'var(--text-secondary)', margin: 0 }}>
                Your average spending per day
              </p>
            </div>

            <div style={{ marginBottom: '0.75rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.125rem' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.8125rem' }}>Top Category</span>
                <span style={{ fontSize: '0.9375rem', fontWeight: '600' }}>
                  {topCategory?.category?.icon} {topCategory?.category?.name || 'N/A'}
                </span>
              </div>
              <p style={{ fontSize: '0.6875rem', color: 'var(--text-secondary)', margin: 0 }}>
                {topCategory ? `${formatCurrency(topCategory.total)} (${topCategory.percentage.toFixed(1)}%)` : 'No expenses yet'}
              </p>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.125rem' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.8125rem' }}>Transactions</span>
                <span style={{ fontSize: '1.125rem', fontWeight: '700' }}>
                  {summary?.summary?.transactionCount || 0}
                </span>
              </div>
              <p style={{ fontSize: '0.6875rem', color: 'var(--text-secondary)', margin: 0 }}>
                Total activities this period
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '2px solid var(--border)' }}>
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

        {/* Budget Alerts Card */}
        {budgetAlerts.length > 0 ? (
          <div className="card" style={{ animationDelay: '0.35s' }}>
            <h3 style={{ marginBottom: '1rem', fontSize: '1.125rem' }}>⚠️ Budget Alerts</h3>
            <div style={{ display: 'grid', gap: '0.75rem' }}>
              {budgetAlerts.map((alert, index) => (
                <div
                  key={index}
                  style={{
                    padding: '0.75rem',
                    backgroundColor: alert.isOverBudget
                      ? 'rgba(239, 68, 68, 0.1)'
                      : 'rgba(251, 191, 36, 0.1)',
                    borderLeft: `4px solid ${alert.isOverBudget ? 'var(--danger)' : 'var(--warning)'}`,
                    borderRadius: 'var(--radius-md)',
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
        ) : (
          <div className="card" style={{ animationDelay: '0.35s' }}>
            <h3 style={{ marginBottom: '0.75rem', fontSize: '1.125rem' }}>💰 Budget Status</h3>
            <div style={{ textAlign: 'center', padding: '1.5rem 1rem' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>✓</div>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '0.375rem', fontSize: '0.9375rem' }}>All budgets on track</p>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>No alerts at this time</p>
            </div>
          </div>
        )}
      </div>

      {/* Removed duplicate Budget Alerts section - now only showing in grid-2 above */}

      {/* Insights */}
      {insights && insights.insights?.length > 0 && (
        <div style={{ marginBottom: '1.5rem' }} className="fade-in">
          <h3 style={{ marginBottom: '1rem', fontSize: '1.125rem' }}>💡 Financial Insights</h3>
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

      {/* Category Breakdown */}
      {summary?.categoryBreakdown?.length > 0 && (
        <div style={{ marginBottom: '1.5rem' }} className="fade-in">
          <h3 style={{ marginBottom: '1rem', fontSize: '1.125rem' }}>📈 Spending by Category</h3>
          <div className="grid grid-2">
            {summary.categoryBreakdown.map((cat, index) => (
              <div
                key={cat._id}
                className="card scale-in"
                style={{ animationDelay: `${index * 0.05}s`, padding: '1rem' }}
              >
                <div className="flex-between" style={{ marginBottom: '0.75rem' }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.625rem',
                    }}
                  >
                    <span style={{ fontSize: '1.75rem' }}>
                      {cat.category.icon}
                    </span>
                    <div>
                      <p
                        style={{
                          fontWeight: '700',
                          fontSize: '1rem',
                          margin: 0,
                        }}
                      >
                        {cat.category.name}
                      </p>
                      <p
                        style={{
                          color: 'var(--text-muted)',
                          fontSize: '0.8125rem',
                          margin: 0,
                        }}
                      >
                        {cat.count} transactions
                      </p>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p
                      style={{
                        fontWeight: '800',
                        fontSize: '1.125rem',
                        margin: 0,
                      }}
                    >
                      {formatCurrency(cat.total)}
                    </p>
                    <p
                      style={{
                        color: 'var(--primary)',
                        fontSize: '0.8125rem',
                        fontWeight: '600',
                        margin: 0,
                      }}
                    >
                      {cat.percentage.toFixed(1)}%
                    </p>
                  </div>
                </div>
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{
                      width: `${cat.percentage}%`,
                      background: `linear-gradient(90deg, ${cat.category.color}, ${cat.category.color}dd)`,
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Transactions with Pagination */}
      {summary?.recentTransactions?.length > 0 && (
        <div className="fade-in">
          <div className="flex-between" style={{ marginBottom: '1rem' }}>
            <h3 style={{ margin: 0, fontSize: '1.125rem' }}>🕒 Recent Transactions</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', margin: 0 }}>
              {summary.recentTransactions.length} total
              {(() => {
                const totalTxnPages = Math.ceil(summary.recentTransactions.length / dashboardPageSize);
                return totalTxnPages > 1 ? ` • Page ${dashboardPage} of ${totalTxnPages}` : '';
              })()}
            </p>
          </div>
          <div className="card" style={{ padding: '1rem' }}>
            {(() => {
              const start = (dashboardPage - 1) * dashboardPageSize;
              const end = start + dashboardPageSize;
              const paginatedTxns = summary.recentTransactions.slice(start, end);
              return paginatedTxns.map((transaction, index) => (
                <div
                  key={transaction._id}
                  style={{
                    padding: '0.875rem 0',
                    borderBottom:
                      index < summary.recentTransactions.length - 1
                        ? '1px solid var(--border)'
                        : 'none',
                    transition: 'var(--transition-base)',
                  }}
                  onMouseEnter={e =>
                    (e.currentTarget.style.background = 'var(--bg-glass)')
                  }
                  onMouseLeave={e =>
                    (e.currentTarget.style.background = 'transparent')
                  }
                >
                  <div className="flex-between">
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                      }}
                    >
                      <div
                        style={{
                          width: '40px',
                          height: '40px',
                          background: 'var(--bg-tertiary)',
                          borderRadius: 'var(--radius-md)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '1.25rem',
                        }}
                      >
                        {transaction.category.icon}
                      </div>
                      <div>
                        <p
                          style={{
                            fontWeight: '600',
                            margin: 0,
                            fontSize: '0.9375rem',
                          }}
                        >
                          {transaction.description || transaction.category.name}
                        </p>
                        <p
                          style={{
                            color: 'var(--text-muted)',
                            fontSize: '0.8125rem',
                            margin: 0,
                          }}
                        >
                          {new Date(transaction.date).toLocaleDateString(
                            'en-US',
                            {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            }
                          )}
                        </p>
                      </div>
                    </div>
                    <span
                      style={{
                        fontWeight: '800',
                        fontSize: '1.125rem',
                        color:
                          transaction.type === 'income'
                            ? 'var(--success)'
                            : 'var(--danger)',
                      }}
                    >
                      {transaction.type === 'income' ? '+' : '-'}
                      {formatCurrency(transaction.amount)}
                    </span>
                  </div>
                </div>
              ))
            })()}
          </div>

          {/* Pagination Controls for Dashboard */}
          {(() => {
            const totalPages = Math.ceil(summary.recentTransactions.length / dashboardPageSize);
            if (totalPages <= 1) return null;

            return (
              <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}>
                <button
                  onClick={() => setDashboardPage(prev => Math.max(1, prev - 1))}
                  disabled={dashboardPage === 1}
                  className="btn btn-outline"
                  style={{ padding: '0.5rem 0.875rem', fontSize: '0.8125rem' }}
                >
                  ‹ Prev
                </button>
                <span style={{ padding: '0 0.75rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                  {dashboardPage} / {totalPages}
                </span>
                <button
                  onClick={() => setDashboardPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={dashboardPage === totalPages}
                  className="btn btn-outline"
                  style={{ padding: '0.5rem 0.875rem', fontSize: '0.8125rem' }}
                >
                  Next ›
                </button>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
