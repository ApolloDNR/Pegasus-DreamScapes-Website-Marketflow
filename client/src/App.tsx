import { lazy, Suspense } from "react";
import { useLocation } from "wouter";
import { isPegasusUrl } from "@/pegasus/routes";
import PublicApp from "@/PublicApp";
import { normalizeSpaPath } from "@shared/spa-routes";
import { useSEO } from "@/hooks/use-seo";
import {
  isPrivateNoindexSpaPath,
  seoFor,
  seoNameFor,
} from "@shared/seo-routes";

const LegacyApp = lazy(() => import("@/LegacyApp"));

function RouteSeoDefaults({ location }: { location: string }) {
  const pathname = normalizeSpaPath(location);
  const privateRoute = isPrivateNoindexSpaPath(pathname);
  const seo = seoFor(pathname);
  useSEO({
    title: privateRoute ? "Private workspace" : seoNameFor(pathname),
    description: privateRoute
      ? "Private Pegasus workspace. Access and content are not public."
      : seo.description,
    image: seo.image,
    type: seo.type,
    noIndex: privateRoute || seo.noIndex,
    noCanonical: privateRoute,
  });
  return null;
}

function RootLoader() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center gap-5 bg-background text-foreground"
      role="status"
      aria-label="Loading"
    >
      <div className="relative h-10 w-10" aria-hidden="true">
        <div className="absolute inset-0 rounded-full border-2 border-primary/15" />
        <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-primary animate-spin" />
      </div>
      <p className="text-[10px] uppercase tracking-[0.3em] text-primary font-supporting font-semibold">
        Reading the situation…
      </p>
    </div>
  );
}

export default function App() {
  const [location] = useLocation();

  const metadata = <RouteSeoDefaults location={location} />;

  if (isPegasusUrl(normalizeSpaPath(location))) {
    return <>{metadata}<PublicApp /></>;
  }

  return (
    <>
      {metadata}
      <Suspense fallback={<RootLoader />}>
        <LegacyApp />
      </Suspense>
    </>
  );
}
