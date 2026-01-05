import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles,
  X,
  Lightbulb,
  TrendingUp,
  Shield,
  MessageCircle,
  ChevronUp,
} from "lucide-react";

interface PeggyCharmProps {
  context?: "negotiation" | "deal" | "general";
  dealInfo?: {
    askingPrice?: number;
    arv?: number;
    propertyType?: string;
  };
}

const TIPS = {
  negotiation: [
    { icon: TrendingUp, text: "Counter-offers within 5% of asking price have 3x higher acceptance rates" },
    { icon: Shield, text: "Always include earnest money to show serious intent" },
    { icon: Lightbulb, text: "Shorter inspection periods can sweeten your offer" },
    { icon: MessageCircle, text: "A personal note explaining your vision helps build rapport" },
    { icon: TrendingUp, text: "Cash offers close 40% faster than financed deals" },
    { icon: Shield, text: "Lock in your offer price but stay flexible on timeline" },
  ],
  deal: [
    { icon: TrendingUp, text: "This property type typically sees 15-20% ROI in fix-and-flip" },
    { icon: Lightbulb, text: "Check comparable sales in the last 90 days for accurate ARV" },
    { icon: Shield, text: "Factor in 10% contingency for unexpected repair costs" },
    { icon: MessageCircle, text: "Properties under 30 days on market get more competitive offers" },
  ],
  general: [
    { icon: Sparkles, text: "I'm Peggy, your AI deal assistant. How can I help today?" },
    { icon: TrendingUp, text: "Browse deals with Match Score to find your best opportunities" },
    { icon: Lightbulb, text: "Save deals to your watchlist to track price changes" },
  ],
};

export function PeggyCharm({ context = "general", dealInfo }: PeggyCharmProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [currentTipIndex, setCurrentTipIndex] = useState(0);
  const [hasNewTip, setHasNewTip] = useState(true);

  const tips = TIPS[context];
  const currentTip = tips[currentTipIndex];
  const TipIcon = currentTip.icon;

  useEffect(() => {
    if (!isExpanded) {
      const interval = setInterval(() => {
        setCurrentTipIndex((prev) => (prev + 1) % tips.length);
        setHasNewTip(true);
      }, 15000);
      return () => clearInterval(interval);
    }
  }, [isExpanded, tips.length]);

  const handleExpand = () => {
    setIsExpanded(!isExpanded);
    setHasNewTip(false);
  };

  const nextTip = () => {
    setCurrentTipIndex((prev) => (prev + 1) % tips.length);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50" data-testid="peggy-charm">
      <AnimatePresence mode="wait">
        {isExpanded ? (
          <motion.div
            key="expanded"
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className="w-72 bg-card border rounded-2xl shadow-lg overflow-hidden"
          >
            <div className="p-3 bg-gradient-to-r from-primary/10 to-primary/5 border-b flex items-center justify-between">
              <div className="flex items-center gap-2">
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ repeat: Infinity, duration: 2, repeatDelay: 3 }}
                  className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center"
                >
                  <Sparkles className="w-4 h-4 text-primary" />
                </motion.div>
                <div>
                  <p className="font-medium text-sm">Peggy</p>
                  <p className="text-[10px] text-muted-foreground">AI Deal Assistant</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0"
                onClick={handleExpand}
                data-testid="button-close-peggy"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="p-4 space-y-3">
              <motion.div
                key={currentTipIndex}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-start gap-2.5"
              >
                <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <TipIcon className="w-3.5 h-3.5 text-primary" />
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {currentTip.text}
                </p>
              </motion.div>

              <div className="flex items-center justify-between pt-1">
                <div className="flex gap-1">
                  {tips.map((_, idx) => (
                    <div
                      key={idx}
                      className={`w-1.5 h-1.5 rounded-full transition-colors ${
                        idx === currentTipIndex ? "bg-primary" : "bg-muted"
                      }`}
                    />
                  ))}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs gap-1"
                  onClick={nextTip}
                  data-testid="button-next-tip"
                >
                  Next tip
                  <ChevronUp className="w-3 h-3 rotate-90" />
                </Button>
              </div>
            </div>

            {dealInfo?.askingPrice && (
              <div className="px-4 pb-4">
                <div className="p-2.5 rounded-lg bg-muted/50 text-xs space-y-1">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Asking</span>
                    <span className="font-medium">
                      ${dealInfo.askingPrice.toLocaleString()}
                    </span>
                  </div>
                  {dealInfo.arv && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">ARV</span>
                      <span className="font-medium text-green-600">
                        ${dealInfo.arv.toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        ) : (
          <motion.button
            key="collapsed"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleExpand}
            className="relative w-14 h-14 rounded-full bg-gradient-to-br from-primary to-primary/80 shadow-lg flex items-center justify-center group"
            data-testid="button-open-peggy"
          >
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ repeat: Infinity, duration: 2, repeatDelay: 3 }}
            >
              <Sparkles className="w-6 h-6 text-primary-foreground" />
            </motion.div>
            
            {hasNewTip && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-1 -right-1"
              >
                <Badge className="h-5 w-5 p-0 flex items-center justify-center bg-green-500 text-[10px]">
                  !
                </Badge>
              </motion.div>
            )}

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="absolute -top-8 right-0 whitespace-nowrap"
            >
              <Badge variant="secondary" className="text-[10px] shadow-sm">
                <Sparkles className="w-2.5 h-2.5 mr-1" />
                Peggy
              </Badge>
            </motion.div>
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
