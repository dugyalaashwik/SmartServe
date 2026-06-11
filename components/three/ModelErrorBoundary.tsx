"use client";

import { Component, type ReactNode } from "react";

interface Props {
  fallback: ReactNode;
  children: ReactNode;
  label?: string;
}

interface State {
  hasError: boolean;
}

/**
 * Catches errors thrown by `useGLTF` (e.g. when a model file doesn't exist
 * yet in /public/models) and renders the primitive fallback instead, so the
 * page stays usable while you're sourcing assets.
 *
 * React doesn't have a hooks-based error boundary — has to be a class.
 */
export class ModelErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: unknown): void {
    if (process.env.NODE_ENV !== "production") {
      // Surface the failure once during dev so it's obvious which model is missing.
      const label = this.props.label ?? "model";
      // eslint-disable-next-line no-console
      console.warn(
        `[Smart Serve] GLB for "${label}" failed to load — falling back to primitive.`,
        error,
      );
    }
  }

  render() {
    if (this.state.hasError) return this.props.fallback;
    return this.props.children;
  }
}
