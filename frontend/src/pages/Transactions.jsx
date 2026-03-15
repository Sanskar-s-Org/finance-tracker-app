import { useEffect, useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useFinance } from '../context/FinanceContext';
import { useAuth } from '../context/AuthContext';
import { parsePaymentReceipt } from '../utils/parsePaymentReceipt';

const Icons = {
  edit: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  ),
  delete: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 6h18" /><path d="M8 6V4h8v2" /><path d="M19 6l-1 14H6L5 6" />
      <path d="M10 11v6" /><path d="M14 11v6" />
    </svg>
  ),
  search: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
    </svg>
  ),
  filter: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
    </svg>
  ),
  chevronLeft: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  ),
  chevronRight: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  ),
  close: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  ),
  plus: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  ),
  warn: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  ),
  empty: (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 16V4m0 0L3 8m4-4l4 4" /><path d="M17 8v12m0 0l4-4m-4 4l-4-4" />
    </svg>
  ),
};

const Transactions = () => {
  const {
    transactions,
    categories,
    fetchTransactions,
    fetchCategories,
    addTransaction,
    updateTransaction,
    deleteTransaction,
  } = useFinance();
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [sharedBanner, setSharedBanner] = useState(null); // { merchant, amount, categoryHint }
  const confirmRef = useRef(null);
  const [formData, setFormData] = useState({
    type: 'expense',
    amount: '',
    category: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    paymentMethod: 'cash',
  });
  const [filter, setFilter] = useState({
    type: '',
    category: '',
    paymentMethod: '',
    dateFrom: '',
    dateTo: '',
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('date-desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  // ── Detect shared receipt from Web Share Target ──────────────────────────
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const sharedText = params.get('shared_text') || params.get('text') || '';
    if (!sharedText) return;

    const parsed = parsePaymentReceipt(sharedText);

    // Strip the query param from the URL without adding a history entry
    navigate('/transactions', { replace: true });

    // We need categories to be loaded before we can match categoryHint.
    // Store parsed result; the category-matching runs once categories arrive.
    setSharedBanner(parsed);
  }, [location.search, navigate]);

  // Once categories are loaded, apply the shared receipt to the form
  useEffect(() => {
    if (!sharedBanner || categories.length === 0) return;

    const { amount, description, paymentMethod, categoryHint } = sharedBanner;

    // Try to find a matching category from the real list
    const matchedCat = categories.find(c => {
      if (!categoryHint) return false;
      return c.name.toLowerCase().includes(categoryHint.toLowerCase()) ||
             categoryHint.toLowerCase().includes(c.name.toLowerCase());
    });

    setFormData(prev => ({
      ...prev,
      type: 'expense',
      amount: amount || '',
      category: matchedCat?._id || '',
      description: description || '',
      paymentMethod: paymentMethod || 'upi',
      date: new Date().toISOString().split('T')[0],
    }));
    setShowForm(true);
  }, [sharedBanner, categories]);

  const loadData = async () => {
    try {
      await Promise.all([fetchTransactions(), fetchCategories()]);
    } catch {
      setFormError('Failed to load data. Please refresh the page.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setFormError('');
    try {
      if (editingId) {
        await updateTransaction(editingId, formData);
      } else {
        await addTransaction(formData);
      }
      setFormData({
        type: 'expense',
        amount: '',
        category: '',
        description: '',
        date: new Date().toISOString().split('T')[0],
        paymentMethod: 'cash',
      });
      setEditingId(null);
      setShowForm(false);
      await fetchTransactions();
    } catch (err) {
      setFormError(err?.response?.data?.message || (editingId ? 'Failed to update transaction.' : 'Failed to save transaction.'));
    }
  };

  const handleEdit = transaction => {
    setFormData({
      type: transaction.type,
      amount: transaction.amount,
      category: transaction.category._id,
      description: transaction.description || '',
      date: new Date(transaction.date).toISOString().split('T')[0],
      paymentMethod: transaction.paymentMethod,
    });
    setEditingId(transaction._id);
    setShowForm(true);
  };

  const handleCancelEdit = () => {
    setFormData({
      type: 'expense',
      amount: '',
      category: '',
      description: '',
      date: new Date().toISOString().split('T')[0],
      paymentMethod: 'cash',
    });
    setEditingId(null);
    setShowForm(false);
    setFormError('');
  };

  const handleDelete = async id => {
    try {
      await deleteTransaction(id);
      await fetchTransactions();
    } catch {
      setFormError('Failed to delete transaction. Please try again.');
    } finally {
      setConfirmDeleteId(null);
    }
  };

  const filteredTransactions = transactions.filter(transaction => {
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesDescription = transaction.description?.toLowerCase().includes(query);
      const matchesCategory = transaction.category?.name?.toLowerCase().includes(query);
      if (!matchesDescription && !matchesCategory) return false;
    }

    // Type filter
    if (filter.type && transaction.type !== filter.type) return false;

    // Category filter
    if (filter.category && transaction.category._id !== filter.category) return false;

    // Payment method filter
    if (filter.paymentMethod && transaction.paymentMethod !== filter.paymentMethod) return false;

    // Date range filter
    if (filter.dateFrom) {
      const transactionDate = new Date(transaction.date);
      const fromDate = new Date(filter.dateFrom);
      if (transactionDate < fromDate) return false;
    }

    if (filter.dateTo) {
      const transactionDate = new Date(transaction.date);
      const toDate = new Date(filter.dateTo);
      toDate.setHours(23, 59, 59); // Include the entire day
      if (transactionDate > toDate) return false;
    }

    return true;
  }).sort((a, b) => {
    // Apply sorting
    switch (sortBy) {
      case 'date-desc':
        return new Date(b.date) - new Date(a.date);
      case 'date-asc':
        return new Date(a.date) - new Date(b.date);
      case 'amount-desc':
        return b.amount - a.amount;
      case 'amount-asc':
        return a.amount - b.amount;
      case 'category':
        return a.category.name.localeCompare(b.category.name);
      default:
        return 0;
    }
  });

  // Reset to page 1 when filters/search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filter, sortBy]);

  // Pagination logic
  const totalTransactions = filteredTransactions.length;
  const totalPages = Math.ceil(totalTransactions / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedTransactions = filteredTransactions.slice(startIndex, endIndex);

  const clearFilters = () => {
    setFilter({
      type: '',
      category: '',
      paymentMethod: '',
      dateFrom: '',
      dateTo: '',
    });
  };

  const hasActiveFilters = filter.type || filter.category || filter.paymentMethod || filter.dateFrom || filter.dateTo;

  const expenseCategories = categories.filter(c => c.type === formData.type);

  const formatCurrency = amount =>
    new Intl.NumberFormat(navigator.language || 'en-IN', {
      style: 'currency',
      currency: user?.currency || 'INR',
    }).format(amount);

  const renderTransactionActions = (transaction) => (
    <div style={{ display: 'flex', gap: '0.375rem', justifyContent: 'flex-end', alignItems: 'center' }}>
      <button
        type="button"
        onClick={() => handleEdit(transaction)}
        className="icon-btn icon-btn-edit"
        title="Edit"
        aria-label={`Edit ${transaction.description || transaction.category.name}`}
      >
        {Icons.edit}
      </button>
      <div className="confirm-popover-host">
        <button
          type="button"
          onClick={() => setConfirmDeleteId(confirmDeleteId === transaction._id ? null : transaction._id)}
          className="icon-btn icon-btn-delete"
          title="Delete"
          aria-label={`Delete ${transaction.description || transaction.category.name}`}
        >
          {Icons.delete}
        </button>
        {confirmDeleteId === transaction._id && (
          <div className="confirm-popover" ref={confirmRef}>
            <p>Remove this transaction? This cannot be undone.</p>
            <div className="confirm-popover-actions">
              <button className="btn btn-danger" onClick={() => handleDelete(transaction._id)}>Delete</button>
              <button className="btn btn-outline" onClick={() => setConfirmDeleteId(null)}>Cancel</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="container" style={{ paddingTop: '2rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="loading-skeleton" style={{ height: '64px', borderRadius: 'var(--radius-xl)' }} />
          <div className="loading-skeleton" style={{ height: '56px', borderRadius: 'var(--radius-xl)' }} />
          <div className="loading-skeleton" style={{ height: '360px', borderRadius: 'var(--radius-xl)' }} />
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ paddingTop: '1.25rem', paddingBottom: '2rem' }}>

      {/* ── Page Header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', gap: '1rem', flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: '800', marginBottom: '0.25rem', letterSpacing: '-0.02em' }}>Transactions</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', margin: 0 }}>
            {totalTransactions > 0
              ? <>{totalTransactions} record{totalTransactions !== 1 ? 's' : ''}{searchQuery ? ` matching "${searchQuery}"` : ''}</>
              : 'Track every income and expense'}
          </p>
        </div>
        <button
          onClick={() => showForm ? handleCancelEdit() : setShowForm(true)}
          className="btn btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.375rem', whiteSpace: 'nowrap' }}
        >
          {showForm ? <>{Icons.close} Cancel</> : <>{Icons.plus} Add Transaction</>}
        </button>
      </div>

      {/* ── Shared receipt banner ── */}
      {sharedBanner && (
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          gap: '0.75rem', padding: '0.75rem 1rem', marginBottom: '0.75rem',
          background: 'rgba(16,185,129,0.10)', border: '1px solid rgba(16,185,129,0.30)',
          borderRadius: 'var(--radius-lg)', fontSize: '0.875rem', fontWeight: 500, color: '#6ee7b7',
        }}>
          <span>
            ✅ Receipt parsed{sharedBanner.merchant ? ` — ${sharedBanner.merchant}` : ''}.
            {' '}Review the form below and save.
          </span>
          <button
            onClick={() => setSharedBanner(null)}
            className="icon-btn"
            style={{ color: '#6ee7b7', flexShrink: 0 }}
            aria-label="Dismiss"
          >
            {Icons.close}
          </button>
        </div>
      )}

      {/* ── Toolbar ── */}
      <div className="card" style={{ padding: '0.875rem 1rem', marginBottom: '1rem' }}>
        <div className="tx-toolbar">
          {/* Search — always full width on mobile */}
          <div className="search-input-wrapper tx-toolbar-search">
            <span className="search-input-icon">{Icons.search}</span>
            <input
              type="text"
              placeholder="Search description or category…"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="form-input search-input"
              style={{ fontSize: '0.875rem', padding: '0.65rem 1rem' }}
            />
          </div>

          {/* Controls row — sort + page-size + filter trigger stay inline */}
          <div className="tx-toolbar-controls">
            {/* Sort */}
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              className="form-select tx-sort-select"
              style={{ padding: '0.65rem 2.5rem 0.65rem 0.875rem', fontSize: '0.875rem' }}
            >
              <option value="date-desc">Newest first</option>
              <option value="date-asc">Oldest first</option>
              <option value="amount-desc">Highest amount</option>
              <option value="amount-asc">Lowest amount</option>
              <option value="category">By category</option>
            </select>

            {/* Per page */}
            <select
              value={pageSize}
              onChange={e => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}
              className="form-select tx-page-select"
              style={{ padding: '0.65rem 2.5rem 0.65rem 0.875rem', fontSize: '0.875rem' }}
            >
              <option value="10">10 / page</option>
              <option value="25">25 / page</option>
              <option value="50">50 / page</option>
              <option value="100">100 / page</option>
            </select>

            {/* Filter toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`toolbar-btn${showFilters ? ' active' : ''}`}
            >
              {Icons.filter}
              Filters
              {hasActiveFilters && <span className="active-filter-dot" />}
            </button>
          </div>
        </div>
      </div>

      {/* ── Advanced Filters ── */}
      {showFilters && (
        <div className="card fade-in" style={{ padding: '1.25rem', marginBottom: '1rem', borderColor: 'rgba(99,102,241,0.2)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <span style={{ fontSize: '0.6875rem', fontWeight: '700', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-disabled)' }}>Advanced Filters</span>
            {hasActiveFilters && (
              <button onClick={clearFilters} className="toolbar-btn" style={{ padding: '0.35rem 0.75rem', fontSize: '0.8125rem' }}>
                {Icons.close} Clear all
              </button>
            )}
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label className="form-label" style={{ fontSize: '0.75rem', marginBottom: '0.5rem' }}>Transaction Type</label>
            <div className="type-toggle-group">
              <button className={`type-toggle-btn${!filter.type ? ' active-all' : ''}`} onClick={() => setFilter({ ...filter, type: '' })}>All</button>
              <button className={`type-toggle-btn${filter.type === 'income' ? ' active-income' : ''}`} onClick={() => setFilter({ ...filter, type: 'income' })}>Income</button>
              <button className={`type-toggle-btn${filter.type === 'expense' ? ' active-expense' : ''}`} onClick={() => setFilter({ ...filter, type: 'expense' })}>Expense</button>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '0.875rem' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" style={{ fontSize: '0.75rem' }}>Category</label>
              <select className="form-select" value={filter.category} onChange={e => setFilter({ ...filter, category: e.target.value })} style={{ fontSize: '0.875rem', padding: '0.625rem 2.5rem 0.625rem 0.875rem' }}>
                <option value="">All categories</option>
                {categories.map(cat => <option key={cat._id} value={cat._id}>{cat.icon} {cat.name}</option>)}
              </select>
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" style={{ fontSize: '0.75rem' }}>Payment method</label>
              <select className="form-select" value={filter.paymentMethod} onChange={e => setFilter({ ...filter, paymentMethod: e.target.value })} style={{ fontSize: '0.875rem', padding: '0.625rem 2.5rem 0.625rem 0.875rem' }}>
                <option value="">All methods</option>
                <option value="cash">Cash</option>
                <option value="card">Card</option>
                <option value="upi">UPI</option>
                <option value="bank_transfer">Bank transfer</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" style={{ fontSize: '0.75rem' }}>From date</label>
              <input type="date" className="form-input" value={filter.dateFrom} onChange={e => setFilter({ ...filter, dateFrom: e.target.value })} style={{ fontSize: '0.875rem', padding: '0.625rem 0.875rem' }} />
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" style={{ fontSize: '0.75rem' }}>To date</label>
              <input type="date" className="form-input" value={filter.dateTo} onChange={e => setFilter({ ...filter, dateTo: e.target.value })} style={{ fontSize: '0.875rem', padding: '0.625rem 0.875rem' }} />
            </div>
          </div>
        </div>
      )}

      {/* ── Transaction Form ── */}
      {showForm && (
        <div className="card fade-in" style={{ padding: '1.5rem', marginBottom: '1.25rem', borderColor: 'rgba(99,102,241,0.25)', background: 'linear-gradient(135deg, rgba(99,102,241,0.04), rgba(139,92,246,0.02))' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1.0625rem', fontWeight: '700', margin: 0 }}>{editingId ? 'Edit Transaction' : 'New Transaction'}</h3>
            <button onClick={handleCancelEdit} className="icon-btn" title="Close">{Icons.close}</button>
          </div>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Type</label>
                <select className="form-select" value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value, category: '' })}>
                  <option value="expense">Expense</option>
                  <option value="income">Income</option>
                </select>
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Amount</label>
                <input type="number" className="form-input" value={formData.amount} onChange={e => setFormData({ ...formData, amount: e.target.value })} step="0.01" min="0" required placeholder="0.00" />
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Category</label>
                <select className="form-select" value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} required>
                  <option value="">Select category</option>
                  {expenseCategories.map(cat => <option key={cat._id} value={cat._id}>{cat.icon} {cat.name}</option>)}
                </select>
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Date</label>
                <input type="date" className="form-input" value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} required />
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Payment method</label>
                <select className="form-select" value={formData.paymentMethod} onChange={e => setFormData({ ...formData, paymentMethod: e.target.value })}>
                  <option value="cash">Cash</option>
                  <option value="card">Card</option>
                  <option value="upi">UPI</option>
                  <option value="bank_transfer">Bank transfer</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Description <span style={{ color: 'var(--text-disabled)', fontWeight: 400 }}>(optional)</span></label>
                <input type="text" className="form-input" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} placeholder="Add a note…" />
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button type="submit" className="btn btn-success" style={{ padding: '0.75rem 1.5rem' }}>
                {editingId ? 'Update Transaction' : 'Save Transaction'}
              </button>
              <button type="button" onClick={handleCancelEdit} className="btn btn-outline" style={{ padding: '0.75rem 1.25rem' }}>
                Cancel
              </button>
            </div>
            {formError && (
              <p style={{ marginTop: '0.875rem', color: 'var(--danger)', fontSize: '0.875rem', fontWeight: '500' }}>
                {Icons.warn} {formError}
              </p>
            )}
        </div>
      )}

      {/* ── Empty State ── */}
      {filteredTransactions.length === 0 ? (
        <div className="card" style={{ padding: '4rem 2rem', textAlign: 'center' }}>
          <div style={{ width: '80px', height: '80px', margin: '0 auto 1.5rem', background: 'var(--bg-tertiary)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-disabled)' }}>
            {Icons.empty}
          </div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '0.5rem' }}>No transactions found</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem', maxWidth: '380px', margin: '0 auto 1.75rem', lineHeight: 1.6 }}>
            {searchQuery || hasActiveFilters
              ? 'Try adjusting your search or filters to find what you\'re looking for.'
              : 'Start tracking your finances by adding your first transaction.'}
          </p>
          {(!showForm && !searchQuery && !hasActiveFilters) && (
            <button onClick={() => setShowForm(true)} className="btn btn-primary" style={{ padding: '0.75rem 1.75rem' }}>
              {Icons.plus} Add your first transaction
            </button>
          )}
          {hasActiveFilters && (
            <button onClick={clearFilters} className="btn btn-outline" style={{ padding: '0.75rem 1.5rem' }}>
              {Icons.close} Clear filters
            </button>
          )}
        </div>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="card transactions-table-wrapper" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th style={{ width: '110px' }}>Date</th>
                    <th>Description</th>
                    <th style={{ width: '180px' }}>Category</th>
                    <th style={{ width: '110px' }}>Payment</th>
                    <th style={{ width: '90px' }}>Type</th>
                    <th style={{ width: '140px', textAlign: 'right' }}>Amount</th>
                    <th style={{ width: '90px', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedTransactions.map(transaction => (
                    <tr key={transaction._id}>
                      <td style={{ color: 'var(--text-muted)', fontSize: '0.8125rem', fontWeight: '500' }}>
                        {new Date(transaction.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>
                      <td>
                        <div style={{ fontWeight: '600', fontSize: '0.9375rem', lineHeight: 1.3 }}>
                          {transaction.description || transaction.category.name}
                        </div>
                        {transaction.description && (
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>{transaction.category.name}</div>
                        )}
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={{ width: '28px', height: '28px', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', flexShrink: 0 }}>
                            {transaction.category.icon}
                          </span>
                          <span style={{ fontSize: '0.875rem', fontWeight: '500' }}>{transaction.category.name}</span>
                        </div>
                      </td>
                      <td style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>
                        {transaction.paymentMethod.replace('_', ' ')}
                      </td>
                      <td>
                        <span className={`status-badge ${transaction.type}`}>{transaction.type}</span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <span style={{ fontWeight: '800', fontSize: '1rem', color: transaction.type === 'income' ? 'var(--success)' : 'var(--danger)' }}>
                          {transaction.type === 'income' ? '+' : '−'}{formatCurrency(transaction.amount)}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        {renderTransactionActions(transaction)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Card View */}
          <div className="transactions-mobile-cards">
            {paginatedTransactions.map(transaction => (
              <div key={transaction._id} className="transaction-mobile-card">
                <div className="transaction-mobile-header">
                  <div className="transaction-mobile-category">
                    <span style={{ width: '40px', height: '40px', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem', flexShrink: 0 }}>
                      {transaction.category.icon}
                    </span>
                    <div style={{ minWidth: 0 }}>
                      <div className="transaction-description">{transaction.description || transaction.category.name}</div>
                      <div className="transaction-category-name">{transaction.category.name}</div>
                    </div>
                  </div>
                  <div className="transaction-mobile-amount" style={{ color: transaction.type === 'income' ? 'var(--success)' : 'var(--danger)' }}>
                    {transaction.type === 'income' ? '+' : '−'}{formatCurrency(transaction.amount)}
                  </div>
                </div>
                <div className="transaction-mobile-footer">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span className="transaction-date">
                      {new Date(transaction.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                    <span className={`status-badge ${transaction.type}`}>{transaction.type}</span>
                  </div>
                  {renderTransactionActions(transaction)}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* ── Pagination ── */}
      {totalPages > 1 && (
        <div className="card" style={{ padding: 0, marginTop: '1rem', overflow: 'hidden' }}>
          <div className="pagination-bar">
            <span className="pagination-info">Showing {startIndex + 1}–{Math.min(endIndex, totalTransactions)} of {totalTransactions}</span>
            <div className="pagination-pages">
              <button onClick={() => setCurrentPage(1)} disabled={currentPage === 1} className="page-btn" title="First page">«</button>
              <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="page-btn">{Icons.chevronLeft}</button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let page;
                if (totalPages <= 5) page = i + 1;
                else if (currentPage <= 3) page = i + 1;
                else if (currentPage >= totalPages - 2) page = totalPages - 4 + i;
                else page = currentPage - 2 + i;
                return (
                  <button key={page} onClick={() => setCurrentPage(page)} className={`page-btn${currentPage === page ? ' current' : ''}`}>{page}</button>
                );
              })}
              <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="page-btn">{Icons.chevronRight}</button>
              <button onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages} className="page-btn" title="Last page">»</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Transactions;
