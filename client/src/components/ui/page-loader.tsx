import { Loader2 } from "lucide-react";

interface PageLoaderProps {
  message?: string;
  className?: string;
}

export function PageLoader({ message = "Loading...", className = "" }: PageLoaderProps) {
  return (
    <div className={`min-h-[400px] flex flex-col items-center justify-center gap-4 ${className}`} data-testid="page-loader">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="text-muted-foreground text-sm">{message}</p>
    </div>
  );
}

interface FullPageLoaderProps {
  message?: string;
}

export function FullPageLoader({ message = "Loading..." }: FullPageLoaderProps) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4" data-testid="full-page-loader">
      <Loader2 className="h-10 w-10 animate-spin text-primary" />
      <p className="text-muted-foreground">{message}</p>
    </div>
  );
}

interface ButtonLoaderProps {
  className?: string;
}

export function ButtonLoader({ className = "" }: ButtonLoaderProps) {
  return <Loader2 className={`h-4 w-4 animate-spin ${className}`} />;
}
