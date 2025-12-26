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
    deleteTransaction,
  } = useFinance();
  const { user } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    type: 'expense',
    amount: '',
    category: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    paymentMethod: 'cash',
  });
  const [filter, setFilter] = useState({ type: '' });
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
      await addTransaction(formData);
      setFormData({
        type: 'expense',
        amount: '',
        category: '',
        description: '',
        date: new Date().toISOString().split('T')[0],
        paymentMethod: 'cash',
      });
      setShowForm(false);
      await fetchTransactions();
    } catch (err) {
      alert('Error creating transaction');
    }
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

  const filteredTransactions = filter.type
    ? transactions.filter(t => t.type === filter.type)
    : transactions;

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
      style={{ paddingTop: '2rem', paddingBottom: '2rem' }}
    >
      <div className="flex-between mb-3">
        <h1>Transactions</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn btn-primary"
        >
          {showForm ? 'Cancel' : '+ Add Transaction'}
        </button>
      </div>

      {showForm && (
        <div className="card mb-3 fade-in">
          <h3>New Transaction</h3>
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
              Save Transaction
            </button>
          </form>
        </div>
      )}

      {/* Filters */}
      <div className="card mb-3">
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <button
            className={`btn ${!filter.type ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setFilter({ type: '' })}
          >
            All
          </button>
          <button
            className={`btn ${filter.type === 'income' ? 'btn-success' : 'btn-outline'}`}
            onClick={() => setFilter({ type: 'income' })}
          >
            Income
          </button>
          <button
            className={`btn ${filter.type === 'expense' ? 'btn-danger' : 'btn-outline'}`}
            onClick={() => setFilter({ type: 'expense' })}
          >
            Expenses
          </button>
        </div>
      </div>

      {/* Transaction List */}
      <div className="card">
        {filteredTransactions.length === 0 ? (
          <p className="text-center text-muted">
            No transactions found. Add your first transaction to get started!
          </p>
        ) : (
          filteredTransactions.map(transaction => (
            <div
              key={transaction._id}
              className="flex-between"
              style={{
                padding: '1rem 0',
                borderBottom: '1px solid var(--border)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  flex: 1,
                }}
              >
                <span style={{ fontSize: '1.5rem' }}>
                  {transaction.category.icon}
                </span>
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: '600', margin: 0 }}>
                    {transaction.description || transaction.category.name}
                  </p>
                  <p
                    className="text-muted"
                    style={{ fontSize: '0.875rem', margin: 0 }}
                  >
                    {new Date(transaction.date).toLocaleDateString()} •{' '}
                    {transaction.paymentMethod}
                  </p>
                </div>
              </div>
              <div
                style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}
              >
                <span
                  style={{
                    fontWeight: '700',
                    fontSize: '1.1rem',
                    color:
                      transaction.type === 'income'
                        ? 'var(--success)'
                        : 'var(--danger)',
                  }}
                >
                  {transaction.type === 'income' ? '+' : '-'}
                  {formatCurrency(transaction.amount)}
                </span>
                <button
                  onClick={() => handleDelete(transaction._id)}
                  className="btn btn-danger"
                  style={{ padding: '0.5rem 1rem' }}
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Transactions;
