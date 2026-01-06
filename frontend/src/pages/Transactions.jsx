import { useEffect, useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { useAuth } from '../context/AuthContext';

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
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
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

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      await Promise.all([fetchTransactions(), fetchCategories()]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
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
      alert(editingId ? 'Error updating transaction' : 'Error creating transaction');
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
  };

  const handleDelete = async id => {
    if (confirm('Are you sure you want to delete this transaction?')) {
      try {
        await deleteTransaction(id);
        await fetchTransactions();
      } catch (err) {
        alert('Error deleting transaction');
      }
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
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: user?.currency || 'USD',
    }).format(amount);

  if (loading) {
    return (
      <div className="container" style={{ paddingTop: '2rem' }}>
        <div className="loading-skeleton" style={{ height: '400px' }}></div>
      </div>
    );
  }

  return (
    <div
      className="container"
      style={{ paddingTop: '1.25rem', paddingBottom: '1.5rem' }}
    >
      {/* Clean Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '1.5rem',
        gap: '1rem',
        flexWrap: 'wrap'
      }}>
        <div style={{ flex: '1', minWidth: 0 }}>
          <h1 style={{ fontSize: '1.875rem', marginBottom: '0.375rem', fontWeight: '700' }}>Transactions</h1>
          {totalTransactions > 0 && (
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', margin: 0 }}>
              {totalTransactions} transaction{totalTransactions !== 1 ? 's' : ''}
              {searchQuery && ` matching "${searchQuery}"`}
              {totalPages > 1 && ` • Page ${currentPage} of ${totalPages}`}
            </p>
          )}
        </div>
        <button
          onClick={() => editingId ? handleCancelEdit() : setShowForm(!showForm)}
          className="btn btn-primary"
          style={{
            fontSize: '0.9375rem',
            padding: '0.75rem 1.5rem',
            whiteSpace: 'nowrap',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          {showForm ? (
            <>✕ Cancel</>
          ) : (
            <>+ Add Transaction</>
          )}
        </button>
      </div>

      {/* Compact Toolbar - Search, Sort, Pagination, Filters Toggle */}
      <div className="card" style={{ padding: '1rem', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'stretch', flexWrap: 'wrap' }}>
          {/* Search */}
          <div style={{ flex: '1 1 100%', minWidth: '200px' }}>
            <input
              type="text"
              placeholder="🔍 Search by description or category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="form-input"
              style={{ width: '100%', padding: '0.75rem 1rem', fontSize: '0.875rem' }}
            />
          </div>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="form-select"
            style={{ flex: '1 1 auto', minWidth: '140px', padding: '0.75rem 1rem', fontSize: '0.875rem' }}
          >
            <option value="date-desc">📅 Newest First</option>
            <option value="date-asc">📅 Oldest First</option>
            <option value="amount-desc">💰 Highest Amount</option>
            <option value="amount-asc">💰 Lowest Amount</option>
            <option value="category">📁 By Category</option>
          </select>

          {/* Page Size */}
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="form-select"
            style={{ flex: '1 1 auto', minWidth: '120px', padding: '0.75rem 1rem', fontSize: '0.875rem' }}
          >
            <option value="10">📄 10 per page</option>
            <option value="25">📄 25 per page</option>
            <option value="50">📄 50 per page</option>
            <option value="100">📄 100 per page</option>
          </select>

          {/* Filters Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="btn btn-outline"
            style={{ flex: '0 0 auto', padding: '0.75rem 1rem', fontSize: '0.875rem', whiteSpace: 'nowrap' }}
          >
            {showFilters ? '🔽 Hide Filters' : '🔼 Show Filters'} {hasActiveFilters && '•'}
          </button>
        </div>
      </div>

      {/* Collapsible Advanced Filters */}
      {showFilters && (
        <div className="card fade-in" style={{ padding: '1.25rem', marginBottom: '1rem' }}>
          <h4 style={{ marginBottom: '1rem', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span>⚙️</span> Advanced Filters
          </h4>

          {/* Type Filter */}
          <div style={{ marginBottom: '1rem' }}>
            <label className="form-label" style={{ fontSize: '0.8125rem', marginBottom: '0.5rem' }}>Transaction Type</label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                className={`btn ${!filter.type ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => setFilter({ ...filter, type: '' })}
                style={{ flex: '1', padding: '0.625rem', fontSize: '0.875rem' }}
              >
                All
              </button>
              <button
                className={`btn ${filter.type === 'income' ? 'btn-success' : 'btn-outline'}`}
                onClick={() => setFilter({ ...filter, type: 'income' })}
                style={{ flex: '1', padding: '0.625rem', fontSize: '0.875rem' }}
              >
                Income
              </button>
              <button
                className={`btn ${filter.type === 'expense' ? 'btn-danger' : 'btn-outline'}`}
                onClick={() => setFilter({ ...filter, type: 'expense' })}
                style={{ flex: '1', padding: '0.625rem', fontSize: '0.875rem' }}
              >
                Expenses
              </button>
            </div>
          </div>

          {/* Other Filters */}
          <div className="grid grid-2" style={{ gap: '1rem' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ fontSize: '0.8125rem' }}>Category</label>
              <select
                className="form-select"
                value={filter.category}
                onChange={e => setFilter({ ...filter, category: e.target.value })}
                style={{ padding: '0.625rem 1rem', fontSize: '0.875rem' }}
              >
                <option value="">All Categories</option>
                {categories.map(cat => (
                  <option key={cat._id} value={cat._id}>
                    {cat.icon} {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ fontSize: '0.8125rem' }}>Payment Method</label>
              <select
                className="form-select"
                value={filter.paymentMethod}
                onChange={e => setFilter({ ...filter, paymentMethod: e.target.value })}
                style={{ padding: '0.625rem 1rem', fontSize: '0.875rem' }}
              >
                <option value="">All Methods</option>
                <option value="cash">Cash</option>
                <option value="card">Card</option>
                <option value="bank_transfer">Bank Transfer</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ fontSize: '0.8125rem' }}>From Date</label>
              <input
                type="date"
                className="form-input"
                value={filter.dateFrom}
                onChange={e => setFilter({ ...filter, dateFrom: e.target.value })}
                style={{ padding: '0.625rem 1rem', fontSize: '0.875rem' }}
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ fontSize: '0.8125rem' }}>To Date</label>
              <input
                type="date"
                className="form-input"
                value={filter.dateTo}
                onChange={e => setFilter({ ...filter, dateTo: e.target.value })}
                style={{ padding: '0.625rem 1rem', fontSize: '0.875rem' }}
              />
            </div>
          </div>

          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="btn btn-outline"
              style={{ width: '100%', marginTop: '1rem', padding: '0.625rem', fontSize: '0.875rem' }}
            >
              🗑️ Clear All Filters
            </button>
          )}
        </div>
      )}

      {/* Transaction Form */}
      {showForm && (
        <div className="card mb-2 fade-in" style={{ padding: '1.25rem' }}>
          <h3 style={{ fontSize: '1.125rem', marginBottom: '1rem' }}>{editingId ? 'Edit Transaction' : 'New Transaction'}</h3>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-2">
              <div className="form-group">
                <label className="form-label">Type</label>
                <select
                  className="form-select"
                  value={formData.type}
                  onChange={e =>
                    setFormData({
                      ...formData,
                      type: e.target.value,
                      category: '',
                    })
                  }
                >
                  <option value="expense">Expense</option>
                  <option value="income">Income</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Amount</label>
                <input
                  type="number"
                  className="form-input"
                  value={formData.amount}
                  onChange={e =>
                    setFormData({ ...formData, amount: e.target.value })
                  }
                  step="0.01"
                  min="0"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Category</label>
                <select
                  className="form-select"
                  value={formData.category}
                  onChange={e =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  required
                >
                  <option value="">Select category</option>
                  {expenseCategories.map(cat => (
                    <option key={cat._id} value={cat._id}>
                      {cat.icon} {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Date</label>
                <input
                  type="date"
                  className="form-input"
                  value={formData.date}
                  onChange={e =>
                    setFormData({ ...formData, date: e.target.value })
                  }
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Payment Method</label>
                <select
                  className="form-select"
                  value={formData.paymentMethod}
                  onChange={e =>
                    setFormData({ ...formData, paymentMethod: e.target.value })
                  }
                >
                  <option value="cash">Cash</option>
                  <option value="card">Card</option>
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Description (Optional)</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.description}
                  onChange={e =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Add a note..."
                />
              </div>
            </div>

            <button type="submit" className="btn btn-success">
              {editingId ? 'Update Transaction' : 'Save Transaction'}
            </button>
          </form>
        </div>
      )}

      {/* Professional Transaction Table */}
      {filteredTransactions.length === 0 ? (
        <div className="card" style={{ padding: '4rem 2rem', textAlign: 'center' }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem', opacity: 0.4 }}>💸</div>
          <h3 style={{ marginBottom: '0.625rem', fontSize: '1.25rem', fontWeight: '700' }}>No transactions found</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.9375rem', maxWidth: '400px', margin: '0 auto 1.5rem' }}>
            {searchQuery || hasActiveFilters
              ? 'Try adjusting your search or filters to find transactions'
              : 'Start tracking your finances by adding your first transaction'}
          </p>
          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="btn btn-primary"
              style={{ fontSize: '0.9375rem', padding: '0.75rem 1.5rem' }}
            >
              ➕ Add Your First Transaction
            </button>
          )}
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ width: '110px' }}>Date</th>
                  <th>Description</th>
                  <th style={{ width: '200px' }}>Category</th>
                  <th style={{ width: '120px' }}>Payment</th>
                  <th style={{ width: '100px' }}>Type</th>
                  <th style={{ width: '140px', textAlign: 'right' }}>Amount</th>
                  <th style={{ width: '100px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedTransactions.map(transaction => (
                  <tr key={transaction._id}>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.8125rem', fontWeight: '500' }}>
                      {new Date(transaction.date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </td>
                    <td>
                      <div style={{ fontWeight: '600', fontSize: '0.9375rem' }}>
                        {transaction.description || transaction.category.name}
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontSize: '1.25rem' }}>{transaction.category.icon}</span>
                        <span style={{ fontSize: '0.875rem', fontWeight: '500' }}>{transaction.category.name}</span>
                      </div>
                    </td>
                    <td style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>
                      {transaction.paymentMethod.replace('_', ' ')}
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
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', alignItems: 'center' }}>
                        <button
                          onClick={() => handleEdit(transaction)}
                          className="btn btn-primary"
                          style={{
                            padding: '0.5rem',
                            fontSize: '1rem',
                            minWidth: 'auto',
                            width: '36px',
                            height: '36px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: 'var(--radius-md)'
                          }}
                          title="Edit transaction"
                        >
                          ✎
                        </button>
                        <button
                          onClick={() => handleDelete(transaction._id)}
                          className="btn btn-danger"
                          style={{
                            padding: '0.5rem',
                            fontSize: '1.125rem',
                            minWidth: 'auto',
                            width: '36px',
                            height: '36px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: 'var(--radius-md)'
                          }}
                          title="Delete transaction"
                        >
                          ×
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="card" style={{ padding: '1rem', marginTop: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
              Showing {startIndex + 1}-{Math.min(endIndex, totalTransactions)} of {totalTransactions} transactions
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <button
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
                className="btn btn-outline"
                style={{ padding: '0.5rem 0.875rem', fontSize: '0.875rem' }}
              >
                « First
              </button>
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="btn btn-outline"
                style={{ padding: '0.5rem 0.875rem', fontSize: '0.875rem' }}
              >
                ‹ Prev
              </button>
              <span style={{ padding: '0 0.75rem', color: 'var(--text-primary)', fontSize: '0.875rem', fontWeight: '600' }}>
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="btn btn-outline"
                style={{ padding: '0.5rem 0.875rem', fontSize: '0.875rem' }}
              >
                Next ›
              </button>
              <button
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
                className="btn btn-outline"
                style={{ padding: '0.5rem 0.875rem', fontSize: '0.875rem' }}
              >
                Last »
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Transactions;
