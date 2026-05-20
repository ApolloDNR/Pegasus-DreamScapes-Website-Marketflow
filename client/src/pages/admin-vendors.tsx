import { useQuery } from "@tanstack/react-query";
import { useSEO } from "@/hooks/use-seo";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Mail, Phone, Calendar, Wrench } from "lucide-react";
import type { Lead } from "@shared/schema";

const formatDate = (iso: string | Date | null) => {
  if (!iso) return "—";
  const d = typeof iso === "string" ? new Date(iso) : iso;
  return d.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
};

export default function AdminVendorsPage() {
  useSEO({
    title: "Vendor Applications — HQ",
    description: "Internal review of vendor network applications.",
    noIndex: true,
  });

  const { data: vendors, isLoading, error } = useQuery<Lead[]>({
    queryKey: ["/api/hq/vendors"],
  });

  return (
    <div className="min-h-screen bg-background pt-20 pb-16">
      <div className="max-w-6xl mx-auto px-6">
        <header className="mb-10">
          <p className="text-[11px] uppercase tracking-[0.3em] text-primary font-supporting font-semibold mb-3">
            HQ · Vendor Network
          </p>
          <h1 className="font-serif text-4xl sm:text-5xl font-semibold tracking-tight" data-testid="text-vendor-admin-title">
            Vendor Applications
          </h1>
          <p className="text-base text-muted-foreground mt-3 max-w-2xl">
            Every application submitted through the Vendor Network intake. Review, vet, and route to the appropriate trade lead.
          </p>
        </header>

        {isLoading && (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground" data-testid="status-vendors-loading">
              Loading applications...
            </CardContent>
          </Card>
        )}

        {error && (
          <Card className="border-destructive/40">
            <CardContent className="py-8 text-center text-destructive" data-testid="status-vendors-error">
              Failed to load vendor applications. {(error as Error)?.message}
            </CardContent>
          </Card>
        )}

        {vendors && vendors.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center" data-testid="status-vendors-empty">
              <Wrench className="w-8 h-8 mx-auto mb-3 text-muted-foreground" />
              <p className="text-muted-foreground">No vendor applications yet.</p>
            </CardContent>
          </Card>
        )}

        {vendors && vendors.length > 0 && (
          <div className="space-y-4">
            <div className="text-sm text-muted-foreground mb-2" data-testid="text-vendor-count">
              {vendors.length} application{vendors.length === 1 ? "" : "s"}
            </div>
            {vendors.map((v) => {
              const leadData = (v.leadData ?? {}) as Record<string, unknown>;
              const company = (leadData.company as string) || (leadData.companyName as string) || null;
              const trade = (leadData.trade as string) || (leadData.tradeCategory as string) || (leadData.category as string) || null;
              const license = (leadData.license as string) || (leadData.licenseNumber as string) || null;
              const serviceArea = (leadData.serviceArea as string) || (leadData.area as string) || null;
              const fullName = [v.firstName, v.lastName].filter(Boolean).join(" ") || "Unknown";

              return (
                <Card key={v.id} data-testid={`card-vendor-${v.id}`}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                      <div>
                        <CardTitle className="font-serif text-2xl" data-testid={`text-vendor-name-${v.id}`}>
                          {fullName}
                        </CardTitle>
                        {company && (
                          <p className="text-sm text-muted-foreground mt-1" data-testid={`text-vendor-company-${v.id}`}>
                            {company}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        {trade && (
                          <Badge variant="outline" className="border-primary/40 text-primary" data-testid={`badge-vendor-trade-${v.id}`}>
                            {trade}
                          </Badge>
                        )}
                        <Badge variant="secondary" data-testid={`badge-vendor-stage-${v.id}`}>
                          {v.stage || "new"}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                      {v.email && (
                        <a
                          href={`mailto:${v.email}`}
                          className="flex items-center gap-2 text-foreground hover:text-primary transition-colors"
                          data-testid={`link-vendor-email-${v.id}`}
                        >
                          <Mail className="w-4 h-4 text-muted-foreground" />
                          {v.email}
                        </a>
                      )}
                      {v.phone && (
                        <a
                          href={`tel:${v.phone}`}
                          className="flex items-center gap-2 text-foreground hover:text-primary transition-colors"
                          data-testid={`link-vendor-phone-${v.id}`}
                        >
                          <Phone className="w-4 h-4 text-muted-foreground" />
                          {v.phone}
                        </a>
                      )}
                      {license && (
                        <div className="flex items-center gap-2 text-foreground">
                          <span className="text-xs uppercase tracking-wider text-muted-foreground">License:</span>
                          <span data-testid={`text-vendor-license-${v.id}`}>{license}</span>
                        </div>
                      )}
                      {serviceArea && (
                        <div className="flex items-center gap-2 text-foreground">
                          <span className="text-xs uppercase tracking-wider text-muted-foreground">Service area:</span>
                          <span data-testid={`text-vendor-area-${v.id}`}>{serviceArea}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-muted-foreground md:col-span-2">
                        <Calendar className="w-4 h-4" />
                        <span data-testid={`text-vendor-submitted-${v.id}`}>Submitted {formatDate(v.createdAt as unknown as string)}</span>
                      </div>
                    </div>
                    {v.notes && (
                      <div className="mt-4 pt-4 border-t border-border/50">
                        <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Notes</p>
                        <p className="text-sm text-foreground whitespace-pre-wrap" data-testid={`text-vendor-notes-${v.id}`}>
                          {v.notes}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
