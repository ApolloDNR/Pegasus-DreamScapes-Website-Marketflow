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
      <Avatar className="h-8 w-8 flex-shrink-0">
        <AvatarFallback className="bg-gradient-to-br from-amber-500 to-orange-600 text-white text-xs font-bold">
          P
        </AvatarFallback>
      </Avatar>
      <div className="flex items-center gap-1 bg-muted rounded-2xl px-4 py-3">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-2 h-2 bg-muted-foreground/50 rounded-full"
            animate={{
              y: [0, -6, 0],
              opacity: [0.5, 1, 0.5]
            }}
            transition={{
              duration: 0.6,
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
      <Avatar className="h-8 w-8 flex-shrink-0">
        <AvatarFallback className={cn(
          "text-xs font-bold",
          isUser 
            ? "bg-primary text-primary-foreground" 
            : "bg-gradient-to-br from-amber-500 to-orange-600 text-white"
        )}>
          {isUser ? "You" : "P"}
        </AvatarFallback>
      </Avatar>
      
      <div className={cn(
        "flex flex-col max-w-[80%]",
        isUser ? "items-end" : "items-start"
      )}>
        <div className={cn(
          "rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
          isUser 
            ? "bg-primary text-primary-foreground rounded-br-sm" 
            : "bg-muted rounded-bl-sm"
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
}

function getQuickPrompts(page?: string): QuickPrompt[] {
  const routerPrompts: QuickPrompt[] = [
    { icon: Home, label: "I have a property", prompt: "I have a property I'd like to discuss.", context: "router", href: "/sell" },
    { icon: GitBranch, label: "I have a deal or JV idea", prompt: "I have a deal or JV idea to route.", context: "router", href: "/submit-deal" },
    { icon: DollarSign, label: "I want to discuss capital", prompt: "I want to discuss a private capital or partnership conversation.", context: "router", href: "/invest" },
    { icon: Hammer, label: "ADU / development", prompt: "I want to explore ADU or development potential.", context: "router", href: "/services" },
    { icon: BookOpen, label: "Learn strategies", prompt: "I want to learn the strategies — point me to the Strategy Library.", context: "router" },
    { icon: Network, label: "Vendor or operator", prompt: "I'm a vendor or operator interested in the Pegasus network — what's the right way in?", context: "router" },
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

  return routerPrompts;
}

function QuickPromptChips({ 
  prompts, 
  onSelect,
  onNavigate,
  compact = false
}: { 
  prompts: QuickPrompt[]; 
  onSelect: (prompt: string) => void;
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
            "gap-1.5 text-xs border-dashed hover:border-solid hover:bg-accent/50",
            compact && "h-7"
          )}
          onClick={() => {
            if (prompt.href && onNavigate) {
              onNavigate(prompt.href);
            } else {
              onSelect(prompt.prompt);
            }
          }}
          data-testid={`button-quick-prompt-${index}`}
        >
          <prompt.icon className="h-3 w-3" />
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
  
  const { context, sessionId, isOpen, openChat, closeChat, toggleChat } = usePeggyContext();
  const [, setLocation] = useLocation();
  
  const quickPrompts = getQuickPrompts(context.page);

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
  }, [isOpen]);
  
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
  
  const handleQuickPromptSelect = (prompt: string) => {
    setInputValue(prompt);
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
              <Button
                onClick={handleToggleExpand}
                className={cn(
                  "h-14 w-14 rounded-full shadow-lg",
                  "bg-gradient-to-br from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700",
                  "border-2 border-white/20",
                  "transition-all duration-200",
                  isDragging && "ring-4 ring-amber-500/30"
                )}
                size="icon"
                data-testid="button-peggy-dock"
              >
                <motion.div
                  animate={{
                    rotate: [0, 10, -10, 0],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    repeatDelay: 3,
                  }}
                >
                  <Sparkles className="h-6 w-6 text-white" />
                </motion.div>
              </Button>
              
              <motion.div
                className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-green-500 border-2 border-white"
                animate={{
                  scale: [1, 1.2, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                }}
              />
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
              "fixed z-50 shadow-2xl",
              isFullscreen 
                ? "inset-4 sm:inset-8" 
                : "bottom-6 right-6 w-[400px] h-[600px]"
            )}
          >
            <Card className="w-full h-full flex flex-col overflow-hidden rounded-2xl border-2">
              <div 
                className="flex items-center justify-between px-4 py-3 border-b bg-gradient-to-r from-amber-500/10 to-orange-500/10 cursor-move"
                onPointerDown={(e) => dragControls.start(e)}
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Avatar className="h-10 w-10 ring-2 ring-amber-500/20">
                      <AvatarFallback className="bg-gradient-to-br from-amber-500 to-orange-600 text-white text-sm font-bold">
                        P
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-green-500 border-2 border-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm flex items-center gap-1.5">
                      Peggy · Strategy Assistant
                      <Badge variant="secondary" className="text-[10px] px-1.5 py-0">AI</Badge>
                    </h3>
                    <p className="text-xs text-muted-foreground">Pegasus Dreamscapes intake & routing</p>
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
                  <div className="text-center py-6">
                    <motion.div 
                      className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-amber-500/20 to-orange-500/20 mb-4"
                      animate={{
                        scale: [1, 1.05, 1],
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                      }}
                    >
                      <Bot className="h-10 w-10 text-amber-600" />
                    </motion.div>
                    <h3 className="font-semibold text-lg mb-1">Hi, I'm Peggy.</h3>
                    <p className="text-sm text-muted-foreground mb-6 max-w-[300px] mx-auto">
                      I can help route your property, deal, or partnership idea to the right Pegasus review path.
                    </p>
                    
                    <div className="text-left">
                      <p className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1.5">
                        <Lightbulb className="h-3 w-3" />
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
                <div className="px-4 py-2 border-t bg-muted/30">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-medium text-muted-foreground">Suggestions</p>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-5 w-5"
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
              
              <div className="p-4 border-t bg-background">
                <form 
                  onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                  className="flex gap-2"
                >
                  <Input
                    ref={inputRef}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Ask Peggy anything..."
                    disabled={chatMutation.isPending || !conversationId}
                    className="flex-1 rounded-full px-4"
                    data-testid="input-peggy-message"
                  />
                  <Button 
                    type="submit" 
                    size="icon"
                    disabled={!inputValue.trim() || chatMutation.isPending || !conversationId}
                    className="rounded-full bg-gradient-to-br from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700"
                    data-testid="button-peggy-send"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
                
                <p className="text-[10px] text-muted-foreground text-center mt-2">
                  Peggy is powered by AI and may occasionally make mistakes
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
