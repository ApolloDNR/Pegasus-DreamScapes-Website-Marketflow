import type { Express, Request, RequestHandler, Response } from "express";
import { z } from "zod";

import { canAccessReviewedMarketflowInventory } from "@shared/marketflow-inventory-access";

type UnknownRecord = Record<string, unknown>;

type DirectMessageRecord = {
  id: number;
  senderId: string;
  receiverId: string;
  subject?: string | null;
  content: string;
  parentId?: number | null;
  isRead?: boolean | null;
  createdAt?: unknown;
  [key: string]: unknown;
};

type DirectMessageDraft = {
  senderId: string;
  receiverId: string;
  subject?: string | null;
  content: string;
  parentId?: number | null;
};

type DealPacketDraft = z.infer<typeof dealPacketDraftSchema>;

export type ApiPrivacyRouteDependencies = {
  isHybridAuthenticated: RequestHandler;
  requireApprovedMarketflowAccess: RequestHandler;
  dealPacketRateLimit: RequestHandler;
  messageWriteRateLimit: RequestHandler;
  getAuthenticatedUserId: (req: unknown) => string | null;
  hasStaffAccess: (req: unknown, userId: string) => Promise<boolean>;
  isEligibleMessageRecipient: (userId: string) => Promise<boolean>;

  getUser: (userId: string) => Promise<unknown | null | undefined>;
  toPublicUserProfile: (user: any) => unknown;
  getUserStats: (userId: string) => Promise<unknown | null | undefined>;
  getUserReputation: (userId: string) => Promise<unknown | null | undefined>;
  getUserBadges: (userId: string) => Promise<unknown[] | null | undefined>;
  getSupabaseReputation: (
    userId: string,
  ) => Promise<unknown | null | undefined>;
  getSupabaseBadges: (
    userId: string,
  ) => Promise<unknown[] | null | undefined>;

  getDirectMessages: (userId: string) => Promise<DirectMessageRecord[]>;
  getConversation: (
    userId: string,
    otherUserId: string,
  ) => Promise<DirectMessageRecord[]>;
  createDirectMessage: (message: DirectMessageDraft) => Promise<DirectMessageRecord>;
  markMessageRead: (id: number) => Promise<DirectMessageRecord | undefined>;

  getAllSiteContent: () => Promise<unknown[]>;
  getSiteContent: (key: string) => Promise<unknown | null | undefined>;
  generateDealPacketPDF: (draft: DealPacketDraft) => Promise<Buffer>;
};

type MessageRecipientDependencies = {
  getUserProfile: (
    userId: string,
  ) => Promise<Record<string, unknown> | null | undefined>;
  getUserRoles: (userId: string) => Promise<Array<{ role?: unknown }>>;
  getUser: (
    userId: string,
  ) => Promise<Record<string, unknown> | null | undefined>;
  hasStaffRole: (userId: string) => Promise<boolean>;
  adminEmails: readonly string[];
};

const MEMBER_ID_PATTERN = /^[A-Za-z0-9_-]{1,100}$/;
const REVIEW_UNAVAILABLE_MESSAGE =
  "Reviews are unavailable until Pegasus can verify a completed transaction.";
const UNVERIFIED_PACKET_NOTICE =
  "USER-PROVIDED DRAFT. Pegasus Dreamscapes has not independently verified these facts, values, assumptions, or projections. This document is not an offer, appraisal, valuation, underwriting approval, investment recommendation, or promise of a transaction.";

const messageDraftSchema = z
  .object({
    receiverId: z.string().trim().regex(MEMBER_ID_PATTERN),
    subject: z.string().trim().min(1).max(255).optional(),
    content: z.string().trim().min(1).max(5_000),
    parentId: z.number().int().positive().max(2_147_483_647).optional(),
  })
  .strict();

const boundedMoney = z.number().finite().nonnegative().max(1_000_000_000_000);
const boundedCount = z.number().int().nonnegative().max(100_000_000);

const dealPacketDraftSchema = z
  .object({
    title: z.string().trim().min(1).max(200),
    type: z.string().trim().min(1).max(80),
    propertyAddress: z.string().trim().min(1).max(500),
    city: z.string().trim().min(1).max(120).optional(),
    state: z.string().trim().min(1).max(80).optional(),
    propertyType: z.string().trim().min(1).max(120).optional(),
    beds: z.number().int().nonnegative().max(100).optional(),
    baths: z.number().finite().nonnegative().max(100).optional(),
    sqft: boundedCount.optional(),
    arv: boundedMoney.optional(),
    purchasePrice: boundedMoney.optional(),
    rehabCost: boundedMoney.optional(),
    holdingCosts: boundedMoney.optional(),
    assignmentFee: boundedMoney.optional(),
    mao: boundedMoney.optional(),
    expectedProfit: z
      .number()
      .finite()
      .min(-1_000_000_000_000)
      .max(1_000_000_000_000)
      .optional(),
    roi: z.number().finite().min(-10_000).max(10_000).optional(),
    description: z.string().trim().min(1).max(5_000).optional(),
    highlights: z
      .array(z.string().trim().min(1).max(500))
      .max(12)
      .optional(),
    timeline: z.string().trim().min(1).max(2_000).optional(),
    operatorName: z.string().trim().min(1).max(200).optional(),
  })
  .strict();

function normalizeMemberId(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const candidate = value.trim();
  return MEMBER_ID_PATTERN.test(candidate) ? candidate : null;
}

function publicHref(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const href = value.trim();
  if (!href || href.length > 2_048) return undefined;
  if (
    (href.startsWith("/") && !href.startsWith("//")) ||
    href.startsWith("#") ||
    /^https:\/\//i.test(href) ||
    /^mailto:/i.test(href) ||
    /^tel:/i.test(href)
  ) {
    return href;
  }
  return undefined;
}

function publicSiteMetadata(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  const source = value as UnknownRecord;
  const metadata: Record<string, unknown> = {};
  const href = publicHref(source.href);
  if (href) metadata.href = href;

  for (const key of ["label", "alt"] as const) {
    const candidate = source[key];
    if (
      typeof candidate === "string" &&
      candidate.trim() &&
      candidate.trim().length <= 500
    ) {
      metadata[key] = candidate.trim();
    }
  }

  for (const key of ["width", "height"] as const) {
    const candidate = source[key];
    if (
      typeof candidate === "number" &&
      Number.isInteger(candidate) &&
      candidate > 0 &&
      candidate <= 20_000
    ) {
      metadata[key] = candidate;
    }
  }

  return Object.keys(metadata).length > 0 ? metadata : null;
}

/** Public site content is an allowlisted projection, not a spread of a row. */
export function toPublicSiteContentDto(value: unknown): {
  key: string;
  value: string;
  type: string;
  metadata: Record<string, unknown> | null;
} {
  const source =
    value && typeof value === "object" && !Array.isArray(value)
      ? (value as UnknownRecord)
      : {};
  return {
    key: typeof source.key === "string" ? source.key : "",
    value: typeof source.value === "string" ? source.value : "",
    type: typeof source.type === "string" ? source.type : "text",
    metadata: publicSiteMetadata(source.metadata),
  };
}

export function createIsEligibleMarketflowMessageRecipient(
  dependencies: MessageRecipientDependencies,
): (userId: string) => Promise<boolean> {
  const adminEmails = new Set(
    dependencies.adminEmails.map((email) => email.trim().toLowerCase()),
  );

  return async (rawUserId) => {
    const userId = normalizeMemberId(rawUserId);
    if (!userId) return false;

    try {
      const [profile, roles, user, isStaff] = await Promise.all([
        dependencies.getUserProfile(userId),
        dependencies.getUserRoles(userId),
        dependencies.getUser(userId),
        dependencies.hasStaffRole(userId),
      ]);
      const exists = Boolean(profile || user || roles.length > 0 || isStaff);
      if (!exists) return false;

      const email =
        typeof user?.email === "string" ? user.email.trim().toLowerCase() : "";
      if (email && adminEmails.has(email)) return true;

      return canAccessReviewedMarketflowInventory({
        isAuthenticated: true,
        isPegasusBadged: profile?.is_pegasus_badged,
        isStaff,
        roles: [profile?.primary_role, ...roles.map((entry) => entry.role)],
      });
    } catch {
      return false;
    }
  };
}

function participantForMessage(
  message: DirectMessageRecord,
  userId: string,
): string | null {
  if (message.senderId === userId && message.receiverId !== userId) {
    return normalizeMemberId(message.receiverId);
  }
  if (message.receiverId === userId && message.senderId !== userId) {
    return normalizeMemberId(message.senderId);
  }
  return null;
}

function isConversationMessage(
  message: DirectMessageRecord,
  userId: string,
  otherUserId: string,
): boolean {
  return (
    (message.senderId === userId && message.receiverId === otherUserId) ||
    (message.senderId === otherUserId && message.receiverId === userId)
  );
}

export function prepareUnverifiedDealPacket(
  draft: DealPacketDraft,
): DealPacketDraft {
  return {
    ...draft,
    title: /^draft\s*[—:-]/i.test(draft.title)
      ? draft.title
      : `DRAFT — ${draft.title}`,
    description: draft.description
      ? `${UNVERIFIED_PACKET_NOTICE}\n\n${draft.description}`
      : UNVERIFIED_PACKET_NOTICE,
  };
}

export function registerApiPrivacyRoutes(
  app: Express,
  dependencies: ApiPrivacyRouteDependencies,
): void {
  const governed = [
    dependencies.isHybridAuthenticated,
    dependencies.requireApprovedMarketflowAccess,
  ] as const;

  const authorizeTarget = async (
    req: Request,
    res: Response,
  ): Promise<{ requesterUserId: string; targetUserId: string } | null> => {
    const requesterUserId = dependencies.getAuthenticatedUserId(req);
    if (!requesterUserId) {
      res.status(401).json({ message: "Unauthorized" });
      return null;
    }

    const targetUserId = normalizeMemberId(req.params.userId);
    if (!targetUserId) {
      res.status(404).json({ message: "User not found" });
      return null;
    }

    if (
      requesterUserId !== targetUserId &&
      !(await dependencies.hasStaffAccess(req, requesterUserId))
    ) {
      res.status(404).json({ message: "User not found" });
      return null;
    }

    return { requesterUserId, targetUserId };
  };

  const visibleMessages = async (
    userId: string,
  ): Promise<DirectMessageRecord[]> => {
    const messages = await dependencies.getDirectMessages(userId);
    const eligibility = new Map<string, boolean>();

    for (const message of messages) {
      const participant = participantForMessage(message, userId);
      if (!participant || eligibility.has(participant)) continue;
      eligibility.set(
        participant,
        await dependencies.isEligibleMessageRecipient(participant),
      );
    }

    return messages.filter((message) => {
      const participant = participantForMessage(message, userId);
      return participant ? eligibility.get(participant) === true : false;
    });
  };

  app.get(
    "/api/users/:userId/reviews",
    ...governed,
    (_req, res) =>
      res.status(501).json({ message: REVIEW_UNAVAILABLE_MESSAGE }),
  );
  app.get(
    "/api/my-reviews",
    ...governed,
    (_req, res) =>
      res.status(501).json({ message: REVIEW_UNAVAILABLE_MESSAGE }),
  );
  app.post(
    "/api/reviews",
    ...governed,
    (_req, res) =>
      res.status(501).json({ message: REVIEW_UNAVAILABLE_MESSAGE }),
  );
  app.post(
    "/api/reviews/:id/respond",
    ...governed,
    (_req, res) =>
      res.status(501).json({ message: REVIEW_UNAVAILABLE_MESSAGE }),
  );

  app.get("/api/users/:userId", ...governed, async (req, res) => {
    try {
      const access = await authorizeTarget(req, res);
      if (!access) return;
      const user = await dependencies.getUser(access.targetUserId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      return res.json(dependencies.toPublicUserProfile(user));
    } catch (error) {
      console.error("Error fetching governed user profile:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/users/:userId/stats", ...governed, async (req, res) => {
    try {
      const access = await authorizeTarget(req, res);
      if (!access) return;
      const stats = await dependencies.getUserStats(access.targetUserId);
      return res.json(stats ?? {});
    } catch (error) {
      console.error("Error fetching governed user stats:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get(
    "/api/users/:userId/reputation",
    ...governed,
    async (req, res) => {
      try {
        const access = await authorizeTarget(req, res);
        if (!access) return;
        const reputation = await dependencies.getUserReputation(
          access.targetUserId,
        );
        return res.json(reputation ?? null);
      } catch (error) {
        console.error("Error fetching governed user reputation:", error);
        return res.status(500).json({ message: "Internal server error" });
      }
    },
  );

  app.get("/api/users/:userId/badges", ...governed, async (req, res) => {
    try {
      const access = await authorizeTarget(req, res);
      if (!access) return;
      const badges = await dependencies.getUserBadges(access.targetUserId);
      return res.json(badges ?? []);
    } catch (error) {
      console.error("Error fetching governed user badges:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get(
    "/api/supabase/reputation/:userId",
    ...governed,
    async (req, res) => {
      try {
        const access = await authorizeTarget(req, res);
        if (!access) return;
        const reputation = await dependencies.getSupabaseReputation(
          access.targetUserId,
        );
        if (!reputation) {
          return res.status(404).json({ message: "Reputation not found" });
        }
        return res.json(reputation);
      } catch (error) {
        console.error("Error fetching governed Supabase reputation:", error);
        return res.status(500).json({ message: "Internal server error" });
      }
    },
  );

  app.get(
    "/api/supabase/badges/:userId",
    ...governed,
    async (req, res) => {
      try {
        const access = await authorizeTarget(req, res);
        if (!access) return;
        const badges = await dependencies.getSupabaseBadges(
          access.targetUserId,
        );
        return res.json(badges ?? []);
      } catch (error) {
        console.error("Error fetching governed Supabase badges:", error);
        return res.status(500).json({ message: "Internal server error" });
      }
    },
  );

  app.get("/api/messages", ...governed, async (req, res) => {
    try {
      const userId = dependencies.getAuthenticatedUserId(req);
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      return res.json(await visibleMessages(userId));
    } catch (error) {
      console.error("Error fetching governed messages:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get(
    "/api/messages/conversation/:otherUserId",
    ...governed,
    async (req, res) => {
      try {
        const userId = dependencies.getAuthenticatedUserId(req);
        const otherUserId = normalizeMemberId(req.params.otherUserId);
        if (!userId) {
          return res.status(401).json({ message: "Unauthorized" });
        }
        if (
          !otherUserId ||
          otherUserId === userId ||
          !(await dependencies.isEligibleMessageRecipient(otherUserId))
        ) {
          return res.status(404).json({ message: "Conversation not found" });
        }
        const messages = await dependencies.getConversation(
          userId,
          otherUserId,
        );
        return res.json(
          messages.filter((message) =>
            isConversationMessage(message, userId, otherUserId),
          ),
        );
      } catch (error) {
        console.error("Error fetching governed conversation:", error);
        return res.status(500).json({ message: "Internal server error" });
      }
    },
  );

  app.post(
    "/api/messages",
    ...governed,
    dependencies.messageWriteRateLimit,
    async (req, res) => {
      try {
        const senderId = dependencies.getAuthenticatedUserId(req);
        if (!senderId) {
          return res.status(401).json({ message: "Unauthorized" });
        }
        const parsed = messageDraftSchema.safeParse(req.body);
        if (!parsed.success) {
          return res.status(400).json({ message: "Invalid message" });
        }

        const { receiverId, subject, content, parentId } = parsed.data;
        if (
          receiverId === senderId ||
          !(await dependencies.isEligibleMessageRecipient(receiverId))
        ) {
          return res.status(404).json({ message: "Recipient not found" });
        }

        if (parentId !== undefined) {
          const parent = (await dependencies.getDirectMessages(senderId)).find(
            (message) => message.id === parentId,
          );
          if (!parent || !isConversationMessage(parent, senderId, receiverId)) {
            return res.status(400).json({ message: "Invalid parent message" });
          }
        }

        const message = await dependencies.createDirectMessage({
          senderId,
          receiverId,
          content,
          ...(subject !== undefined ? { subject } : {}),
          ...(parentId !== undefined ? { parentId } : {}),
        });
        return res.status(201).json(message);
      } catch (error) {
        console.error("Error sending governed message:", error);
        return res.status(500).json({ message: "Internal server error" });
      }
    },
  );

  app.patch("/api/messages/:id/read", ...governed, async (req, res) => {
    try {
      const userId = dependencies.getAuthenticatedUserId(req);
      const id = Number(req.params.id);
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      if (!Number.isSafeInteger(id) || id <= 0) {
        return res.status(404).json({ message: "Message not found" });
      }
      const message = (await visibleMessages(userId)).find(
        (candidate) => candidate.id === id && candidate.receiverId === userId,
      );
      if (!message) {
        return res.status(404).json({ message: "Message not found" });
      }
      const updated = await dependencies.markMessageRead(id);
      if (!updated || updated.receiverId !== userId) {
        return res.status(404).json({ message: "Message not found" });
      }
      return res.json(updated);
    } catch (error) {
      console.error("Error marking governed message as read:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/messages/unread-count", ...governed, async (req, res) => {
    try {
      const userId = dependencies.getAuthenticatedUserId(req);
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      const count = (await visibleMessages(userId)).filter(
        (message) =>
          message.receiverId === userId && message.isRead !== true,
      ).length;
      return res.json({ count });
    } catch (error) {
      console.error("Error counting governed messages:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/site-content", async (_req, res) => {
    try {
      const rows = await dependencies.getAllSiteContent();
      return res.json(rows.map(toPublicSiteContentDto));
    } catch (error) {
      console.error("Error fetching public site content:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/site-content/:key", async (req, res) => {
    try {
      const row = await dependencies.getSiteContent(req.params.key);
      if (!row) {
        return res.status(404).json({ message: "Content not found" });
      }
      return res.json(toPublicSiteContentDto(row));
    } catch (error) {
      console.error("Error fetching public site content item:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post(
    "/api/pdf/deal-packet",
    dependencies.isHybridAuthenticated,
    dependencies.dealPacketRateLimit,
    async (req, res) => {
      try {
        const userId = dependencies.getAuthenticatedUserId(req);
        if (!userId) {
          return res.status(401).json({ message: "Unauthorized" });
        }
        if (!(await dependencies.hasStaffAccess(req, userId))) {
          return res.status(403).json({ message: "Forbidden" });
        }

        const parsed = dealPacketDraftSchema.safeParse(req.body);
        if (!parsed.success) {
          return res
            .status(400)
            .json({ message: "Invalid deal-packet draft" });
        }

        const draft = prepareUnverifiedDealPacket(parsed.data);
        const buffer = await dependencies.generateDealPacketPDF(draft);
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Cache-Control", "private, no-store");
        res.setHeader("X-Pegasus-Data-Status", "unverified-user-input");
        res.setHeader(
          "Content-Disposition",
          `attachment; filename="deal-packet-draft-${Date.now()}.pdf"`,
        );
        return res.send(buffer);
      } catch (error) {
        console.error("Error generating governed deal-packet draft:", error);
        return res.status(500).json({ message: "Failed to generate PDF" });
      }
    },
  );
}
