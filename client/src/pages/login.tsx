import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  LogIn, 
  ArrowLeft,
  LayoutDashboard,
  FileText,
  TrendingUp,
  Bell
} from "lucide-react";

export default function Login() {
  return (
    <div className="min-h-screen pt-16">
      <section className="py-20 lg:py-32 relative">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-primary/5" />
        <div className="relative max-w-7xl mx-auto px-6">
          <div className="max-w-md mx-auto text-center mb-12">
            <h1 className="text-4xl sm:text-5xl font-bold mb-6" data-testid="text-login-hero">
              Pegasus HQ
            </h1>
            <p className="text-lg text-muted-foreground">
              Access your investment dashboard, track projects, and manage your partnership with Pegasus Dreamscapes.
            </p>
          </div>

          <Card className="max-w-md mx-auto">
            <CardHeader className="text-center pb-2">
              <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <LogIn className="w-8 h-8 text-primary" />
              </div>
              <CardTitle className="text-2xl">Welcome Back</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 pt-4">
              <p className="text-center text-muted-foreground">
                Pegasus HQ is currently in development. Our investor portal will provide secure access to:
              </p>

              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-secondary/50 rounded-lg">
                  <LayoutDashboard className="w-5 h-5 text-primary" />
                  <span className="text-sm">Project dashboards & updates</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-secondary/50 rounded-lg">
                  <FileText className="w-5 h-5 text-primary" />
                  <span className="text-sm">Investment documents & reports</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-secondary/50 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  <span className="text-sm">Performance metrics & analytics</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-secondary/50 rounded-lg">
                  <Bell className="w-5 h-5 text-primary" />
                  <span className="text-sm">Real-time notifications</span>
                </div>
              </div>

              <div className="pt-4 border-t border-border">
                <p className="text-center text-sm text-muted-foreground mb-4">
                  Interested in becoming an investor?
                </p>
                <div className="flex flex-col gap-3">
                  <Link href="/invest">
                    <Button className="w-full" data-testid="button-login-invest">
                      Learn About Investing
                    </Button>
                  </Link>
                  <Link href="/">
                    <Button variant="ghost" className="w-full" data-testid="button-login-home">
                      <ArrowLeft className="mr-2 w-4 h-4" />
                      Back to Home
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
