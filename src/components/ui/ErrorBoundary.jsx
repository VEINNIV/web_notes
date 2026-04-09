import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('[NoteFlow] Uncaught error:', error, info.componentStack);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', height: '100vh', gap: 16,
        background: 'var(--bg)', color: 'var(--text)', fontFamily: 'var(--font)',
        padding: 32, textAlign: 'center',
      }}>
        <AlertCircle size={48} color="var(--danger)" />
        <h2 style={{ fontSize: 20, fontWeight: 600 }}>Something went wrong</h2>
        <p style={{ color: 'var(--text-muted)', maxWidth: 420, lineHeight: 1.5 }}>
          An unexpected error occurred. Your data is safely stored in IndexedDB.
        </p>
        <code style={{
          fontSize: 12, padding: '8px 16px', background: 'var(--surface-2)',
          borderRadius: 8, color: 'var(--danger)', maxWidth: 500,
          overflow: 'auto', whiteSpace: 'pre-wrap',
        }}>
          {this.state.error?.message}
        </code>
        <button
          onClick={this.handleReset}
          style={{
            marginTop: 8, display: 'flex', alignItems: 'center', gap: 8,
            padding: '10px 20px', background: 'var(--accent)', color: '#fff',
            border: 'none', borderRadius: 10, cursor: 'pointer',
            fontWeight: 600, fontSize: 14,
          }}
        >
          <RefreshCw size={16} /> Try Again
        </button>
      </div>
    );
  }
}
