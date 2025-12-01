import { z } from "zod";

// Seller Lead Schema
export const sellerLeadSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Name is required"),
  phone: z.string().min(1, "Phone is required"),
  email: z.string().email("Valid email is required"),
  propertyAddress: z.string().min(1, "Property address is required"),
  propertyType: z.enum(["house", "condo", "multi", "land"]),
  condition: z.enum(["needs-tlc", "major-repairs", "move-in-ready"]),
  timeline: z.enum(["asap", "30-60-days", "3-plus-months"]),
  notes: z.string().optional(),
  createdAt: z.string().optional(),
});

export const insertSellerLeadSchema = sellerLeadSchema.omit({ id: true, createdAt: true });

export type SellerLead = z.infer<typeof sellerLeadSchema>;
export type InsertSellerLead = z.infer<typeof insertSellerLeadSchema>;

// Investor Lead Schema
export const investorLeadSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Valid email is required"),
  phone: z.string().min(1, "Phone is required"),
  cityState: z.string().min(1, "City/State is required"),
  capitalRange: z.enum(["0-25k", "25-50k", "50-100k", "100k-plus"]),
  investmentPreference: z.enum(["flips", "rentals", "mexico", "not-sure"]),
  experienceLevel: z.enum(["new", "some", "advanced"]),
  notes: z.string().optional(),
  createdAt: z.string().optional(),
});

export const insertInvestorLeadSchema = investorLeadSchema.omit({ id: true, createdAt: true });

export type InvestorLead = z.infer<typeof investorLeadSchema>;
export type InsertInvestorLead = z.infer<typeof insertInvestorLeadSchema>;

// Contact Form Schema
export const contactSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Valid email is required"),
  phone: z.string().optional(),
  subject: z.string().min(1, "Subject is required"),
  message: z.string().min(1, "Message is required"),
  createdAt: z.string().optional(),
});

export const insertContactSchema = contactSchema.omit({ id: true, createdAt: true });

export type Contact = z.infer<typeof contactSchema>;
export type InsertContact = z.infer<typeof insertContactSchema>;

// Legacy user schema for compatibility
export const users = {
  id: z.string(),
  username: z.string(),
  password: z.string(),
};

export const insertUserSchema = z.object({
  username: z.string(),
  password: z.string(),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = { id: string; username: string; password: string };
