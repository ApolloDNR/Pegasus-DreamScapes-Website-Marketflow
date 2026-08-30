/** Legacy paths whose attribution/query context must survive migration. */
export const QUERY_PRESERVING_INTAKE_PATHS: ReadonlySet<string> = new Set([
  "/investments",
  "/submit",
  "/submit-property",
  "/submit-deal",
  "/wholesale",
]);

/**
 * Browser aliases with a safe, permanent canonical destination. The same map
 * drives Wouter redirects and real server 301s so in-app and refresh behavior
 * cannot drift.
 */
export const LEGACY_SPA_EXACT_REDIRECTS: ReadonlyArray<
  readonly [from: string, to: string]
> = [
  ["/sell", "/property-owners"],
  ["/investments", "/capital"],
  ["/submit-deal", "/bring-an-opportunity?intent=deal-jv"],
  ["/submit-property", "/bring-an-opportunity"],
  ["/submit", "/bring-an-opportunity"],
  ["/services", "/how-we-operate"],
  ["/buy", "/marketflow"],
  ["/partner", "/deal-partners"],
  ["/invest", "/capital"],
  ["/sellers", "/property-owners"],
  ["/dealfinders", "/deal-partners"],
  ["/deal-strategy", "/how-we-operate"],
  ["/wholesale", "/bring-an-opportunity?intent=deal-jv"],
  ["/deal-architecture", "/how-we-operate"],
  ["/strategy-lab/library", "/saved"],
  ["/dashboard", "/marketflow/dashboard"],
  ["/dealflow/hq", "/marketflow/admin"],
  ["/hq", "/marketflow/admin"],
  ["/portal", "/marketflow"],
  ["/portal/investor", "/marketflow/investor"],
  ["/portal/wholesaler", "/marketflow/wholesaler"],
  ["/portal/buyer", "/marketflow/buyer"],
  ["/portal/dreamscaper", "/marketflow/dreamscaper"],
  ["/community", "/marketflow/community"],
  ["/dealflow", "/marketflow"],
  ["/dealflow/office", "/marketflow"],
  ["/dealflow/deals", "/marketflow/deals"],
  ["/dealflow/community", "/marketflow/community"],
  ["/dealflow/messages", "/marketflow/messages"],
  ["/marketplace", "/marketflow"],
  ["/marketplace/wholesaler", "/marketflow/wholesaler"],
  ["/marketplace/dreamscaper", "/marketflow/dreamscaper"],
  ["/marketplace/investor", "/marketflow/investor"],
  ["/marketplace/buyer", "/marketflow/buyer"],
  ["/marketplace/admin", "/marketflow/admin"],
  ["/marketplace/discover", "/marketflow/deals"],
  ["/marketplace/calculators", "/marketflow/calculators"],
  ["/marketplace/resources", "/marketflow/resources"],
  ["/marketplace/community", "/marketflow/community"],
  ["/marketplace/messages", "/marketflow/messages"],
  ["/marketplace/deals", "/marketflow/deals"],
  ["/marketplace/capital", "/marketflow/capital"],
  ["/marketplace/properties", "/marketflow/properties"],
];

/** Nested legacy operator URLs intentionally collapse to their lane landing. */
export const LEGACY_SPA_PREFIX_REDIRECTS: ReadonlyArray<
  readonly [prefix: string, to: string]
> = [
  ["/marketplace/wholesaler", "/marketflow/wholesaler"],
  ["/marketplace/dreamscaper", "/marketflow/dreamscaper"],
  ["/marketplace/investor", "/marketflow/investor"],
  ["/marketplace/buyer", "/marketflow/buyer"],
  ["/marketplace/admin", "/marketflow/admin"],
  ["/marketplace/deals", "/marketflow/deals"],
  ["/marketplace/capital", "/marketflow/capital"],
  ["/marketplace/properties", "/marketflow/properties"],
];

/**
 * Append an existing search string to a fixed, same-site redirect target.
 * Parameters already fixed by the target win over incoming duplicates, so an
 * alias such as `/submit-deal?intent=sell` cannot replace `intent=deal-jv`.
 */
export function appendRedirectSearch(target: string, search: string): string {
  const query = search.replace(/^\?/, "").trim();
  if (!query) return target;

  const [targetWithoutHash, hash = ""] = target.split("#", 2);
  const targetQuery = targetWithoutHash.split("?", 2)[1] ?? "";
  const fixedKeys = new Set(new URLSearchParams(targetQuery).keys());
  const incomingParts = query.split("&").filter((part) => {
    if (!part) return false;
    const key = new URLSearchParams(part).keys().next().value;
    return typeof key !== "string" || !fixedKeys.has(key);
  });

  if (incomingParts.length === 0) return target;
  const joined = `${targetWithoutHash}${targetWithoutHash.includes("?") ? "&" : "?"}${incomingParts.join("&")}`;
  return hash ? `${joined}#${hash}` : joined;
}
