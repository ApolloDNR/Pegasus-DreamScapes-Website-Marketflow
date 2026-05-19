import { useEffect } from "react";

interface SEOProps {
  title?: string;
  description?: string;
  type?: string;
  image?: string;
  noIndex?: boolean;
  noTagline?: boolean;
}

const BRAND = "Pegasus DreamScapes Corp.";
const TAGLINE = "The Deal Architect";
const BASE_TITLE = `${BRAND} · ${TAGLINE}`;
const BASE_DESCRIPTION =
  "Pegasus DreamScapes Corp. is a strategy-first real estate operating company. Complex property, structured opportunity. Every property gets a serious review.";
const SITE_URL = "https://pegasusdreamscapes.com";
const DEFAULT_OG_IMAGE = `${SITE_URL}/og/default.svg`;

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

export function useSEO({ title, description, type = "website", image, noIndex, noTagline }: SEOProps = {}) {
  useEffect(() => {
    const suffix = noTagline ? BRAND : BASE_TITLE;
    const fullTitle = title ? `${title} · ${suffix}` : BASE_TITLE;
    const desc = description || BASE_DESCRIPTION;
    const ogImage = image || DEFAULT_OG_IMAGE;
    const url = typeof window !== "undefined" ? `${SITE_URL}${window.location.pathname}` : SITE_URL;

    document.title = fullTitle;

    setMeta('meta[name="description"]', "name", "description", desc);
    setMeta('meta[name="robots"]', "name", "robots", noIndex ? "noindex, nofollow" : "index, follow");

    setMeta('meta[property="og:title"]', "property", "og:title", fullTitle);
    setMeta('meta[property="og:description"]', "property", "og:description", desc);
    setMeta('meta[property="og:type"]', "property", "og:type", type);
    setMeta('meta[property="og:url"]', "property", "og:url", url);
    setMeta('meta[property="og:image"]', "property", "og:image", ogImage);
    setMeta('meta[property="og:site_name"]', "property", "og:site_name", BRAND);

    setMeta('meta[name="twitter:card"]', "name", "twitter:card", "summary_large_image");
    setMeta('meta[name="twitter:title"]', "name", "twitter:title", fullTitle);
    setMeta('meta[name="twitter:description"]', "name", "twitter:description", desc);
    setMeta('meta[name="twitter:image"]', "name", "twitter:image", ogImage);

    setLink("canonical", url);

    return () => {
      document.title = BASE_TITLE;
    };
  }, [title, description, type, image, noIndex, noTagline]);
}
