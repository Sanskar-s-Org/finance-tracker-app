import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useFinance } from '../context/FinanceContext';
import { useAuth } from '../context/AuthContext';
import { dashboardService, budgetService } from '../services';
import DonutChart from '../components/DonutChart';
import MiniTrendChart from '../components/MiniTrendChart';

const TrendUpIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" />
  </svg>
);
const TrendDownIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 18 13.5 8.5 8.5 13.5 1 6" /><polyline points="17 18 23 18 23 12" />
  </svg>
);
const RefreshIcon = ({ spinning }) => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
    style={{ animation: spinning ? 'spin 1s linear infinite' : 'none', display: 'block' }}>
    <polyline points="23 4 23 10 17 10" /><polyline points="1 20 1 14 7 14" />
    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
  </svg>
);

const PERIOD_LABELS = {
  thisMonth: 'This Month', lastMonth: 'Last Month', last3Months: 'Last 3 Months',
  thisYear: 'This Year', allTime: 'All Time', custom: 'Custom Range',
};

const KpiCard = ({ label, value, accent, trend, trendInverted, sparkData, sparkColor, badge, badgeGood, iconBg }) => {
  const trendPositive = trendInverted ? (trend !== undefined && trend < 0) : (trend !== undefined && trend > 0);
  return (
    <div className="stat-card" style={{ background: `linear-gradient(135deg,${accent}12 0%,${accent}05 100%)`, borderColor: `${accent}28` }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.6875rem', textTransform: 'uppercase', letterSpacing: '0.09em', margin: 0, fontWeight: '600' }}>{label}</p>
        <div style={{ width: '36px', height: '36px', background: `${accent}22`, borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: accent, fontSize: '1.125rem' }}>{iconBg}</div>
      </div>
      <h2 style={{ margin: '0 0 0.5rem', fontSize: '1.5rem', fontWeight: '800', letterSpacing: '-0.02em', color: accent, lineHeight: 1.15 }}>{value}</h2>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', flexWrap: 'wrap' }}>
        {trend !== undefined && trend !== null && (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.2rem', padding: '0.2rem 0.5rem', borderRadius: '99px', fontSize: '0.6875rem', fontWeight: '700', background: trendPositive ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)', color: trendPositive ? 'var(--success)' : 'var(--danger)' }}>
            {trendPositive ? <TrendUpIcon /> : <TrendDownIcon />} {Math.abs(trend).toFixed(1)}%
          </span>
        )}
        {badge && (
          <span style={{ padding: '0.2rem 0.5rem', borderRadius: '99px', fontSize: '0.6875rem', fontWeight: '700', background: badgeGood ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)', color: badgeGood ? 'var(--success)' : 'var(--danger)' }}>{badge}</span>
        )}
      </div>
      {sparkData?.length > 0 && (
        <div style={{ position: 'absolute', bottom: '0.875rem', right: '0.75rem', opacity: 0.45 }}>
          <MiniTrendChart data={sparkData} color={sparkColor} />
        </div>
      )}
    </div>
  );
};

const SectionHeader = ({ title, meta }) => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
    <h3 style={{ margin: 0, fontSize: '0.9375rem', fontWeight: '700', letterSpacing: '-0.01em' }}>{title}</h3>
    {meta && <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', fontWeight: '500' }}>{meta}</div>}
  </div>
);

const OverviewRow = ({ label, value, icon }) => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.625rem 0', borderBottom: '1px solid var(--border)' }}>
    <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><span>{icon}</span>{label}</span>
    <span style={{ fontSize: '0.9rem', fontWeight: '700', color: 'var(--text-primary)' }}>{value}</span>
  </div>
);

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
              if (loading) {
                return (
                  <div style={{ paddingTop: '0.5rem' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
                      {[1, 2, 3, 4].map(i => <div key={i} className="loading-skeleton" style={{ height: '120px', borderRadius: 'var(--radius-xl)' }} />)}
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '1.25rem' }}>
                      <div className="loading-skeleton" style={{ height: '360px', borderRadius: 'var(--radius-xl)' }} />
                      <div className="loading-skeleton" style={{ height: '360px', borderRadius: 'var(--radius-xl)' }} />
                    </div>
                  </div>
                );
              }

              const formatCurrency = amount =>
                new Intl.NumberFormat('en-US', { style: 'currency', currency: user?.currency || 'USD' }).format(amount);

              const income = summary?.summary?.income || 0;
              const expense = summary?.summary?.expense || 0;
              const balance = summary?.summary?.balance || 0;
              const savingsRate = income > 0 ? ((income - expense) / income * 100) : 0;

              const expenseChartData = summary?.categoryBreakdown?.slice(0, 5).map(cat => ({
                label: cat.category.name, value: cat.total, color: cat.category.color,
                icon: cat.category.icon, formattedValue: formatCurrency(cat.total), percentage: cat.percentage,
              })) || [];

              const greetingHour = new Date().getHours();
              const greeting = greetingHour < 12 ? 'Good morning' : greetingHour < 17 ? 'Good afternoon' : 'Good evening';
              const firstName = user?.name?.split(' ')[0] || 'there';
              const fmt = d => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

              return (
                <div style={{ maxWidth: '1280px' }}>
                  {/* ── Page Header ── */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', gap: '1rem', flexWrap: 'wrap' }}>
                    <div>
                      <h1 style={{ fontSize: '1.625rem', fontWeight: '800', marginBottom: '0.25rem', letterSpacing: '-0.02em' }}>
                        {greeting}, {firstName} 👋
                      </h1>
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', margin: 0 }}>
                        {PERIOD_LABELS[period]} · {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                      </p>
                    </div>
                    <div style={{ display: 'flex', gap: '0.625rem', alignItems: 'center', flexWrap: 'wrap' }}>
                      <select value={period}
                        onChange={e => { setPeriod(e.target.value); if (e.target.value !== 'custom') setCustomDateRange({ startDate: '', endDate: '' }); }}
                        style={{ padding: '0.5rem 2.5rem 0.5rem 0.75rem', fontSize: '0.8125rem', fontWeight: '600', background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', color: 'var(--text-primary)', cursor: 'pointer', appearance: 'none', backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.5rem center', backgroundSize: '14px' }}>
                        {Object.entries(PERIOD_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                      </select>
                      {period === 'custom' && (
                        <>
                          <input type="date" value={customDateRange.startDate} onChange={e => setCustomDateRange(p => ({ ...p, startDate: e.target.value }))} style={{ padding: '0.5rem 0.75rem', fontSize: '0.8125rem', background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', color: 'var(--text-primary)' }} />
                          <span style={{ color: 'var(--text-muted)' }}>→</span>
                          <input type="date" value={customDateRange.endDate} onChange={e => setCustomDateRange(p => ({ ...p, endDate: e.target.value }))} style={{ padding: '0.5rem 0.75rem', fontSize: '0.8125rem', background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', color: 'var(--text-primary)' }} />
                          <button onClick={loadDashboard} disabled={!customDateRange.startDate || !customDateRange.endDate} className="btn btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.8125rem' }}>Apply</button>
                        </>
                      )}
                      <button onClick={handleRefresh} disabled={refreshing}
                        style={{ width: '34px', height: '34px', borderRadius: 'var(--radius-lg)', background: 'var(--bg-secondary)', border: '1px solid var(--border)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                        <RefreshIcon spinning={refreshing} />
                      </button>
                    </div>
                  </div>

                  {/* ── KPI Cards ── */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(195px,1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                    <KpiCard label="Total Income" value={formatCurrency(income)} accent="#10b981" iconBg="↑"
                      trend={summary?.trends?.income} trendInverted={false}
                      sparkData={trends.map(t => t.income || 0)} sparkColor="#10b981" />
                    <KpiCard label="Total Expenses" value={formatCurrency(expense)} accent="#ef4444" iconBg="↓"
                      trend={summary?.trends?.expense} trendInverted
                      sparkData={trends.map(t => t.expense || 0)} sparkColor="#ef4444" />
                    <KpiCard label="Net Balance" value={formatCurrency(balance)} accent="#6366f1" iconBg="≈"
                      sparkData={trends.map(t => (t.income || 0) - (t.expense || 0))} sparkColor="#6366f1"
                      badge={balance >= 0 ? 'Positive' : 'Negative'} badgeGood={balance >= 0} />
                    <KpiCard label="Savings Rate" value={`${savingsRate.toFixed(1)}%`}
                      accent={savingsRate >= 20 ? '#10b981' : savingsRate >= 5 ? '#f59e0b' : '#ef4444'} iconBg="💹"
                      badge={savingsRate >= 20 ? 'Excellent' : savingsRate >= 10 ? 'Good' : savingsRate >= 0 ? 'Fair' : 'Alert'}
                      badgeGood={savingsRate >= 10} />
                  </div>

                  {/* ── Main Grid ── */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1.25fr 0.75fr', gap: '1.25rem', marginBottom: '1.25rem' }}>
                    <div className="card fade-in" style={{ padding: '1.5rem' }}>
                      <SectionHeader title="Expense Breakdown" meta={`Top ${expenseChartData.length || 0} categories`} />
                      {expenseChartData.length > 0
                        ? <DonutChart data={expenseChartData} centerValue={formatCurrency(expense)} centerLabel="Total" />
                        : <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}><div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>🧾</div><p style={{ margin: 0 }}>No expense data yet</p></div>
                      }
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      <div className="card fade-in" style={{ padding: '1.25rem' }}>
                        <SectionHeader title="Overview" />
                        <OverviewRow label="Savings Rate" icon="💹" value={<span style={{ color: savingsRate >= 20 ? 'var(--success)' : savingsRate >= 0 ? 'var(--warning)' : 'var(--danger)' }}>{savingsRate.toFixed(1)}%</span>} />
                        <OverviewRow label="Transactions" icon="🔢" value={summary?.summary?.transactionCount || 0} />
                        <OverviewRow label="Budget Status" icon="🎯" value={budgetAlerts.length > 0
                          ? <span style={{ color: 'var(--warning)' }}>{budgetAlerts.length} alert{budgetAlerts.length > 1 ? 's' : ''}</span>
                          : <span style={{ color: 'var(--success)' }}>All clear ✓</span>} />
                      </div>
                      <div className="card fade-in" style={{ padding: '1.25rem' }}>
                        <SectionHeader title="Quick Actions" />
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                          <Link to="/transactions" className="btn btn-primary" style={{ padding: '0.625rem', fontSize: '0.875rem', textDecoration: 'none' }}>+ Add Transaction</Link>
                          <Link to="/budgets" className="btn btn-outline" style={{ padding: '0.625rem', fontSize: '0.875rem', textDecoration: 'none' }}>Manage Budgets</Link>
                          <Link to="/reports" className="btn btn-outline" style={{ padding: '0.625rem', fontSize: '0.875rem', textDecoration: 'none' }}>View Reports</Link>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* ── Budget Alerts ── */}
                  {budgetAlerts.length > 0 && (
                    <div className="card fade-in" style={{ padding: '1.5rem', marginBottom: '1.25rem' }}>
                      <SectionHeader title="Budget Alerts" meta={`${budgetAlerts.length} item${budgetAlerts.length > 1 ? 's' : ''} need attention`} />
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: '0.75rem' }}>
                        {budgetAlerts.map((alert, i) => (
                          <div key={i} style={{ padding: '1rem', borderRadius: 'var(--radius-lg)', background: alert.isOverBudget ? 'rgba(239,68,68,0.07)' : 'rgba(245,158,11,0.07)', border: `1px solid ${alert.isOverBudget ? 'rgba(239,68,68,0.25)' : 'rgba(245,158,11,0.2)'}` }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                              <span style={{ fontSize: '1.25rem' }}>{alert.category?.icon}</span>
                              <div style={{ flex: 1 }}>
                                <p style={{ margin: 0, fontWeight: '700', fontSize: '0.875rem' }}>{alert.category?.name}</p>
                                <p style={{ margin: 0, fontSize: '0.6875rem', color: alert.isOverBudget ? 'var(--danger)' : 'var(--warning)', fontWeight: '600' }}>{alert.isOverBudget ? 'Over budget!' : 'Approaching limit'}</p>
                              </div>
                              <span style={{ fontWeight: '800', fontSize: '0.875rem', color: alert.isOverBudget ? 'var(--danger)' : 'var(--warning)' }}>{alert.percentageUsed}%</span>
                            </div>
                            <div style={{ height: '5px', background: 'var(--bg-tertiary)', borderRadius: '99px', overflow: 'hidden' }}>
                              <div style={{ height: '100%', width: `${Math.min(alert.percentageUsed, 100)}%`, background: alert.isOverBudget ? 'var(--danger)' : 'var(--warning)', borderRadius: '99px', transition: 'width 0.8s cubic-bezier(0.4,0,0.2,1)' }} />
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.375rem', fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
                              <span>Spent: {formatCurrency(alert.spent)}</span>
                              <span>Limit: {formatCurrency(alert.amount)}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* ── Insights ── */}
                  {insights?.insights?.length > 0 && (
                    <div className="card fade-in" style={{ padding: '1.5rem', marginBottom: '1.25rem' }}>
                      <SectionHeader title="Financial Insights" />
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: '0.625rem' }}>
                        {insights.insights.map((insight, i) => {
                          const c = { success: { bg: 'rgba(16,185,129,0.08)', b: 'rgba(16,185,129,0.2)', dot: '#10b981' }, warning: { bg: 'rgba(245,158,11,0.08)', b: 'rgba(245,158,11,0.2)', dot: '#f59e0b' }, info: { bg: 'rgba(59,130,246,0.08)', b: 'rgba(59,130,246,0.2)', dot: '#3b82f6' } }[insight.type] || { bg: 'rgba(59,130,246,0.08)', b: 'rgba(59,130,246,0.2)', dot: '#3b82f6' };
                          return (
                            <div key={i} style={{ padding: '0.875rem 1rem', borderRadius: 'var(--radius-lg)', background: c.bg, border: `1px solid ${c.b}`, display: 'flex', gap: '0.625rem', alignItems: 'flex-start' }}>
                              <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: c.dot, flexShrink: 0, marginTop: '0.4rem' }} />
                              <p style={{ margin: 0, fontSize: '0.875rem', lineHeight: '1.55', color: 'var(--text-secondary)' }}>{insight.message}</p>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* ── Recent Transactions ── */}
                  {summary?.recentTransactions?.length > 0 && (
                    <div className="card fade-in" style={{ padding: '1.5rem', overflow: 'hidden' }}>
                      <SectionHeader title="Recent Transactions"
                        meta={<Link to="/transactions" style={{ fontSize: '0.8125rem', color: 'var(--primary)', textDecoration: 'none', fontWeight: '600' }}>View all →</Link>} />
                      <div className="transactions-table-wrapper" style={{ overflowX: 'auto', margin: '0 -1.5rem', padding: '0 1.5rem' }}>
                        <table className="data-table" style={{ minWidth: '520px' }}>
                          <thead><tr><th>Date</th><th>Description</th><th>Category</th><th>Type</th><th style={{ textAlign: 'right' }}>Amount</th></tr></thead>
                          <tbody>
                            {summary.recentTransactions.slice(0, 10).map(tx => (
                              <tr key={tx._id}>
                                <td style={{ color: 'var(--text-muted)', fontSize: '0.8125rem', whiteSpace: 'nowrap' }}>{fmt(tx.date)}</td>
                                <td style={{ fontWeight: '600' }}>{tx.description || tx.category.name}</td>
                                <td><span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.875rem' }}><span>{tx.category.icon}</span><span style={{ color: 'var(--text-secondary)' }}>{tx.category.name}</span></span></td>
                                <td><span className={`status-badge ${tx.type}`}>{tx.type}</span></td>
                                <td style={{ textAlign: 'right' }}><span style={{ fontWeight: '800', color: tx.type === 'income' ? 'var(--success)' : 'var(--danger)', whiteSpace: 'nowrap' }}>{tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}</span></td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      <div className="transactions-mobile-cards">
                        {summary.recentTransactions.slice(0, 8).map(tx => (
                          <div key={tx._id} className="transaction-mobile-card">
                            <div className="transaction-mobile-header">
                              <div className="transaction-mobile-category">
                                <span className="transaction-icon">{tx.category.icon}</span>
                                <div><div className="transaction-description">{tx.description || tx.category.name}</div><div className="transaction-category-name">{tx.category.name}</div></div>
                              </div>
                              <span className="transaction-mobile-amount" style={{ color: tx.type === 'income' ? 'var(--success)' : 'var(--danger)' }}>{tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}</span>
                            </div>
                            <div className="transaction-mobile-footer">
                              <span className="transaction-date">{fmt(tx.date)}</span>
                              <span className={`status-badge ${tx.type}`}>{tx.type}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
                </div>
              );
            };

            export default Dashboard;
          )}
