import { Component, type ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import { Link } from "wouter";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
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

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-[500px] flex items-center justify-center p-6 bg-background">
          <div className="max-w-md w-full text-center">
            <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full border border-primary/30 bg-primary/5">
              <AlertTriangle className="h-6 w-6 text-primary" />
            </div>
            <div className="inline-flex items-center gap-3 mb-5">
              <span className="h-px w-8 bg-primary/60" />
              <p className="text-[10px] uppercase tracking-[0.3em] text-primary font-supporting font-semibold">
                A wrinkle in the path
              </p>
              <span className="h-px w-8 bg-primary/60" />
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl font-semibold tracking-tight leading-tight mb-4 text-foreground">
              Something didn't load.
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-8">
              We hit an unexpected error rendering this view. Try again, or head back to a known-good surface.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button onClick={this.handleReset} variant="outline" className="gap-2 min-h-[44px] px-6 border-primary/30 hover:border-primary hover:bg-primary/5">
                <RefreshCw className="h-4 w-4 text-primary" />
                Try again
              </Button>
              <Link href="/">
                <Button className="gap-2 w-full sm:w-auto min-h-[44px] px-6 bg-primary hover:bg-primary/90">
                  <Home className="h-4 w-4" />
                  Back to home
                </Button>
              </Link>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

interface QueryErrorFallbackProps {
  error: Error | null;
  onRetry?: () => void;
  title?: string;
  description?: string;
}

export function QueryErrorFallback({ 
  error, 
  onRetry, 
  title = "Failed to load data",
  description = "There was a problem loading this content. Please try again."
}: QueryErrorFallbackProps) {
  const isNotFound = error?.message?.includes("404");
  const isUnauthorized = error?.message?.includes("401") || error?.message?.includes("403");

  if (isNotFound) {
    return (
      <div className="min-h-[300px] flex items-center justify-center p-6">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center space-y-4">
            <p className="text-muted-foreground">
              The requested item could not be found. It may have been removed or you may not have access.
            </p>
            <Link href="/marketflow">
              <Button variant="outline" className="gap-2">
                <Home className="h-4 w-4" />
                Return to Dashboard
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isUnauthorized) {
    return (
      <div className="min-h-[300px] flex items-center justify-center p-6">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center space-y-4">
            <p className="text-muted-foreground">
              You need to be signed in to view this content.
            </p>
            <Link href="/login">
              <Button className="gap-2">
                Sign In
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-[300px] flex items-center justify-center p-6">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10">
            <AlertTriangle className="h-5 w-5 text-destructive" />
          </div>
          <CardTitle className="text-lg">{title}</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-muted-foreground text-sm">{description}</p>
          {onRetry && (
            <Button onClick={onRetry} variant="outline" className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Try Again
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export function LoadingSpinner({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center ${className}`} role="status" aria-label="Loading">
      <div className="relative h-10 w-10">
        <div className="absolute inset-0 rounded-full border-2 border-primary/15" />
        <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-primary animate-spin" />
      </div>
    </div>
  );
}

export function PageLoader({ message = "Reading the situation…" }: { message?: string }) {
  return (
    <div className="min-h-[400px] flex flex-col items-center justify-center gap-5">
      <LoadingSpinner />
      <p className="text-[10px] uppercase tracking-[0.3em] text-primary font-supporting font-semibold">
        {message}
      </p>
    </div>
  );
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action
}: {
  icon?: React.ComponentType<{ className?: string }>;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="min-h-[300px] flex flex-col items-center justify-center p-6 text-center">
      {Icon && (
        <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-full border border-primary/30 bg-primary/5">
          <Icon className="h-6 w-6 text-primary" />
        </div>
      )}
      <div className="inline-flex items-center gap-3 mb-4">
        <span className="h-px w-8 bg-primary/60" />
        <p className="text-[10px] uppercase tracking-[0.3em] text-primary font-supporting font-semibold">
          Nothing here yet
        </p>
        <span className="h-px w-8 bg-primary/60" />
      </div>
      <h3 className="font-serif text-2xl sm:text-3xl font-semibold tracking-tight leading-tight mb-3 text-foreground">
        {title}
      </h3>
      {description && (
        <p className="text-muted-foreground text-sm max-w-md mb-5 leading-relaxed">{description}</p>
      )}
      {action}
    </div>
  );
}
