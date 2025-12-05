import { useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Building2, 
  TrendingUp, 
  Users, 
  ArrowRight, 
  Shield,
  Loader2,
  LogIn,
  ShoppingBag
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export default function PortalSelect() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading && isAuthenticated && user) {
      // Only auto-redirect if user has exactly one portal role
      const portalRoles = [user.isStaff, user.isInvestor, user.isWholesaler, user.isBuyer].filter(Boolean);
      if (portalRoles.length === 1) {
        if (user.isStaff) {
          setLocation("/dealflow/hq");
        } else if (user.isInvestor || user.isWholesaler || user.isBuyer) {
          // Non-staff users go to Dealflow
          setLocation("/dealflow/office");
        }
      } else if (portalRoles.length > 1 && !user.isStaff) {
        // Multiple roles but not staff - go to Dealflow
        setLocation("/dealflow/office");
      }
    }
  }, [isLoading, isAuthenticated, user, setLocation]);

  if (isLoading) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen pt-20">
        <div className="max-w-3xl mx-auto px-6 py-20 text-center">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
            <LogIn className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-3xl font-bold mb-4">Sign In to Access Your Portal</h1>
          <p className="text-muted-foreground mb-8">
            Log in with your Replit account to access your investor or wholesaler portal.
          </p>
          <a href="/api/login?returnTo=/portal">
            <Button size="lg" data-testid="button-portal-login">
              Sign In
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </a>
        </div>
      </div>
    );
  }

  const portals = [
    {
      id: "staff",
      title: "Dreamscaper HQ",
      description: "Access the Pegasus Dreamscapes headquarters dashboard for lead management, deal tracking, and team operations.",
      icon: Shield,
      href: "/dealflow/hq",
      badge: "Staff Only",
      badgeColor: "bg-blue-600",
      available: user?.isStaff,
      registerHref: null,
    },
    {
      id: "investor",
      title: "Investor Dealflow",
      description: "View investment opportunities, track your portfolio, and discover deals matched to your criteria.",
      icon: TrendingUp,
      href: "/dealflow/office",
      badge: "Investors",
      badgeColor: "bg-green-600",
      available: user?.isInvestor,
      registerHref: "/invest",
    },
    {
      id: "wholesaler",
      title: "Wholesaler Dealflow",
      description: "Post deals, track assignments, and connect with buyers and investors.",
      icon: Building2,
      href: "/dealflow/office",
      badge: "Wholesalers",
      badgeColor: "bg-purple-600",
      available: user?.isWholesaler,
      registerHref: "/dealflow/office",
    },
    {
      id: "buyer",
      title: "Buyer Dealflow",
      description: "Browse wholesale deals and renovated properties, save favorites, and submit offers.",
      icon: ShoppingBag,
      href: "/dealflow/office",
      badge: "Buyers",
      badgeColor: "bg-orange-600",
      available: user?.isBuyer,
      registerHref: "/buyers",
    },
  ];

  return (
    <div className="min-h-screen pt-20">
      <section className="py-20 lg:py-32">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-16">
            <Badge variant="secondary" className="mb-6 text-xs uppercase tracking-[0.2em]">
              <Users className="w-3 h-3 mr-2" />
              Member Access
            </Badge>
            <h1 className="text-4xl sm:text-5xl font-bold mb-4" data-testid="text-portal-title">
              Select Your Portal
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Welcome back, {user?.firstName || "Member"}. Choose your dashboard to continue.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {portals.map((portal) => (
              <Card 
                key={portal.id} 
                className={`sleek-card transition-all duration-300 ${
                  portal.available ? "hover:shadow-lg" : "opacity-50"
                }`}
                data-testid={`card-portal-${portal.id}`}
              >
                <CardHeader>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <portal.icon className="w-6 h-6 text-primary" />
                    </div>
                    <Badge className={portal.badgeColor}>{portal.badge}</Badge>
                  </div>
                  <CardTitle className="text-xl">{portal.title}</CardTitle>
                  <CardDescription className="text-sm">
                    {portal.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {portal.available ? (
                    <Link href={portal.href}>
                      <Button className="w-full" data-testid={`button-enter-${portal.id}`}>
                        Enter Portal
                        <ArrowRight className="ml-2 w-4 h-4" />
                      </Button>
                    </Link>
                  ) : portal.registerHref ? (
                    <Link href={portal.registerHref}>
                      <Button className="w-full" variant="outline" data-testid={`button-register-${portal.id}`}>
                        Register Now
                        <ArrowRight className="ml-2 w-4 h-4" />
                      </Button>
                    </Link>
                  ) : (
                    <Button className="w-full" disabled variant="secondary">
                      Staff Access Required
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {!user?.isInvestor && !user?.isWholesaler && !user?.isBuyer && !user?.isStaff && (
            <div className="mt-12 text-center">
              <p className="text-muted-foreground mb-4">
                Don't have a portal account yet? Choose your role to get started.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center flex-wrap">
                <Link href="/portal/investor">
                  <Button variant="outline" data-testid="button-register-investor">
                    Register as Investor
                  </Button>
                </Link>
                <Link href="/portal/wholesaler">
                  <Button variant="outline" data-testid="button-register-wholesaler">
                    Register as Wholesaler
                  </Button>
                </Link>
                <Link href="/portal/buyer">
                  <Button variant="outline" data-testid="button-register-buyer">
                    Register as Buyer
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
