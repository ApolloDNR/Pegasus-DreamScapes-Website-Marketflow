import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "wouter";
import {
  ArrowLeft,
  CalendarDays,
  Info,
  Loader2,
  MessageCircle,
  ShieldCheck,
  Star,
  UserRound,
} from "lucide-react";

import { MarketplaceLayout } from "@/components/marketplace-layout";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSupabaseAuth } from "@/contexts/supabase-auth-context";
import { useSEO } from "@/hooks/use-seo";

const REVIEW_UNAVAILABLE_COPY =
  "Reviews are unavailable until Pegasus can verify a completed transaction.";

interface PublicUserProfile {
  id: string;
  firstName?: string | null;
  lastName?: string | null;
  profileImageUrl?: string | null;
  createdAt?: string | null;
}

const PROFILE_ID_PATTERN = /^[a-zA-Z0-9_-]{1,100}$/;

function displayName(profile: PublicUserProfile) {
  return [profile.firstName?.trim(), profile.lastName?.trim()]
    .filter(Boolean)
    .join(" ") || "MarketFlow member";
}

function initials(profile: PublicUserProfile) {
  const first = profile.firstName?.trim().charAt(0) ?? "";
  const last = profile.lastName?.trim().charAt(0) ?? "";
  return `${first}${last}`.toUpperCase() || "M";
}

function formattedDate(value?: string | null) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function UserProfile() {
  useSEO({
    title: "MarketFlow Member Profile",
    description: "Private MarketFlow member identity page.",
    noIndex: true,
  });

  const { userId } = useParams<{ userId: string }>();
  const { user: currentUser, isAuthenticated } = useSupabaseAuth();
  const validUserId = userId && PROFILE_ID_PATTERN.test(userId) ? userId : null;

  const {
    data: profile,
    isLoading,
    isError,
  } = useQuery<PublicUserProfile>({
    queryKey: ["user-profile", validUserId],
    queryFn: async () => {
      const response = await fetch(`/api/users/${encodeURIComponent(validUserId ?? "")}`);
      if (!response.ok) throw new Error("Profile unavailable");
      return response.json() as Promise<PublicUserProfile>;
    },
    enabled: Boolean(validUserId),
  });

  const isOwnProfile = currentUser?.id === validUserId;

  if (isLoading) {
    return (
      <MarketplaceLayout>
        <div className="flex min-h-[420px] items-center justify-center" role="status">
          <Loader2 className="h-8 w-8 animate-spin text-primary" aria-hidden="true" />
          <span className="sr-only">Loading member profile</span>
        </div>
      </MarketplaceLayout>
    );
  }

  if (!validUserId || isError || !profile) {
    return (
      <MarketplaceLayout>
        <div className="mx-auto flex min-h-[420px] max-w-xl flex-col items-center justify-center text-center">
          <UserRound className="h-10 w-10 text-muted-foreground" aria-hidden="true" />
          <h1 className="mt-4 font-serif text-2xl font-semibold">Member profile unavailable</h1>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            The profile does not exist or is not available to this MarketFlow workspace.
          </p>
          <Button asChild className="mt-6">
            <Link href="/marketflow">
              <ArrowLeft className="mr-2 h-4 w-4" aria-hidden="true" />
              Back to MarketFlow
            </Link>
          </Button>
        </div>
      </MarketplaceLayout>
    );
  }

  const name = displayName(profile);
  const createdAt = formattedDate(profile.createdAt);

  return (
    <MarketplaceLayout>
      <div className="mx-auto w-full max-w-4xl space-y-6">
        <Button variant="ghost" asChild className="w-fit">
          <Link href="/marketflow" data-testid="button-back">
            <ArrowLeft className="mr-2 h-4 w-4" aria-hidden="true" />
            Back to MarketFlow
          </Link>
        </Button>

        <div className="grid gap-6 lg:grid-cols-[minmax(260px,0.75fr)_minmax(0,1.25fr)]">
          <Card>
            <CardContent className="flex flex-col items-center px-6 py-8 text-center">
              <Avatar className="h-24 w-24">
                <AvatarImage src={profile.profileImageUrl || undefined} alt={name} />
                <AvatarFallback className="bg-primary text-2xl text-primary-foreground">
                  {initials(profile)}
                </AvatarFallback>
              </Avatar>

              <Badge variant="outline" className="mt-5">Controlled-pilot profile</Badge>
              <h1 className="mt-3 font-serif text-2xl font-semibold" data-testid="text-profile-name">
                {name}
              </h1>

              {createdAt ? (
                <p className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                  <CalendarDays className="h-4 w-4" aria-hidden="true" />
                  Profile created {createdAt}
                </p>
              ) : null}

              {!isOwnProfile && isAuthenticated ? (
                <Button variant="outline" className="mt-6 w-full" asChild>
                  <Link
                    href={`/marketflow/messages?to=${encodeURIComponent(validUserId)}`}
                    data-testid="button-message"
                  >
                    <MessageCircle className="mr-2 h-4 w-4" aria-hidden="true" />
                    Message
                  </Link>
                </Button>
              ) : null}
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <ShieldCheck className="h-5 w-5 text-primary" aria-hidden="true" />
                  Profile boundary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm leading-7 text-muted-foreground">
                  This page confirms a MarketFlow account identity only. It is not a Pegasus endorsement, approval, certification, professional license, transaction history, or availability signal.
                </p>
                <p className="text-sm leading-7 text-muted-foreground">
                  Performance metrics are not published during the controlled pilot because transactions, returns, response rates, rankings, badges, and activity are not currently verified as public proof.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Star className="h-5 w-5 text-primary" aria-hidden="true" />
                  Reviews
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Button
                  disabled
                  aria-describedby="review-unavailable-note"
                  data-testid="button-write-review"
                >
                  Reviews unavailable
                </Button>
                <p id="review-unavailable-note" className="mt-3 text-sm leading-6 text-muted-foreground">
                  {REVIEW_UNAVAILABLE_COPY}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="flex gap-3 py-5">
                <Info className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" aria-hidden="true" />
                <p className="text-sm leading-6 text-muted-foreground">
                  Use Messages only for private workspace communication. A profile or message does not create representation, a transaction, or a duty to respond.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MarketplaceLayout>
  );
}
