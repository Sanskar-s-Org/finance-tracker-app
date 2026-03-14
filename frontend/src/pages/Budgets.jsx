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
        <div style={{ display: 'grid', gap: '1rem' }}>
          {[1, 2, 3].map(i => (
            <div key={i} className="loading-skeleton" style={{ height: '140px', borderRadius: 'var(--radius-lg)' }} />
          ))}
        </div>
      </div>
    );
  }

  const totalBudgeted = budgets.reduce((s, b) => s + b.amount, 0);
  const totalSpent    = budgets.reduce((s, b) => s + b.spent, 0);
  const totalRemaining = budgets.reduce((s, b) => s + Math.max(b.remaining, 0), 0);

  return (
    <div className="container" style={{ paddingTop: '1.25rem', paddingBottom: '2rem' }}>

      {/* ── Header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', gap: '1rem', flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontSize: '1.875rem', fontWeight: '700', marginBottom: '0.375rem' }}>Budgets</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', margin: 0 }}>
            {new Date().toLocaleDateString('default', { month: 'long', year: 'numeric' })}
            {' · '}
            <span style={{ color: 'var(--primary)', fontWeight: '600' }}>
              {Math.ceil((new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate() - new Date().getDate()))} days remaining
            </span>
          </p>
        </div>
        <button
          onClick={() => editingId ? handleCancelEdit() : setShowForm(!showForm)}
          className="btn btn-primary"
          style={{ padding: '0.75rem 1.5rem', whiteSpace: 'nowrap' }}
        >
          {showForm ? '✕ Cancel' : '+ Add Budget'}
        </button>
      </div>

      {/* ── Summary Row ── */}
      {budgets.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
          {[
            { label: 'Total Budgeted', value: totalBudgeted, color: 'var(--primary)', accent: 'rgba(99,102,241,0.12)' },
            { label: 'Total Spent',    value: totalSpent,    color: 'var(--danger)',  accent: 'rgba(239,68,68,0.08)' },
            { label: 'Total Remaining',value: totalRemaining,color: 'var(--success)', accent: 'rgba(16,185,129,0.08)' },
          ].map(item => (
            <div key={item.label} className="card" style={{ padding: '1rem 1.25rem', textAlign: 'center', borderLeft: `3px solid ${item.color}`, background: item.accent }}>
              <div style={{ fontSize: '0.6875rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.375rem' }}>{item.label}</div>
              <div style={{ fontSize: '1.375rem', fontWeight: '800', color: item.color }}>{formatCurrency(item.value)}</div>
            </div>
          ))}
        </div>
      )}

      {/* ── Budget Form ── */}
      {showForm && (
        <div className="card mb-2 fade-in" style={{ padding: '1.25rem 1.5rem', marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: '700', marginBottom: '1.25rem' }}>
            {editingId ? 'Edit Budget' : 'New Budget'}
          </h3>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Category</label>
                <select className="form-select" value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} required>
                  <option value="">Select category</option>
                  {categories.map(cat => <option key={cat._id} value={cat._id}>{cat.icon} {cat.name}</option>)}
                </select>
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Budget Amount</label>
                <input type="number" className="form-input" value={formData.amount} onChange={e => setFormData({ ...formData, amount: e.target.value })} step="0.01" min="0" required placeholder="0.00" />
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Month</label>
                <select className="form-select" value={formData.month} onChange={e => setFormData({ ...formData, month: parseInt(e.target.value) })}>
                  {Array.from({ length: 12 }, (_, i) => (
                    <option key={i + 1} value={i + 1}>{new Date(2000, i).toLocaleString('default', { month: 'long' })}</option>
                  ))}
                </select>
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Year</label>
                <input type="number" className="form-input" value={formData.year} onChange={e => setFormData({ ...formData, year: parseInt(e.target.value) })} min="2000" max="2100" required />
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Alert Threshold (%)</label>
                <input type="number" className="form-input" value={formData.alertThreshold} onChange={e => setFormData({ ...formData, alertThreshold: parseInt(e.target.value) })} min="0" max="100" />
              </div>
            </div>
            <button type="submit" className="btn btn-success" style={{ padding: '0.75rem 1.5rem' }}>
              {editingId ? 'Update Budget' : 'Save Budget'}
            </button>
          </form>
        </div>
      )}

      {/* ── Budget Cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
        {budgets.length === 0 ? (
          <div className="card" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '4rem 2rem' }}>
            <div style={{ fontSize: '3.5rem', marginBottom: '1rem', opacity: 0.35 }}>💰</div>
            <h3 style={{ marginBottom: '0.5rem', fontSize: '1.25rem', fontWeight: '700' }}>No budgets set</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.9375rem', maxWidth: '380px', margin: '0 auto 1.5rem' }}>
              Set monthly budgets for your expense categories to track spending and stay on target.
            </p>
            {!showForm && (
              <button onClick={() => setShowForm(true)} className="btn btn-primary" style={{ padding: '0.75rem 1.5rem' }}>
                Create Your First Budget
              </button>
            )}
          </div>
        ) : (
          budgets.map(budget => {
            const pct = Math.min(budget.percentageUsed, 100);
            const barColor = budget.isOverBudget
              ? 'var(--danger)'
              : budget.percentageUsed >= budget.alertThreshold
                ? 'var(--warning)'
                : 'var(--success)';
            const statusLabel = budget.isOverBudget ? 'Over Budget' : budget.percentageUsed >= budget.alertThreshold ? 'Near Limit' : 'On Track';
            return (
              <div key={budget._id} className="card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>

                {/* Card Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                    <div style={{ width: '42px', height: '42px', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem', flexShrink: 0 }}>
                      {budget.category.icon}
                    </div>
                    <div>
                      <div style={{ fontWeight: '700', fontSize: '1rem', lineHeight: 1.2 }}>{budget.category.name}</div>
                      <div style={{ fontSize: '0.75rem', fontWeight: '600', color: barColor, marginTop: '0.125rem' }}>{statusLabel}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.375rem', flexShrink: 0 }}>
                    <button onClick={() => handleEdit(budget)} className="btn btn-primary" style={{ padding: '0.375rem 0.75rem', fontSize: '0.8125rem' }}>Edit</button>
                    <button onClick={() => handleDelete(budget._id)} className="btn btn-danger" style={{ padding: '0.375rem 0.75rem', fontSize: '0.8125rem' }}>Del</button>
                  </div>
                </div>

                {/* Progress */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.8125rem' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>{formatCurrency(budget.spent)} spent</span>
                    <span style={{ fontWeight: '700', color: barColor }}>{budget.percentageUsed}%</span>
                  </div>
                  <div style={{ height: '8px', background: 'var(--bg-tertiary)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: `${pct}%`, height: '100%', background: barColor, borderRadius: '4px', transition: 'width 0.5s ease' }} />
                  </div>
                </div>

                {/* Footer Stats */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', paddingTop: '0.625rem', borderTop: '1px solid var(--border)' }}>
                  <div>
                    <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.125rem' }}>Budget</div>
                    <div style={{ fontWeight: '700', fontSize: '0.9375rem' }}>{formatCurrency(budget.amount)}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.125rem' }}>Remaining</div>
                    <div style={{ fontWeight: '700', fontSize: '0.9375rem', color: budget.remaining >= 0 ? 'var(--success)' : 'var(--danger)' }}>{formatCurrency(budget.remaining)}</div>
                  </div>
                </div>

              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default Budgets;
