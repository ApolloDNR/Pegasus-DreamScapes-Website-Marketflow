import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Link, useRoute } from "wouter";
import {
  AlertTriangle,
  ArrowLeft,
  Bookmark,
  Building2,
  CalendarDays,
  CheckCircle2,
  Clipboard,
  ExternalLink,
  FileText,
  Loader2,
  MapPin,
  Pencil,
  Save,
  X,
} from "lucide-react";

import { DealflowLayout } from "@/components/dealflow-layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useSupabaseAuth } from "@/contexts/supabase-auth-context";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface CapitalProject {
  id: number;
  title: string;
  description?: string | null;
  location?: string | null;
  fundingGoal?: number | null;
  amountRaised?: number | null;
  minInvestment?: number | null;
  structure?: string | null;
  projectedReturn?: string | null;
  holdPeriod?: string | null;
  status: string;
  images?: string[] | null;
  riskLevel?: string | null;
  neighborhoodGrade?: string | null;
  strategy?: string | null;
  propertyType?: string | null;
  purchasePrice?: number | null;
  rehabBudget?: number | null;
  softCosts?: number | null;
  contingency?: number | null;
  projectedARV?: number | null;
  projectedProfit?: number | null;
  acquisitionDate?: string | null;
  constructionStart?: string | null;
  constructionEnd?: string | null;
  stabilizationDate?: string | null;
  exitDate?: string | null;
  startDate?: string | null;
  estimatedCompletion?: string | null;
}

interface ProjectMilestone {
  id: number;
  title?: string | null;
  description?: string | null;
  isComplete?: boolean | null;
  targetDate?: string | null;
  completedAt?: string | null;
}

interface SavedDeal {
  id: number | string;
  dealType: string;
  dealId: number;
  action?: string | null;
}

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);

const formatStatus = (status: string) =>
  status
    .trim()
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());

const formatDate = (value?: string | null) => {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

function ReadOnlyMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-t border-border/70 py-3 first:border-t-0 first:pt-0 last:pb-0">
      <dt className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">
        {label}
      </dt>
      <dd className="mt-1 text-sm font-medium text-foreground">{value}</dd>
    </div>
  );
}

export default function DealflowProject() {
  const { isAuthenticated, isAdmin } = useSupabaseAuth();
  const { toast } = useToast();
  const [, params] = useRoute("/dealflow/project/:id");
  const parsedProjectId = params?.id ? Number(params.id) : Number.NaN;
  const projectId = Number.isSafeInteger(parsedProjectId) && parsedProjectId > 0
    ? parsedProjectId
    : null;
  const [isEditMode, setIsEditMode] = useState(false);
  const [editData, setEditData] = useState<Partial<CapitalProject>>({});

  const {
    data: project,
    isLoading,
    isError,
  } = useQuery<CapitalProject>({
    queryKey: ["/api/capital-projects", projectId],
    enabled: projectId !== null,
  });

  const {
    data: milestones = [],
    isError: milestonesUnavailable,
  } = useQuery<ProjectMilestone[]>({
    queryKey: [`/api/capital-projects/${projectId}/milestones`],
    enabled: projectId !== null,
  });

  const { data: savedDeals = [] } = useQuery<SavedDeal[]>({
    queryKey: ["/api/deals/saved"],
    enabled: Boolean(projectId && isAuthenticated),
  });

  const isSaved = projectId !== null && savedDeals.some(
    (saved) =>
      saved.dealType === "capital_project" &&
      Number(saved.dealId) === projectId &&
      saved.action !== "pass",
  );

  const updateProjectMutation = useMutation({
    mutationFn: async (data: Partial<CapitalProject>) => {
      const response = await apiRequest(
        "PATCH",
        `/api/hq/capital-projects/${projectId}`,
        data,
      );
      return response.json() as Promise<CapitalProject>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/capital-projects", projectId] });
      queryClient.invalidateQueries({ queryKey: ["/api/capital-projects"] });
      setIsEditMode(false);
      setEditData({});
      toast({
        title: "Project record updated",
        description: "The authorized record changes were saved.",
      });
    },
    onError: (error: unknown) => {
      toast({
        title: "Project update failed",
        description: error instanceof Error ? error.message : "Try again or contact an administrator.",
        variant: "destructive",
      });
    },
  });

  const saveProjectMutation = useMutation({
    mutationFn: async (nextSaved: boolean) => {
      if (!projectId) throw new Error("Project record is unavailable.");
      if (nextSaved) {
        return apiRequest("POST", "/api/deals/action", {
          dealType: "capital_project",
          dealId: projectId,
          action: "save",
        });
      }
      return apiRequest(
        "DELETE",
        `/api/deals/capital_project/${projectId}/saved`,
      );
    },
    onSuccess: (_response, nextSaved) => {
      queryClient.setQueryData<SavedDeal[]>(["/api/deals/saved"], (current = []) => {
        const withoutProject = current.filter(
          (saved) =>
            saved.dealType !== "capital_project" || Number(saved.dealId) !== projectId,
        );
        return nextSaved && projectId
          ? [
              ...withoutProject,
              {
                id: `capital_project-${projectId}`,
                dealType: "capital_project",
                dealId: projectId,
                action: "save",
              },
            ]
          : withoutProject;
      });
      queryClient.invalidateQueries({ queryKey: ["/api/deals/saved"] });
      toast({
        title: nextSaved ? "Project saved" : "Project removed",
        description: nextSaved
          ? "This record is now in your saved MarketFlow items."
          : "This record was removed from your saved MarketFlow items.",
      });
    },
    onError: () => {
      toast({
        title: "Save failed",
        description: "The project record was not changed. Please try again.",
        variant: "destructive",
      });
    },
  });

  const beginEditing = () => {
    if (!project) return;
    setEditData({
      title: project.title,
      description: project.description,
      location: project.location,
      status: project.status,
    });
    setIsEditMode(true);
  };

  const cancelEditing = () => {
    setEditData({});
    setIsEditMode(false);
  };

  const copyProtectedLink = async () => {
    if (!project || typeof window === "undefined") return;
    try {
      if (!navigator.clipboard?.writeText) {
        throw new Error("Clipboard access is unavailable.");
      }
      await navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Protected link copied",
        description: "Recipients still need authorized MarketFlow access to open this record.",
      });
    } catch {
      toast({
        title: "Could not copy the link",
        description: "Use your browser's address bar to copy this protected page URL.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <DealflowLayout>
        <div className="mx-auto flex min-h-[420px] max-w-xl flex-col items-center justify-center px-4 text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" aria-hidden="true" />
          <p className="mt-4 text-sm text-muted-foreground" role="status">
            Loading the authorized project record…
          </p>
        </div>
      </DealflowLayout>
    );
  }

  if (isError || !project) {
    return (
      <DealflowLayout>
        <div className="mx-auto flex min-h-[420px] max-w-xl flex-col items-center justify-center px-4 text-center">
          <AlertTriangle className="h-10 w-10 text-muted-foreground" aria-hidden="true" />
          <h1 className="mt-4 font-serif text-2xl font-semibold">Project record unavailable</h1>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            The record does not exist, is no longer published to your workspace, or your account cannot access it.
          </p>
          <Button asChild className="mt-6">
            <Link href="/marketflow/deals">
              <ArrowLeft className="mr-2 h-4 w-4" aria-hidden="true" />
              Back to Deal Flow
            </Link>
          </Button>
        </div>
      </DealflowLayout>
    );
  }

  const assumptions = [
    ["Purchase price", project.purchasePrice],
    ["Rehabilitation budget", project.rehabBudget],
    ["Soft costs", project.softCosts],
    ["Contingency", project.contingency],
    ["Projected after-repair value", project.projectedARV],
    ["Projected profit", project.projectedProfit],
  ].filter((entry): entry is [string, number] => typeof entry[1] === "number");

  const timeline = [
    ["Acquisition", project.acquisitionDate],
    ["Work begins", project.constructionStart || project.startDate],
    ["Work target", project.constructionEnd || project.estimatedCompletion],
    ["Stabilization", project.stabilizationDate],
    ["Exit target", project.exitDate],
  ]
    .map(([label, value]) => [label, formatDate(value)] as const)
    .filter((entry): entry is readonly [string, string] => Boolean(entry[1]));

  return (
    <DealflowLayout>
      <div className="mx-auto w-full max-w-6xl space-y-6">
        <div className="flex flex-col gap-4 border-b border-border pb-5 sm:flex-row sm:items-center sm:justify-between">
          <Button variant="ghost" asChild className="w-fit">
            <Link href="/marketflow/deals" data-testid="button-back">
              <ArrowLeft className="mr-2 h-4 w-4" aria-hidden="true" />
              Back to Deal Flow
            </Link>
          </Button>

          <div className="flex flex-wrap items-center gap-2">
            {isAdmin && (isEditMode ? (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={cancelEditing}
                  data-testid="button-cancel-edit"
                >
                  <X className="mr-2 h-4 w-4" aria-hidden="true" />
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={() => updateProjectMutation.mutate(editData)}
                  disabled={updateProjectMutation.isPending || Object.keys(editData).length === 0}
                  data-testid="button-save-edit"
                >
                  {updateProjectMutation.isPending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                  ) : (
                    <Save className="mr-2 h-4 w-4" aria-hidden="true" />
                  )}
                  Save changes
                </Button>
              </>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={beginEditing}
                data-testid="button-edit-project"
              >
                <Pencil className="mr-2 h-4 w-4" aria-hidden="true" />
                Edit record
              </Button>
            ))}

            <Button
              variant="outline"
              size="sm"
              aria-label={isSaved ? "Remove saved project" : "Save project"}
              aria-pressed={isSaved}
              onClick={() => saveProjectMutation.mutate(!isSaved)}
              disabled={saveProjectMutation.isPending}
              data-testid="button-save-project"
            >
              {saveProjectMutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
              ) : (
                <Bookmark className={`mr-2 h-4 w-4 ${isSaved ? "fill-current" : ""}`} aria-hidden="true" />
              )}
              {isSaved ? "Saved" : "Save"}
            </Button>

            <Button
              variant="outline"
              size="sm"
              aria-label="Copy protected link"
              onClick={copyProtectedLink}
              data-testid="button-share-project"
            >
              <Clipboard className="mr-2 h-4 w-4" aria-hidden="true" />
              Copy link
            </Button>

            <Button variant="outline" size="sm" asChild>
              <Link href="/contact?intent=marketflow" data-testid="button-contact-project">
                <ExternalLink className="mr-2 h-4 w-4" aria-hidden="true" />
                Contact Pegasus
              </Link>
            </Button>
          </div>
        </div>

        <section aria-labelledby="project-title" className="grid gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(280px,0.8fr)]">
          <div className="space-y-6">
            {project.images?.[0] ? (
              <img
                src={project.images[0]}
                alt=""
                className="aspect-[16/7] w-full rounded-md border border-border object-cover"
              />
            ) : null}

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline">Controlled pilot</Badge>
                <Badge variant="secondary">Record status: {formatStatus(project.status)}</Badge>
              </div>
              <h1 id="project-title" className="mt-4 font-serif text-3xl font-semibold tracking-tight sm:text-4xl">
                {project.title}
              </h1>
              {project.location ? (
                <p className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" aria-hidden="true" />
                  {project.location}
                </p>
              ) : null}
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <FileText className="h-5 w-5 text-primary" aria-hidden="true" />
                  Record overview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="max-w-3xl text-sm leading-7 text-muted-foreground">
                  {project.description?.trim() || "No project description has been published to this record."}
                </p>
                <div className="flex flex-wrap gap-2">
                  {project.strategy ? <Badge variant="outline">{formatStatus(project.strategy)}</Badge> : null}
                  {project.propertyType ? <Badge variant="outline">{formatStatus(project.propertyType)}</Badge> : null}
                  {project.neighborhoodGrade ? <Badge variant="outline">Recorded grade {project.neighborhoodGrade}</Badge> : null}
                  {project.riskLevel ? <Badge variant="outline">Recorded risk: {formatStatus(project.riskLevel)}</Badge> : null}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Recorded assumptions</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-5 max-w-3xl text-sm leading-6 text-muted-foreground">
                  These are record inputs, not independently verified facts, a valuation, an appraisal, an offer, or a promised outcome.
                </p>
                {assumptions.length > 0 ? (
                  <dl className="grid gap-x-8 sm:grid-cols-2">
                    {assumptions.map(([label, value]) => (
                      <ReadOnlyMetric key={label} label={label} value={formatCurrency(value)} />
                    ))}
                  </dl>
                ) : (
                  <p className="text-sm text-muted-foreground">No financial assumptions are published for this record.</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Recorded milestones</CardTitle>
              </CardHeader>
              <CardContent>
                {milestonesUnavailable ? (
                  <p className="text-sm text-muted-foreground">
                    Milestone details are unavailable to this account.
                  </p>
                ) : milestones.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No milestones have been published to this record.
                  </p>
                ) : (
                  <ol className="space-y-4">
                    {milestones.map((milestone) => {
                      const date = formatDate(milestone.completedAt || milestone.targetDate);
                      return (
                        <li key={milestone.id} className="flex gap-3 border-t border-border pt-4 first:border-t-0 first:pt-0">
                          <CheckCircle2
                            className={`mt-0.5 h-5 w-5 shrink-0 ${milestone.isComplete ? "text-primary" : "text-muted-foreground"}`}
                            aria-hidden="true"
                          />
                          <div>
                            <p className="text-sm font-medium">
                              {milestone.title?.trim() || "Untitled milestone"}
                            </p>
                            <p className="mt-1 text-xs text-muted-foreground">
                              {milestone.isComplete ? "Recorded complete" : "Recorded planned"}
                              {date ? ` · ${date}` : ""}
                            </p>
                            {milestone.description ? (
                              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                                {milestone.description}
                              </p>
                            ) : null}
                          </div>
                        </li>
                      );
                    })}
                  </ol>
                )}
              </CardContent>
            </Card>
          </div>

          <aside className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Pilot boundary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm leading-6 text-muted-foreground">
                  This authenticated page is a reference record. It does not create an investment offer, commitment, approval, match, allocation, or right to participate.
                </p>
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/capital#capital-introduction">
                    Relationship information
                    <ExternalLink className="ml-2 h-4 w-4" aria-hidden="true" />
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Building2 className="h-5 w-5 text-primary" aria-hidden="true" />
                  Record context
                </CardTitle>
              </CardHeader>
              <CardContent>
                <dl>
                  {typeof project.fundingGoal === "number" ? (
                    <ReadOnlyMetric label="Recorded capital target" value={formatCurrency(project.fundingGoal)} />
                  ) : null}
                  {project.structure ? (
                    <ReadOnlyMetric label="Recorded structure" value={formatStatus(project.structure)} />
                  ) : null}
                  {project.holdPeriod ? (
                    <ReadOnlyMetric label="Recorded horizon" value={project.holdPeriod} />
                  ) : null}
                </dl>
                <p className="mt-4 text-xs leading-5 text-muted-foreground">
                  Progress, participant counts, return figures, and executable terms are not published through this legacy record.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <CalendarDays className="h-5 w-5 text-primary" aria-hidden="true" />
                  Recorded timeline
                </CardTitle>
              </CardHeader>
              <CardContent>
                {timeline.length > 0 ? (
                  <dl>
                    {timeline.map(([label, value]) => (
                      <ReadOnlyMetric key={label} label={label} value={value} />
                    ))}
                  </dl>
                ) : (
                  <p className="text-sm text-muted-foreground">No timeline dates are published for this record.</p>
                )}
              </CardContent>
            </Card>
          </aside>
        </section>

        {isEditMode ? (
          <Card className="border-primary/40" data-testid="project-edit-panel">
            <CardHeader>
              <CardTitle className="text-lg">Edit authorized record fields</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-5 md:grid-cols-2">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="project-title-edit">Title</Label>
                <Input
                  id="project-title-edit"
                  value={editData.title ?? ""}
                  onChange={(event) => setEditData((current) => ({ ...current, title: event.target.value }))}
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="project-description-edit">Description</Label>
                <Textarea
                  id="project-description-edit"
                  value={editData.description ?? ""}
                  onChange={(event) => setEditData((current) => ({ ...current, description: event.target.value }))}
                  rows={5}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="project-location-edit">Location</Label>
                <Input
                  id="project-location-edit"
                  value={editData.location ?? ""}
                  onChange={(event) => setEditData((current) => ({ ...current, location: event.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="project-status-edit">Record status</Label>
                <Input
                  id="project-status-edit"
                  value={editData.status ?? ""}
                  onChange={(event) => setEditData((current) => ({ ...current, status: event.target.value }))}
                />
              </div>
            </CardContent>
          </Card>
        ) : null}
      </div>
    </DealflowLayout>
  );
}
