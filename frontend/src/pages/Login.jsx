import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login({ email, password });
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
          left: '-10%',
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
          right: '-10%',
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
          maxWidth: '480px',
          width: '100%',
          margin: '2rem',
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
            💰
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
            Finance Tracker
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>
            Welcome back! Please login to your account
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
          <div className="form-group">
            <label className="form-label">📧 Email Address</label>
            <input
              type="email"
              className="form-input"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <label className="form-label">🔒 Password</label>
            <input
              type="password"
              className="form-input"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
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
                Logging in...
              </>
            ) : (
              <>🚀 Login to Dashboard</>
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
            Don't have an account?
          </p>
          <Link
            to="/signup"
            className="btn btn-outline"
            style={{ width: '100%' }}
          >
            ✨ Create New Account
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
