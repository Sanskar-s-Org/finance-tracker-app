import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useFinance } from '../context/FinanceContext';
import { useAuth } from '../context/AuthContext';
import { dashboardService, budgetService } from '../services';
import DonutChart from '../components/DonutChart';
import MiniTrendChart from '../components/MiniTrendChart';
import { MonthlyComparisonChart, SpendingTrendsChart } from '../components/ChartComponents';

const PERIOD_LABELS = {
  thisMonth: 'This Month',
  lastMonth: 'Last Month',
  last3Months: 'Last 3 Months',
  thisYear: 'This Year',
  allTime: 'All Time',
  custom: 'Custom Range',
};

const ICONS = {
  income: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 19V5" />
      <path d="M6 11l6-6 6 6" />
    </svg>
  ),
  expense: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 5v14" />
      <path d="M18 13l-6 6-6-6" />
    </svg>
  ),
  balance: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 7h16" />
      <path d="M6 3h12l2 4v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7l2-4z" />
      <path d="M16 13h.01" />
    </svg>
  ),
  savings: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3v18" />
      <path d="M17 7.5c0-1.93-2.24-3.5-5-3.5s-5 1.57-5 3.5 2.24 3.5 5 3.5 5 1.57 5 3.5-2.24 3.5-5 3.5-5-1.57-5-3.5" />
    </svg>
  ),
  pulse: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 12h4l3-7 4 14 3-7h4" />
    </svg>
  ),
  target: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="5" />
      <circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none" />
    </svg>
  ),
  spark: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 15l3-8 3 5 2-3 2 6" />
      <path d="M3 19h18" />
    </svg>
  ),
  shield: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3l7 3v6c0 5-3.5 8-7 9-3.5-1-7-4-7-9V6l7-3z" />
    </svg>
  ),
  arrowUpRight: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 17L17 7" />
      <path d="M8 7h9v9" />
    </svg>
  ),
  arrowDownRight: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 7l10 10" />
      <path d="M8 17h9V8" />
    </svg>
  ),
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

  useEffect(() => {
    if (period !== 'custom' || (customDateRange.startDate && customDateRange.endDate)) {
      loadDashboard();
    }
  }, [period, customDateRange.startDate, customDateRange.endDate]);

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
  }, [period, customDateRange.startDate, customDateRange.endDate]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadDashboard();
    setRefreshing(false);
  };

  const formatCurrency = (amount) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: user?.currency || 'USD',
      maximumFractionDigits: 0,
    }).format(amount || 0);

  const formatCurrencyPrecise = (amount) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: user?.currency || 'USD',
    }).format(amount || 0);

  const fmtDate = (date) =>
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

  const trendSeries = trends.map((item) => ({
    month: item.monthName,
    income: item.income || 0,
    expense: item.expense || 0,
    balance: item.balance || 0,
  }));
  const activeTrendSeries = trendSeries.filter((item) => item.income !== 0 || item.expense !== 0 || item.balance !== 0);
  const hasTrendData = activeTrendSeries.length > 0;
  const hasComparableTrendData = activeTrendSeries.length >= 2;

  const latestTrend = activeTrendSeries[activeTrendSeries.length - 1] || { income: 0, expense: 0, balance: 0 };
  const previousTrend = activeTrendSeries[activeTrendSeries.length - 2] || null;

  const getPercentDelta = (current, previous) => {
    if (previous === null || previous === undefined) {
      return null;
    }

    if (previous === 0) {
      return null;
    }

    return ((current - previous) / previous) * 100;
  };

  const incomeDelta = getPercentDelta(latestTrend.income, previousTrend?.income);
  const expenseDelta = getPercentDelta(latestTrend.expense, previousTrend?.expense);
  const balanceDelta = getPercentDelta(latestTrend.balance, previousTrend?.balance);
  const hasExpenseShift = hasComparableTrendData && expenseDelta !== null;

  const totalTrendIncome = activeTrendSeries.reduce((sum, item) => sum + item.income, 0);
  const totalTrendExpense = activeTrendSeries.reduce((sum, item) => sum + item.expense, 0);
  const avgIncome = activeTrendSeries.length ? totalTrendIncome / activeTrendSeries.length : 0;
  const avgExpense = activeTrendSeries.length ? totalTrendExpense / activeTrendSeries.length : 0;
  const strongestMonth = activeTrendSeries.reduce(
    (best, item) => (item.balance > best.balance ? item : best),
    activeTrendSeries[0] || { month: PERIOD_LABELS[period], balance },
  );

  const expenseChartData =
    summary?.categoryBreakdown?.slice(0, 6).map((cat) => ({
      label: cat.category.name,
      value: cat.total,
      color: cat.category.color,
      formattedValue: formatCurrencyPrecise(cat.total),
      percentage: cat.percentage,
    })) || [];

  const topCategory = insights?.topCategory?.category?.name || expenseChartData[0]?.label || 'No category data yet';
  const topCategorySpend = insights?.topCategory?.total || expenseChartData[0]?.value || 0;
  const topCategoryShare = expenseChartData[0]?.percentage || 0;
  const healthTone = budgetAlerts.length > 0 || balance < 0 ? 'warning' : 'positive';
  const healthLabel = balance >= 0 ? 'Healthy runway' : 'Cash pressure';
  const insightCards = [
    {
      title: 'Budget posture',
      value: budgetAlerts.length ? `${budgetAlerts.length} active alerts` : 'All clear',
      detail: budgetAlerts.length ? 'A few categories are running hot' : 'Current spending is within set limits',
      icon: ICONS.shield,
      tone: budgetAlerts.length ? 'warning' : 'positive',
    },
    {
      title: 'Top category',
      value: topCategory,
      detail: topCategorySpend ? `${formatCurrency(topCategorySpend)} this period` : 'Spend profile will appear here',
      icon: ICONS.target,
      tone: 'neutral',
    },
    {
      title: 'Expense shift',
      value: hasExpenseShift
        ? `${Math.abs(expenseDelta).toFixed(1)}% ${expenseDelta <= 0 ? 'lower' : 'higher'}`
        : 'Waiting for monthly baseline',
      detail: hasExpenseShift
        ? (expenseDelta <= 0 ? 'Month-over-month outflow is easing' : 'Month-over-month outflow is rising')
        : (activeTrendSeries.length === 1
            ? 'Need one more active month to compare spending movement'
            : 'Add transactions over multiple months to unlock this signal'),
      icon: hasExpenseShift
        ? (expenseDelta <= 0 ? ICONS.arrowDownRight : ICONS.arrowUpRight)
        : ICONS.pulse,
      tone: hasExpenseShift ? (expenseDelta <= 0 ? 'positive' : 'warning') : 'neutral',
    },
  ];

  const metricCards = [
    {
      label: 'Total income',
      value: formatCurrencyPrecise(income),
      tone: 'positive',
      icon: ICONS.income,
      trendLabel: hasTrendData
        ? (incomeDelta !== null
            ? `${incomeDelta >= 0 ? '+' : ''}${incomeDelta.toFixed(1)}% vs prior month`
            : 'Prior month income baseline is zero')
        : 'Need two active months for trend',
      chart: trends.map((item) => item.income || 0),
      chartColor: '#10b981',
    },
    {
      label: 'Total expense',
      value: formatCurrencyPrecise(expense),
      tone: 'danger',
      icon: ICONS.expense,
      trendLabel: hasTrendData
        ? (expenseDelta !== null
            ? `${expenseDelta >= 0 ? '+' : ''}${expenseDelta.toFixed(1)}% vs prior month`
            : 'Prior month expense baseline is zero')
        : 'Need two active months for trend',
      chart: trends.map((item) => item.expense || 0),
      chartColor: '#ef4444',
    },
    {
      label: 'Net balance',
      value: formatCurrencyPrecise(balance),
      tone: balance >= 0 ? 'positive' : 'danger',
      icon: ICONS.balance,
      trendLabel: hasTrendData
        ? (balanceDelta !== null
            ? `${balanceDelta >= 0 ? '+' : ''}${balanceDelta.toFixed(1)}% balance swing`
            : 'Prior month balance baseline is zero')
        : 'Need two active months for trend',
      chart: trends.map((item) => item.balance || 0),
      chartColor: balance >= 0 ? '#22c55e' : '#f97316',
    },
    {
      label: 'Savings rate',
      value: Number.isFinite(savingsRate) ? `${savingsRate.toFixed(1)}%` : '0.0%',
      tone: savingsRate >= 15 ? 'positive' : 'warning',
      icon: ICONS.savings,
      trendLabel: `${transactionCount} transactions in scope`,
      chart: trends.map((item) => (item.income > 0 ? ((item.income - item.expense) / item.income) * 100 : 0)),
      chartColor: '#8b5cf6',
    },
  ];

  const signalCards = [
    {
      title: 'Average monthly income',
      value: activeTrendSeries.length > 0 ? formatCurrency(avgIncome) : 'Not enough data yet',
      supporting: activeTrendSeries.length > 0 ? 'Average across active months' : 'Track monthly income to see this metric',
      icon: ICONS.spark,
    },
    {
      title: 'Average monthly expense',
      value: activeTrendSeries.length > 0 ? formatCurrency(avgExpense) : 'Not enough data yet',
      supporting: activeTrendSeries.length > 0 ? 'Average across active months' : 'Track monthly expenses to see this metric',
      icon: ICONS.pulse,
    },
    {
      title: 'Strongest month',
      value: activeTrendSeries.length > 0 ? strongestMonth?.month : 'Not enough data yet',
      supporting: activeTrendSeries.length > 0 ? formatCurrency(strongestMonth?.balance || 0) : 'Compare multiple months to rank performance',
      icon: ICONS.target,
    },
  ];

  if (loading) {
    return (
      <div className="container dashboard-page" style={{ paddingTop: '1.5rem', paddingBottom: '2rem' }}>
        <div className="loading-skeleton" style={{ height: '220px', borderRadius: 'var(--radius-2xl)' }} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: '1rem' }}>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="loading-skeleton" style={{ height: '180px', borderRadius: 'var(--radius-xl)' }} />
          ))}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1.35fr 0.85fr', gap: '1rem' }}>
          <div className="loading-skeleton" style={{ height: '360px', borderRadius: 'var(--radius-2xl)' }} />
          <div className="loading-skeleton" style={{ height: '360px', borderRadius: 'var(--radius-2xl)' }} />
        </div>
      </div>
    );
  }

  return (
    <div className="container dashboard-page" style={{ paddingTop: '1.25rem', paddingBottom: '2rem' }}>
      <section className="card dashboard-hero fade-in">
        <div className="dashboard-hero-content">
          <div className="dashboard-hero-copy">
            <span className="dashboard-eyebrow">Executive Snapshot</span>
            <h1 className="dashboard-title">Financial command center</h1>
            <p className="dashboard-subtitle">
              {PERIOD_LABELS[period]} performance for {user?.name || 'your portfolio'}, with live trends, budget posture, and cash flow signals.
            </p>

            <div className="dashboard-hero-badges">
              <span className={`dashboard-badge dashboard-badge-${healthTone}`}>
                {ICONS.shield}
                {healthLabel}
              </span>
              <span className="dashboard-badge dashboard-badge-neutral">
                {ICONS.pulse}
                {transactionCount} tracked entries
              </span>
              {topCategorySpend > 0 && (
                <span className="dashboard-badge dashboard-badge-neutral">
                  {ICONS.target}
                  {topCategory} leads at {topCategoryShare.toFixed(1)}%
                </span>
              )}
            </div>
          </div>

          <div className="dashboard-hero-controls">
            <div className="dashboard-control-group">
              <label className="dashboard-control-label">Reporting window</label>
              <select
                value={period}
                onChange={(e) => {
                  setPeriod(e.target.value);
                  if (e.target.value !== 'custom') {
                    setCustomDateRange({ startDate: '', endDate: '' });
                  }
                }}
                className="form-select"
              >
                {Object.entries(PERIOD_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            {period === 'custom' && (
              <div className="dashboard-custom-range">
                <input
                  type="date"
                  className="form-input"
                  value={customDateRange.startDate}
                  onChange={(e) => setCustomDateRange((prev) => ({ ...prev, startDate: e.target.value }))}
                />
                <input
                  type="date"
                  className="form-input"
                  value={customDateRange.endDate}
                  onChange={(e) => setCustomDateRange((prev) => ({ ...prev, endDate: e.target.value }))}
                />
              </div>
            )}

            <button onClick={handleRefresh} className="btn btn-outline dashboard-refresh-btn" disabled={refreshing}>
              {refreshing ? 'Refreshing...' : 'Refresh data'}
            </button>
          </div>
        </div>

        <div className="dashboard-insight-strip">
          {insightCards.map((card) => (
            <article key={card.title} className={`dashboard-insight-card dashboard-insight-card-${card.tone}`}>
              <span className="dashboard-insight-icon">{card.icon}</span>
              <div>
                <p className="dashboard-insight-title">{card.title}</p>
                <strong className="dashboard-insight-value">{card.value}</strong>
                <p className="dashboard-insight-detail">{card.detail}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="dashboard-kpi-grid">
        {metricCards.map((card) => (
          <article key={card.label} className={`stat-card dashboard-stat-card dashboard-stat-card-${card.tone}`}>
            <div className="dashboard-stat-topline">
              <span className="dashboard-stat-icon">{card.icon}</span>
              <span className="dashboard-stat-label">{card.label}</span>
            </div>
            <h2 className="dashboard-stat-value">{card.value}</h2>
            <p className="dashboard-stat-meta">{card.trendLabel}</p>
            <div className="dashboard-stat-trendchart">
              <MiniTrendChart data={card.chart} color={card.chartColor} width={136} height={48} />
            </div>
          </article>
        ))}
      </section>

      <section className="dashboard-chart-grid">
        <div className="card dashboard-chart-card dashboard-chart-card-wide">
          <div className="dashboard-section-header">
            <div>
              <span className="dashboard-section-kicker">Trendline</span>
              <h3>Cash flow trajectory</h3>
            </div>
            <p>Income and expense movement across the last six months.</p>
          </div>
          <div className="dashboard-chart-frame">
            {hasTrendData ? (
              <SpendingTrendsChart data={trendSeries} currency={user?.currency || 'USD'} />
            ) : (
              <div className="empty-state dashboard-chart-empty">
                <div className="empty-state-icon dashboard-empty-icon">{ICONS.pulse}</div>
                <div className="empty-state-title">No trend data available yet</div>
                <div className="empty-state-description">Add transactions in upcoming months to unlock cash flow trajectory insights.</div>
              </div>
            )}
          </div>
        </div>

        <div className="dashboard-side-stack">
          <div className="card dashboard-brief-card">
            <div className="dashboard-section-header">
              <div>
                <span className="dashboard-section-kicker">Signal Brief</span>
                <h3>What needs attention</h3>
              </div>
            </div>
            <div className="dashboard-signal-grid">
              {signalCards.map((card) => (
                <article key={card.title} className="dashboard-signal-card">
                  <span className="dashboard-signal-icon">{card.icon}</span>
                  <div>
                    <p>{card.title}</p>
                    <strong>{card.value}</strong>
                    <span>{card.supporting}</span>
                  </div>
                </article>
              ))}
            </div>
          </div>

          <div className="card dashboard-actions-card">
            <div className="dashboard-section-header">
              <div>
                <span className="dashboard-section-kicker">Quick Actions</span>
                <h3>Move the plan forward</h3>
              </div>
            </div>
            <div className="dashboard-action-grid">
              <Link to="/transactions" className="btn btn-primary" style={{ textDecoration: 'none' }}>
                Add transaction
              </Link>
              <Link to="/budgets" className="btn btn-outline" style={{ textDecoration: 'none' }}>
                Review budgets
              </Link>
              <Link to="/reports" className="btn btn-outline" style={{ textDecoration: 'none' }}>
                Open reports
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="dashboard-chart-grid dashboard-chart-grid-secondary">
        <div className="card dashboard-chart-card">
          <div className="dashboard-section-header">
            <div>
              <span className="dashboard-section-kicker">Mix</span>
              <h3>Expense allocation</h3>
            </div>
            <p>Top categories driving spend in the selected period.</p>
          </div>
          {expenseChartData.length > 0 ? (
            <DonutChart data={expenseChartData} centerValue={formatCurrencyPrecise(expense)} centerLabel="Total" />
          ) : (
            <div className="empty-state">
              <div className="empty-state-icon dashboard-empty-icon">{ICONS.spark}</div>
              <div className="empty-state-title">No expense distribution yet</div>
              <div className="empty-state-description">Once expenses start landing, the category mix and patterns will appear here.</div>
            </div>
          )}
        </div>

        <div className="card dashboard-chart-card">
          <div className="dashboard-section-header">
            <div>
              <span className="dashboard-section-kicker">Comparison</span>
              <h3>Monthly income vs expense</h3>
            </div>
            <p>Side-by-side monthly comparison to expose margin compression.</p>
          </div>
          <div className="dashboard-chart-frame">
            {hasTrendData ? (
              <MonthlyComparisonChart data={trendSeries} currency={user?.currency || 'USD'} />
            ) : (
              <div className="empty-state dashboard-chart-empty">
                <div className="empty-state-icon dashboard-empty-icon">{ICONS.spark}</div>
                <div className="empty-state-title">No month-over-month comparison yet</div>
                <div className="empty-state-description">As data accumulates, this chart will compare income and expense by month.</div>
              </div>
            )}
          </div>
        </div>
      </section>

      {(budgetAlerts.length > 0 || insights?.insights?.length > 0) && (
        <section className="dashboard-chart-grid dashboard-chart-grid-secondary">
          {budgetAlerts.length > 0 && (
            <div className="card dashboard-list-card">
              <div className="dashboard-section-header">
                <div>
                  <span className="dashboard-section-kicker">Alerts</span>
                  <h3>Budget watchlist</h3>
                </div>
                <p>Categories approaching or exceeding planned limits.</p>
              </div>
              <div className="dashboard-alert-list">
                {budgetAlerts.map((alert, index) => (
                  <article key={`${alert.category?._id || index}`} className="dashboard-alert-item">
                    <div className="dashboard-alert-header">
                      <div>
                        <strong>{alert.category?.name}</strong>
                        <span>{formatCurrencyPrecise(alert.spent)} of {formatCurrencyPrecise(alert.amount)}</span>
                      </div>
                      <span className={`dashboard-alert-pill ${alert.isOverBudget ? 'dashboard-alert-pill-danger' : 'dashboard-alert-pill-warning'}`}>
                        {alert.percentageUsed}%
                      </span>
                    </div>
                    <div className="progress-bar">
                      <div
                        className="progress-fill"
                        style={{
                          width: `${Math.min(alert.percentageUsed, 100)}%`,
                          background: alert.isOverBudget ? 'var(--gradient-danger)' : 'linear-gradient(90deg, #f59e0b, #f97316)',
                          boxShadow: 'none',
                        }}
                      />
                    </div>
                  </article>
                ))}
              </div>
            </div>
          )}

          {insights?.insights?.length > 0 && (
            <div className="card dashboard-list-card">
              <div className="dashboard-section-header">
                <div>
                  <span className="dashboard-section-kicker">Insights</span>
                  <h3>AI-style observations</h3>
                </div>
                <p>Short reads based on month-over-month movement and category behavior.</p>
              </div>
              <div className="dashboard-observation-list">
                {insights.insights.map((item, index) => (
                  <article key={`${item.type}-${index}`} className={`dashboard-observation-item dashboard-observation-item-${item.type || 'info'}`}>
                    <span className="dashboard-observation-mark" />
                    <p>{item.message}</p>
                  </article>
                ))}
              </div>
            </div>
          )}
        </section>
      )}

      {summary?.recentTransactions?.length > 0 && (
        <section className="card dashboard-recent-card" style={{ overflow: 'hidden' }}>
          <div className="dashboard-section-header">
            <div>
              <span className="dashboard-section-kicker">Activity</span>
              <h3>Recent transactions</h3>
            </div>
            <Link to="/transactions" style={{ fontSize: '0.875rem', textDecoration: 'none', color: 'var(--primary)' }}>
              View all
            </Link>
          </div>
          <div className="transactions-table-wrapper" style={{ overflowX: 'auto' }}>
            <table className="data-table" style={{ minWidth: '640px' }}>
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
                {summary.recentTransactions.slice(0, 8).map((tx) => (
                  <tr key={tx._id}>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.8125rem' }}>{fmtDate(tx.date)}</td>
                    <td style={{ fontWeight: '600' }}>{tx.description || tx.category?.name}</td>
                    <td>
                      <span className="dashboard-recent-category">
                        <span className="dashboard-category-dot" style={{ background: tx.category?.color || 'var(--primary)' }} />
                        <span style={{ color: 'var(--text-secondary)' }}>{tx.category?.name}</span>
                      </span>
                    </td>
                    <td>
                      <span className={`status-badge ${tx.type}`}>{tx.type}</span>
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: '700', color: tx.type === 'income' ? 'var(--success)' : 'var(--danger)' }}>
                      {tx.type === 'income' ? '+' : '-'}
                      {formatCurrencyPrecise(tx.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
};

export default Dashboard;
