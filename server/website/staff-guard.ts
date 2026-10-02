import type { RequestHandler } from "express";
import type { WebsiteDb } from "./db";
import {
  getVerifiedWebsiteAuthSubject,
  isWebsiteIdentityUuid,
  resolveWebsiteStaff,
  type WebsiteStaffIdentity,
} from "./identity";

declare global {
  namespace Express {
    interface Request {
      websiteStaff?: WebsiteStaffIdentity;
    }
  }
}

type WebsiteStaffGuardOptions = {
  db: WebsiteDb;
  // No request argument: organization selection belongs to server config.
  getOrgId?: () => string | null | undefined;
};

export function createWebsiteStaffGuard({
  db,
  getOrgId = () => process.env.WEBSITE_ORG_ID,
}: WebsiteStaffGuardOptions): RequestHandler {
  return async (req, res, next) => {
    res.set("Cache-Control", "no-store");
    delete req.websiteStaff;
    const subject = getVerifiedWebsiteAuthSubject(req);
    if (!subject) return res.status(401).json({ message: "Unauthorized" });

    try {
      const orgId = getOrgId();
      if (!isWebsiteIdentityUuid(orgId)) {
        return res.status(503).json({ message: "Website staff access unavailable" });
      }
      const staff = await resolveWebsiteStaff(subject, orgId, db);
      if (!staff) return res.status(403).json({ message: "Forbidden: Staff access required" });
      req.websiteStaff = staff;
      return next();
    } catch {
      return res.status(503).json({ message: "Website staff access unavailable" });
    }
  };
}
