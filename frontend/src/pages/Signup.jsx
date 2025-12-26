import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Signup = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    currency: 'USD',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await signup(formData);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="flex-center"
      style={{
        minHeight: '100vh',
        padding: '2rem',
        background: 'linear-gradient(135deg, #0a0e1a 0%, #1a1f2e 100%)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Animated Background Orbs */}
      <div
        style={{
          position: 'absolute',
          top: '-10%',
          right: '-10%',
          width: '40%',
          height: '40%',
          background:
            'radial-gradient(circle, rgba(102, 126, 234, 0.15) 0%, transparent 70%)',
          borderRadius: '50%',
          filter: 'blur(60px)',
          animation: 'float 20s ease-in-out infinite',
        }}
      ></div>
      <div
        style={{
          position: 'absolute',
          bottom: '-10%',
          left: '-10%',
          width: '40%',
          height: '40%',
          background:
            'radial-gradient(circle, rgba(118, 75, 162, 0.15) 0%, transparent 70%)',
          borderRadius: '50%',
          filter: 'blur(60px)',
          animation: 'float 25s ease-in-out infinite reverse',
        }}
      ></div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -30px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
      `}</style>

      <div
        className="card scale-in"
        style={{
          maxWidth: '550px',
          width: '100%',
          boxShadow: 'var(--shadow-xl), var(--shadow-glow)',
        }}
      >
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div
            style={{
              fontSize: '4rem',
              marginBottom: '1rem',
              background: 'var(--gradient-primary)',
              borderRadius: '50%',
              width: '100px',
              height: '100px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.5rem',
              boxShadow: 'var(--shadow-glow)',
            }}
          >
            ✨
          </div>
          <h1
            style={{
              fontSize: '2.5rem',
              marginBottom: '0.5rem',
              background: 'var(--gradient-primary)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Create Account
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>
            Start tracking your finances today
          </p>
        </div>

        {error && (
          <div
            className="fade-in"
            style={{
              background: 'rgba(239, 68, 68, 0.1)',
              border: '2px solid var(--danger)',
              borderRadius: 'var(--radius-md)',
              padding: '1rem',
              marginBottom: '1.5rem',
            }}
          >
            <p style={{ color: 'var(--danger)', margin: 0, fontWeight: '600' }}>
              ⚠️ {error}
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="grid grid-2">
            <div className="form-group">
              <label className="form-label">👤 Full Name</label>
              <input
                type="text"
                name="name"
                className="form-input"
                value={formData.name}
                onChange={handleChange}
                placeholder="John Doe"
                required
                autoFocus
              />
            </div>

            <div className="form-group">
              <label className="form-label">💵 Currency</label>
              <select
                name="currency"
                className="form-select"
                value={formData.currency}
                onChange={handleChange}
              >
                <option value="USD">🇺🇸 USD - US Dollar</option>
                <option value="EUR">🇪🇺 EUR - Euro</option>
                <option value="GBP">🇬🇧 GBP - British Pound</option>
                <option value="INR">🇮🇳 INR - Indian Rupee</option>
                <option value="JPY">🇯🇵 JPY - Japanese Yen</option>
                <option value="CAD">🇨🇦 CAD - Canadian Dollar</option>
                <option value="AUD">🇦🇺 AUD - Australian Dollar</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">📧 Email Address</label>
            <input
              type="email"
              name="email"
              className="form-input"
              value={formData.email}
              onChange={handleChange}
              placeholder="john@example.com"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">🔒 Password</label>
            <input
              type="password"
              name="password"
              className="form-input"
              value={formData.password}
              onChange={handleChange}
              placeholder="Minimum 6 characters"
              minLength={6}
              required
            />
            <p
              style={{
                color: 'var(--text-muted)',
                fontSize: '0.875rem',
                marginTop: '0.5rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem',
              }}
            >
              ℹ️ Password must be at least 6 characters long
            </p>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{
              width: '100%',
              padding: '1rem',
              fontSize: '1rem',
              marginTop: '0.5rem',
            }}
            disabled={loading}
          >
            {loading ? (
              <>
                <span
                  className="loading-skeleton"
                  style={{
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    display: 'inline-block',
                  }}
                ></span>
                Creating Account...
              </>
            ) : (
              <>🚀 Create Account</>
            )}
          </button>
        </form>

        <div
          style={{
            marginTop: '2rem',
            paddingTop: '1.5rem',
            borderTop: '1px solid var(--border)',
            textAlign: 'center',
          }}
        >
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>
            Already have an account?
          </p>
          <Link
            to="/login"
            className="btn btn-outline"
            style={{ width: '100%' }}
          >
            🔑 Login Instead
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Signup;
