"use client";

import { Component, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  reset = () => {
    this.setState({ hasError: false });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex min-h-[400px] items-center justify-center p-8">
          <div className="glass-card-strong noise-bg w-full max-w-md rounded-xl border border-white/[0.06] p-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-violet-500/10 text-3xl">
              !
            </div>
            <h2 className="text-gradient mb-2 text-xl font-bold tracking-tight">
              something went wrong
            </h2>
            <p className="mb-6 text-sm text-muted-foreground">
              An unexpected error occurred. Please try again.
            </p>
            <button
              onClick={this.reset}
              className="font-pixel px-6 py-2.5 hover:-translate-x-0.5 hover:-translate-y-0.5 transition-transform"
              style={{
                background: "#FF4500",
                border: "2px solid #FFE27D",
                color: "#1A0F00",
                boxShadow: "3px 3px 0 #000, inset 0 6px 0 rgba(255,255,255,0.12), inset 0 -6px 0 rgba(0,0,0,0.2)",
                fontSize: 11,
                letterSpacing: 2,
              }}
            >
              Try Again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
