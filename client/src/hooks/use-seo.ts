import { useEffect } from "react";
import { isPreviewHostname } from "@shared/preview-hosts";

interface SEOProps {
  title?: string;
  description?: string;
  type?: string;
  image?: string;
  noIndex?: boolean;
  noCanonical?: boolean;
  noTagline?: boolean;
}

// Empire Doctrine v1.0.1 — Wave 4 title pattern:
//   [Page] · Pegasus Dreamscapes
// Tagline is dropped from per-page titles so they stay under the
// 60-character SERP truncation limit. The home (no `title` passed)
// still renders the brand + tagline as the bare-document title.
const BRAND = "Pegasus Dreamscapes";
// Public Website v1 (issue #22) PRD §12 locks the homepage title verbatim.
// It intentionally exceeds the per-page 60-char clamp (which only applies to
// composed `page · brand` titles, not this locked base title).
const BASE_TITLE = "Pegasus Dreamscapes — Complex Real Estate, Made Executable";
const BASE_DESCRIPTION =
  "A real estate operating company for complex opportunities in the East Bay. Bring a property, a deal, or a project and get a straight read on the path forward.";
const SITE_URL = "https://pegasusdreamscapes.com";
const DEFAULT_OG_IMAGE = `${SITE_URL}/og/default.png`;

const MAX_TITLE = 60;
const MAX_DESC = 160;

function clamp(value: string, max: number) {
  if (value.length <= max) return value;
  // Soft-truncate at the last word boundary before max-1 and append ellipsis.
  const slice = value.slice(0, max - 1);
  const lastSpace = slice.lastIndexOf(" ");
  const cut = lastSpace > max * 0.6 ? slice.slice(0, lastSpace) : slice;
  return `${cut.replace(/[.,;:\-–—\s]+$/, "")}…`;
}

function setMeta(selector: string, attr: "name" | "property", key: string, value: string) {
  let el = document.head.querySelector<HTMLMetaElement>(selector);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", value);
}

function setLink(rel: string, href: string) {
  let el = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", rel);
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
}

function absoluteImage(image: string | undefined) {
  const raw = image || DEFAULT_OG_IMAGE;
  if (/^https?:\/\//i.test(raw)) return raw;
  if (raw.startsWith("/")) return `${SITE_URL}${raw}`;
  return `${SITE_URL}/${raw}`;
}

export function useSEO({
  title,
  description,
  type = "website",
  image,
  noIndex,
  noCanonical,
  noTagline,
}: SEOProps = {}) {
  useEffect(() => {
    // Per-page titles always drop the tagline to stay under the SERP
    // truncation limit. `noTagline` is accepted for backwards-compat with
    // earlier callers but no longer changes behavior in v1.0.1.
    void noTagline;
    // Per-page composed titles are clamped for SERP truncation; the locked
    // PRD base title passes through verbatim.
    const fullTitle = title ? clamp(`${title} · ${BRAND}`, MAX_TITLE) : BASE_TITLE;
    const desc = clamp(description || BASE_DESCRIPTION, MAX_DESC);
    const ogImage = absoluteImage(image);
    const previewHost =
      typeof window !== "undefined" && isPreviewHostname(window.location.hostname);
    const url =
      typeof window !== "undefined"
        ? previewHost
          ? `${window.location.origin}${window.location.pathname}`
          : `${SITE_URL}${window.location.pathname}`
        : SITE_URL;

    document.title = fullTitle;

    setMeta('meta[name="description"]', "name", "description", desc);
    setMeta(
      'meta[name="robots"]',
      "name",
      "robots",
      previewHost
        ? "noindex, nofollow, noarchive, nosnippet"
        : noIndex
          ? "noindex, nofollow"
          : "index, follow",
    );

    setMeta('meta[property="og:title"]', "property", "og:title", fullTitle);
    setMeta('meta[property="og:description"]', "property", "og:description", desc);
    setMeta('meta[property="og:type"]', "property", "og:type", type);
    setMeta('meta[property="og:url"]', "property", "og:url", url);
    setMeta('meta[property="og:image"]', "property", "og:image", ogImage);
    setMeta('meta[property="og:image:width"]', "property", "og:image:width", "1200");
    setMeta('meta[property="og:image:height"]', "property", "og:image:height", "630");
    setMeta('meta[property="og:site_name"]', "property", "og:site_name", BRAND);

    setMeta('meta[name="twitter:card"]', "name", "twitter:card", "summary_large_image");
    setMeta('meta[name="twitter:title"]', "name", "twitter:title", fullTitle);
    setMeta('meta[name="twitter:description"]', "name", "twitter:description", desc);
    setMeta('meta[name="twitter:image"]', "name", "twitter:image", ogImage);

    if (previewHost || noCanonical) {
      document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]')?.remove();
    } else {
      setLink("canonical", url);
    }

    return () => {
      document.title = BASE_TITLE;
    };
  }, [title, description, type, image, noIndex, noCanonical, noTagline]);
}
