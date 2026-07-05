"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { Button, Card, CardBody, CardHeader } from "@heroui/react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo });
    console.error("ErrorBoundary caught an error:", error, errorInfo);

    // Save to localStorage for diagnostic logs
    try {
      const errData = {
        type: "react_render_error",
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        route: typeof window !== "undefined" ? window.location.href : "",
        time: new Date().toISOString(),
      };
      localStorage.setItem("last_client_error", JSON.stringify(errData));
    } catch (e) {
      // Ignore storage errors
    }
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    if (typeof window !== "undefined") {
      window.location.reload();
    }
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-neutral-900 text-white p-6">
          <Card className="w-full max-w-2xl bg-neutral-800 border border-neutral-700/50 shadow-2xl rounded-2xl">
            <CardHeader className="flex flex-col gap-2 pt-6 px-6 pb-2">
              <h2 className="text-2xl font-extrabold text-red-500">
                Application Error
              </h2>
              <p className="text-sm text-neutral-400">
                A client-side exception occurred while rendering the page.
              </p>
            </CardHeader>
            <CardBody className="flex flex-col gap-6 px-6 pb-6 pt-2">
              <div className="bg-black/40 border border-black/20 rounded-xl p-4 font-mono text-xs overflow-x-auto text-red-400 select-all max-h-60">
                <div className="font-bold text-red-300 mb-1">
                  Error: {this.state.error?.message || "Unknown error"}
                </div>
                {this.state.error?.stack && (
                  <pre className="whitespace-pre-wrap mt-2 select-text opacity-85">
                    {this.state.error.stack}
                  </pre>
                )}
                {this.state.errorInfo?.componentStack && (
                  <pre className="whitespace-pre-wrap mt-4 select-text text-neutral-400">
                    Component Stack:
                    {this.state.errorInfo.componentStack}
                  </pre>
                )}
              </div>
              <div className="flex gap-4">
                <Button
                  onPress={this.handleReset}
                  className="bg-[#33525c] hover:bg-[#33525c]/90 text-white font-bold px-6 h-12 rounded-xl transition-colors w-full"
                >
                  Reload Page
                </Button>
                <Button
                  onPress={() => {
                    if (typeof window !== "undefined") {
                      window.location.href = "/";
                    }
                  }}
                  variant="flat"
                  className="bg-neutral-700 hover:bg-neutral-600 text-white font-bold px-6 h-12 rounded-xl transition-colors w-full"
                >
                  Back to Home
                </Button>
              </div>
            </CardBody>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
