import { useEffect } from "react";
import { Redirect, useLocation } from "wouter";

// Retired public route. The live surface is /deal-strategy; this file stays as
// a minimal safety net for tests or stale client-side imports.
export default function DealArchitectureRedirect() {
  const [, setLocation] = useLocation();

  useEffect(() => {
    setLocation("/deal-strategy");
  }, [setLocation]);

  return <Redirect to="/deal-strategy" />;
}
