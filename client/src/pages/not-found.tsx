import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen pt-16 flex items-center justify-center">
      <div className="max-w-md mx-auto px-6 text-center">
        <div className="text-9xl font-bold text-primary/20 mb-4">404</div>
        <h1 className="text-3xl font-bold mb-4" data-testid="text-404-title">Page Not Found</h1>
        <p className="text-muted-foreground mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/">
            <Button data-testid="button-404-home">
              <Home className="mr-2 w-4 h-4" />
              Back to Home
            </Button>
          </Link>
          <Button variant="outline" onClick={() => window.history.back()} data-testid="button-404-back">
            <ArrowLeft className="mr-2 w-4 h-4" />
            Go Back
          </Button>
        </div>
      </div>
    </div>
  );
}
