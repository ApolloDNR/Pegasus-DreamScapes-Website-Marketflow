import { useState, useRef, useEffect, useCallback } from "react";
import { useLocation } from "wouter";
import { useMutation, useQuery } from "@tanstack/react-query";
import { createPortal } from "react-dom";
import { apiRequest } from "@/lib/queryClient";
import { usePeggyContext, type PeggyContextData } from "@/contexts/peggy-context";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { motion, AnimatePresence, useDragControls, PanInfo } from "framer-motion";
import { 
  MessageCircle, 
  X, 
  Send, 
  Sparkles, 
  ThumbsUp, 
  ThumbsDown,
  Minimize2,
  Maximize2,
  RotateCcw,
  GripHorizontal,
  Home,
  Calculator,
  TrendingUp,
  Building2,
  HelpCircle,
  Lightbulb,
  Target,
  ChevronDown,
  ChevronUp,
  Bot,
  DollarSign,
  Hammer,
  BookOpen,
  Network,
  GitBranch
} from "lucide-react";
import { cn } from "@/lib/utils";

const DOCK_STORAGE_KEY = 'peggy_dock_position';
const DEFAULT_POSITION = { x: 0, y: 0 };

interface DockPosition {
  x: number;
  y: number;
}

function loadDockPosition(): DockPosition {
  try {
    const stored = localStorage.getItem(DOCK_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('Failed to load dock position:', e);
  }
  return DEFAULT_POSITION;
}

function saveDockPosition(position: DockPosition) {
  try {
    localStorage.setItem(DOCK_STORAGE_KEY, JSON.stringify(position));
  } catch (e) {
    console.error('Failed to save dock position:', e);
  }
}

function TypingIndicator() {
  return (
    <div className="flex gap-3 mb-4">
      <Avatar className="h-9 w-9 flex-shrink-0 ring-1 ring-primary/25 ring-offset-2 ring-offset-background shadow-sm">
        <AvatarFallback className="bg-gradient-to-br from-primary via-primary to-[#A35A28] text-primary-foreground text-sm font-display tracking-wider">
          P
        </AvatarFallback>
      </Avatar>
      <div className="flex items-center gap-1.5 bg-cream/60 dark:bg-white/5 border border-primary/15 rounded-lg rounded-bl-md px-4 py-3 shadow-sm">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-1.5 h-1.5 bg-primary/70 rounded-full"
            animate={{
              y: [0, -5, 0],
              opacity: [0.4, 1, 0.4]
            }}
            transition={{
              duration: 0.7,
              repeat: Infinity,
              delay: i * 0.15,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>
    </div>
  );
}

interface Message {
  id: number;
  role: 'user' | 'assistant';
  content: string;
  createdAt?: string;
  feedback?: string;
}

function PeggyMessage({ 
  message, 
  onFeedback 
}: { 
  message: Message; 
  onFeedback?: (feedback: 'helpful' | 'not_helpful') => void;
}) {
  const isUser = message.role === 'user';
  
  return (
    <motion.div 
      className={cn(
        "flex gap-3 mb-4",
        isUser ? "flex-row-reverse" : "flex-row"
      )}
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      <Avatar className={cn(
        "h-9 w-9 flex-shrink-0 ring-1 ring-offset-2 ring-offset-background shadow-sm",
        isUser ? "ring-navy/30" : "ring-primary/25"
      )}>
        <AvatarFallback className={cn(
          "text-xs",
          isUser 
            ? "bg-gradient-to-br from-navy to-charcoal text-cream font-supporting font-semibold tracking-wider" 
            : "bg-gradient-to-br from-primary via-primary to-[#A35A28] text-primary-foreground font-display tracking-wider text-sm"
        )}>
          {isUser ? "You" : "P"}
        </AvatarFallback>
      </Avatar>
      
      <div className={cn(
        "flex flex-col max-w-[80%]",
        isUser ? "items-end" : "items-start"
      )}>
        <div className={cn(
          "px-4 py-2.5 text-sm leading-relaxed shadow-sm",
          isUser 
            ? "rounded-lg rounded-br-md bg-gradient-to-br from-primary to-[#A35A28] text-primary-foreground shadow-primary/20" 
            : "rounded-lg rounded-bl-md bg-cream/60 dark:bg-white/5 border border-primary/15 text-foreground"
        )}>
          <div className="whitespace-pre-wrap">{message.content}</div>
        </div>
        
        {!isUser && onFeedback && !message.feedback && (
          <div className="flex gap-1 mt-1.5">
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-muted-foreground hover:text-green-600"
              onClick={() => onFeedback('helpful')}
              data-testid={`button-feedback-helpful-${message.id}`}
            >
              <ThumbsUp className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-muted-foreground hover:text-red-600"
              onClick={() => onFeedback('not_helpful')}
              data-testid={`button-feedback-not-helpful-${message.id}`}
            >
              <ThumbsDown className="h-3 w-3" />
            </Button>
          </div>
        )}
        
        {!isUser && message.feedback && (
          <Badge variant="secondary" className="mt-1.5 text-xs">
            {message.feedback === 'helpful' ? 'Thanks!' : 'Noted'}
          </Badge>
        )}
      </div>
    </motion.div>
  );
}

interface QuickPrompt {
  icon: typeof Home;
  label: string;
  prompt: string;
  context?: string;
  href?: string;
  // Strategy Lab (Task #85): when set, the chip flips Peggy into a lab mode
  // (explain / stress / prepare) before sending the prompt so the system
  // prompt is already wired with the right framing.
  labMode?: 'explain' | 'stress' | 'prepare';
}

export function getQuickPrompts(page?: string, labAnalysis?: PeggyContextData['labAnalysis']): QuickPrompt[] {
  const routerPrompts: QuickPrompt[] = [
    { icon: Home, label: "I have a property", prompt: "I have a property I'd like to discuss.", context: "router", href: "/sell" },
    { icon: GitBranch, label: "I have a deal or JV idea", prompt: "I have a deal or JV idea to route.", context: "router", href: "/sell" },
    { icon: DollarSign, label: "I want to discuss capital", prompt: "I want to discuss a private capital or partnership conversation.", context: "router", href: "/invest" },
    { icon: Hammer, label: "ADU / development", prompt: "I want to explore ADU or development potential.", context: "router", href: "/sell" },
    { icon: BookOpen, label: "Learn strategies", prompt: "I want to learn the strategies. Point me to the Strategy Library.", context: "router", href: "/resources" },
    { icon: Network, label: "Vendor or operator", prompt: "I'm a vendor or operator interested in the Pegasus network. What's the right way in?", context: "router", href: "/vendor-network" },
  ];

  if (page?.includes('calculator')) {
    return [
      { icon: Calculator, label: "Analyze results", prompt: "Can you analyze my calculation results and tell me if this is a good deal?", context: "calculator" },
      { icon: Target, label: "Improve ROI", prompt: "How can I improve the ROI on this deal?", context: "calculator" },
      { icon: Lightbulb, label: "Deal tips", prompt: "What factors should I consider before proceeding with this investment?", context: "calculator" },
    ];
  }

  if (page?.includes('deal') || page?.includes('wholesale') || page?.includes('capital')) {
    return [
      { icon: Building2, label: "Analyze deal", prompt: "Can you walk me through how Pegasus would review this deal?", context: "deal" },
      { icon: Target, label: "Route this deal", prompt: "What's the right Pegasus path for this deal?", context: "deal" },
      { icon: TrendingUp, label: "Strategy fit", prompt: "Which strategy lane fits this opportunity best?", context: "deal" },
    ];
  }

  if (page?.includes('marketflow') || page?.includes('marketplace')) {
    return [
      { icon: Building2, label: "What is MarketFlow?", prompt: "What is MarketFlow and how do deals get in?", context: "marketplace" },
      { icon: Target, label: "Request access", prompt: "How do I request access to MarketFlow?", context: "marketplace", href: "/contact" },
      ...routerPrompts.slice(0, 2),
    ];
  }

  // Strategy Lab — lab-aware prompts prepended to the standard router prompts
  // so the user keeps full access to the rest of Peggy's intake routes.
  if (page === 'strategy-lab') {
    const laneLabel = labAnalysis?.topLaneLabel ?? null;
    const laneTag = laneLabel ? ` (${laneLabel})` : "";
    const explainPrompt = laneLabel
      ? `Explain in plain language why ${laneLabel} was recommended for the snapshot I'm looking at. What signals carried the most weight, and what would flip the recommendation to a different lane?`
      : "Explain in plain language why this lane was recommended for the snapshot I'm looking at. What signals carried the most weight, and what would flip it?";
    const stressPrompt = laneLabel
      ? `Stress test the ${laneLabel} recommendation. What breaks first if ARV softens, rehab overruns, hold time doubles, or rates rise? Tell me which input is most worth re-checking before I submit.`
      : "Stress test the recommendation. What breaks first if ARV softens, rehab overruns, hold time doubles, or rates rise? Tell me which input is most worth re-checking before I submit.";
    const preparePrompt = laneLabel
      ? `I want to submit this ${laneLabel} snapshot to Pegasus. What inputs should I sharpen, what documents will the team ask for, and draft a one-paragraph submitter notes block I can paste into the form.`
      : "I want to submit this to Pegasus. What inputs should I sharpen, what documents will the team ask for, and draft a one-paragraph submitter notes block I can paste into the form.";
    return [
      { icon: Lightbulb, label: `Explain${laneTag}`, prompt: explainPrompt, context: "strategy-lab", labMode: "explain" },
      { icon: TrendingUp, label: `Stress test${laneTag}`, prompt: stressPrompt, context: "strategy-lab", labMode: "stress" },
      { icon: Target, label: `Prepare for review${laneTag}`, prompt: preparePrompt, context: "strategy-lab", labMode: "prepare" },
      ...routerPrompts,
    ];
  }

  return routerPrompts;
}

function QuickPromptChips({ 
  prompts, 
  onSelect,
  onNavigate,
  compact = false
}: { 
  prompts: QuickPrompt[]; 
  onSelect: (prompt: QuickPrompt) => void;
  onNavigate?: (href: string) => void;
  compact?: boolean;
}) {
  return (
    <div className={cn(
      "flex flex-wrap gap-2",
      compact ? "mb-2" : "mb-4"
    )}>
      {prompts.map((prompt, index) => (
        <Button
          key={index}
          variant="outline"
          size="sm"
          className={cn(
            "gap-1.5 text-xs bg-cream/40 dark:bg-white/[0.03] border-primary/25 text-foreground/80 hover:border-primary/60 hover:bg-cream/70 dark:hover:bg-white/[0.06] hover:text-foreground hover:-translate-y-px hover:shadow-sm transition-all duration-200 rounded-full px-3",
            compact && "h-7"
          )}
          onClick={() => {
            if (prompt.href && onNavigate) {
              onNavigate(prompt.href);
            } else {
              onSelect(prompt);
            }
          }}
          data-testid={`button-quick-prompt-${index}`}
        >
          <prompt.icon className="h-3 w-3 text-primary" />
          {prompt.label}
        </Button>
      ))}
    </div>
  );
}

export function PeggyDock() {
  const [position, setPosition] = useState<DockPosition>(loadDockPosition);
  const [isDragging, setIsDragging] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [conversationId, setConversationId] = useState<number | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [showQuickPrompts, setShowQuickPrompts] = useState(true);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dragControls = useDragControls();
  const constraintsRef = useRef<HTMLDivElement>(null);
  
  const { context, sessionId, isOpen, openChat, closeChat, toggleChat, consumePendingPrompt, pendingPrompt, updateContext } = usePeggyContext();
  const [, setLocation] = useLocation();
  
  const quickPrompts = getQuickPrompts(context.page, context.labAnalysis);

  const handleNavigate = useCallback((href: string) => {
    setLocation(href);
    closeChat();
    setIsExpanded(false);
    setIsFullscreen(false);
  }, [setLocation, closeChat]);
  
  const createConversationMutation = useMutation({
    mutationFn: async (newContext: PeggyContextData) => {
      const response = await apiRequest('POST', '/api/peggy/conversations', { sessionId, context: newContext });
      return response.json();
    },
    onSuccess: (data: any) => {
      setConversationId(data.id);
    }
  });
  
  const chatMutation = useMutation({
    mutationFn: async (message: string) => {
      if (!conversationId) {
        throw new Error('No conversation');
      }
      const response = await apiRequest('POST', '/api/peggy/chat', { 
        conversationId, 
        message, 
        context 
      });
      return response.json();
    },
    onSuccess: (data: any) => {
      setMessages(prev => [...prev, {
        id: data.messageId,
        role: 'assistant',
        content: data.response
      }]);
    }
  });
  
  const feedbackMutation = useMutation({
    mutationFn: async ({ messageId, feedback }: { messageId: number; feedback: string }) => {
      const response = await apiRequest('POST', `/api/peggy/messages/${messageId}/feedback`, { feedback });
      return response.json();
    },
    onSuccess: (_, variables) => {
      setMessages(prev => prev.map(m => 
        m.id === variables.messageId 
          ? { ...m, feedback: variables.feedback } 
          : m
      ));
    }
  });
  
  useEffect(() => {
    if (isOpen && !conversationId) {
      createConversationMutation.mutate(context);
    }
    if (isOpen && pendingPrompt && !isExpanded) {
      setIsExpanded(true);
    }
  }, [isOpen, pendingPrompt]);
  
  // When a pending prompt is staged (from "Ask Peggy" on a calculator or
  // saved analysis) and the conversation is ready, auto-send it so Peggy
  // immediately produces a structural read without the user retyping.
  useEffect(() => {
    if (!conversationId || !pendingPrompt || chatMutation.isPending) return;
    const prompt = consumePendingPrompt();
    if (!prompt) return;
    setShowQuickPrompts(false);
    setMessages(prev => [...prev, {
      id: Date.now(),
      role: 'user',
      content: prompt,
    }]);
    chatMutation.mutate(prompt);
  }, [conversationId, pendingPrompt, chatMutation.isPending]);
  
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  useEffect(() => {
    if (isExpanded && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isExpanded]);
  
  const handleDragEnd = useCallback((event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    setIsDragging(false);
    const newPosition = {
      x: position.x + info.offset.x,
      y: position.y + info.offset.y
    };
    setPosition(newPosition);
    saveDockPosition(newPosition);
  }, [position]);
  
  const handleSend = async () => {
    if (!inputValue.trim() || chatMutation.isPending) return;
    
    const userMessage = inputValue.trim();
    setInputValue("");
    setShowQuickPrompts(false);
    
    setMessages(prev => [...prev, {
      id: Date.now(),
      role: 'user',
      content: userMessage
    }]);
    
    chatMutation.mutate(userMessage);
    inputRef.current?.focus();
  };
  
  const handleQuickPromptSelect = (prompt: QuickPrompt) => {
    // Lab Mode (Task #85): flip Peggy's framing before sending so the system
    // prompt already carries the right mode when the message hits the server.
    if (prompt.labMode) {
      updateContext({ labMode: prompt.labMode });
    }
    setInputValue(prompt.prompt);
    setTimeout(() => {
      handleSend();
    }, 100);
  };
  
  const handleNewConversation = () => {
    setConversationId(null);
    setMessages([]);
    setShowQuickPrompts(true);
    createConversationMutation.mutate(context);
  };
  
  const handleFeedback = (messageId: number, feedback: 'helpful' | 'not_helpful') => {
    feedbackMutation.mutate({ messageId, feedback });
  };
  
  const handleToggleExpand = () => {
    if (!isExpanded) {
      openChat();
    }
    setIsExpanded(!isExpanded);
    if (!isExpanded) {
      setIsFullscreen(false);
    }
  };

  const handleClose = () => {
    setIsExpanded(false);
    setIsFullscreen(false);
    closeChat();
  };

  const dockContent = (
    <>
      <motion.div
        ref={constraintsRef}
        className="fixed inset-0 pointer-events-none z-40"
        style={{ margin: 20 }}
      />
      
      <motion.div
        drag
        dragControls={dragControls}
        dragMomentum={false}
        dragElastic={0.1}
        dragConstraints={constraintsRef}
        onDragStart={() => setIsDragging(true)}
        onDragEnd={handleDragEnd}
        initial={false}
        animate={{
          x: position.x,
          y: position.y,
          scale: isDragging ? 1.05 : 1,
        }}
        transition={{
          type: "spring",
          stiffness: 500,
          damping: 30,
        }}
        className={cn(
          "fixed z-50 cursor-grab active:cursor-grabbing",
          isExpanded ? "pointer-events-none" : "bottom-6 right-6"
        )}
        style={{
          bottom: isExpanded ? 'auto' : undefined,
          right: isExpanded ? 'auto' : undefined,
        }}
      >
        <AnimatePresence mode="wait">
          {!isExpanded ? (
            <motion.div
              key="collapsed"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="pointer-events-auto"
            >
              <div className="relative">
                {/* Outer ambient glow */}
                <motion.div
                  aria-hidden="true"
                  className="absolute inset-0 rounded-full bg-primary/30 blur-2xl"
                  animate={{ scale: [1, 1.18, 1], opacity: [0.4, 0.6, 0.4] }}
                  transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
                />
                {/* Slow rotating brass ring */}
                <motion.div
                  aria-hidden="true"
                  className="absolute -inset-1.5 rounded-full"
                  style={{
                    background:
                      "conic-gradient(from 0deg, hsl(var(--copper) / 0.55), hsl(var(--copper) / 0) 35%, hsl(var(--copper) / 0) 70%, hsl(var(--copper) / 0.55))",
                  }}
                  animate={{ rotate: 360 }}
                  transition={{ duration: 14, repeat: Infinity, ease: "linear" }}
                />
                <Button
                  onClick={handleToggleExpand}
                  className={cn(
                    "relative h-16 w-16 rounded-full p-0 overflow-hidden",
                    "bg-gradient-to-br from-[#D88E4E] via-primary to-[#8E4F22] text-primary-foreground",
                    "ring-1 ring-cream/40 shadow-[0_18px_40px_-10px_rgba(13,27,45,0.55)]",
                    "transition-all duration-300 hover:shadow-[0_22px_48px_-10px_rgba(199,122,58,0.6)]",
                    isDragging && "ring-4 ring-primary/40"
                  )}
                  size="icon"
                  aria-label="Open Peggy strategy assistant"
                  data-testid="button-peggy-dock"
                >
                  {/* Inner brass sheen */}
                  <span
                    aria-hidden="true"
                    className="absolute inset-0 rounded-full bg-[radial-gradient(ellipse_at_30%_25%,rgba(255,255,255,0.5)_0%,rgba(255,255,255,0)_55%)]"
                  />
                  {/* Inner shadow rim */}
                  <span
                    aria-hidden="true"
                    className="absolute inset-0 rounded-full shadow-[inset_0_-6px_14px_rgba(0,0,0,0.25),inset_0_2px_4px_rgba(255,255,255,0.18)]"
                  />
                  <motion.span
                    className="relative font-display text-[22px] leading-none tracking-[0.04em] text-cream"
                    animate={{ y: [0, -1, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  >
                    P
                  </motion.span>
                </Button>

                {/* Live status pip */}
                <motion.div
                  className="absolute top-0.5 right-0.5 h-3 w-3 rounded-full border-2 border-background"
                  style={{ backgroundColor: "hsl(var(--copper))" }}
                  animate={{
                    scale: [1, 1.3, 1],
                    opacity: [0.75, 1, 0.75],
                  }}
                  transition={{
                    duration: 2.4,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </motion.div>
      
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            key="expanded"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className={cn(
              "fixed z-50 shadow-md",
              isFullscreen 
                ? "inset-4 sm:inset-8" 
                : "bottom-6 right-6 w-[400px] h-[600px]"
            )}
          >
            <Card className="w-full h-full flex flex-col overflow-hidden rounded-lg border border-primary/20 shadow-[0_30px_70px_-20px_rgba(13,27,45,0.45),0_0_0_1px_rgba(199,122,58,0.06)] bg-background">
              <div 
                className="relative flex items-center justify-between px-5 py-4 cursor-move bg-gradient-to-b from-cream/70 to-cream/20 dark:from-white/[0.04] dark:to-transparent"
                onPointerDown={(e) => dragControls.start(e)}
              >
                {/* Copper hairline at base of header */}
                <span aria-hidden="true" className="absolute inset-x-5 bottom-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
                <div className="flex items-center gap-3">
                  <div className="relative">
                    {/* Soft glow halo */}
                    <span aria-hidden="true" className="absolute inset-0 rounded-full bg-primary/25 blur-md" />
                    <Avatar className="relative h-11 w-11 ring-1 ring-primary/35 ring-offset-2 ring-offset-background shadow-md">
                      <AvatarFallback className="bg-gradient-to-br from-[#D88E4E] via-primary to-[#8E4F22] text-cream text-base font-display tracking-wider">
                        P
                      </AvatarFallback>
                    </Avatar>
                    <motion.div
                      className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-background"
                      style={{ backgroundColor: "hsl(var(--copper))" }}
                      animate={{ opacity: [0.7, 1, 0.7], scale: [1, 1.2, 1] }}
                      transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
                    />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.3em] text-primary font-supporting font-semibold leading-none mb-1.5">
                      The Deal Architect
                    </p>
                    <h3 className="font-serif text-base font-semibold leading-none tracking-tight">
                      Peggy <span className="text-muted-foreground font-normal">·</span> Strategy Assistant
                    </h3>
                  </div>
                </div>
                
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={handleNewConversation}
                    title="New conversation"
                    data-testid="button-peggy-new"
                  >
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setIsFullscreen(!isFullscreen)}
                    data-testid="button-peggy-fullscreen"
                  >
                    {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={handleClose}
                    data-testid="button-peggy-close"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <ScrollArea className="flex-1 px-4 py-4">
                {messages.length === 0 && (
                  <div className="text-center py-8">
                    <div className="relative inline-flex items-center justify-center mb-6">
                      {/* Outer pulsing halo */}
                      <motion.span
                        aria-hidden="true"
                        className="absolute inset-0 -m-3 rounded-full bg-primary/15 blur-xl"
                        animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0.8, 0.5] }}
                        transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
                      />
                      {/* Slow rotating brass ring */}
                      <motion.span
                        aria-hidden="true"
                        className="absolute -inset-2 rounded-full"
                        style={{
                          background:
                            "conic-gradient(from 0deg, hsl(var(--copper) / 0.5), hsl(var(--copper) / 0) 30%, hsl(var(--copper) / 0) 70%, hsl(var(--copper) / 0.5))",
                        }}
                        animate={{ rotate: 360 }}
                        transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
                      />
                      <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-[#D88E4E] via-primary to-[#8E4F22] ring-1 ring-cream/40 shadow-[0_18px_40px_-10px_rgba(13,27,45,0.45)] flex items-center justify-center overflow-hidden">
                        <span aria-hidden="true" className="absolute inset-0 rounded-full bg-[radial-gradient(ellipse_at_30%_25%,rgba(255,255,255,0.45)_0%,rgba(255,255,255,0)_55%)]" />
                        <span aria-hidden="true" className="absolute inset-0 rounded-full shadow-[inset_0_-6px_14px_rgba(0,0,0,0.25),inset_0_2px_4px_rgba(255,255,255,0.2)]" />
                        <span className="relative font-display text-[34px] leading-none tracking-[0.04em] text-cream">P</span>
                      </div>
                    </div>
                    <p className="text-[10px] uppercase tracking-[0.3em] text-primary font-supporting font-semibold mb-3">
                      The Deal Architect
                    </p>
                    <h3 className="font-serif text-[26px] font-semibold tracking-tight leading-tight mb-3">
                      Hi, I'm <span className="italic bg-gradient-to-r from-[#E8DBC5] via-[#D4B483] to-[#C17A4A] bg-clip-text text-transparent">Peggy</span>.
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed mb-3 max-w-[320px] mx-auto">
                      I read complex property situations and route them to the right Pegasus path.
                    </p>
                    <div className="flex items-center justify-center gap-3 mb-7">
                      <span className="h-px w-8 bg-primary/40" />
                      <span className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground font-supporting">Where others see impossible</span>
                      <span className="h-px w-8 bg-primary/40" />
                    </div>
                    
                    <div className="text-left">
                      <p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground font-supporting font-semibold mb-3 flex items-center gap-1.5">
                        <Lightbulb className="h-3 w-3 text-primary" />
                        Where would you like to start?
                      </p>
                      <QuickPromptChips 
                        prompts={quickPrompts} 
                        onSelect={handleQuickPromptSelect}
                        onNavigate={handleNavigate}
                      />
                    </div>
                  </div>
                )}
                
                {messages.map((message, index) => (
                  <PeggyMessage 
                    key={`${message.id}-${index}`}
                    message={message}
                    onFeedback={message.role === 'assistant' ? (fb) => handleFeedback(message.id, fb) : undefined}
                  />
                ))}
                
                <AnimatePresence>
                  {chatMutation.isPending && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                    >
                      <TypingIndicator />
                    </motion.div>
                  )}
                </AnimatePresence>
                
                <div ref={messagesEndRef} />
              </ScrollArea>
              
              {messages.length > 0 && showQuickPrompts && (
                <div className="relative px-5 pt-3 pb-2 bg-cream/30 dark:bg-white/[0.02]">
                  <span aria-hidden="true" className="absolute inset-x-5 top-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground font-supporting font-semibold">Suggestions</p>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-5 w-5 text-muted-foreground hover:text-foreground"
                      onClick={() => setShowQuickPrompts(false)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                  <QuickPromptChips 
                    prompts={quickPrompts.slice(0, 2)} 
                    onSelect={handleQuickPromptSelect}
                    onNavigate={handleNavigate}
                    compact
                  />
                </div>
              )}
              
              <div className="relative px-5 pt-4 pb-4 bg-gradient-to-b from-background to-cream/20 dark:to-white/[0.02]">
                <span aria-hidden="true" className="absolute inset-x-5 top-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
                <form 
                  onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                  className="group relative flex items-center gap-2 rounded-full bg-cream/50 dark:bg-white/[0.04] border border-primary/20 pl-5 pr-1.5 py-1.5 shadow-sm transition-all duration-200 focus-within:border-primary/50 focus-within:shadow-md focus-within:shadow-primary/10 focus-within:bg-background"
                >
                  <Input
                    ref={inputRef}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Ask Peggy anything…"
                    disabled={chatMutation.isPending || !conversationId}
                    className="flex-1 border-0 bg-transparent px-0 h-9 text-sm shadow-none focus-visible:ring-0 placeholder:text-muted-foreground/70"
                    data-testid="input-peggy-message"
                  />
                  <Button 
                    type="submit" 
                    size="icon"
                    disabled={!inputValue.trim() || chatMutation.isPending || !conversationId}
                    className={cn(
                      "relative h-9 w-9 rounded-full p-0 overflow-hidden flex-shrink-0",
                      "bg-gradient-to-br from-[#D88E4E] via-primary to-[#8E4F22] text-cream",
                      "shadow-md shadow-primary/30 hover:shadow-lg hover:shadow-primary/40",
                      "transition-all duration-200 hover:-translate-y-px",
                      "disabled:opacity-50 disabled:hover:translate-y-0 disabled:shadow-none disabled:bg-muted disabled:text-muted-foreground disabled:bg-none"
                    )}
                    data-testid="button-peggy-send"
                  >
                    <span aria-hidden="true" className="absolute inset-0 rounded-full bg-[radial-gradient(ellipse_at_30%_25%,rgba(255,255,255,0.4)_0%,rgba(255,255,255,0)_55%)]" />
                    <Send className="relative h-3.5 w-3.5" />
                  </Button>
                </form>
                
                <p className="text-[10px] text-muted-foreground/80 text-center mt-3 font-supporting tracking-wide">
                  Peggy is an AI assistant. Strategy reads, not legal or financial advice.
                </p>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );

  if (typeof document !== 'undefined') {
    return createPortal(dockContent, document.body);
  }
  
  return null;
}

export default PeggyDock;
