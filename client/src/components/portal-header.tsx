import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Shield, 
  TrendingUp, 
  Building2, 
  ShoppingBag,
  ChevronDown,
  Home,
  LogOut,
  User,
  Repeat,
  Hammer
} from "lucide-react";
import { useSupabaseAuth } from "@/contexts/supabase-auth-context";
import { NotificationBell } from "@/components/notification-bell";

interface PortalHeaderProps {
  currentPortal: "staff" | "investor" | "wholesaler" | "buyer" | "dreamscaper";
}

export function PortalHeader({ currentPortal }: PortalHeaderProps) {
  const { isAdmin, isInvestor, isWholesaler, isBuyer, isDreamscaper } = useSupabaseAuth();
  const [, setLocation] = useLocation();

  const portals = [
    {
      id: "staff",
      title: "Dreamscaper HQ",
      icon: Shield,
      href: "/dealflow/hq",
      available: isAdmin,
      badge: "Staff",
      color: "bg-blue-600",
    },
    {
      id: "investor",
      title: "Investor Dealflow",
      icon: TrendingUp,
      href: "/dealflow/office",
      available: isInvestor,
      badge: "Investor",
      color: "bg-green-600",
    },
    {
      id: "wholesaler",
      title: "Wholesaler Dealflow",
      icon: Building2,
      href: "/dealflow/office",
      available: isWholesaler,
      badge: "Wholesaler",
      color: "bg-purple-600",
    },
    {
      id: "buyer",
      title: "Buyer Dealflow",
      icon: ShoppingBag,
      href: "/dealflow/office",
      available: isBuyer,
      badge: "Buyer",
      color: "bg-orange-600",
    },
    {
      id: "dreamscaper",
      title: "Dreamscaper Portal",
      icon: Hammer,
      href: "/portal/dreamscaper",
      available: isDreamscaper,
      badge: "Operator",
      color: "bg-amber-600",
    },
  ];

  const currentPortalInfo = portals.find(p => p.id === currentPortal);
  const availablePortals = portals.filter(p => p.available && p.id !== currentPortal);

  return (
    <div className="flex items-center gap-4 flex-wrap">
      {currentPortalInfo && (
        <Badge className={`${currentPortalInfo.color} flex items-center gap-1`}>
          <currentPortalInfo.icon className="w-3 h-3" />
          {currentPortalInfo.badge}
        </Badge>
      )}
      
      <NotificationBell />
      
      {availablePortals.length > 0 && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" data-testid="button-switch-portal">
              <Repeat className="w-4 h-4 mr-2" />
              Switch Portal
              <ChevronDown className="w-4 h-4 ml-2" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Your Portals</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {availablePortals.map(portal => (
              <DropdownMenuItem 
                key={portal.id}
                onClick={() => setLocation(portal.href)}
                className="cursor-pointer"
                data-testid={`menu-portal-${portal.id}`}
              >
                <portal.icon className="w-4 h-4 mr-2" />
                {portal.title}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={() => setLocation("/portal")}
              className="cursor-pointer"
            >
              <Home className="w-4 h-4 mr-2" />
              Portal Home
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}

      <Link href="/">
        <Button variant="ghost" size="sm">
          <Home className="w-4 h-4 mr-2" />
          Main Site
        </Button>
      </Link>

      <a href="/api/logout">
        <Button variant="ghost" size="sm">
          <LogOut className="w-4 h-4 mr-2" />
          Sign Out
        </Button>
      </a>
    </div>
  );
}
