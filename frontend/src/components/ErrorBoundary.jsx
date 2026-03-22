import { Component } from 'react';
import { Link } from 'react-router-dom';

class ErrorBoundary extends Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('ErrorBoundary caught:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          className="min-vh-100 d-flex align-items-center justify-content-center text-center px-4"
          style={{ background: '#0A0A0F' }}
        >
          <div>
            <div
              className="d-inline-flex align-items-center justify-content-center rounded-circle mb-4"
              style={{
                width: 72, height: 72,
                background: 'rgba(220,53,69,0.1)',
                border: '1px solid rgba(220,53,69,0.25)'
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="none"
                viewBox="0 0 24 24" stroke="#dc3545" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
            </div>
            <h2
              className="fw-bold text-white mb-3"
              style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.75rem' }}
            >
              Something went wrong
            </h2>
            <p style={{ color: '#8B8FA8', fontSize: '0.875rem' }} className="mb-4">
              {this.state.error?.message || 'An unexpected error occurred.'}
            </p>
            <Link
              to="/"
              onClick={() => this.setState({ hasError: false })}
              className="btn fw-semibold px-5 py-2 rounded-3"
              style={{ background: '#F5A623', color: '#000' }}
            >
              Go Home
            </Link>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
