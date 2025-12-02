import { pgTable, text, serial, timestamp, varchar, integer, boolean, jsonb, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { sql } from "drizzle-orm";

// Session storage table for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// Users table for Pegasus HQ authentication with Replit Auth
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email", { length: 255 }).unique(),
  firstName: varchar("first_name", { length: 255 }),
  lastName: varchar("last_name", { length: 255 }),
  profileImageUrl: varchar("profile_image_url"),
  role: varchar("role", { length: 50 }).notNull().default("user"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

// Seller Leads table
export const sellerLeads = pgTable("seller_leads", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 50 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  propertyAddress: text("property_address").notNull(),
  propertyType: varchar("property_type", { length: 50 }).notNull(),
  condition: varchar("condition", { length: 50 }).notNull(),
  timeline: varchar("timeline", { length: 50 }).notNull(),
  notes: text("notes"),
  status: varchar("status", { length: 50 }).notNull().default("new"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertSellerLeadSchema = createInsertSchema(sellerLeads).omit({ id: true, createdAt: true, status: true });
export type InsertSellerLead = z.infer<typeof insertSellerLeadSchema>;
export type SellerLead = typeof sellerLeads.$inferSelect;

// Investor Leads table
export const investorLeads = pgTable("investor_leads", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 50 }).notNull(),
  cityState: varchar("city_state", { length: 255 }).notNull(),
  capitalRange: varchar("capital_range", { length: 50 }).notNull(),
  investmentPreference: varchar("investment_preference", { length: 50 }).notNull(),
  experienceLevel: varchar("experience_level", { length: 50 }).notNull(),
  notes: text("notes"),
  status: varchar("status", { length: 50 }).notNull().default("new"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertInvestorLeadSchema = createInsertSchema(investorLeads).omit({ id: true, createdAt: true, status: true });
export type InsertInvestorLead = z.infer<typeof insertInvestorLeadSchema>;
export type InvestorLead = typeof investorLeads.$inferSelect;

// Contact form submissions table
export const contacts = pgTable("contacts", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 50 }),
  subject: varchar("subject", { length: 255 }).notNull(),
  message: text("message").notNull(),
  status: varchar("status", { length: 50 }).notNull().default("new"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertContactSchema = createInsertSchema(contacts).omit({ id: true, createdAt: true, status: true });
export type InsertContact = z.infer<typeof insertContactSchema>;
export type Contact = typeof contacts.$inferSelect;

// Projects table for case studies and portfolio
export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  address: text("address").notNull(),
  city: varchar("city", { length: 100 }).notNull(),
  state: varchar("state", { length: 50 }).notNull(),
  strategy: varchar("strategy", { length: 50 }).notNull(),
  status: varchar("status", { length: 50 }).notNull().default("active"),
  purchasePrice: integer("purchase_price"),
  rehabCost: integer("rehab_cost"),
  arv: integer("arv"),
  salePrice: integer("sale_price"),
  profit: integer("profit"),
  roi: varchar("roi", { length: 20 }),
  holdTime: varchar("hold_time", { length: 50 }),
  bedrooms: integer("bedrooms"),
  bathrooms: varchar("bathrooms", { length: 10 }),
  sqft: integer("sqft"),
  yearBuilt: integer("year_built"),
  description: text("description"),
  beforeImages: text("before_images").array(),
  afterImages: text("after_images").array(),
  highlights: text("highlights").array(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertProjectSchema = createInsertSchema(projects).omit({ id: true, createdAt: true });
export type InsertProject = z.infer<typeof insertProjectSchema>;
export type Project = typeof projects.$inferSelect;

// Blog/Resources articles table
export const articles = pgTable("articles", {
  id: serial("id").primaryKey(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  title: varchar("title", { length: 255 }).notNull(),
  excerpt: text("excerpt").notNull(),
  content: text("content").notNull(),
  category: varchar("category", { length: 100 }).notNull(),
  author: varchar("author", { length: 255 }).notNull(),
  imageUrl: text("image_url"),
  published: boolean("published").notNull().default(false),
  publishedAt: timestamp("published_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertArticleSchema = createInsertSchema(articles).omit({ id: true, createdAt: true });
export type InsertArticle = z.infer<typeof insertArticleSchema>;
export type Article = typeof articles.$inferSelect;

// Lead activity/notes table for CRM
export const leadActivities = pgTable("lead_activities", {
  id: serial("id").primaryKey(),
  leadType: varchar("lead_type", { length: 20 }).notNull(),
  leadId: integer("lead_id").notNull(),
  activityType: varchar("activity_type", { length: 50 }).notNull(),
  notes: text("notes"),
  followUpDate: timestamp("follow_up_date"),
  createdBy: integer("created_by"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertLeadActivitySchema = createInsertSchema(leadActivities).omit({ id: true, createdAt: true });
export type InsertLeadActivity = z.infer<typeof insertLeadActivitySchema>;
export type LeadActivity = typeof leadActivities.$inferSelect;

// Wholesale Deals table - off-market properties under contract
export const wholesaleDeals = pgTable("wholesale_deals", {
  id: serial("id").primaryKey(),
  // Property details
  propertyAddress: text("property_address").notNull(),
  city: varchar("city", { length: 100 }).notNull(),
  state: varchar("state", { length: 50 }).notNull(),
  zipCode: varchar("zip_code", { length: 20 }).notNull(),
  propertyType: varchar("property_type", { length: 50 }).notNull(),
  bedrooms: integer("bedrooms"),
  bathrooms: varchar("bathrooms", { length: 10 }),
  sqft: integer("sqft"),
  yearBuilt: integer("year_built"),
  lotSize: varchar("lot_size", { length: 50 }),
  // Financial details
  contractPrice: integer("contract_price").notNull(),
  assignmentFee: integer("assignment_fee").notNull(),
  arv: integer("arv"),
  estimatedRepairs: integer("estimated_repairs"),
  // Deal info
  strategy: varchar("strategy", { length: 50 }).notNull(),
  description: text("description"),
  highlights: text("highlights").array(),
  images: text("images").array(),
  // Status workflow: under_review -> accepted/rejected/available -> assigned
  status: varchar("status", { length: 50 }).notNull().default("under_review"),
  // Management
  acquisitionsNotes: text("acquisitions_notes"),
  developmentNotes: text("development_notes"),
  contractExpiration: timestamp("contract_expiration"),
  // Timestamps
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertWholesaleDealSchema = createInsertSchema(wholesaleDeals).omit({ id: true, createdAt: true, updatedAt: true, status: true });
export type InsertWholesaleDeal = z.infer<typeof insertWholesaleDealSchema>;
export type WholesaleDeal = typeof wholesaleDeals.$inferSelect;

// Wholesale Deal Assignment Requests - investors requesting deals
export const wholesaleRequests = pgTable("wholesale_requests", {
  id: serial("id").primaryKey(),
  dealId: integer("deal_id").notNull(),
  // Investor info
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 50 }).notNull(),
  company: varchar("company", { length: 255 }),
  // Request details
  experience: varchar("experience", { length: 50 }).notNull(),
  fundingSource: varchar("funding_source", { length: 50 }).notNull(),
  message: text("message"),
  // Status
  status: varchar("status", { length: 50 }).notNull().default("pending"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertWholesaleRequestSchema = createInsertSchema(wholesaleRequests).omit({ id: true, createdAt: true, status: true });
export type InsertWholesaleRequest = z.infer<typeof insertWholesaleRequestSchema>;
export type WholesaleRequest = typeof wholesaleRequests.$inferSelect;
