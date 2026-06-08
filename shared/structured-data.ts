// shared/structured-data.ts
// Route-aware JSON-LD (schema.org) structured data. The server injector
// (server/seo-html.ts) calls jsonLdFor(pathname) at request time and writes the
// resulting graph into the HTML shell so crawlers (Google Rich Results) see the
// right entities without executing client JS.
//
// Grounding rule: only real, already-published facts. No invented numbers,
// timelines, or credentials. Business identity mirrors the existing site copy
// (DRE #02333658, phone 925-744-8525, Keller Williams East Bay).

import { SITE_URL, seoFor } from "./seo-routes";
import { FAQ_SECTIONS } from "./faq-data";

// Grounded, already-published facts for the Nelson Drive case study. Mirrors the
// public NELSON record in client/src/pegasus/data.tsx; kept here (rather than
// importing client code into the server bundle) to avoid coupling the server to
// the client module tree. If the case-study record changes, update both.
const NELSON = {
  name: "Nelson Drive",
  location: "Richmond / El Sobrante Area, CA",
  settled: "September 2025",
} as const;

const ORG_ID = `${SITE_URL}/#organization`;
const LOGO_URL = `${SITE_URL}/icon-512.png`;
const DEFAULT_IMAGE = `${SITE_URL}/og/default.png`;

const PHONE = "+1-925-744-8525";
const EMAIL = "apollo@pegasusdreamscapes.com";
const DRE = "DRE #02333658";

// Lightweight Organization node — present on every route so the brand entity is
// always discoverable and so Article/FAQ nodes have a publisher to reference.
function organizationNode(): Record<string, unknown> {
  return {
    "@type": "Organization",
    "@id": ORG_ID,
    name: "Pegasus DreamScapes Corp.",
    alternateName: "Pegasus DreamScapes",
    url: SITE_URL,
    logo: LOGO_URL,
    image: DEFAULT_IMAGE,
    email: EMAIL,
    telephone: PHONE,
    identifier: DRE,
    memberOf: {
      "@type": "Organization",
      name: "Keller Williams East Bay",
      description: "Each office is independently owned and operated.",
    },
  };
}

// Richer RealEstateAgent (a LocalBusiness subtype) for the home and about
// pages, where the business identity is the point. Carries the licensed
// founder, contact point, and service area.
function realEstateAgentNode(): Record<string, unknown> {
  return {
    "@type": "RealEstateAgent",
    "@id": ORG_ID,
    name: "Pegasus DreamScapes Corp.",
    alternateName: "Pegasus DreamScapes",
    url: SITE_URL,
    logo: LOGO_URL,
    image: DEFAULT_IMAGE,
    description:
      "Strategy-first real estate operating company serving the East Bay. Complex property, structured opportunity. Every property gets a path.",
    email: EMAIL,
    telephone: PHONE,
    identifier: DRE,
    areaServed: {
      "@type": "AdministrativeArea",
      name: "East Bay, California",
    },
    address: {
      "@type": "PostalAddress",
      addressRegion: "CA",
      addressCountry: "US",
    },
    contactPoint: {
      "@type": "ContactPoint",
      telephone: PHONE,
      email: EMAIL,
      contactType: "customer service",
      areaServed: "US",
      availableLanguage: ["English"],
    },
    founder: {
      "@type": "Person",
      name: 'Paolo "Apollo" Duran',
      jobTitle: "Founder & Principal",
      identifier: DRE,
    },
    memberOf: {
      "@type": "Organization",
      name: "Keller Williams East Bay",
      description: "Each office is independently owned and operated.",
    },
  };
}

// Article node for the Nelson Drive case study. Facts come from the published
// NELSON case-study record (location + settled date); no extra claims added.
function nelsonArticleNode(pathname: string): Record<string, unknown> {
  const meta = seoFor(pathname);
  const settled = NELSON.settled;
  const node: Record<string, unknown> = {
    "@type": "Article",
    headline: `${NELSON.name} Case Study`,
    description: meta.description,
    image: meta.image,
    about: `${NELSON.name}, ${NELSON.location}`,
    articleSection: "Case Study",
    url: `${SITE_URL}${pathname}`,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${SITE_URL}${pathname}`,
    },
    author: {
      "@type": "Person",
      name: 'Paolo "Apollo" Duran',
    },
    publisher: { "@id": ORG_ID },
  };
  // "Settled September 2025" -> a coarse but real published month.
  if (settled) {
    const parsed = parseSettledMonth(settled);
    if (parsed) node.datePublished = parsed;
  }
  return node;
}

// Turns a label like "September 2025" into an ISO date (first of the month).
// Returns undefined if it can't be parsed, so we never emit a fabricated date.
function parseSettledMonth(label: string): string | undefined {
  const m = label.match(
    /\b(January|February|March|April|May|June|July|August|September|October|November|December)\b\s+(\d{4})/i,
  );
  if (!m) return undefined;
  const months = [
    "january", "february", "march", "april", "may", "june",
    "july", "august", "september", "october", "november", "december",
  ];
  const idx = months.indexOf(m[1].toLowerCase());
  if (idx < 0) return undefined;
  const mm = String(idx + 1).padStart(2, "0");
  return `${m[2]}-${mm}-01`;
}

// FAQPage node built from the shared FAQ source of truth.
function faqPageNode(): Record<string, unknown> {
  const mainEntity = FAQ_SECTIONS.flatMap((section) =>
    section.items.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.a,
      },
    })),
  );
  return {
    "@type": "FAQPage",
    "@id": `${SITE_URL}/faq#faqpage`,
    mainEntity,
  };
}

// Returns the JSON-LD graph nodes appropriate for a given route.
export function jsonLdFor(pathname: string): Record<string, unknown>[] {
  if (pathname === "/" || pathname === "/about") {
    return [realEstateAgentNode()];
  }
  if (pathname === "/projects/nelson-dr") {
    return [organizationNode(), nelsonArticleNode(pathname)];
  }
  if (pathname === "/faq") {
    return [organizationNode(), faqPageNode()];
  }
  return [organizationNode()];
}

// Serializes the route's JSON-LD into a single <script type="application/ld+json">
// tag, escaping "<" so a stray "</script>" in content can't break out of the tag.
export function jsonLdScript(pathname: string): string {
  const nodes = jsonLdFor(pathname);
  const graph =
    nodes.length === 1
      ? { "@context": "https://schema.org", ...nodes[0] }
      : { "@context": "https://schema.org", "@graph": nodes };
  const json = JSON.stringify(graph, null, 2).replace(/</g, "\\u003c");
  return `<script type="application/ld+json">\n${json}\n    </script>`;
}
