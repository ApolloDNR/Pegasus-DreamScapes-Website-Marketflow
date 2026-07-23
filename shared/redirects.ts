/** Legacy intake paths whose attribution/query context must survive migration. */
export const QUERY_PRESERVING_INTAKE_PATHS: ReadonlySet<string> = new Set([
  "/submit",
  "/submit-property",
  "/submit-deal",
  "/wholesale",
]);

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
