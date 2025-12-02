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
        isWholesaler: roleNames.includes("wholesaler")
      });
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
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

  // Protected HQ Routes (require authentication)
  app.get("/api/hq/seller-leads", isAuthenticated, async (req, res) => {
    try {
      const leads = await storage.getSellerLeads();
      return res.json(leads);
    } catch (error) {
      console.error("Error fetching seller leads:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/hq/investor-leads", isAuthenticated, async (req, res) => {
    try {
      const leads = await storage.getInvestorLeads();
      return res.json(leads);
    } catch (error) {
      console.error("Error fetching investor leads:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/hq/contacts", isAuthenticated, async (req, res) => {
    try {
      const contactsList = await storage.getContacts();
      return res.json(contactsList);
    } catch (error) {
      console.error("Error fetching contacts:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.patch("/api/hq/seller-leads/:id/status", isAuthenticated, async (req, res) => {
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

  app.patch("/api/hq/investor-leads/:id/status", isAuthenticated, async (req, res) => {
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

  app.patch("/api/hq/contacts/:id/status", isAuthenticated, async (req, res) => {
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

  // Lead Activities Routes (for CRM)
  app.get("/api/hq/activities/:leadType/:leadId", isAuthenticated, async (req, res) => {
    try {
      const { leadType, leadId } = req.params;
      const activities = await storage.getLeadActivities(leadType, parseInt(leadId));
      return res.json(activities);
    } catch (error) {
      console.error("Error fetching lead activities:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/hq/activities", isAuthenticated, async (req, res) => {
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

  app.patch("/api/hq/activities/:id/complete", isAuthenticated, async (req, res) => {
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

  // Queue Routes (for work queue/task management)
  app.get("/api/hq/queue", isAuthenticated, async (req, res) => {
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

  // Protected HQ Wholesale Routes
  app.get("/api/hq/wholesale-deals", isAuthenticated, async (req, res) => {
    try {
      const deals = await storage.getWholesaleDeals();
      return res.json(deals);
    } catch (error) {
      console.error("Error fetching all wholesale deals:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/hq/wholesale-deals", isAuthenticated, async (req, res) => {
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

  app.patch("/api/hq/wholesale-deals/:id/status", isAuthenticated, async (req, res) => {
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

  app.patch("/api/hq/wholesale-deals/:id", isAuthenticated, async (req, res) => {
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

  app.get("/api/hq/wholesale-requests", isAuthenticated, async (req, res) => {
    try {
      const requests = await storage.getWholesaleRequests();
      return res.json(requests);
    } catch (error) {
      console.error("Error fetching wholesale requests:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/hq/wholesale-deals/:id/requests", isAuthenticated, async (req, res) => {
    try {
      const dealId = parseInt(req.params.id);
      const requests = await storage.getWholesaleRequestsByDeal(dealId);
      return res.json(requests);
    } catch (error) {
      console.error("Error fetching deal requests:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.patch("/api/hq/wholesale-requests/:id/status", isAuthenticated, async (req, res) => {
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

  return httpServer;
}
