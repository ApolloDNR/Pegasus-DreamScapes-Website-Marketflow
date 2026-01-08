import { useEffect, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";

interface ShortcutAction {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  action: () => void;
  description: string;
  category: "navigation" | "actions" | "view" | "search";
}

interface UseKeyboardShortcutsOptions {
  enabled?: boolean;
  shortcuts: ShortcutAction[];
}

export function useKeyboardShortcuts({ enabled = true, shortcuts }: UseKeyboardShortcutsOptions) {
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!enabled) return;
    
    const target = event.target as HTMLElement;
    const isInput = target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable;
    
    if (isInput && event.key !== "Escape") return;

    for (const shortcut of shortcuts) {
      const keyMatch = event.key.toLowerCase() === shortcut.key.toLowerCase();
      const ctrlMatch = shortcut.ctrl ? (event.ctrlKey || event.metaKey) : !(event.ctrlKey || event.metaKey);
      const shiftMatch = shortcut.shift ? event.shiftKey : !event.shiftKey;
      const altMatch = shortcut.alt ? event.altKey : !event.altKey;

      if (keyMatch && ctrlMatch && shiftMatch && altMatch) {
        event.preventDefault();
        shortcut.action();
        return;
      }
    }
  }, [enabled, shortcuts]);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);
}

export function useMarketflowShortcuts({
  onSave,
  onCompare,
  onNext,
  onPrevious,
  onSearch,
  onViewToggle,
  onEscape,
  onHelp,
  enabled = true
}: {
  onSave?: () => void;
  onCompare?: () => void;
  onNext?: () => void;
  onPrevious?: () => void;
  onSearch?: () => void;
  onViewToggle?: () => void;
  onEscape?: () => void;
  onHelp?: () => void;
  enabled?: boolean;
}) {
  const { toast } = useToast();

  const shortcuts: ShortcutAction[] = [
    ...(onSave ? [{
      key: "s",
      action: onSave,
      description: "Save current deal",
      category: "actions" as const
    }] : []),
    ...(onCompare ? [{
      key: "c",
      action: onCompare,
      description: "Add to compare",
      category: "actions" as const
    }] : []),
    ...(onNext ? [{
      key: "ArrowRight",
      action: onNext,
      description: "Next deal",
      category: "navigation" as const
    }, {
      key: "j",
      action: onNext,
      description: "Next deal",
      category: "navigation" as const
    }] : []),
    ...(onPrevious ? [{
      key: "ArrowLeft",
      action: onPrevious,
      description: "Previous deal",
      category: "navigation" as const
    }, {
      key: "k",
      action: onPrevious,
      description: "Previous deal",
      category: "navigation" as const
    }] : []),
    ...(onSearch ? [{
      key: "/",
      action: onSearch,
      description: "Focus search",
      category: "search" as const
    }] : []),
    ...(onViewToggle ? [{
      key: "v",
      action: onViewToggle,
      description: "Toggle view mode",
      category: "view" as const
    }] : []),
    ...(onEscape ? [{
      key: "Escape",
      action: onEscape,
      description: "Close modal / Clear selection",
      category: "navigation" as const
    }] : []),
    ...(onHelp ? [{
      key: "?",
      shift: true,
      action: onHelp,
      description: "Show keyboard shortcuts",
      category: "navigation" as const
    }] : [])
  ];

  useKeyboardShortcuts({ enabled, shortcuts });

  return { shortcuts };
}

export const SHORTCUT_REFERENCE = [
  { key: "M", description: "Toggle map view", category: "View" },
  { key: "V", description: "Toggle Grid/Swipe view", category: "View" },
  { key: "E", description: "Export deals", category: "Actions" },
  { key: "S", description: "Save search", category: "Actions" },
  { key: "/", description: "Focus search", category: "Search" },
  { key: "Esc", description: "Close modal / Clear", category: "Navigation" },
  { key: "?", description: "Show shortcuts help", category: "Help" },
];
