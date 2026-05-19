/**
 * Modal that collects a recipient name + email + optional note and POSTs to
 * `/api/pdf/calculator/email` to send a saved-analysis PDF as a SendGrid
 * attachment with a Pegasus-branded cover email.
 *
 * Pass either `analysisId` (owner-only, requires auth) or `shareToken` (public,
 * rate-limited).
 */
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { Loader2, Send } from "lucide-react";

interface Props {
  trigger: React.ReactNode;
  analysisId?: number;
  shareToken?: string;
  analysisName: string;
}

export function SendAnalysisPdfDialog({
  trigger,
  analysisId,
  shareToken,
  analysisName,
}: Props) {
  const [open, setOpen] = useState(false);
  const [recipientName, setRecipientName] = useState("");
  const [recipientEmail, setRecipientEmail] = useState("");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  const reset = () => {
    setRecipientName("");
    setRecipientEmail("");
    setNote("");
  };

  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipientEmail.trim());
  const canSubmit =
    recipientName.trim().length > 0 && isValidEmail && !submitting;

  const handleSend = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      const body: Record<string, unknown> = {
        recipientName: recipientName.trim(),
        recipientEmail: recipientEmail.trim(),
      };
      if (note.trim()) body.note = note.trim();
      if (analysisId !== undefined) body.id = analysisId;
      else if (shareToken) body.shareToken = shareToken;

      const res = await fetch("/api/pdf/calculator/email", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        let message = `HTTP ${res.status}`;
        try {
          const j = await res.json();
          if (j?.message) message = j.message;
        } catch {}
        throw new Error(message);
      }
      toast({
        title: "PDF sent",
        description: `Sent to ${recipientEmail.trim()}.`,
      });
      if (analysisId !== undefined) {
        queryClient.invalidateQueries({
          queryKey: ["/api/saved-analyses", analysisId, "sends"],
        });
      }
      reset();
      setOpen(false);
    } catch (err) {
      toast({
        title: "Could not send PDF",
        description: err instanceof Error ? err.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) reset();
      }}
    >
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <p className="text-[10px] uppercase tracking-[0.3em] text-primary font-supporting font-semibold">
            Strategy Lab
          </p>
          <DialogTitle className="font-serif text-2xl">Send PDF</DialogTitle>
          <DialogDescription>
            Email the branded analysis to a lender, JV partner, or seller.
            Attaches "{analysisName}" as a PDF with a short cover note.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="send-pdf-name">Recipient name</Label>
            <Input
              id="send-pdf-name"
              value={recipientName}
              onChange={(e) => setRecipientName(e.target.value)}
              placeholder="Jane Lender"
              maxLength={120}
              data-testid="input-send-pdf-name"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="send-pdf-email">Recipient email</Label>
            <Input
              id="send-pdf-email"
              type="email"
              value={recipientEmail}
              onChange={(e) => setRecipientEmail(e.target.value)}
              placeholder="jane@lender.com"
              maxLength={254}
              data-testid="input-send-pdf-email"
            />
            {recipientEmail.length > 0 && !isValidEmail && (
              <p className="text-xs text-destructive">
                Enter a valid email address.
              </p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="send-pdf-note">Note (optional)</Label>
            <Textarea
              id="send-pdf-note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Quick context for them — what they're looking at and why."
              maxLength={2000}
              rows={4}
              data-testid="input-send-pdf-note"
            />
            <p className="text-[11px] text-muted-foreground text-right">
              {note.length} / 2000
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="ghost"
            onClick={() => setOpen(false)}
            disabled={submitting}
            data-testid="button-send-pdf-cancel"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSend}
            disabled={!canSubmit}
            data-testid="button-send-pdf-confirm"
          >
            {submitting ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Send className="w-4 h-4 mr-2" />
            )}
            Send PDF
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
