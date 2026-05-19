import { useEffect } from "react";
import type { SavedAnalysis } from "@shared/schema";

const EVT = "calc:load";

export function dispatchCalcLoad(a: SavedAnalysis) {
  window.dispatchEvent(new CustomEvent<SavedAnalysis>(EVT, { detail: a }));
}

export function useCalcLoad(
  calculatorType: string,
  apply: (inputs: Record<string, unknown>, analysis: SavedAnalysis) => void,
) {
  useEffect(() => {
    function handler(e: Event) {
      const ce = e as CustomEvent<SavedAnalysis>;
      if (!ce.detail || ce.detail.calculatorType !== calculatorType) return;
      const inputs = (ce.detail.inputs ?? {}) as Record<string, unknown>;
      apply(inputs, ce.detail);
    }
    window.addEventListener(EVT, handler as EventListener);
    return () => window.removeEventListener(EVT, handler as EventListener);
  }, [calculatorType, apply]);
}
