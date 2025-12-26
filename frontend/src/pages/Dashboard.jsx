import { useEffect, useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { useAuth } from '../context/AuthContext';
import { dashboardService } from '../services';

const Dashboard = () => {
  const { fetchDashboard } = useFinance();
  const { user } = useAuth();
  const [summary, setSummary] = useState(null);
  const [trends, setTrends] = useState([]);
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const [summaryRes, trendsRes, insightsRes] = await Promise.all([
        dashboardService.getSummary(),
        dashboardService.getTrends(6),
        dashboardService.getInsights(),
      ]);

      setSummary(summaryRes.data);
      setTrends(trendsRes.data);
      setInsights(insightsRes.data);
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
          <h1 style={{ marginBottom: '0.5rem' }}>Dashboard</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>
            Welcome back! Here's your financial overview
          </p>
        </div>
        <button
          onClick={handleRefresh}
          className="btn btn-outline"
          disabled={refreshing}
          style={{ minWidth: '120px' }}
        >
          {refreshing ? '🔄 Refreshing...' : '🔄 Refresh'}
        </button>
      </div>

      {/* Enhanced Summary Cards */}
      <div className="grid grid-3" style={{ marginBottom: '2.5rem' }}>
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
                {formatCurrency(summary?.summary?.income || 0)}
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
            ↑ This month
          </p>
        </div>

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
                {formatCurrency(summary?.summary?.expense || 0)}
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
            ↓ This month
          </p>
        </div>

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
            {summary?.summary?.transactionCount || 0} transactions
          </p>
        </div>
      </div>

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
                  borderLeft: `4px solid ${
                    insight.type === 'success'
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
