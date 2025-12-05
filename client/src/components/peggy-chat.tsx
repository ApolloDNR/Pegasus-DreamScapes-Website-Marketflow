import { useState, useRef, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { usePeggyContext, type PeggyContextData } from "@/contexts/peggy-context";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { 
  MessageCircle, 
  X, 
  Send, 
  Sparkles, 
  ThumbsUp, 
  ThumbsDown,
  Minimize2,
  Maximize2,
  RotateCcw
} from "lucide-react";
import { cn } from "@/lib/utils";

function TypingIndicator() {
  return (
    <div className="flex gap-3 mb-4">
      <Avatar className="h-8 w-8 flex-shrink-0">
        <AvatarFallback className="bg-accent text-accent-foreground text-xs font-medium">
          P
        </AvatarFallback>
      </Avatar>
      <div className="flex items-center gap-1 bg-muted rounded-lg px-4 py-3">
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

interface Conversation {
  id: number;
  title: string;
  messageCount: number;
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
          "text-xs font-medium",
          isUser ? "bg-primary text-primary-foreground" : "bg-accent text-accent-foreground"
        )}>
          {isUser ? "You" : "P"}
        </AvatarFallback>
      </Avatar>
      
      <div className={cn(
        "flex flex-col max-w-[80%]",
        isUser ? "items-end" : "items-start"
      )}>
        <div className={cn(
          "rounded-lg px-4 py-2 text-sm",
          isUser 
            ? "bg-primary text-primary-foreground" 
            : "bg-muted"
        )}>
          <div className="whitespace-pre-wrap">{message.content}</div>
        </div>
        
        {!isUser && onFeedback && !message.feedback && (
          <div className="flex gap-1 mt-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => onFeedback('helpful')}
              data-testid={`button-feedback-helpful-${message.id}`}
            >
              <ThumbsUp className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => onFeedback('not_helpful')}
              data-testid={`button-feedback-not-helpful-${message.id}`}
            >
              <ThumbsDown className="h-3 w-3" />
            </Button>
          </div>
        )}
        
        {!isUser && message.feedback && (
          <Badge variant="secondary" className="mt-1 text-xs">
            {message.feedback === 'helpful' ? 'Thanks!' : 'Noted'}
          </Badge>
        )}
      </div>
    </motion.div>
  );
}

function SuggestionChips({ 
  suggestions, 
  onSelect 
}: { 
  suggestions: string[]; 
  onSelect: (suggestion: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2 mb-4">
      {suggestions.map((suggestion, index) => (
        <Button
          key={index}
          variant="outline"
          size="sm"
          className="text-xs"
          onClick={() => onSelect(suggestion)}
          data-testid={`button-suggestion-${index}`}
        >
          {suggestion}
        </Button>
      ))}
    </div>
  );
}

export function PeggyChatBubble() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [conversationId, setConversationId] = useState<number | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const { context, sessionId, isOpen, openChat, closeChat } = usePeggyContext();
  
  const { data: suggestions = [] } = useQuery<string[]>({
    queryKey: ['/api/peggy/suggestions', context.page],
    queryFn: async () => {
      const response = await apiRequest('POST', '/api/peggy/suggestions', { context });
      return (await response.json()).suggestions;
    },
    enabled: isOpen
  });
  
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
  
  const handleSend = async () => {
    if (!inputValue.trim() || chatMutation.isPending) return;
    
    const userMessage = inputValue.trim();
    setInputValue("");
    
    setMessages(prev => [...prev, {
      id: Date.now(),
      role: 'user',
      content: userMessage
    }]);
    
    chatMutation.mutate(userMessage);
    inputRef.current?.focus();
  };
  
  const handleSuggestionSelect = (suggestion: string) => {
    setInputValue(suggestion);
    setTimeout(() => handleSend(), 100);
  };
  
  const handleNewConversation = () => {
    setConversationId(null);
    setMessages([]);
    createConversationMutation.mutate(context);
  };
  
  const handleFeedback = (messageId: number, feedback: 'helpful' | 'not_helpful') => {
    feedbackMutation.mutate({ messageId, feedback });
  };
  
  if (!isOpen) {
    return (
      <Button
        onClick={openChat}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg z-50"
        size="icon"
        data-testid="button-peggy-open"
      >
        <Sparkles className="h-6 w-6" />
      </Button>
    );
  }
  
  return (
    <Card className={cn(
      "fixed z-50 shadow-2xl transition-all duration-300",
      isExpanded 
        ? "bottom-0 right-0 w-full h-full sm:bottom-4 sm:right-4 sm:w-[500px] sm:h-[700px] sm:rounded-xl" 
        : "bottom-6 right-6 w-[380px] h-[520px] rounded-xl"
    )}>
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between px-4 py-3 border-b bg-accent/5">
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-primary text-primary-foreground text-sm font-semibold">
                P
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold text-sm">Peggy</h3>
              <p className="text-xs text-muted-foreground">AI Assistant</p>
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
              onClick={() => setIsExpanded(!isExpanded)}
              data-testid="button-peggy-expand"
            >
              {isExpanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={closeChat}
              data-testid="button-peggy-close"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <ScrollArea className="flex-1 px-4 py-4">
          {messages.length === 0 && (
            <div className="text-center py-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                <Sparkles className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Hi, I'm Peggy!</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Your AI assistant for real estate investing. Ask me anything about deals, strategies, or the platform.
              </p>
              
              {suggestions.length > 0 && (
                <SuggestionChips 
                  suggestions={suggestions} 
                  onSelect={handleSuggestionSelect} 
                />
              )}
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
        
        <div className="p-4 border-t">
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
              className="flex-1"
              data-testid="input-peggy-message"
            />
            <Button 
              type="submit" 
              size="icon"
              disabled={!inputValue.trim() || chatMutation.isPending || !conversationId}
              data-testid="button-peggy-send"
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </div>
    </Card>
  );
}

export function AskPeggyButton({
  calculatorType,
  inputs,
  results,
  className
}: {
  calculatorType: string;
  inputs: Record<string, any>;
  results: Record<string, any>;
  className?: string;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<string | null>(null);
  const { sessionId, setCalculatorData } = usePeggyContext();
  
  const handleAskPeggy = async () => {
    setIsLoading(true);
    setCalculatorData(calculatorType, inputs, results);
    
    try {
      const response = await apiRequest('POST', '/api/peggy/analyze-calculator', {
        sessionId,
        calculatorType,
        inputs,
        results
      });
      const result = await response.json() as { response: string; conversationId: number };
      
      setResponse(result.response);
    } catch (error) {
      console.error('Error asking Peggy:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  if (response) {
    return (
      <Card className={cn("p-4", className)}>
        <div className="flex items-start gap-3">
          <Avatar className="h-8 w-8 flex-shrink-0">
            <AvatarFallback className="bg-primary text-primary-foreground text-sm">
              P
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="font-semibold text-sm">Peggy's Analysis</span>
              <Sparkles className="h-4 w-4 text-primary" />
            </div>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{response}</p>
            <Button
              variant="ghost"
              size="sm"
              className="mt-2"
              onClick={() => setResponse(null)}
              data-testid="button-peggy-dismiss"
            >
              Dismiss
            </Button>
          </div>
        </div>
      </Card>
    );
  }
  
  return (
    <Button
      variant="outline"
      onClick={handleAskPeggy}
      disabled={isLoading}
      className={cn("gap-2", className)}
      data-testid="button-ask-peggy"
    >
      <Sparkles className="h-4 w-4" />
      {isLoading ? 'Analyzing...' : 'Ask Peggy'}
    </Button>
  );
}

export default PeggyChatBubble;
