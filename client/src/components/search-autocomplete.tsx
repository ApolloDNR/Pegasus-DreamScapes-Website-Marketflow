import { useState, useEffect, useRef, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Search, 
  X, 
  Clock, 
  TrendingUp, 
  MapPin, 
  Home, 
  Building2,
  DollarSign,
  History
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SearchSuggestion {
  type: "recent" | "popular" | "location" | "property" | "price";
  value: string;
  label: string;
  count?: number;
}

interface SearchAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onSearch?: (value: string) => void;
  placeholder?: string;
  className?: string;
  suggestions?: SearchSuggestion[];
}

const STORAGE_KEY = "marketflow_search_history";
const MAX_HISTORY = 10;

function useSearchHistory() {
  const getHistory = (): string[] => {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return [];
      }
    }
    return [];
  };

  const addToHistory = (query: string) => {
    if (typeof window === 'undefined' || !query.trim()) return;
    const history = getHistory();
    const filtered = history.filter(h => h.toLowerCase() !== query.toLowerCase());
    const updated = [query, ...filtered].slice(0, MAX_HISTORY);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const removeFromHistory = (query: string) => {
    if (typeof window === 'undefined') return;
    const history = getHistory();
    const updated = history.filter(h => h !== query);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const clearHistory = () => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(STORAGE_KEY);
  };

  return { getHistory, addToHistory, removeFromHistory, clearHistory };
}

const defaultSuggestions: SearchSuggestion[] = [
  { type: "popular", value: "single family", label: "Single Family", count: 45 },
  { type: "popular", value: "multi-family", label: "Multi-Family", count: 23 },
  { type: "location", value: "Atlanta, GA", label: "Atlanta, GA", count: 18 },
  { type: "location", value: "Houston, TX", label: "Houston, TX", count: 15 },
  { type: "location", value: "Phoenix, AZ", label: "Phoenix, AZ", count: 12 },
  { type: "property", value: "fix and flip", label: "Fix and Flip", count: 28 },
  { type: "property", value: "rental ready", label: "Rental Ready", count: 14 },
  { type: "price", value: "under 100k", label: "Under $100K", count: 21 },
  { type: "price", value: "100k-250k", label: "$100K - $250K", count: 35 },
];

function getSuggestionIcon(type: string) {
  switch (type) {
    case "recent": return <Clock className="w-4 h-4 text-muted-foreground" />;
    case "popular": return <TrendingUp className="w-4 h-4 text-primary" />;
    case "location": return <MapPin className="w-4 h-4 text-blue-500" />;
    case "property": return <Home className="w-4 h-4 text-green-500" />;
    case "price": return <DollarSign className="w-4 h-4 text-amber-500" />;
    default: return <Search className="w-4 h-4" />;
  }
}

export function SearchAutocomplete({
  value,
  onChange,
  onSearch,
  placeholder = "Search deals...",
  className,
  suggestions = defaultSuggestions
}: SearchAutocompleteProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { getHistory, addToHistory, removeFromHistory } = useSearchHistory();

  const history = getHistory();
  
  const filteredSuggestions = value.trim() 
    ? suggestions.filter(s => 
        s.label.toLowerCase().includes(value.toLowerCase()) ||
        s.value.toLowerCase().includes(value.toLowerCase())
      )
    : [];

  const recentSearches: SearchSuggestion[] = history
    .filter(h => !value.trim() || h.toLowerCase().includes(value.toLowerCase()))
    .slice(0, 5)
    .map(h => ({ type: "recent" as const, value: h, label: h }));

  const allSuggestions = value.trim() 
    ? [...recentSearches, ...filteredSuggestions]
    : [...recentSearches, ...suggestions.slice(0, 6)];

  const handleSelect = (suggestion: SearchSuggestion) => {
    onChange(suggestion.value);
    addToHistory(suggestion.value);
    setIsOpen(false);
    onSearch?.(suggestion.value);
    inputRef.current?.blur();
  };

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (value.trim()) {
      addToHistory(value);
      onSearch?.(value);
      setIsOpen(false);
      inputRef.current?.blur();
    }
  };

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!isOpen) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev < allSuggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev > 0 ? prev - 1 : allSuggestions.length - 1
        );
        break;
      case "Enter":
        e.preventDefault();
        if (highlightedIndex >= 0 && allSuggestions[highlightedIndex]) {
          handleSelect(allSuggestions[highlightedIndex]);
        } else {
          handleSubmit();
        }
        break;
      case "Escape":
        setIsOpen(false);
        inputRef.current?.blur();
        break;
    }
  }, [isOpen, highlightedIndex, allSuggestions]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div 
      ref={containerRef} 
      className={cn("relative", className)}
      data-testid="search-autocomplete"
    >
      <form onSubmit={handleSubmit} className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          ref={inputRef}
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            setIsOpen(true);
            setHighlightedIndex(-1);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="pl-9 pr-9"
          data-testid="input-search"
        />
        {value && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
            onClick={() => {
              onChange("");
              inputRef.current?.focus();
            }}
            data-testid="button-clear-search"
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </form>

      {isOpen && allSuggestions.length > 0 && (
        <div 
          className="absolute top-full left-0 right-0 mt-1 bg-popover border rounded-md shadow-lg z-50"
          data-testid="dropdown-suggestions"
        >
          <ScrollArea className="max-h-[300px]">
            <div className="p-1">
              {recentSearches.length > 0 && !value.trim() && (
                <div className="px-2 py-1.5 text-xs text-muted-foreground font-medium flex items-center gap-1">
                  <History className="w-3 h-3" />
                  Recent Searches
                </div>
              )}
              
              {allSuggestions.map((suggestion, index) => (
                <div
                  key={`${suggestion.type}-${suggestion.value}`}
                  className={cn(
                    "flex items-center justify-between gap-2 px-2 py-2 rounded-sm cursor-pointer",
                    highlightedIndex === index ? "bg-accent" : "hover-elevate"
                  )}
                  onClick={() => handleSelect(suggestion)}
                  onMouseEnter={() => setHighlightedIndex(index)}
                  data-testid={`suggestion-${index}`}
                >
                  <div className="flex items-center gap-2">
                    {getSuggestionIcon(suggestion.type)}
                    <span className="text-sm">{suggestion.label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {suggestion.count && (
                      <Badge variant="secondary" className="text-[10px]">
                        {suggestion.count}
                      </Badge>
                    )}
                    {suggestion.type === "recent" && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-5 w-5"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeFromHistory(suggestion.value);
                        }}
                        data-testid={`remove-history-${index}`}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      )}
    </div>
  );
}

export function QuickSearchPill({ 
  label, 
  onClick, 
  active = false 
}: { 
  label: string; 
  onClick: () => void; 
  active?: boolean;
}) {
  return (
    <Badge
      variant={active ? "default" : "outline"}
      className="cursor-pointer hover-elevate"
      onClick={onClick}
      data-testid={`pill-${label.toLowerCase().replace(/\s/g, '-')}`}
    >
      {label}
    </Badge>
  );
}

export function SearchFiltersBar({
  onFilterSelect
}: {
  onFilterSelect: (filter: string) => void;
}) {
  const filters = [
    "Single Family",
    "Multi-Family",
    "Under $100K",
    "High ROI",
    "Fix & Flip",
    "Near Me"
  ];

  return (
    <div className="flex items-center gap-2 flex-wrap" data-testid="search-filters-bar">
      {filters.map(filter => (
        <QuickSearchPill
          key={filter}
          label={filter}
          onClick={() => onFilterSelect(filter.toLowerCase())}
        />
      ))}
    </div>
  );
}
