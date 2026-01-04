import { useEffect } from "react";
import { useLocation } from "wouter";
import { useSupabaseAuth } from "@/contexts/supabase-auth-context";
import { Loader2 } from "lucide-react";

export default function Dashboard() {
  const { user, isLoading } = useSupabaseAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (isLoading) return;

    if (!user) {
      setLocation("/login");
      return;
    }

    const role = user.user_metadata?.role || "investor";

    switch (role) {
      case "admin":
      case "pegasus_wholesaler":
      case "pegasus_dreamscaper":
        setLocation("/marketflow/admin");
        break;
      case "wholesaler":
        setLocation("/marketflow/wholesaler");
        break;
      case "dreamscaper":
        setLocation("/marketflow/dreamscaper");
        break;
      case "investor":
        setLocation("/marketflow/investor");
        break;
      case "buyer_retail":
      case "buyer_investment":
        setLocation("/marketflow/buyer");
        break;
      default:
        setLocation("/marketflow");
    }
  }, [user, isLoading, setLocation]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
        <p className="text-muted-foreground">Redirecting to your dashboard...</p>
      </div>
    </div>
  );
}
