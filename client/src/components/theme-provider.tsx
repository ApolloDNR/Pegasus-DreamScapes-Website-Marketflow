import { createContext, useContext, useEffect } from "react";

interface ThemeProviderContextProps {
  theme: "dark";
  resolvedTheme: "dark";
}

const ThemeProviderContext = createContext<ThemeProviderContextProps>({
  theme: "dark",
  resolvedTheme: "dark",
});

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: string;
  storageKey?: string;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("light", "system");
    root.classList.add("dark");
    localStorage.removeItem("pegasus-ui-theme");
  }, []);

  return (
    <ThemeProviderContext.Provider value={{ theme: "dark", resolvedTheme: "dark" }}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeProviderContext);
}
