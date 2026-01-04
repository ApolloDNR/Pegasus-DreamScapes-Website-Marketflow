import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Construction, Sparkles } from "lucide-react";

interface UnderConstructionBadgeProps {
  className?: string;
}

export function UnderConstructionBadge({ className }: UnderConstructionBadgeProps) {
  return (
    <Badge variant="outline" className={`gap-1 border-amber-500/50 text-amber-600 ${className || ''}`}>
      <Construction className="w-3 h-3" />
      Coming Soon
    </Badge>
  );
}

interface UnderConstructionCardProps {
  title: string;
  description?: string;
  className?: string;
}

export function UnderConstructionCard({ title, description, className }: UnderConstructionCardProps) {
  return (
    <Card className={`border-dashed border-amber-500/30 bg-amber-500/5 ${className || ''}`}>
      <CardContent className="p-6 text-center">
        <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center mx-auto mb-4">
          <Construction className="w-6 h-6 text-amber-600" />
        </div>
        <h3 className="font-semibold mb-2">{title}</h3>
        <p className="text-sm text-muted-foreground">
          {description || "This feature is under development and will be available soon."}
        </p>
        <Badge variant="outline" className="mt-4 gap-1 border-amber-500/50 text-amber-600">
          <Sparkles className="w-3 h-3" />
          Coming Soon
        </Badge>
      </CardContent>
    </Card>
  );
}

interface UnderConstructionBannerProps {
  message?: string;
  className?: string;
}

export function UnderConstructionBanner({ message, className }: UnderConstructionBannerProps) {
  return (
    <div className={`bg-amber-500/10 border border-amber-500/30 rounded-lg px-4 py-3 flex items-center gap-3 ${className || ''}`}>
      <Construction className="w-5 h-5 text-amber-600 flex-shrink-0" />
      <p className="text-sm">
        {message || "Some features on this page are still under development."}
      </p>
    </div>
  );
}
