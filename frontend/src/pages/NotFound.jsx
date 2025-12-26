import { Link } from 'react-router-dom';

const NotFound = () => {
    return (
        <div
            style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '2rem',
                background: 'var(--bg-primary)',
            }}
        >
            <div
                className="card fade-in"
                style={{
                    maxWidth: '600px',
                    textAlign: 'center',
                }}
            >
                <div
                    style={{
                        fontSize: '8rem',
                        fontWeight: '800',
                        background: 'var(--gradient-primary)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        lineHeight: '1',
                        marginBottom: '1rem',
                    }}
                >
                    404
                </div>
                <h1 style={{ marginBottom: '1rem' }}>Page Not Found</h1>
                <p
                    style={{
                        color: 'var(--text-secondary)',
                        marginBottom: '2rem',
                        lineHeight: '1.6',
                        fontSize: '1.1rem',
                    }}
                >
                    The page you're looking for doesn't exist or has been moved.
                </p>
                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                    <Link to="/dashboard" className="btn btn-primary">
                        Go to Dashboard
                    </Link>
                    <Link to="/transactions" className="btn btn-outline">
                        View Transactions
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default NotFound;
