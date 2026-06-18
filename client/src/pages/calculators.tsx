import { Redirect } from "wouter";

// The standalone "classic" calculator suite has been folded into the unified
// Strategy Lab. Its calculator UI now lives in
// `client/src/components/strategy-lab/calculator-tools-panel.tsx` and renders
// in-page under the Lab's "Quick Tools" work area.
//
// `/strategy-lab/classic` (and the legacy `/calculators` redirect) now forward
// into the Lab's Quick Tools, preserving any `?tab=` deep link.
export default function Calculators() {
  const search = typeof window !== "undefined" ? window.location.search : "";
  const tab = new URLSearchParams(search).get("tab");
  const to = tab
    ? `/strategy-lab?tool=calculators&tab=${encodeURIComponent(tab)}`
    : "/strategy-lab?tool=calculators";
  return <Redirect to={to} />;
}
