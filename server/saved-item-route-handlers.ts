import type { Request, RequestHandler, Response } from "express";
import type { SupabaseSavedItem } from "./supabase-storage";

type SavedItemRecord = Record<string, unknown>;
type SavedItemType = SupabaseSavedItem["item_type"];

const SAVED_ITEM_TYPES: ReadonlySet<SavedItemType> = new Set<SavedItemType>([
  "wholesale_deal",
  "capital_project",
  "listing",
  "retail",
  "retail_listing",
  "article",
]);

function isSavedItemType(value: string): value is SavedItemType {
  return SAVED_ITEM_TYPES.has(value as SavedItemType);
}

type SavedItemRouteDependencies = {
  getUserId: (request: Request) => string | null;
  canAccessItemType: (response: Response, itemType: SavedItemType) => boolean;
  saveItem: (
    userId: string,
    itemType: SavedItemType,
    itemId: string,
  ) => Promise<SavedItemRecord | null>;
  removeItem: (
    userId: string,
    itemType: SavedItemType,
    itemId: string,
  ) => Promise<boolean>;
  logError?: (message: string, error: unknown) => void;
};

function normalizeWriteBody(body: unknown): {
  itemType: string;
  itemId: string;
} | null {
  if (!body || typeof body !== "object") return null;
  const candidate = body as Record<string, unknown>;
  const itemType =
    typeof candidate.itemType === "string" ? candidate.itemType.trim() : "";
  const rawItemId = candidate.itemId;
  const itemId =
    typeof rawItemId === "string" || typeof rawItemId === "number"
      ? String(rawItemId).trim()
      : "";
  return itemType && itemId ? { itemType, itemId } : null;
}

export function createSavedItemRouteHandlers(
  dependencies: SavedItemRouteDependencies,
): { post: RequestHandler; remove: RequestHandler } {
  const post: RequestHandler = async (req, res) => {
    try {
      const userId = dependencies.getUserId(req);
      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }
      const write = normalizeWriteBody(req.body);
      if (!write) {
        return res.status(400).json({ message: "Missing itemType or itemId" });
      }
      if (!isSavedItemType(write.itemType)) {
        return res.status(400).json({ message: "Invalid itemType" });
      }
      if (!dependencies.canAccessItemType(res, write.itemType)) {
        return res.status(404).json({ message: "Item not found" });
      }

      const savedItem = await dependencies.saveItem(
        userId,
        write.itemType,
        write.itemId,
      );
      if (!savedItem) {
        return res.status(503).json({ message: "Saved item was not persisted" });
      }
      return res.status(201).json(savedItem);
    } catch (error) {
      dependencies.logError?.("Error saving item:", error);
      return res.status(500).json({ message: "Failed to save item" });
    }
  };

  const remove: RequestHandler = async (req, res) => {
    try {
      const userId = dependencies.getUserId(req);
      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }
      const write = normalizeWriteBody(req.body);
      if (!write) {
        return res.status(400).json({ message: "Missing itemType or itemId" });
      }
      if (!isSavedItemType(write.itemType)) {
        return res.status(400).json({ message: "Invalid itemType" });
      }
      if (!dependencies.canAccessItemType(res, write.itemType)) {
        return res.status(404).json({ message: "Item not found" });
      }

      const removed = await dependencies.removeItem(
        userId,
        write.itemType,
        write.itemId,
      );
      if (!removed) {
        return res.status(503).json({ message: "Saved item was not removed" });
      }
      return res.json({ success: true });
    } catch (error) {
      dependencies.logError?.("Error unsaving item:", error);
      return res.status(500).json({ message: "Failed to unsave item" });
    }
  };

  return { post, remove };
}
