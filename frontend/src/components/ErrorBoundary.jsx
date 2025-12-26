import { Component } from 'react';

class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        console.error('Error caught by boundary:', error, errorInfo);
        this.setState({
            error,
            errorInfo,
        });
    }

    render() {
        if (this.state.hasError) {
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
                        className="card"
                        style={{
                            maxWidth: '600px',
                            textAlign: 'center',
                        }}
                    >
                        <div
                            style={{
                                fontSize: '4rem',
                                marginBottom: '1rem',
                            }}
                        >
                            😕
                        </div>
                        <h1 style={{ marginBottom: '1rem', color: 'var(--danger)' }}>
                            Oops! Something went wrong
                        </h1>
                        <p
                            style={{
                                color: 'var(--text-secondary)',
                                marginBottom: '2rem',
                                lineHeight: '1.6',
                            }}
                        >
                            We're sorry for the inconvenience. An unexpected error occurred.
                            Please try refreshing the page.
                        </p>
                        {process.env.NODE_ENV === 'development' && this.state.error && (
                            <details
                                style={{
                                    textAlign: 'left',
                                    background: 'var(--bg-tertiary)',
                                    padding: '1rem',
                                    borderRadius: 'var(--radius-md)',
                                    marginBottom: '1rem',
                                }}
                            >
                                <summary
                                    style={{
                                        cursor: 'pointer',
                                        fontWeight: '600',
                                        marginBottom: '0.5rem',
                                    }}
                                >
                                    Error Details (Development Mode)
                                </summary>
                                <pre
                                    style={{
                                        fontSize: '0.875rem',
                                        overflow: 'auto',
                                        color: 'var(--danger)',
                                    }}
                                >
                                    {this.state.error.toString()}
                                    {'\n'}
                                    {this.state.errorInfo?.componentStack}
                                </pre>
                            </details>
                        )}
                        <button
                            onClick={() => window.location.reload()}
                            className="btn btn-primary"
                            style={{ marginRight: '1rem' }}
                        >
                            Refresh Page
                        </button>
                        <button
                            onClick={() => (window.location.href = '/dashboard')}
                            className="btn btn-outline"
                        >
                            Go to Dashboard
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
