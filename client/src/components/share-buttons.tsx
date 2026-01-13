import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { Share2, Link2, Mail, MessageCircle } from "lucide-react";
import { SiFacebook, SiLinkedin, SiX } from "react-icons/si";

interface ShareButtonsProps {
  title: string;
  description?: string;
  url?: string;
  variant?: "icon" | "full";
  className?: string;
}

export function ShareButtons({ 
  title, 
  description, 
  url,
  variant = "icon",
  className = ""
}: ShareButtonsProps) {
  const { toast } = useToast();
  const shareUrl = url || (typeof window !== "undefined" ? window.location.href : "");
  const encodedUrl = encodeURIComponent(shareUrl);
  const encodedTitle = encodeURIComponent(title);
  const encodedDescription = encodeURIComponent(description || title);

  const shareLinks = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
    linkedin: `https://www.linkedin.com/shareArticle?mini=true&url=${encodedUrl}&title=${encodedTitle}&summary=${encodedDescription}`,
    email: `mailto:?subject=${encodedTitle}&body=${encodedDescription}%0A%0A${encodedUrl}`,
    sms: `sms:?body=${encodedTitle}%20${encodedUrl}`,
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast({
        title: "Link copied",
        description: "The link has been copied to your clipboard.",
      });
    } catch {
      toast({
        title: "Unable to copy",
        description: "Please copy the URL from your browser.",
        variant: "destructive",
      });
    }
  };

  const openShare = (url: string) => {
    window.open(url, "_blank", "width=600,height=400,noopener,noreferrer");
  };

  if (variant === "full") {
    return (
      <div className={`flex flex-wrap gap-2 ${className}`}>
        <Button
          variant="outline"
          size="sm"
          onClick={copyLink}
          data-testid="button-share-copy"
        >
          <Link2 className="w-4 h-4 mr-2" />
          Copy Link
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => openShare(shareLinks.facebook)}
          data-testid="button-share-facebook"
        >
          <SiFacebook className="w-4 h-4 mr-2" />
          Facebook
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => openShare(shareLinks.twitter)}
          data-testid="button-share-twitter"
        >
          <SiX className="w-4 h-4 mr-2" />
          Twitter
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => openShare(shareLinks.linkedin)}
          data-testid="button-share-linkedin"
        >
          <SiLinkedin className="w-4 h-4 mr-2" />
          LinkedIn
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => window.location.href = shareLinks.email}
          data-testid="button-share-email"
        >
          <Mail className="w-4 h-4 mr-2" />
          Email
        </Button>
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="icon" 
          className={className} 
          data-testid="button-share"
          aria-label="Share this page"
        >
          <Share2 className="w-4 h-4" />
          <span className="sr-only">Share</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={copyLink} data-testid="menu-share-copy">
          <Link2 className="w-4 h-4 mr-2" />
          Copy Link
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => openShare(shareLinks.facebook)} data-testid="menu-share-facebook">
          <SiFacebook className="w-4 h-4 mr-2" />
          Share on Facebook
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => openShare(shareLinks.twitter)} data-testid="menu-share-twitter">
          <SiX className="w-4 h-4 mr-2" />
          Share on X
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => openShare(shareLinks.linkedin)} data-testid="menu-share-linkedin">
          <SiLinkedin className="w-4 h-4 mr-2" />
          Share on LinkedIn
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => window.location.href = shareLinks.email} data-testid="menu-share-email">
          <Mail className="w-4 h-4 mr-2" />
          Share via Email
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => window.location.href = shareLinks.sms} data-testid="menu-share-sms">
          <MessageCircle className="w-4 h-4 mr-2" />
          Share via SMS
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
