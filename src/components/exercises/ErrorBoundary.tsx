// ExamForge — ErrorBoundary Component
// Catches rendering errors in child components and shows a fallback with retry button

"use client";

import { Component, type ErrorInfo, type ReactNode } from "react";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error("[ErrorBoundary] Caught rendering error:", error, errorInfo);
    this.props.onError?.(error, errorInfo);
  }

  handleRetry = (): void => {
    this.setState({ hasError: false, error: null });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div
          className="rounded-xl border border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/30 p-8 text-center space-y-4"
          role="alert"
        >
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-red-800 dark:text-red-200">
              Something went wrong
            </h3>
            <p className="text-sm text-red-600 dark:text-red-400 max-w-md mx-auto">
              An unexpected error occurred while rendering this section.
              {this.state.error && process.env.NODE_ENV === "development" && (
                <span className="block mt-2 font-mono text-xs opacity-75">
                  {this.state.error.message}
                </span>
              )}
            </p>
          </div>
          <button
            onClick={this.handleRetry}
            className="inline-flex items-center justify-center rounded-lg bg-red-600 px-6 py-2 text-sm font-medium text-white hover:bg-red-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
            type="button"
          >
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
