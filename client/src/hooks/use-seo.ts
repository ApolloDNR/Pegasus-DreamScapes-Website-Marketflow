import { useEffect } from "react";

interface SEOProps {
  title?: string;
  description?: string;
  type?: string;
}

const BASE_TITLE = "Pegasus Dreamscapes Corp";
const BASE_DESCRIPTION = "Transform distressed properties into profitable investments. Browse wholesale deals, capital projects, and listings.";

export function useSEO({ title, description, type = "website" }: SEOProps = {}) {
  useEffect(() => {
    const fullTitle = title ? `${title} | ${BASE_TITLE}` : BASE_TITLE;
    document.title = fullTitle;

    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute("content", description || BASE_DESCRIPTION);
    }

    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) {
      ogTitle.setAttribute("content", fullTitle);
    }

    const ogDescription = document.querySelector('meta[property="og:description"]');
    if (ogDescription) {
      ogDescription.setAttribute("content", description || BASE_DESCRIPTION);
    }

    const ogType = document.querySelector('meta[property="og:type"]');
    if (ogType) {
      ogType.setAttribute("content", type);
    }

    const twitterTitle = document.querySelector('meta[name="twitter:title"]');
    if (twitterTitle) {
      twitterTitle.setAttribute("content", fullTitle);
    }

    const twitterDescription = document.querySelector('meta[name="twitter:description"]');
    if (twitterDescription) {
      twitterDescription.setAttribute("content", description || BASE_DESCRIPTION);
    }

    return () => {
      document.title = BASE_TITLE;
    };
  }, [title, description, type]);
}
