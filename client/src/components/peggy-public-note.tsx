import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Sparkles, X, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { trackCtaClick } from "@/lib/analytics";

// Empire Doctrine Amendment 2 §D / §G — public Peggy widget. Peggy the
// conversational assistant is in private training; the public surface is
// a "leave a note" form so the dock is never a broken state (launch
// gate #4). Posts to /api/leads as leadType: "peggy_note".
export function PeggyPublicNote() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [note, setNote] = useState("");
  const [hp, setHp] = useState("");
  const { toast } = useToast();

  const submit = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/leads", {
        leadType: "peggy_notify",
        source: "peggy_public_dock",
        contactName: name,
        contactInfo: contact,
        message: note,
        hp_company: hp,
      });
    },
    onSuccess: () => {
      toast({
        title: "Note received",
        description: "Apollo gets every Peggy note as a daily inbound report. We'll be in touch.",
      });
      setName("");
      setContact("");
      setNote("");
      setOpen(false);
    },
    onError: () => {
      toast({
        title: "Could not send",
        description: "Please email apollo@pegasusdreamscapes.com or call 925-744-8525.",
        variant: "destructive",
      });
    },
  });

  return (
    <>
      {!open && (
        <button
          onClick={() => {
            setOpen(true);
            trackCtaClick("peggy_dock", "Open Peggy", "/peggy");
          }}
          className="fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-40 flex items-center gap-2 rounded-full bg-[hsl(var(--copper))] p-3.5 sm:px-5 sm:py-3 text-[hsl(var(--copper-foreground))] shadow-lg shadow-black/30 hover:bg-[hsl(var(--copper))] transition-all duration-200 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--bronze))] focus-visible:ring-offset-2"
          aria-label="Open Peggy"
          data-testid="button-peggy-public-open"
        >
          <Sparkles className="w-4 h-4 sm:w-4 sm:h-4" aria-hidden="true" />
          {/* icon-only on phones so the pill never covers statbar/footer copy */}
          <span className="hidden sm:inline text-[12px] uppercase tracking-[0.16em] font-semibold font-supporting">
            Talk to Peggy
          </span>
        </button>
      )}

      {open && (
        <div
          className="fixed bottom-6 right-6 z-40 w-[min(380px,calc(100vw-2rem))] bg-[hsl(var(--paper))] border border-[hsl(var(--rule))] rounded-lg shadow-2xl shadow-black/30 overflow-hidden"
          role="dialog"
          aria-label="Peggy — leave a note"
          data-testid="peggy-public-panel"
        >
          <div className="flex items-start justify-between gap-3 p-5 border-b border-[hsl(var(--rule))] bg-[hsl(var(--navy))] text-cream">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Sparkles className="w-4 h-4 text-[hsl(var(--copper))]" aria-hidden="true" />
                <p className="font-display text-base tracking-[0.06em]">Peggy</p>
                <span
                  className="text-[9px] uppercase tracking-[0.22em] font-supporting font-semibold bg-[hsl(var(--cream))] text-[hsl(var(--navy))] px-2 py-0.5 rounded-sm"
                  data-testid="badge-peggy-status"
                >
                  In private training
                </span>
              </div>
              <p className="text-[12px] text-cream/80 leading-snug" data-testid="text-peggy-private-training">
                Peggy is in private training. Notify me when she's live, or leave a note and Apollo will pick it up.
              </p>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="text-cream/70 hover:text-cream transition-colors p-1 -m-1 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--bronze))]"
              aria-label="Close Peggy"
              data-testid="button-peggy-public-close"
            >
              <X className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>

          <form
            className="p-5 space-y-3"
            onSubmit={(e) => {
              e.preventDefault();
              if (!name.trim() || !note.trim()) return;
              submit.mutate();
            }}
          >
            <div className="space-y-1">
              <Label htmlFor="peggy-name" className="text-[10px] uppercase tracking-[0.22em] font-supporting font-semibold">
                Your name
              </Label>
              <Input
                id="peggy-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                data-testid="input-peggy-name"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="peggy-contact" className="text-[10px] uppercase tracking-[0.22em] font-supporting font-semibold">
                Email or phone
              </Label>
              <Input
                id="peggy-contact"
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                placeholder="apollo@pegasusdreamscapes.com"
                data-testid="input-peggy-contact"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="peggy-note" className="text-[10px] uppercase tracking-[0.22em] font-supporting font-semibold">
                What's the situation?
              </Label>
              <Textarea
                id="peggy-note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={3}
                required
                placeholder="A few sentences about the property or question."
                data-testid="input-peggy-note"
              />
            </div>
            <input
              type="text"
              tabIndex={-1}
              autoComplete="off"
              value={hp}
              onChange={(e) => setHp(e.target.value)}
              className="hidden"
              aria-hidden="true"
            />
            <Button
              type="submit"
              disabled={submit.isPending}
              className="w-full bg-[hsl(var(--bronze))] hover:bg-[hsl(var(--bronze))] text-[hsl(var(--copper-foreground))] text-[12px] uppercase tracking-[0.14em] font-semibold h-10 rounded-sm"
              data-testid="button-peggy-submit"
            >
              {submit.isPending ? "Sending…" : "Leave a note"}
              <ArrowRight className="ml-2 w-3.5 h-3.5" aria-hidden="true" />
            </Button>
            <p className="text-[10px] text-muted-foreground leading-snug">
              Peggy is in private training. Every note routes straight to Apollo. For urgent calls: 925-744-8525.
            </p>
          </form>
        </div>
      )}
    </>
  );
}
