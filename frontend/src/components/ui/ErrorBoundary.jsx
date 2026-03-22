import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Chronix Error Boundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="container min-vh-100 d-flex flex-column align-items-center justify-content-center text-center p-4">
          <h1 className="font-display display-3 text-gold mb-4">A Momentary Interruption.</h1>
          <p className="text-t2 fs-5 mb-5" style={{ maxWidth: 500 }}>
            Even the finest mechanisms require adjustment. We've encountered an unexpected complication.
          </p>
          <button 
            onClick={() => window.location.href = '/'} 
            className="btn-chronix-primary py-3 px-5"
          >
            Reset Master Clock
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
