import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { useSupabaseAuth } from "./supabase-auth-context";

interface EditModeContextType {
  isEditMode: boolean;
  toggleEditMode: () => void;
  canEdit: boolean;
}

const EditModeContext = createContext<EditModeContextType | null>(null);

export function EditModeProvider({ children }: { children: ReactNode }) {
  const [isEditMode, setIsEditMode] = useState(false);
  // Use auth context's isAdmin as single source of truth (derived from backend)
  const { isAdmin } = useSupabaseAuth();
  
  useEffect(() => {
    if (!isAdmin && isEditMode) {
      setIsEditMode(false);
    }
  }, [isAdmin, isEditMode]);

  const toggleEditMode = () => {
    if (isAdmin) {
      setIsEditMode((prev) => !prev);
    }
  };

  return (
    <EditModeContext.Provider value={{
      isEditMode,
      toggleEditMode,
      canEdit: isAdmin,
    }}>
      {children}
    </EditModeContext.Provider>
  );
}

export function useEditMode() {
  const context = useContext(EditModeContext);
  if (!context) {
    throw new Error("useEditMode must be used within an EditModeProvider");
  }
  return context;
}
