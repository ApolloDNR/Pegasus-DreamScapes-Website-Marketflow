import { LockKeyhole, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function CollaborativeWatchlists({ userId }: { userId?: string }) {
  return (
    <Card className="border-dashed" data-testid="state-shared-watchlists-unavailable">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" aria-hidden="true" />
          Shared watchlists
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed p-6 text-center sm:flex-row sm:text-left">
          <LockKeyhole className="h-7 w-7 shrink-0 text-muted-foreground" aria-hidden="true" />
          <div>
            <p className="font-medium">
              {userId
                ? "Shared watchlists are not available in this release."
                : "Sign in is required for private collaboration features."}
            </p>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              Pegasus has not launched collaborative list creation, invitations, or public share links. No list will be created until the complete permission and revocation workflow is available.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
