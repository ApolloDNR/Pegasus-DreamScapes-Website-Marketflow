import fs from "node:fs";
import path from "node:path";
import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { CATEGORIES } from "@/pegasus/data";
import { FAQBlock } from "@/pegasus/blocks";

// FAQ teaser deep-link contract (Task #172).
//
// The homepage and audience category pages render a "See all questions"
// link (FAQBlock -> data-testid="link-faq-see-all") that deep-links into a
// grouped section on /faq via `cat.faqAnchor` (e.g. /faq#marketflow-network).
// The anchor must match an actual section id on the /faq page, which is the
// slugify() of each section's `eyebrow`. A future copy or slug change could
// silently break the link -> anchor mapping, so we lock it here:
//
//   (1) Every category faqAnchor matches a real /faq section id.
//   (2) FAQBlock renders the "See all questions" link with the expected href.

// Mirror of the slugify() used in client/src/pages/faq.tsx to build section ids.
const slugify = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

function faqSectionIds(): Set<string> {
  const src = fs.readFileSync(
    path.join(process.cwd(), "client/src/pages/faq.tsx"),
    "utf-8",
  );
  // The SECTIONS array drives the page: each entry has `eyebrow: "..."` and
  // the rendered section id is slugify(eyebrow).
  const ids = new Set<string>();
  const re = /eyebrow:\s*["']([^"']+)["']/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(src)) !== null) {
    ids.add(slugify(m[1]));
  }
  return ids;
}

const categoryAnchors = Object.entries(CATEGORIES)
  .map(([key, cat]) => ({ key, faqAnchor: cat.faqAnchor }))
  .filter((c): c is { key: string; faqAnchor: string } => Boolean(c.faqAnchor));

describe("FAQ teaser deep-link anchors", () => {
  afterEach(() => cleanup());

  it("parses real section ids out of the /faq page", () => {
    const ids = faqSectionIds();
    // Sanity: the page must define some sections, otherwise the regex broke.
    expect(ids.size).toBeGreaterThan(0);
    expect(ids.has("submitting-a-property")).toBe(true);
  });

  it("has at least one category wired to a faqAnchor", () => {
    expect(categoryAnchors.length).toBeGreaterThan(0);
  });

  it.each(categoryAnchors)(
    "category '$key' faqAnchor '$faqAnchor' matches a real /faq section id",
    ({ faqAnchor }) => {
      const ids = faqSectionIds();
      expect(ids).toContain(faqAnchor);
    },
  );

  it("FAQBlock renders the 'See all questions' link with the expected href", () => {
    render(
      <FAQBlock
        items={[{ q: "Q?", a: "A." }]}
        allHref="/faq#marketflow-network"
      />,
    );
    const link = screen.getByTestId("link-faq-see-all");
    expect(link).toBeInTheDocument();
    expect(link.tagName).toBe("A");
    expect(link).toHaveAttribute("href", "/faq#marketflow-network");
  });

  it("FAQBlock defaults the link to /faq when no anchor is given", () => {
    render(<FAQBlock items={[{ q: "Q?", a: "A." }]} />);
    expect(screen.getByTestId("link-faq-see-all")).toHaveAttribute(
      "href",
      "/faq",
    );
  });
});
