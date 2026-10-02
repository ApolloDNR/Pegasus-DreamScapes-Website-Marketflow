import { isWebsiteIdentityUuid } from "./identity";

/** Audit callers may narrow to the verified staff org, never select a tenant. */
export function requireWebsiteAuditOrganization(expectedOrgId?: string): string {
  const configuredOrgId = process.env.WEBSITE_ORG_ID?.trim();
  if (!isWebsiteIdentityUuid(configuredOrgId)) {
    throw new Error("Website audit organization is unavailable");
  }
  if (expectedOrgId !== undefined && (
    !isWebsiteIdentityUuid(expectedOrgId) ||
    expectedOrgId.toLowerCase() !== configuredOrgId.toLowerCase()
  )) {
    throw new Error("Website audit organization does not match verified staff");
  }
  return configuredOrgId;
}
