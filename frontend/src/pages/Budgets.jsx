import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { budgetService, categoryService } from '../services';

const Icons = {
  edit: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  ),
  delete: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 6h18" /><path d="M8 6V4h8v2" /><path d="M19 6l-1 14H6L5 6" />
      <path d="M10 11v6" /><path d="M14 11v6" />
    </svg>
  ),
  plus: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  ),
  close: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  ),
  empty: (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" />
    </svg>
  ),
};

const Budgets = () => {
  const { user } = useAuth();
  const [budgets, setBudgets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
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
    try {
      await budgetService.delete(id);
      await loadData();
    } catch (err) {
      alert('Error deleting budget');
    } finally {
      setConfirmDeleteId(null);
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
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: '1rem' }}>
          {[1, 2, 3].map(i => (
            <div key={i} className="loading-skeleton" style={{ height: '200px', borderRadius: 'var(--radius-xl)' }} />
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
          <h1 style={{ fontSize: '1.75rem', fontWeight: '800', marginBottom: '0.25rem', letterSpacing: '-0.02em' }}>Budgets</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', margin: 0 }}>
            {new Date().toLocaleDateString('default', { month: 'long', year: 'numeric' })}
            {' · '}
            <span style={{ color: 'var(--primary-300)', fontWeight: '600' }}>
              {Math.ceil((new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate() - new Date().getDate()))} days remaining
            </span>
          </p>
        </div>
        <button
          onClick={() => showForm ? handleCancelEdit() : setShowForm(true)}
          className="btn btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.375rem', whiteSpace: 'nowrap' }}
        >
          {showForm ? <>{Icons.close} Cancel</> : <>{Icons.plus} Add Budget</>}
        </button>
      </div>

      {/* ── Summary Strip ── */}
      {budgets.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
          {[
            { label: 'Total budgeted', value: totalBudgeted, color: 'var(--primary)', glow: 'rgba(99,102,241,0.25)', bg: 'rgba(99,102,241,0.08)' },
            { label: 'Total spent',    value: totalSpent,    color: 'var(--danger)',  glow: 'rgba(239,68,68,0.2)',   bg: 'rgba(239,68,68,0.06)' },
            { label: 'Remaining',      value: totalRemaining,color: 'var(--success)', glow: 'rgba(16,185,129,0.2)', bg: 'rgba(16,185,129,0.06)' },
          ].map(item => (
            <div key={item.label} className="card" style={{ padding: '1rem 1.25rem', textAlign: 'center', borderTop: `2px solid ${item.color}`, background: item.bg, boxShadow: `0 4px 16px ${item.glow}` }}>
              <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.5rem', fontWeight: '600' }}>{item.label}</div>
              <div style={{ fontSize: '1.5rem', fontWeight: '800', color: item.color, letterSpacing: '-0.02em' }}>{formatCurrency(item.value)}</div>
            </div>
          ))}
        </div>
      )}

      {/* ── Budget Form ── */}
      {showForm && (
        <div className="card fade-in" style={{ padding: '1.5rem', marginBottom: '1.5rem', borderColor: 'rgba(99,102,241,0.25)', background: 'linear-gradient(135deg, rgba(99,102,241,0.04), rgba(139,92,246,0.02))' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1.0625rem', fontWeight: '700', margin: 0 }}>{editingId ? 'Edit Budget' : 'New Budget'}</h3>
            <button onClick={handleCancelEdit} className="icon-btn" title="Close">{Icons.close}</button>
          </div>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Category</label>
                <select className="form-select" value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} required>
                  <option value="">Select category</option>
                  {categories.map(cat => <option key={cat._id} value={cat._id}>{cat.icon} {cat.name}</option>)}
                </select>
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Budget amount</label>
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
                <label className="form-label">Alert threshold (%)</label>
                <input type="number" className="form-input" value={formData.alertThreshold} onChange={e => setFormData({ ...formData, alertThreshold: parseInt(e.target.value) })} min="0" max="100" />
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button type="submit" className="btn btn-success" style={{ padding: '0.75rem 1.5rem' }}>
                {editingId ? 'Update Budget' : 'Save Budget'}
              </button>
              <button type="button" onClick={handleCancelEdit} className="btn btn-outline" style={{ padding: '0.75rem 1.25rem' }}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── Budget Cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
        {budgets.length === 0 ? (
          <div className="card" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '4rem 2rem' }}>
            <div style={{ width: '80px', height: '80px', margin: '0 auto 1.5rem', background: 'var(--bg-tertiary)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-disabled)' }}>
              {Icons.empty}
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '0.5rem' }}>No budgets set</h3>
            <p style={{ color: 'var(--text-secondary)', maxWidth: '380px', margin: '0 auto 1.75rem', lineHeight: 1.6, fontSize: '0.9375rem' }}>
              Set monthly spending limits for your expense categories to stay on track and get alerts when you're close to the edge.
            </p>
            {!showForm && (
              <button onClick={() => setShowForm(true)} className="btn btn-primary" style={{ padding: '0.75rem 1.75rem' }}>
                {Icons.plus} Create your first budget
              </button>
            )}
          </div>
        ) : (
          budgets.map(budget => {
            const pct = Math.min(budget.percentageUsed, 100);
            const isOver = budget.isOverBudget;
            const isNear = !isOver && budget.percentageUsed >= budget.alertThreshold;
            const statusKey = isOver ? 'over' : isNear ? 'near-limit' : 'on-track';
            const statusLabel = isOver ? 'Over budget' : isNear ? 'Near limit' : 'On track';
            const barColor = isOver ? '#ef4444' : isNear ? '#f59e0b' : '#10b981';
            const barGradient = isOver
              ? 'linear-gradient(90deg, #ef4444, #dc2626)'
              : isNear
                ? 'linear-gradient(90deg, #f59e0b, #d97706)'
                : 'linear-gradient(90deg, #10b981, #059669)';

            return (
              <div key={budget._id} className="card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>

                {/* Card Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: 0 }}>
                    <div style={{ width: '44px', height: '44px', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-lg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.375rem', flexShrink: 0 }}>
                      {budget.category.icon}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontWeight: '700', fontSize: '0.9375rem', lineHeight: 1.2, marginBottom: '0.25rem' }}>{budget.category.name}</div>
                      <span className={`budget-status-chip ${statusKey}`}>{statusLabel}</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.375rem', flexShrink: 0 }}>
                    <button onClick={() => handleEdit(budget)} className="icon-btn icon-btn-edit" title="Edit budget">{Icons.edit}</button>
                    <div className="confirm-popover-host">
                      <button
                        onClick={() => setConfirmDeleteId(confirmDeleteId === budget._id ? null : budget._id)}
                        className="icon-btn icon-btn-delete"
                        title="Delete budget"
                      >{Icons.delete}</button>
                      {confirmDeleteId === budget._id && (
                        <div className="confirm-popover">
                          <p>Delete this budget? Your spending data will not be affected.</p>
                          <div className="confirm-popover-actions">
                            <button className="btn btn-danger" onClick={() => handleDelete(budget._id)}>Delete</button>
                            <button className="btn btn-outline" onClick={() => setConfirmDeleteId(null)}>Cancel</button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Progress */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>{formatCurrency(budget.spent)} spent</span>
                    <span style={{ fontSize: '0.875rem', fontWeight: '800', color: barColor }}>{budget.percentageUsed}%</span>
                  </div>
                  <div className="budget-progress-bar">
                    <div className="budget-progress-fill" style={{ width: `${pct}%`, background: barGradient }} />
                  </div>
                </div>

                {/* Footer Stats */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border)' }}>
                  <div>
                    <div style={{ fontSize: '0.625rem', color: 'var(--text-disabled)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.25rem', fontWeight: '600' }}>Budgeted</div>
                    <div style={{ fontWeight: '700', fontSize: '1rem' }}>{formatCurrency(budget.amount)}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.625rem', color: 'var(--text-disabled)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.25rem', fontWeight: '600' }}>Remaining</div>
                    <div style={{ fontWeight: '700', fontSize: '1rem', color: budget.remaining >= 0 ? 'var(--success)' : 'var(--danger)' }}>{formatCurrency(budget.remaining)}</div>
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
