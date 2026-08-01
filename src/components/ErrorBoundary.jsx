import { Component } from 'react'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center h-full gap-4 text-center px-4">
          <div className="text-red-400 font-mono text-sm font-bold">Something went wrong.</div>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="px-4 py-2 rounded-lg text-xs font-mono border border-white/10 text-slate-400"
          >
            Try again
          </button>
        </div>
      )
    }
    return this.props.children
  }
}