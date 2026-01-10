import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface DemoModeContextValue {
  isDemoMode: boolean;
  enableDemoMode: () => void;
  disableDemoMode: () => void;
  showDemoPrompt: boolean;
  setShowDemoPrompt: (show: boolean) => void;
}

const DemoModeContext = createContext<DemoModeContextValue | undefined>(undefined);

export function DemoModeProvider({ children }: { children: ReactNode }) {
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [showDemoPrompt, setShowDemoPrompt] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("pegasus_demo_mode");
    if (stored === "true") {
      setIsDemoMode(true);
    }
  }, []);

  const enableDemoMode = () => {
    setIsDemoMode(true);
    localStorage.setItem("pegasus_demo_mode", "true");
    setShowDemoPrompt(false);
  };

  const disableDemoMode = () => {
    setIsDemoMode(false);
    localStorage.removeItem("pegasus_demo_mode");
  };

  return (
    <DemoModeContext.Provider
      value={{
        isDemoMode,
        enableDemoMode,
        disableDemoMode,
        showDemoPrompt,
        setShowDemoPrompt,
      }}
    >
      {children}
    </DemoModeContext.Provider>
  );
}

export function useDemoMode() {
  const context = useContext(DemoModeContext);
  if (!context) {
    throw new Error("useDemoMode must be used within a DemoModeProvider");
  }
  return context;
}
