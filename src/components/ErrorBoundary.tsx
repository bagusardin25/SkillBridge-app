import { Component } from "react";
import type { ErrorInfo, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCcw } from "lucide-react";

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error in ErrorBoundary:", error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = "/"; // Redirect to home or reload
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <div className="max-w-md w-full text-center space-y-6">
            <div className="flex justify-center">
              <div className="h-20 w-20 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                <AlertTriangle className="h-10 w-10 text-red-600 dark:text-red-400" />
              </div>
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-bold tracking-tight">Oops! Something went wrong</h1>
              <p className="text-muted-foreground">
                We're sorry, but an unexpected error occurred. Our team has been notified.
              </p>
            </div>
            
            {import.meta.env.DEV && this.state.error && (
              <div className="text-left bg-muted p-4 rounded-lg overflow-auto max-h-40 text-xs font-mono">
                <p className="text-red-500 font-semibold mb-2">{this.state.error.toString()}</p>
                {this.state.error.stack?.split("\n").map((line, i) => (
                  <div key={i} className="text-muted-foreground break-all">{line}</div>
                ))}
              </div>
            )}

            <Button onClick={this.handleReset} size="lg" className="w-full gap-2 font-medium">
              <RefreshCcw className="h-4 w-4" />
              Return to Home
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
