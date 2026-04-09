import React from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Error boundary for the root
class RootErrorBoundary extends React.Component<{children: React.ReactNode}, {hasError: boolean, error?: Error}> {
  constructor(props: {children: React.ReactNode}) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Root error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{padding: '20px', fontFamily: 'sans-serif'}}>
          <h1>Something went wrong</h1>
          <p>Please refresh the page or try again later.</p>
          <pre style={{background: '#f5f5f5', padding: '10px', borderRadius: '4px'}}>
            {this.state.error?.message}
          </pre>
          <button onClick={() => window.location.reload()}>Refresh Page</button>
        </div>
      )
    }
    return this.props.children
  }
}

const rootElement = document.getElementById('root')

if (!rootElement) {
  console.error('Root element not found!')
} else {
  const root = createRoot(rootElement)
  
  // Wrap in try-catch for initialization errors
  try {
    root.render(
      <RootErrorBoundary>
        <App />
      </RootErrorBoundary>
    )
  } catch (error) {
    console.error('Failed to render app:', error)
    rootElement.innerHTML = `
      <div style="padding: 20px; font-family: sans-serif;">
        <h1>Failed to load application</h1>
        <p>Please check your browser extensions or try a different browser.</p>
        <button onclick="window.location.reload()">Retry</button>
      </div>
    `
  }
}
