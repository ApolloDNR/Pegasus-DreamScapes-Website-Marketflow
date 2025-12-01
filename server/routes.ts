import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertSellerLeadSchema, 
  insertInvestorLeadSchema, 
  insertContactSchema 
} from "@shared/schema";
import { fromError } from "zod-validation-error";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
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

  return httpServer;
}
