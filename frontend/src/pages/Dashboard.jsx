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

  const periodLabels = {
    thisMonth: 'This Month',
    lastMonth: 'Last Month',
    last3Months: 'Last 3 Months',
    thisYear: 'This Year',
    allTime: 'All Time',
  };

  useEffect(() => {
    loadDashboard();
  }, [period]);

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
      style={{ paddingTop: '2rem', paddingBottom: '3rem' }}
    >
      {/* Header with Refresh Button */}
      <div
        style={{
          marginBottom: '2.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
        }}
        className="fade-in"
      >
        <div>
          <h1 style={{ marginBottom: '0.5rem' }}>Financial Dashboard</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>
            {periodLabels[period]} Overview
          </p>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="form-select"
            style={{
              minWidth: '160px',
              padding: '0.625rem 1rem',
              fontSize: '0.95rem',
              fontWeight: '600',
            }}
          >
            <option value="thisMonth">This Month</option>
            <option value="lastMonth">Last Month</option>
            <option value="last3Months">Last 3 Months</option>
            <option value="thisYear">This Year</option>
            <option value="allTime">All Time</option>
          </select>
          <button
            onClick={handleRefresh}
            className="btn btn-outline"
            disabled={refreshing}
            style={{ minWidth: '120px' }}
          >
            {refreshing ? '🔄 Refreshing...' : '🔄 Refresh'}
          </button>
        </div>
      </div>

      {/* Main Stats - First Row */}
      <div className="grid grid-3" style={{ marginBottom: '2.5rem' }}>
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
              marginBottom: '1rem',
            }}
          >
            <div>
              <p
                style={{
                  color: 'var(--text-muted)',
                  fontSize: '0.875rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  marginBottom: '0.5rem',
                }}
              >
                Total Income
              </p>
              <h2
                style={{
                  margin: 0,
                  fontSize: '2.25rem',
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
                width: '60px',
                height: '60px',
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                borderRadius: '1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.75rem',
                boxShadow: '0 8px 16px rgba(16, 185, 129, 0.3)',
              }}
            >
              💰
            </div>
          </div>
          <p
            style={{
              color: 'var(--success)',
              fontSize: '0.875rem',
              fontWeight: '600',
            }}
          >
            ↑ {periodLabels[period]}
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
              marginBottom: '1rem',
            }}
          >
            <div>
              <p
                style={{
                  color: 'var(--text-muted)',
                  fontSize: '0.875rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  marginBottom: '0.5rem',
                }}
              >
                Total Expenses
              </p>
              <h2
                style={{
                  margin: 0,
                  fontSize: '2.25rem',
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
                width: '60px',
                height: '60px',
                background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                borderRadius: '1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.75rem',
                boxShadow: '0 8px 16px rgba(239, 68, 68, 0.3)',
              }}
            >
              💸
            </div>
          </div>
          <p
            style={{
              color: 'var(--danger)',
              fontSize: '0.875rem',
              fontWeight: '600',
            }}
          >
            ↓ {periodLabels[period]}
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
              marginBottom: '1rem',
            }}
          >
            <div>
              <p
                style={{
                  color: 'var(--text-muted)',
                  fontSize: '0.875rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  marginBottom: '0.5rem',
                }}
              >
                Net Balance
              </p>
              <h2
                style={{
                  margin: 0,
                  fontSize: '2.25rem',
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
                width: '60px',
                height: '60px',
                background: 'var(--gradient-primary)',
                borderRadius: '1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.75rem',
                boxShadow: 'var(--shadow-glow)',
              }}
            >
              📊
            </div>
          </div>
          <p
            style={{
              color: 'var(--text-secondary)',
              fontSize: '0.875rem',
              fontWeight: '600',
            }}
          >
            {income > expense ? '✓ Saving money' : expense > income ? '⚠ Deficit' : 'Breaking even'}
          </p>
        </div>
      </div>

      {/* Second Row: Overview & Alerts */}
      <div className="grid grid-2" style={{ marginBottom: '2.5rem' }}>
        {/* Financial Overview Card */}
        <div className="card" style={{ animationDelay: '0.3s' }}>
          <h3 style={{ marginBottom: '1.5rem', fontSize: '1.25rem' }}>📈 Financial Overview</h3>

          {/* Key Metrics */}
          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Savings Rate</span>
                <span style={{ fontSize: '1.25rem', fontWeight: '700', color: savingsRate >= 20 ? 'var(--success)' : savingsRate >= 0 ? 'var(--warning)' : 'var(--danger)' }}>
                  {savingsRate.toFixed(1)}%
                </span>
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: 0 }}>
                {savingsRate >= 20 ? 'Excellent! Keep it up' : savingsRate >= 0 ? 'Good, aim for 20%+' : 'Warning: Spending exceeds income'}
              </p>
            </div>

            <div style={{ marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Daily Average</span>
                <span style={{ fontSize: '1.25rem', fontWeight: '700' }}>
                  {formatCurrency(avgDailySpending)}
                </span>
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: 0 }}>
                Your average spending per day
              </p>
            </div>

            <div style={{ marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Top Category</span>
                <span style={{ fontSize: '1rem', fontWeight: '600' }}>
                  {topCategory?.category?.icon} {topCategory?.category?.name || 'N/A'}
                </span>
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: 0 }}>
                {topCategory ? `${formatCurrency(topCategory.total)} (${topCategory.percentage.toFixed(1)}%)` : 'No expenses yet'}
              </p>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Transactions</span>
                <span style={{ fontSize: '1.25rem', fontWeight: '700' }}>
                  {summary?.summary?.transactionCount || 0}
                </span>
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: 0 }}>
                Total activities this period
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '2px solid var(--border)' }}>
            <h4 style={{ fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: '1rem' }}>Quick Actions</h4>
            <div style={{ display: 'grid', gap: '0.75rem' }}>
              <Link
                to="/transactions"
                className="btn btn-primary"
                style={{
                  padding: '0.875rem 1.25rem',
                  fontSize: '0.9375rem',
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
                  padding: '0.875rem 1.25rem',
                  fontSize: '0.9375rem',
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
            <h3 style={{ marginBottom: '1.5rem', fontSize: '1.25rem' }}>⚠️ Budget Alerts</h3>
            <div style={{ display: 'grid', gap: '1rem' }}>
              {budgetAlerts.map((alert, index) => (
                <div
                  key={index}
                  style={{
                    padding: '1rem',
                    backgroundColor: alert.isOverBudget
                      ? 'rgba(239, 68, 68, 0.1)'
                      : 'rgba(251, 191, 36, 0.1)',
                    borderLeft: `4px solid ${alert.isOverBudget ? 'var(--danger)' : 'var(--warning)'}`,
                    borderRadius: 'var(--radius-md)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                    <span style={{ fontSize: '1.5rem' }}>{alert.category?.icon}</span>
                    <div style={{ flex: 1 }}>
                      <p style={{ margin: 0, fontWeight: '700', fontSize: '1rem' }}>
                        {alert.category?.name}
                      </p>
                      <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {alert.isOverBudget ? 'Over budget!' : 'Approaching limit'}
                      </p>
                    </div>
                  </div>
                  <div style={{ fontSize: '0.875rem', marginBottom: '0.5rem', display: 'flex', justifyContent: 'space-between' }}>
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
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem', textAlign: 'right', margin: 0 }}>
                    {alert.percentageUsed}% used
                  </p>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="card" style={{ animationDelay: '0.35s' }}>
            <h3 style={{ marginBottom: '1rem', fontSize: '1.25rem' }}>💰 Budget Status</h3>
            <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✓</div>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>All budgets on track</p>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>No alerts at this time</p>
            </div>
          </div>
        )}
      </div>

      {/* Budget Alerts */}
      {budgetAlerts.length > 0 && (
        <div style={{ marginBottom: '2.5rem' }} className="fade-in">
          <h3 style={{ marginBottom: '1.5rem' }}>⚠️ Budget Alerts</h3>
          <div className="grid grid-2">
            {budgetAlerts.map((alert, index) => (
              <div
                key={index}
                className="card scale-in"
                style={{
                  borderLeft: `4px solid ${alert.isOverBudget ? 'var(--danger)' : 'var(--warning)'}`,
                  background: alert.isOverBudget
                    ? 'linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, transparent 100%)'
                    : 'linear-gradient(135deg, rgba(251, 191, 36, 0.1) 0%, transparent 100%)',
                  animationDelay: `${index * 0.05}s`,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.75rem' }}>
                  <span style={{ fontSize: '2rem' }}>{alert.category?.icon}</span>
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: 0, fontWeight: '700', fontSize: '1.1rem' }}>
                      {alert.category?.name}
                    </p>
                    <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                      {alert.isOverBudget ? 'Over budget!' : 'Approaching limit'}
                    </p>
                  </div>
                </div>
                <div style={{ marginBottom: '0.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginBottom: '0.25rem' }}>
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
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem', textAlign: 'right' }}>
                    {alert.percentageUsed}% used
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Insights */}
      {insights && insights.insights?.length > 0 && (
        <div style={{ marginBottom: '2.5rem' }} className="fade-in">
          <h3 style={{ marginBottom: '1.5rem' }}>💡 Financial Insights</h3>
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
                }}
              >
                <p style={{ margin: 0, fontSize: '1rem', lineHeight: '1.6' }}>
                  {insight.message}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Category Breakdown */}
      {summary?.categoryBreakdown?.length > 0 && (
        <div style={{ marginBottom: '2.5rem' }} className="fade-in">
          <h3 style={{ marginBottom: '1.5rem' }}>📈 Spending by Category</h3>
          <div className="grid grid-2">
            {summary.categoryBreakdown.map((cat, index) => (
              <div
                key={cat._id}
                className="card scale-in"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="flex-between" style={{ marginBottom: '1rem' }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                    }}
                  >
                    <span style={{ fontSize: '2rem' }}>
                      {cat.category.icon}
                    </span>
                    <div>
                      <p
                        style={{
                          fontWeight: '700',
                          fontSize: '1.1rem',
                          margin: 0,
                        }}
                      >
                        {cat.category.name}
                      </p>
                      <p
                        style={{
                          color: 'var(--text-muted)',
                          fontSize: '0.875rem',
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
                        fontSize: '1.25rem',
                        margin: 0,
                      }}
                    >
                      {formatCurrency(cat.total)}
                    </p>
                    <p
                      style={{
                        color: 'var(--primary)',
                        fontSize: '0.875rem',
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

      {/* Recent Transactions */}
      {summary?.recentTransactions?.length > 0 && (
        <div className="fade-in">
          <h3 style={{ marginBottom: '1.5rem' }}>🕐 Recent Transactions</h3>
          <div className="card">
            {summary.recentTransactions.map((transaction, index) => (
              <div
                key={transaction._id}
                style={{
                  padding: '1.25rem 0',
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
                      gap: '1rem',
                    }}
                  >
                    <div
                      style={{
                        width: '50px',
                        height: '50px',
                        background: 'var(--bg-tertiary)',
                        borderRadius: 'var(--radius-md)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.5rem',
                      }}
                    >
                      {transaction.category.icon}
                    </div>
                    <div>
                      <p
                        style={{
                          fontWeight: '600',
                          margin: 0,
                          fontSize: '1.05rem',
                        }}
                      >
                        {transaction.description || transaction.category.name}
                      </p>
                      <p
                        style={{
                          color: 'var(--text-muted)',
                          fontSize: '0.875rem',
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
                      fontSize: '1.25rem',
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
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
