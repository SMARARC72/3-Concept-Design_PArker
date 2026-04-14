import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';

class RootErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Root error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-pj-cream text-pj-charcoal flex items-center justify-center px-6">
          <div className="max-w-xl rounded-2xl bg-white p-8 shadow-xl">
            <p className="text-sm uppercase tracking-[0.3em] text-pj-gold mb-3">
              Application Error
            </p>
            <h1 className="font-display text-4xl text-pj-navy mb-4">
              ParkerJoe could not finish loading
            </h1>
            <p className="text-pj-gray mb-6">
              Please refresh the page. If the issue persists, browser extensions
              or missing environment configuration may be interfering with the app.
            </p>
            <pre className="bg-pj-cream rounded-xl p-4 text-sm overflow-x-auto">
              {this.state.error?.message}
            </pre>
            <button
              onClick={() => window.location.reload()}
              className="mt-6 inline-flex items-center justify-center rounded-full bg-pj-navy px-6 py-3 text-white transition-colors hover:bg-pj-navy/90"
            >
              Refresh page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const rootElement = document.getElementById('root');

if (!rootElement) {
  console.error('Root element not found');
} else {
  const root = createRoot(rootElement);

  try {
    root.render(
      <RootErrorBoundary>
        <App />
      </RootErrorBoundary>
    );
  } catch (error) {
    console.error('Failed to render app:', error);
    rootElement.innerHTML = `
      <div style="padding: 24px; font-family: Inter, sans-serif; color: #1a1a1a;">
        <h1 style="margin-bottom: 12px;">Failed to load ParkerJoe</h1>
        <p style="margin-bottom: 16px;">Please refresh the page or check browser extensions that may be interfering with React.</p>
        <button onclick="window.location.reload()" style="padding: 12px 20px; border: none; border-radius: 9999px; background: #0f1f3c; color: #fff; cursor: pointer;">
          Retry
        </button>
      </div>
    `;
  }
}
