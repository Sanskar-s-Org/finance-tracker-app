import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { budgetService, categoryService } from '../services';

const Budgets = () => {
  const { user } = useAuth();
  const [budgets, setBudgets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    category: '',
    amount: '',
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    alertThreshold: 80,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const currentMonth = new Date().getMonth() + 1;
      const currentYear = new Date().getFullYear();

      const [budgetsRes, categoriesRes] = await Promise.all([
        budgetService.getAll({ month: currentMonth, year: currentYear }),
        categoryService.getAll('expense'),
      ]);

      setBudgets(budgetsRes.data);
      setCategories(categoriesRes.data);
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
        await budgetService.update(editingId, formData);
      } else {
        await budgetService.create(formData);
      }
      setFormData({
        category: '',
        amount: '',
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
        alertThreshold: 80,
      });
      setEditingId(null);
      setShowForm(false);
      await loadData();
    } catch (err) {
      alert(editingId ? 'Error updating budget' : 'Error creating budget');
    }
  };

  const handleEdit = budget => {
    setFormData({
      category: budget.category._id,
      amount: budget.amount,
      month: budget.month,
      year: budget.year,
      alertThreshold: budget.alertThreshold,
    });
    setEditingId(budget._id);
    setShowForm(true);
  };

  const handleCancelEdit = () => {
    setFormData({
      category: '',
      amount: '',
      month: new Date().getMonth() + 1,
      year: new Date().getFullYear(),
      alertThreshold: 80,
    });
    setEditingId(null);
    setShowForm(false);
  };

  const handleDelete = async id => {
    if (confirm('Are you sure you want to delete this budget?')) {
      try {
        await budgetService.delete(id);
        await loadData();
      } catch (err) {
        alert('Error deleting budget');
      }
    }
  };

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
      <div className="flex-between mb-2">
        <div>
          <h1 style={{ fontSize: '1.75rem', marginBottom: '0.25rem' }}>Budgets</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', margin: 0 }}>
            {new Date().toLocaleDateString('default', { month: 'long', year: 'numeric' })} •
            {Math.ceil((new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate() - new Date().getDate()))} days remaining
          </p>
        </div>
        <button
          onClick={() => editingId ? handleCancelEdit() : setShowForm(!showForm)}
          className="btn btn-primary"
        >
          {showForm ? 'Cancel' : '+ Add Budget'}
        </button>
      </div>

      {showForm && (
        <div className="card mb-2 fade-in" style={{ padding: '1.25rem' }}>
          <h3 style={{ fontSize: '1.125rem', marginBottom: '1rem' }}>{editingId ? 'Edit Budget' : 'New Budget'}</h3>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-2">
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
                  {categories.map(cat => (
                    <option key={cat._id} value={cat._id}>
                      {cat.icon} {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Budget Amount</label>
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
                <label className="form-label">Month</label>
                <select
                  className="form-select"
                  value={formData.month}
                  onChange={e =>
                    setFormData({
                      ...formData,
                      month: parseInt(e.target.value),
                    })
                  }
                >
                  {Array.from({ length: 12 }, (_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {new Date(2000, i).toLocaleString('default', {
                        month: 'long',
                      })}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Year</label>
                <input
                  type="number"
                  className="form-input"
                  value={formData.year}
                  onChange={e =>
                    setFormData({ ...formData, year: parseInt(e.target.value) })
                  }
                  min="2000"
                  max="2100"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Alert Threshold (%)</label>
                <input
                  type="number"
                  className="form-input"
                  value={formData.alertThreshold}
                  onChange={e =>
                    setFormData({
                      ...formData,
                      alertThreshold: parseInt(e.target.value),
                    })
                  }
                  min="0"
                  max="100"
                />
              </div>
            </div>

            <button type="submit" className="btn btn-success">
              {editingId ? 'Update Budget' : 'Save Budget'}
            </button>
          </form>
        </div>
      )}

      {/* Budget List */}
      <div className="grid grid-2">
        {budgets.length === 0 ? (
          <div className="card" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem 1rem' }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem', opacity: 0.5 }}>💰</div>
            <h3 style={{ marginBottom: '0.5rem', fontSize: '1.125rem' }}>No budgets set</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.9375rem' }}>
              Set monthly budgets for your expense categories to track spending and stay on target
            </p>
            {!showForm && (
              <button
                onClick={() => setShowForm(true)}
                className="btn btn-primary"
                style={{ fontSize: '0.9375rem' }}
              >
                💰 Create Your First Budget
              </button>
            )}
          </div>
        ) : (
          budgets.map(budget => (
            <div key={budget._id} className="card">
              <div className="flex-between mb-2">
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                  }}
                >
                  <span style={{ fontSize: '1.25rem' }}>
                    {budget.category.icon}
                  </span>
                  <h4 style={{ margin: 0, fontSize: '1.0625rem' }}>{budget.category.name}</h4>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    onClick={() => handleEdit(budget)}
                    className="btn btn-primary"
                    style={{ padding: '0.5rem 1rem' }}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(budget._id)}
                    className="btn btn-danger"
                    style={{ padding: '0.5rem 1rem' }}
                  >
                    Delete
                  </button>
                </div>
              </div>

              <div className="mb-1">
                <div className="flex-between mb-1" style={{ fontSize: '0.9375rem' }}>
                  <span className="text-muted">Spent</span>
                  <span style={{ fontWeight: '600' }}>
                    {formatCurrency(budget.spent)}
                  </span>
                </div>
                <div className="flex-between mb-1" style={{ fontSize: '0.9375rem' }}>
                  <span className="text-muted">Budget</span>
                  <span style={{ fontWeight: '600' }}>
                    {formatCurrency(budget.amount)}
                  </span>
                </div>
                <div className="flex-between" style={{ fontSize: '0.9375rem' }}>
                  <span className="text-muted">Remaining</span>
                  <span
                    style={{
                      fontWeight: '700',
                      color:
                        budget.remaining > 0
                          ? 'var(--success)'
                          : 'var(--danger)',
                    }}
                  >
                    {formatCurrency(budget.remaining)}
                  </span>
                </div>
              </div>

              <div
                style={{
                  height: '12px',
                  background: 'var(--bg-tertiary)',
                  borderRadius: '6px',
                  overflow: 'hidden',
                  marginBottom: '0.5rem',
                }}
              >
                <div
                  style={{
                    width: `${Math.min(budget.percentageUsed, 100)}%`,
                    height: '100%',
                    background:
                      budget.percentageUsed >= 100
                        ? 'var(--danger)'
                        : budget.percentageUsed >= budget.alertThreshold
                          ? 'var(--warning)'
                          : 'var(--success)',
                    transition: 'width 0.3s ease',
                  }}
                ></div>
              </div>

              <div className="flex-between">
                <span className="text-muted" style={{ fontSize: '0.875rem' }}>
                  {budget.percentageUsed}% used
                </span>
                {budget.isOverBudget && (
                  <span
                    style={{
                      color: 'var(--danger)',
                      fontSize: '0.875rem',
                      fontWeight: '600',
                    }}
                  >
                    Over budget!
                  </span>
                )}
                {budget.isNearLimit && !budget.isOverBudget && (
                  <span
                    style={{
                      color: 'var(--warning)',
                      fontSize: '0.875rem',
                      fontWeight: '600',
                    }}
                  >
                    Near limit
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Budgets;
