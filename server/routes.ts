import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertSellerLeadSchema, 
  insertInvestorLeadSchema, 
  insertContactSchema,
  insertProjectSchema,
  insertWholesaleDealSchema,
  insertWholesaleRequestSchema
} from "@shared/schema";
import { fromError } from "zod-validation-error";
import { setupAuth, isAuthenticated } from "./replitAuth";

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
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
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

  return httpServer;
}
