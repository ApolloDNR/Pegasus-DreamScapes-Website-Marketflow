import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertSellerLeadSchema, 
  insertInvestorLeadSchema, 
  insertContactSchema,
  insertProjectSchema,
  insertWholesaleDealSchema,
  insertWholesaleRequestSchema,
  insertRetailListingSchema,
  insertBuyerInquirySchema,
  insertInvestorProfileSchema,
  insertWholesalerProfileSchema,
  insertBuyerProfileSchema,
  insertSavedPropertySchema,
  insertBuyerOfferSchema,
  insertCapitalProjectSchema,
  insertProjectMilestoneSchema,
  insertInvestmentOfferSchema,
  insertCommittedInvestmentSchema,
  insertDealMatchSchema,
  insertAnnouncementSchema,
  insertNotificationSchema,
  STAFF_ROLES
} from "@shared/schema";
import { fromError } from "zod-validation-error";
import { setupAuth, isAuthenticated } from "./replitAuth";

// Middleware to require staff roles for HQ access
const requireStaffRole = async (req: any, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.claims?.sub;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    const hasStaffAccess = await storage.hasAnyStaffRole(userId);
    if (!hasStaffAccess) {
      return res.status(403).json({ message: "Forbidden: Staff access required" });
    }
    
    next();
  } catch (error) {
    console.error("Error checking staff role:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Middleware to require specific roles
const requireRole = (...roles: string[]) => async (req: any, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.claims?.sub;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    const userRoles = await storage.getUserRoles(userId);
    const hasRequiredRole = userRoles.some(r => roles.includes(r.role));
    
    if (!hasRequiredRole) {
      return res.status(403).json({ message: `Forbidden: Required roles: ${roles.join(", ")}` });
    }
    
    next();
  } catch (error) {
    console.error("Error checking role:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  // Setup Replit Auth
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      const roles = await storage.getUserRoles(userId);
      const roleNames = roles.map(r => r.role);
      const isStaff = roleNames.some(r => STAFF_ROLES.includes(r as any));
      
      res.json({ 
        ...user, 
        roles: roleNames,
        isStaff,
        isInvestor: roleNames.includes("investor"),
        isWholesaler: roleNames.includes("wholesaler"),
        isBuyer: roleNames.includes("buyer")
      });
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Dealflow stats route for authenticated users
  app.get('/api/dealflow/stats', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      // Get user's saved deals (liked)
      const savedDeals = await storage.getUserLikedDeals(userId);
      
      // Get all wholesale deals to count active ones
      const allDeals = await storage.getWholesaleDeals();
      const activeDeals = allDeals.filter((d: any) => d.status === 'available').length;
      
      // Get all saved deals (not passed)
      const allSaved = await storage.getUserSavedDeals(userId);
      
      res.json({
        savedDeals: savedDeals.length,
        activeDeals,
        pendingDeals: allSaved.filter((b: any) => b.action === 'save').length,
        matchScore: 87 // Placeholder for AI matching score
      });
    } catch (error) {
      console.error("Error fetching dealflow stats:", error);
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  // Portal registration routes - investors and wholesalers can register
  app.post('/api/portal/investor/register', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const result = insertInvestorProfileSchema.safeParse({ ...req.body, userId });
      if (!result.success) {
        return res.status(400).json({ message: fromError(result.error).toString() });
      }
      
      // Create investor profile
      const profile = await storage.upsertInvestorProfile(result.data);
      
      // Add investor role if not exists
      const hasRole = await storage.hasRole(userId, "investor");
      if (!hasRole) {
        await storage.addUserRole({ userId, role: "investor" });
      }
      
      return res.status(201).json(profile);
    } catch (error) {
      console.error("Error creating investor profile:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post('/api/portal/wholesaler/register', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const result = insertWholesalerProfileSchema.safeParse({ ...req.body, userId });
      if (!result.success) {
        return res.status(400).json({ message: fromError(result.error).toString() });
      }
      
      // Create wholesaler profile
      const profile = await storage.upsertWholesalerProfile(result.data);
      
      // Add wholesaler role if not exists
      const hasRole = await storage.hasRole(userId, "wholesaler");
      if (!hasRole) {
        await storage.addUserRole({ userId, role: "wholesaler" });
      }
      
      return res.status(201).json(profile);
    } catch (error) {
      console.error("Error creating wholesaler profile:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post('/api/portal/buyer/register', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const result = insertBuyerProfileSchema.safeParse({ ...req.body, userId });
      if (!result.success) {
        return res.status(400).json({ message: fromError(result.error).toString() });
      }
      
      // Create buyer profile
      const profile = await storage.upsertBuyerProfile(result.data);
      
      // Add buyer role if not exists
      const hasRole = await storage.hasRole(userId, "buyer");
      if (!hasRole) {
        await storage.addUserRole({ userId, role: "buyer" });
      }
      
      return res.status(201).json(profile);
    } catch (error) {
      console.error("Error creating buyer profile:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Portal-specific data routes
  app.get('/api/portal/investor/profile', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const profile = await storage.getInvestorProfile(userId);
      if (!profile) {
        return res.status(404).json({ message: "Profile not found" });
      }
      return res.json(profile);
    } catch (error) {
      console.error("Error fetching investor profile:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get('/api/portal/wholesaler/profile', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const profile = await storage.getWholesalerProfile(userId);
      if (!profile) {
        return res.status(404).json({ message: "Profile not found" });
      }
      return res.json(profile);
    } catch (error) {
      console.error("Error fetching wholesaler profile:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get('/api/portal/wholesaler/my-deals', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const deals = await storage.getWholesaleDealsBySubmitter(userId);
      return res.json(deals);
    } catch (error) {
      console.error("Error fetching wholesaler deals:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get('/api/portal/buyer/profile', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const profile = await storage.getBuyerProfile(userId);
      if (!profile) {
        return res.status(404).json({ message: "Profile not found" });
      }
      return res.json(profile);
    } catch (error) {
      console.error("Error fetching buyer profile:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Saved Properties routes (for buyers)
  app.get('/api/portal/buyer/saved-properties', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const saved = await storage.getSavedProperties(userId);
      return res.json(saved);
    } catch (error) {
      console.error("Error fetching saved properties:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post('/api/portal/buyer/saved-properties', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const result = insertSavedPropertySchema.safeParse({ ...req.body, userId });
      if (!result.success) {
        return res.status(400).json({ message: fromError(result.error).toString() });
      }
      
      // Check if already saved
      const isSaved = await storage.isPropertySaved(userId, result.data.propertyType, result.data.propertyId);
      if (isSaved) {
        return res.status(400).json({ message: "Property already saved" });
      }
      
      const saved = await storage.saveProperty(result.data);
      return res.status(201).json(saved);
    } catch (error) {
      console.error("Error saving property:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.delete('/api/portal/buyer/saved-properties/:propertyType/:propertyId', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { propertyType, propertyId } = req.params;
      await storage.removeSavedProperty(userId, propertyType, parseInt(propertyId));
      return res.status(204).send();
    } catch (error) {
      console.error("Error removing saved property:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Buyer Offers routes
  app.get('/api/portal/buyer/offers', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const offers = await storage.getBuyerOffers(userId);
      return res.json(offers);
    } catch (error) {
      console.error("Error fetching buyer offers:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post('/api/portal/buyer/offers', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const result = insertBuyerOfferSchema.safeParse({ ...req.body, userId });
      if (!result.success) {
        return res.status(400).json({ message: fromError(result.error).toString() });
      }
      
      const offer = await storage.createBuyerOffer(result.data);
      return res.status(201).json(offer);
    } catch (error) {
      console.error("Error creating buyer offer:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // Seller Lead Routes
  app.post("/api/seller-leads", async (req, res) => {
    try {
      const result = insertSellerLeadSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ 
          message: fromError(result.error).toString() 
        });
      }
      
      const lead = await storage.createSellerLead(result.data);
      console.log("New seller lead received:", lead.email);
      return res.status(201).json(lead);
    } catch (error) {
      console.error("Error creating seller lead:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Investor Lead Routes
  app.post("/api/investor-leads", async (req, res) => {
    try {
      const result = insertInvestorLeadSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ 
          message: fromError(result.error).toString() 
        });
      }
      
      const lead = await storage.createInvestorLead(result.data);
      console.log("New investor lead received:", lead.email);
      return res.status(201).json(lead);
    } catch (error) {
      console.error("Error creating investor lead:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Contact Routes
  app.post("/api/contacts", async (req, res) => {
    try {
      const result = insertContactSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ 
          message: fromError(result.error).toString() 
        });
      }
      
      const contact = await storage.createContact(result.data);
      console.log("New contact message received:", contact.email);
      return res.status(201).json(contact);
    } catch (error) {
      console.error("Error creating contact:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Articles/Resources Routes (public)
  app.get("/api/articles", async (req, res) => {
    try {
      const articlesList = await storage.getPublishedArticles();
      return res.json(articlesList);
    } catch (error) {
      console.error("Error fetching articles:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/articles/:slug", async (req, res) => {
    try {
      const article = await storage.getArticleBySlug(req.params.slug);
      if (!article || !article.published) {
        return res.status(404).json({ message: "Article not found" });
      }
      return res.json(article);
    } catch (error) {
      console.error("Error fetching article:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Protected HQ Routes (require staff role)
  app.get("/api/hq/seller-leads", isAuthenticated, requireStaffRole, async (req, res) => {
    try {
      const leads = await storage.getSellerLeads();
      return res.json(leads);
    } catch (error) {
      console.error("Error fetching seller leads:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/hq/investor-leads", isAuthenticated, requireStaffRole, async (req, res) => {
    try {
      const leads = await storage.getInvestorLeads();
      return res.json(leads);
    } catch (error) {
      console.error("Error fetching investor leads:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/hq/contacts", isAuthenticated, requireStaffRole, async (req, res) => {
    try {
      const contactsList = await storage.getContacts();
      return res.json(contactsList);
    } catch (error) {
      console.error("Error fetching contacts:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.patch("/api/hq/seller-leads/:id/status", isAuthenticated, requireStaffRole, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { status } = req.body;
      const updated = await storage.updateSellerLeadStatus(id, status);
      if (!updated) {
        return res.status(404).json({ message: "Lead not found" });
      }
      return res.json(updated);
    } catch (error) {
      console.error("Error updating seller lead status:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.patch("/api/hq/investor-leads/:id/status", isAuthenticated, requireStaffRole, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { status } = req.body;
      const updated = await storage.updateInvestorLeadStatus(id, status);
      if (!updated) {
        return res.status(404).json({ message: "Lead not found" });
      }
      return res.json(updated);
    } catch (error) {
      console.error("Error updating investor lead status:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.patch("/api/hq/contacts/:id/status", isAuthenticated, requireStaffRole, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { status } = req.body;
      const updated = await storage.updateContactStatus(id, status);
      if (!updated) {
        return res.status(404).json({ message: "Contact not found" });
      }
      return res.json(updated);
    } catch (error) {
      console.error("Error updating contact status:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Lead Activities Routes (for CRM - staff only)
  app.get("/api/hq/activities/:leadType/:leadId", isAuthenticated, requireStaffRole, async (req, res) => {
    try {
      const { leadType, leadId } = req.params;
      const activities = await storage.getLeadActivities(leadType, parseInt(leadId));
      return res.json(activities);
    } catch (error) {
      console.error("Error fetching lead activities:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/hq/activities", isAuthenticated, requireStaffRole, async (req, res) => {
    try {
      const { leadType, leadId, activityType, notes, followUpDate } = req.body;
      const activity = await storage.createLeadActivity({
        leadType,
        leadId: parseInt(leadId),
        activityType,
        notes,
        followUpDate: followUpDate ? new Date(followUpDate) : undefined,
      });
      return res.status(201).json(activity);
    } catch (error) {
      console.error("Error creating lead activity:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.patch("/api/hq/activities/:id/complete", isAuthenticated, requireStaffRole, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updated = await storage.markActivityCompleted(id);
      if (!updated) {
        return res.status(404).json({ message: "Activity not found" });
      }
      return res.json(updated);
    } catch (error) {
      console.error("Error marking activity as completed:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Queue Routes (for work queue/task management - staff only)
  app.get("/api/hq/queue", isAuthenticated, requireStaffRole, async (req, res) => {
    try {
      const queueItems = await storage.getQueueItems();
      return res.json(queueItems);
    } catch (error) {
      console.error("Error fetching queue:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Projects Routes (public)
  app.get("/api/projects", async (req, res) => {
    try {
      const projectsList = await storage.getProjects();
      return res.json(projectsList);
    } catch (error) {
      console.error("Error fetching projects:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/projects/:slug", async (req, res) => {
    try {
      const project = await storage.getProjectBySlug(req.params.slug);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      return res.json(project);
    } catch (error) {
      console.error("Error fetching project:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Wholesale Deals Routes (public - only available deals)
  app.get("/api/wholesale-deals", async (req, res) => {
    try {
      const deals = await storage.getAvailableWholesaleDeals();
      return res.json(deals);
    } catch (error) {
      console.error("Error fetching wholesale deals:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/wholesale-deals-active", async (req, res) => {
    try {
      const deals = await storage.getAvailableWholesaleDeals();
      const activeDeals = deals.filter(d => d.status === "available" || d.status === "ACTIVE");
      return res.json(activeDeals);
    } catch (error) {
      console.error("Error fetching active wholesale deals:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/wholesale-deals/:id", async (req, res) => {
    try {
      const deal = await storage.getWholesaleDeal(parseInt(req.params.id));
      if (!deal || deal.status !== "available") {
        return res.status(404).json({ message: "Deal not found" });
      }
      return res.json(deal);
    } catch (error) {
      console.error("Error fetching wholesale deal:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Wholesale Request (public - investors can request deals)
  app.post("/api/wholesale-requests", async (req, res) => {
    try {
      const result = insertWholesaleRequestSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ 
          message: fromError(result.error).toString() 
        });
      }
      
      const request = await storage.createWholesaleRequest(result.data);
      console.log("New wholesale request received:", request.email);
      return res.status(201).json(request);
    } catch (error) {
      console.error("Error creating wholesale request:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Protected HQ Wholesale Routes (staff only)
  app.get("/api/hq/wholesale-deals", isAuthenticated, requireStaffRole, async (req, res) => {
    try {
      const deals = await storage.getWholesaleDeals();
      return res.json(deals);
    } catch (error) {
      console.error("Error fetching all wholesale deals:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/hq/wholesale-deals", isAuthenticated, requireStaffRole, async (req, res) => {
    try {
      const result = insertWholesaleDealSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ 
          message: fromError(result.error).toString() 
        });
      }
      
      const deal = await storage.createWholesaleDeal(result.data);
      console.log("New wholesale deal created:", deal.propertyAddress);
      return res.status(201).json(deal);
    } catch (error) {
      console.error("Error creating wholesale deal:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.patch("/api/hq/wholesale-deals/:id/status", isAuthenticated, requireStaffRole, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { status, notes } = req.body;
      const updated = await storage.updateWholesaleDealStatus(id, status, notes);
      if (!updated) {
        return res.status(404).json({ message: "Deal not found" });
      }
      return res.json(updated);
    } catch (error) {
      console.error("Error updating wholesale deal status:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.patch("/api/hq/wholesale-deals/:id", isAuthenticated, requireStaffRole, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updated = await storage.updateWholesaleDeal(id, req.body);
      if (!updated) {
        return res.status(404).json({ message: "Deal not found" });
      }
      return res.json(updated);
    } catch (error) {
      console.error("Error updating wholesale deal:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/hq/wholesale-requests", isAuthenticated, requireStaffRole, async (req, res) => {
    try {
      const requests = await storage.getWholesaleRequests();
      return res.json(requests);
    } catch (error) {
      console.error("Error fetching wholesale requests:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/hq/wholesale-deals/:id/requests", isAuthenticated, requireStaffRole, async (req, res) => {
    try {
      const dealId = parseInt(req.params.id);
      const requests = await storage.getWholesaleRequestsByDeal(dealId);
      return res.json(requests);
    } catch (error) {
      console.error("Error fetching deal requests:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.patch("/api/hq/wholesale-requests/:id/status", isAuthenticated, requireStaffRole, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { status } = req.body;
      const updated = await storage.updateWholesaleRequestStatus(id, status);
      if (!updated) {
        return res.status(404).json({ message: "Request not found" });
      }
      return res.json(updated);
    } catch (error) {
      console.error("Error updating wholesale request status:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // ============ RETAIL LISTINGS ROUTES ============

  // Public Routes - Active retail listings for buyers
  app.get("/api/retail-listings", async (req, res) => {
    try {
      const listings = await storage.getActiveRetailListings();
      return res.json(listings);
    } catch (error) {
      console.error("Error fetching retail listings:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/retail-listings/:slug", async (req, res) => {
    try {
      const listing = await storage.getRetailListingBySlug(req.params.slug);
      if (!listing || (listing.status !== "active" && listing.status !== "coming_soon")) {
        return res.status(404).json({ message: "Listing not found" });
      }
      return res.json(listing);
    } catch (error) {
      console.error("Error fetching retail listing:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Buyer Inquiries (public)
  app.post("/api/buyer-inquiries", async (req, res) => {
    try {
      const result = insertBuyerInquirySchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: fromError(result.error).toString() });
      }
      
      const inquiry = await storage.createBuyerInquiry(result.data);
      console.log("New buyer inquiry received:", inquiry.email);
      return res.status(201).json(inquiry);
    } catch (error) {
      console.error("Error creating buyer inquiry:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Protected HQ Routes for Retail Listings (staff only)
  app.get("/api/hq/retail-listings", isAuthenticated, requireStaffRole, async (req, res) => {
    try {
      const listings = await storage.getRetailListings();
      return res.json(listings);
    } catch (error) {
      console.error("Error fetching all retail listings:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/hq/retail-listings", isAuthenticated, requireStaffRole, async (req, res) => {
    try {
      const result = insertRetailListingSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: fromError(result.error).toString() });
      }
      
      const listing = await storage.createRetailListing(result.data);
      console.log("New retail listing created:", listing.propertyAddress);
      return res.status(201).json(listing);
    } catch (error) {
      console.error("Error creating retail listing:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.patch("/api/hq/retail-listings/:id", isAuthenticated, requireStaffRole, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updated = await storage.updateRetailListing(id, req.body);
      if (!updated) {
        return res.status(404).json({ message: "Listing not found" });
      }
      return res.json(updated);
    } catch (error) {
      console.error("Error updating retail listing:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.patch("/api/hq/retail-listings/:id/status", isAuthenticated, requireStaffRole, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { status } = req.body;
      const updated = await storage.updateRetailListingStatus(id, status);
      if (!updated) {
        return res.status(404).json({ message: "Listing not found" });
      }
      return res.json(updated);
    } catch (error) {
      console.error("Error updating retail listing status:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Protected HQ Routes for Buyer Inquiries (staff only)
  app.get("/api/hq/buyer-inquiries", isAuthenticated, requireStaffRole, async (req, res) => {
    try {
      const inquiries = await storage.getBuyerInquiries();
      return res.json(inquiries);
    } catch (error) {
      console.error("Error fetching buyer inquiries:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.patch("/api/hq/buyer-inquiries/:id/status", isAuthenticated, requireStaffRole, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { status } = req.body;
      const updated = await storage.updateBuyerInquiryStatus(id, status);
      if (!updated) {
        return res.status(404).json({ message: "Inquiry not found" });
      }
      return res.json(updated);
    } catch (error) {
      console.error("Error updating buyer inquiry status:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // ============ ADMIN ROUTES FOR USER/ROLE MANAGEMENT ============

  // Admin-only routes for managing staff and portal users
  app.get("/api/hq/users/roles", isAuthenticated, requireRole("admin"), async (req, res) => {
    try {
      const allUsers = await storage.getAllStaffProfiles();
      const investors = await storage.getAllInvestorProfiles();
      const wholesalers = await storage.getAllWholesalerProfiles();
      return res.json({ staff: allUsers, investors, wholesalers });
    } catch (error) {
      console.error("Error fetching user profiles:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/hq/investor-profiles", isAuthenticated, requireRole("admin"), async (req, res) => {
    try {
      const profiles = await storage.getAllInvestorProfiles();
      return res.json(profiles);
    } catch (error) {
      console.error("Error fetching investor profiles:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/hq/wholesaler-profiles", isAuthenticated, requireRole("admin"), async (req, res) => {
    try {
      const profiles = await storage.getAllWholesalerProfiles();
      return res.json(profiles);
    } catch (error) {
      console.error("Error fetching wholesaler profiles:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/hq/buyer-profiles", isAuthenticated, requireRole("admin"), async (req, res) => {
    try {
      const profiles = await storage.getAllBuyerProfiles();
      return res.json(profiles);
    } catch (error) {
      console.error("Error fetching buyer profiles:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/hq/users/:userId/roles", isAuthenticated, requireRole("admin"), async (req, res) => {
    try {
      const { userId } = req.params;
      const { role } = req.body;
      
      // Check if role already exists
      const hasRole = await storage.hasRole(userId, role);
      if (hasRole) {
        return res.status(400).json({ message: "User already has this role" });
      }
      
      const userRole = await storage.addUserRole({ userId, role });
      return res.status(201).json(userRole);
    } catch (error) {
      console.error("Error adding user role:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.delete("/api/hq/users/:userId/roles/:role", isAuthenticated, requireRole("admin"), async (req, res) => {
    try {
      const { userId, role } = req.params;
      await storage.removeUserRole(userId, role);
      return res.json({ message: "Role removed successfully" });
    } catch (error) {
      console.error("Error removing user role:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.patch("/api/hq/investors/:userId/approve", isAuthenticated, requireRole("admin"), async (req, res) => {
    try {
      const { userId } = req.params;
      const { isApproved } = req.body;
      const updated = await storage.updateInvestorApproval(userId, isApproved);
      if (!updated) {
        return res.status(404).json({ message: "Investor profile not found" });
      }
      return res.json(updated);
    } catch (error) {
      console.error("Error updating investor approval:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.patch("/api/hq/wholesalers/:userId/approve", isAuthenticated, requireRole("admin"), async (req, res) => {
    try {
      const { userId } = req.params;
      const { isApproved } = req.body;
      const updated = await storage.updateWholesalerApproval(userId, isApproved);
      if (!updated) {
        return res.status(404).json({ message: "Wholesaler profile not found" });
      }
      return res.json(updated);
    } catch (error) {
      console.error("Error updating wholesaler approval:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.patch("/api/hq/buyers/:userId/approve", isAuthenticated, requireRole("admin"), async (req, res) => {
    try {
      const { userId } = req.params;
      const { isApproved } = req.body;
      const updated = await storage.updateBuyerApproval(userId, isApproved);
      if (!updated) {
        return res.status(404).json({ message: "Buyer profile not found" });
      }
      return res.json(updated);
    } catch (error) {
      console.error("Error updating buyer approval:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Check staff access route (for frontend to verify before accessing HQ)
  app.get("/api/auth/check-staff", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const isStaff = await storage.hasAnyStaffRole(userId);
      return res.json({ isStaff });
    } catch (error) {
      console.error("Error checking staff access:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // =====================================================
  // Community Routes
  // =====================================================
  
  // Get all community categories
  app.get("/api/community/categories", async (req, res) => {
    try {
      const categories = await storage.getCommunityCategories();
      return res.json(categories);
    } catch (error) {
      console.error("Error fetching community categories:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get community category by slug
  app.get("/api/community/categories/:slug", async (req, res) => {
    try {
      const { slug } = req.params;
      const category = await storage.getCommunityCategory(slug);
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }
      return res.json(category);
    } catch (error) {
      console.error("Error fetching community category:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Create community category (admin only)
  app.post("/api/community/categories", isAuthenticated, requireRole("admin"), async (req, res) => {
    try {
      const { name, slug, description, icon, color, order } = req.body;
      const category = await storage.createCommunityCategory({ name, slug, description, icon, color, order });
      return res.status(201).json(category);
    } catch (error) {
      console.error("Error creating community category:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get community posts (optionally filtered by category)
  app.get("/api/community/posts", async (req, res) => {
    try {
      const categoryId = req.query.categoryId ? Number(req.query.categoryId) : undefined;
      const posts = await storage.getCommunityPosts(categoryId);
      return res.json(posts);
    } catch (error) {
      console.error("Error fetching community posts:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get single community post
  app.get("/api/community/posts/:id", async (req, res) => {
    try {
      const id = Number(req.params.id);
      const post = await storage.getCommunityPost(id);
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }
      // Increment view count
      await storage.incrementPostViews(id);
      return res.json(post);
    } catch (error) {
      console.error("Error fetching community post:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Create community post (authenticated users only)
  app.post("/api/community/posts", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { categoryId, title, content, isPinned, isLocked } = req.body;
      
      const post = await storage.createCommunityPost({
        categoryId,
        userId,
        title,
        content,
        isPinned: isPinned || false,
        isLocked: isLocked || false
      });
      return res.status(201).json(post);
    } catch (error) {
      console.error("Error creating community post:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Update community post (owner or admin)
  app.patch("/api/community/posts/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const id = Number(req.params.id);
      const post = await storage.getCommunityPost(id);
      
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }
      
      // Check if user is owner or admin
      const userRoles = await storage.getUserRoles(userId);
      const isAdmin = userRoles.some(r => r.role === "admin");
      if (post.userId !== userId && !isAdmin) {
        return res.status(403).json({ message: "Not authorized to edit this post" });
      }
      
      const { title, content, isPinned, isLocked } = req.body;
      const updated = await storage.updateCommunityPost(id, { title, content, isPinned, isLocked });
      return res.json(updated);
    } catch (error) {
      console.error("Error updating community post:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get replies for a post
  app.get("/api/community/posts/:id/replies", async (req, res) => {
    try {
      const postId = Number(req.params.id);
      const replies = await storage.getCommunityReplies(postId);
      return res.json(replies);
    } catch (error) {
      console.error("Error fetching community replies:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Create reply to a post (authenticated users only)
  app.post("/api/community/posts/:id/replies", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const postId = Number(req.params.id);
      const { content } = req.body;
      
      // Check if post exists and isn't locked
      const post = await storage.getCommunityPost(postId);
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }
      if (post.isLocked) {
        return res.status(403).json({ message: "This thread is locked" });
      }
      
      const reply = await storage.createCommunityReply({
        postId,
        userId,
        content
      });
      return res.status(201).json(reply);
    } catch (error) {
      console.error("Error creating community reply:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Social Feed - get all posts across categories
  app.get("/api/community/feed", async (req, res) => {
    try {
      const limit = Number(req.query.limit) || 50;
      const posts = await storage.getSocialFeedPosts(limit);
      return res.json(posts);
    } catch (error) {
      console.error("Error fetching social feed:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Toggle like on a post
  app.post("/api/community/posts/:id/like", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const postId = Number(req.params.id);
      const result = await storage.togglePostLike(postId, userId);
      return res.json(result);
    } catch (error) {
      console.error("Error toggling like:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Check if user has liked a post
  app.get("/api/community/posts/:id/liked", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const postId = Number(req.params.id);
      const liked = await storage.isPostLiked(postId, userId);
      return res.json({ liked });
    } catch (error) {
      console.error("Error checking like:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Toggle bookmark on a post
  app.post("/api/community/posts/:id/bookmark", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const postId = Number(req.params.id);
      const result = await storage.togglePostBookmark(postId, userId);
      return res.json(result);
    } catch (error) {
      console.error("Error toggling bookmark:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Check if user has bookmarked a post
  app.get("/api/community/posts/:id/bookmarked", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const postId = Number(req.params.id);
      const bookmarked = await storage.isPostBookmarked(postId, userId);
      return res.json({ bookmarked });
    } catch (error) {
      console.error("Error checking bookmark:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get user's bookmarked posts
  app.get("/api/community/bookmarks", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const posts = await storage.getUserBookmarks(userId);
      return res.json(posts);
    } catch (error) {
      console.error("Error fetching bookmarks:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // =====================================================
  // Deal Bookmark Routes
  // =====================================================

  // Save/like/pass on a deal
  app.post("/api/deals/action", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { dealType, dealId, action } = req.body;
      
      if (!dealType || !dealId || !action) {
        return res.status(400).json({ message: "Missing required fields" });
      }
      
      const result = await storage.saveDeal(userId, dealType, dealId, action);
      return res.json(result);
    } catch (error) {
      console.error("Error saving deal action:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get user's saved deals
  app.get("/api/deals/saved", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const savedDeals = await storage.getUserSavedDeals(userId);
      
      // Enrich with deal details
      const enrichedDeals = await Promise.all(savedDeals.map(async (bookmark) => {
        if (bookmark.dealType === "capital_project") {
          const project = await storage.getCapitalProject(bookmark.dealId);
          return { ...bookmark, deal: project };
        } else if (bookmark.dealType === "wholesale_deal") {
          const deal = await storage.getWholesaleDeal(bookmark.dealId);
          return { ...bookmark, deal };
        }
        return bookmark;
      }));
      
      return res.json(enrichedDeals);
    } catch (error) {
      console.error("Error fetching saved deals:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get user's liked deals (matches)
  app.get("/api/deals/liked", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const likedDeals = await storage.getUserLikedDeals(userId);
      
      // Enrich with deal details
      const enrichedDeals = await Promise.all(likedDeals.map(async (bookmark) => {
        if (bookmark.dealType === "capital_project") {
          const project = await storage.getCapitalProject(bookmark.dealId);
          return { ...bookmark, deal: project };
        } else if (bookmark.dealType === "wholesale_deal") {
          const deal = await storage.getWholesaleDeal(bookmark.dealId);
          return { ...bookmark, deal };
        }
        return bookmark;
      }));
      
      return res.json(enrichedDeals);
    } catch (error) {
      console.error("Error fetching liked deals:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Remove a saved deal
  app.delete("/api/deals/:dealType/:dealId/saved", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { dealType, dealId } = req.params;
      
      await storage.removeDealBookmark(userId, dealType, Number(dealId));
      return res.json({ success: true });
    } catch (error) {
      console.error("Error removing saved deal:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // =====================================================
  // Direct Messaging Routes
  // =====================================================
  
  // Get user's messages
  app.get("/api/messages", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const messages = await storage.getDirectMessages(userId);
      return res.json(messages);
    } catch (error) {
      console.error("Error fetching messages:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get conversation with another user
  app.get("/api/messages/conversation/:otherUserId", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { otherUserId } = req.params;
      const messages = await storage.getConversation(userId, otherUserId);
      return res.json(messages);
    } catch (error) {
      console.error("Error fetching conversation:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Send a message
  app.post("/api/messages", isAuthenticated, async (req: any, res) => {
    try {
      const senderId = req.user.claims.sub;
      const { receiverId, subject, content, parentId } = req.body;
      
      const message = await storage.createDirectMessage({
        senderId,
        receiverId,
        subject,
        content,
        parentId
      });
      return res.status(201).json(message);
    } catch (error) {
      console.error("Error sending message:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Mark message as read
  app.patch("/api/messages/:id/read", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const id = Number(req.params.id);
      
      // Verify the message belongs to this user
      const messages = await storage.getDirectMessages(userId);
      const message = messages.find(m => m.id === id);
      if (!message || message.receiverId !== userId) {
        return res.status(404).json({ message: "Message not found" });
      }
      
      const updated = await storage.markMessageRead(id);
      return res.json(updated);
    } catch (error) {
      console.error("Error marking message as read:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get unread message count
  app.get("/api/messages/unread-count", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const count = await storage.getUnreadMessageCount(userId);
      return res.json({ count });
    } catch (error) {
      console.error("Error getting unread count:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // =====================================================
  // Capital Projects Routes (Staff only for management)
  // =====================================================
  
  // Get all capital projects
  app.get("/api/capital-projects", async (req, res) => {
    try {
      const projects = await storage.getCapitalProjects();
      return res.json(projects);
    } catch (error) {
      console.error("Error fetching capital projects:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get active capital projects for investors
  app.get("/api/capital-projects/active", async (req, res) => {
    try {
      const projects = await storage.getActiveCapitalProjects();
      return res.json(projects);
    } catch (error) {
      console.error("Error fetching active capital projects:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get single capital project
  app.get("/api/capital-projects/:id", async (req, res) => {
    try {
      const id = Number(req.params.id);
      const project = await storage.getCapitalProject(id);
      if (!project) {
        return res.status(404).json({ message: "Capital project not found" });
      }
      return res.json(project);
    } catch (error) {
      console.error("Error fetching capital project:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get all capital projects (Staff only - for HQ)
  app.get("/api/hq/capital-projects", isAuthenticated, requireStaffRole, async (req: any, res) => {
    try {
      const projects = await storage.getCapitalProjects();
      return res.json(projects);
    } catch (error) {
      console.error("Error fetching capital projects:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get all investment offers (Staff only - for HQ)
  app.get("/api/hq/investment-offers", isAuthenticated, requireStaffRole, async (req: any, res) => {
    try {
      const offers = await storage.getInvestmentOffers();
      return res.json(offers);
    } catch (error) {
      console.error("Error fetching investment offers:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Create capital project (Staff only)
  app.post("/api/hq/capital-projects", isAuthenticated, requireStaffRole, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const result = insertCapitalProjectSchema.safeParse({ ...req.body, createdBy: userId });
      if (!result.success) {
        return res.status(400).json({ message: fromError(result.error).toString() });
      }
      const project = await storage.createCapitalProject(result.data);
      return res.status(201).json(project);
    } catch (error) {
      console.error("Error creating capital project:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Update capital project (Staff only)
  app.patch("/api/hq/capital-projects/:id", isAuthenticated, requireStaffRole, async (req: any, res) => {
    try {
      const id = Number(req.params.id);
      const project = await storage.updateCapitalProject(id, req.body);
      if (!project) {
        return res.status(404).json({ message: "Capital project not found" });
      }
      return res.json(project);
    } catch (error) {
      console.error("Error updating capital project:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // =====================================================
  // Milestones Routes
  // =====================================================
  
  // Get milestones for a capital project
  app.get("/api/capital-projects/:projectId/milestones", async (req, res) => {
    try {
      const projectId = Number(req.params.projectId);
      const milestones = await storage.getProjectMilestones(projectId);
      return res.json(milestones);
    } catch (error) {
      console.error("Error fetching milestones:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Create milestone (Staff only)
  app.post("/api/hq/capital-projects/:projectId/milestones", isAuthenticated, requireStaffRole, async (req: any, res) => {
    try {
      const projectId = Number(req.params.projectId);
      const result = insertProjectMilestoneSchema.safeParse({ ...req.body, projectId });
      if (!result.success) {
        return res.status(400).json({ message: fromError(result.error).toString() });
      }
      const milestone = await storage.createProjectMilestone(result.data);
      return res.status(201).json(milestone);
    } catch (error) {
      console.error("Error creating milestone:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Update milestone (Staff only)
  app.patch("/api/hq/milestones/:id", isAuthenticated, requireStaffRole, async (req: any, res) => {
    try {
      const id = Number(req.params.id);
      const milestone = await storage.updateProjectMilestone(id, req.body);
      if (!milestone) {
        return res.status(404).json({ message: "Milestone not found" });
      }
      return res.json(milestone);
    } catch (error) {
      console.error("Error updating milestone:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // =====================================================
  // Investment Offers Routes (Negotiation)
  // =====================================================
  
  // Get investment offers for a project (Staff sees all, investors see theirs)
  app.get("/api/capital-projects/:projectId/offers", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const projectId = Number(req.params.projectId);
      const isStaff = await storage.hasAnyStaffRole(userId);
      
      if (isStaff) {
        const offers = await storage.getInvestmentOffersByProject(projectId);
        return res.json(offers);
      } else {
        const offers = await storage.getInvestmentOffersByInvestor(userId);
        const filtered = offers.filter(o => o.projectId === projectId);
        return res.json(filtered);
      }
    } catch (error) {
      console.error("Error fetching investment offers:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get my investment offers (for investors)
  app.get("/api/my-investment-offers", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const offers = await storage.getInvestmentOffersByInvestor(userId);
      return res.json(offers);
    } catch (error) {
      console.error("Error fetching my investment offers:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Create investment offer (Investors)
  app.post("/api/investment-offers", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const result = insertInvestmentOfferSchema.safeParse({ ...req.body, investorId: userId });
      if (!result.success) {
        return res.status(400).json({ message: fromError(result.error).toString() });
      }
      const offer = await storage.createInvestmentOffer(result.data);
      return res.status(201).json(offer);
    } catch (error) {
      console.error("Error creating investment offer:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Respond to investment offer (Staff only - accept/decline/counter)
  app.post("/api/hq/investment-offers/:id/respond", isAuthenticated, requireStaffRole, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const id = Number(req.params.id);
      const { status, counterTerms, notes } = req.body;
      
      if (!["accepted", "declined", "countered"].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }
      
      const offer = await storage.respondToInvestmentOffer(id, status, counterTerms, notes, userId);
      if (!offer) {
        return res.status(404).json({ message: "Investment offer not found" });
      }
      
      // If accepted, create committed investment
      if (status === "accepted") {
        await storage.createCommittedInvestment({
          projectId: offer.projectId,
          investorId: offer.investorId,
          committedAmount: offer.amountOffered,
          role: offer.requestedRole,
          equityPercent: offer.proposedEquityPercent,
          interestRate: offer.proposedInterestRate,
          notes: offer.notes || "",
          offerId: offer.id
        });
      }
      
      return res.json(offer);
    } catch (error) {
      console.error("Error responding to investment offer:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // =====================================================
  // Committed Investments Routes
  // =====================================================
  
  // Get committed investments for a project
  app.get("/api/capital-projects/:projectId/commitments", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const projectId = Number(req.params.projectId);
      const isStaff = await storage.hasAnyStaffRole(userId);
      
      if (isStaff) {
        const commitments = await storage.getCommittedInvestmentsByProject(projectId);
        return res.json(commitments);
      } else {
        const commitments = await storage.getCommittedInvestmentsByInvestor(userId);
        const filtered = commitments.filter(c => c.projectId === projectId);
        return res.json(filtered);
      }
    } catch (error) {
      console.error("Error fetching committed investments:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get my committed investments
  app.get("/api/my-committed-investments", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const commitments = await storage.getCommittedInvestmentsByInvestor(userId);
      return res.json(commitments);
    } catch (error) {
      console.error("Error fetching my committed investments:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // =====================================================
  // Deal Matches Routes
  // =====================================================
  
  // Get deal matches for staff
  app.get("/api/hq/deal-matches", isAuthenticated, requireStaffRole, async (req: any, res) => {
    try {
      const matches = await storage.getDealMatches();
      return res.json(matches);
    } catch (error) {
      console.error("Error fetching deal matches:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get my deal matches (buyers/investors)
  app.get("/api/my-deal-matches", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const matches = await storage.getDealMatchesByUser(userId);
      return res.json(matches);
    } catch (error) {
      console.error("Error fetching my deal matches:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Create deal match (Staff only)
  app.post("/api/hq/deal-matches", isAuthenticated, requireStaffRole, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const result = insertDealMatchSchema.safeParse({ ...req.body, matchedBy: userId });
      if (!result.success) {
        return res.status(400).json({ message: fromError(result.error).toString() });
      }
      const match = await storage.createDealMatch(result.data);
      return res.status(201).json(match);
    } catch (error) {
      console.error("Error creating deal match:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Update deal match status
  app.patch("/api/deal-matches/:id/status", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const id = Number(req.params.id);
      const { status } = req.body;
      
      // Verify user can update this match
      const matches = await storage.getDealMatchesByUser(userId);
      const isStaff = await storage.hasAnyStaffRole(userId);
      const match = matches.find(m => m.id === id);
      
      if (!match && !isStaff) {
        return res.status(403).json({ message: "Not authorized to update this match" });
      }
      
      const updated = await storage.updateDealMatchStatus(id, status);
      if (!updated) {
        return res.status(404).json({ message: "Deal match not found" });
      }
      return res.json(updated);
    } catch (error) {
      console.error("Error updating deal match status:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // =====================================================
  // Announcements Routes
  // =====================================================
  
  // Get announcements for current user's role
  app.get("/api/announcements", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const roles = await storage.getUserRoles(userId);
      const roleNames = roles.map(r => r.role);
      
      // Determine audience based on roles
      let audience = "ALL";
      if (roleNames.some(r => STAFF_ROLES.includes(r as any))) {
        audience = "STAFF";
      } else if (roleNames.includes("investor")) {
        audience = "INVESTORS";
      } else if (roleNames.includes("wholesaler")) {
        audience = "WHOLESALERS";
      } else if (roleNames.includes("buyer")) {
        audience = "BUYERS";
      }
      
      const announcements = await storage.getAnnouncementsForAudience(audience);
      return res.json(announcements);
    } catch (error) {
      console.error("Error fetching announcements:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get all announcements (Staff only)
  app.get("/api/hq/announcements", isAuthenticated, requireStaffRole, async (req: any, res) => {
    try {
      const announcements = await storage.getAnnouncements();
      return res.json(announcements);
    } catch (error) {
      console.error("Error fetching all announcements:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Create announcement (Staff only)
  app.post("/api/hq/announcements", isAuthenticated, requireStaffRole, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const result = insertAnnouncementSchema.safeParse({ ...req.body, createdBy: userId });
      if (!result.success) {
        return res.status(400).json({ message: fromError(result.error).toString() });
      }
      const announcement = await storage.createAnnouncement(result.data);
      return res.status(201).json(announcement);
    } catch (error) {
      console.error("Error creating announcement:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Update announcement (Staff only)
  app.patch("/api/hq/announcements/:id", isAuthenticated, requireStaffRole, async (req: any, res) => {
    try {
      const id = Number(req.params.id);
      const announcement = await storage.updateAnnouncement(id, req.body);
      if (!announcement) {
        return res.status(404).json({ message: "Announcement not found" });
      }
      return res.json(announcement);
    } catch (error) {
      console.error("Error updating announcement:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Delete announcement (Staff only)
  app.delete("/api/hq/announcements/:id", isAuthenticated, requireStaffRole, async (req: any, res) => {
    try {
      const id = Number(req.params.id);
      await storage.deleteAnnouncement(id);
      return res.status(204).send();
    } catch (error) {
      console.error("Error deleting announcement:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // =====================================================
  // Notifications Routes
  // =====================================================
  
  // Get my notifications
  app.get("/api/notifications", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const notifications = await storage.getNotifications(userId);
      return res.json(notifications);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get unread notifications
  app.get("/api/notifications/unread", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const notifications = await storage.getUnreadNotifications(userId);
      return res.json(notifications);
    } catch (error) {
      console.error("Error fetching unread notifications:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get unread notification count
  app.get("/api/notifications/unread-count", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const count = await storage.getUnreadNotificationCount(userId);
      return res.json({ count });
    } catch (error) {
      console.error("Error getting unread notification count:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Mark notification as read
  app.patch("/api/notifications/:id/read", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const id = Number(req.params.id);
      
      // Verify notification belongs to user
      const notifications = await storage.getNotifications(userId);
      const notification = notifications.find(n => n.id === id);
      if (!notification) {
        return res.status(404).json({ message: "Notification not found" });
      }
      
      const updated = await storage.markNotificationRead(id);
      return res.json(updated);
    } catch (error) {
      console.error("Error marking notification as read:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Mark all notifications as read
  app.post("/api/notifications/mark-all-read", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      await storage.markAllNotificationsRead(userId);
      return res.json({ success: true });
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Create notification (Staff only - for manual notifications)
  app.post("/api/hq/notifications", isAuthenticated, requireStaffRole, async (req: any, res) => {
    try {
      const result = insertNotificationSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: fromError(result.error).toString() });
      }
      const notification = await storage.createNotification(result.data);
      return res.status(201).json(notification);
    } catch (error) {
      console.error("Error creating notification:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  return httpServer;
}
