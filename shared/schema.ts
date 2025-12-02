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
  portalType: varchar("portal_type", { length: 50 }), // staff, investor, wholesaler
  lastPortal: varchar("last_portal", { length: 50 }), // Remember last portal used
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

// User Roles - supports multiple roles per user
export const userRoles = pgTable("user_roles", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  role: varchar("role", { length: 50 }).notNull(), // admin, project_manager, acquisitions, dispositions, investor, wholesaler
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserRoleSchema = createInsertSchema(userRoles).omit({ id: true, createdAt: true });
export type InsertUserRole = z.infer<typeof insertUserRoleSchema>;
export type UserRole = typeof userRoles.$inferSelect;

// Role constants for type safety
export const STAFF_ROLES = ["admin", "project_manager", "acquisitions", "dispositions"] as const;
export const PORTAL_ROLES = ["investor", "wholesaler", "buyer"] as const;
export const ALL_ROLES = [...STAFF_ROLES, ...PORTAL_ROLES] as const;
export type StaffRole = typeof STAFF_ROLES[number];
export type PortalRole = typeof PORTAL_ROLES[number];
export type Role = typeof ALL_ROLES[number];

// Staff Profiles - for internal team members
export const staffProfiles = pgTable("staff_profiles", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id", { length: 255 }).notNull().unique(),
  department: varchar("department", { length: 100 }), // acquisitions, dispositions, management
  title: varchar("title", { length: 255 }),
  phone: varchar("phone", { length: 50 }),
  bio: text("bio"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertStaffProfileSchema = createInsertSchema(staffProfiles).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertStaffProfile = z.infer<typeof insertStaffProfileSchema>;
export type StaffProfile = typeof staffProfiles.$inferSelect;

// Investor Profiles - for investment partners
export const investorProfiles = pgTable("investor_profiles", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id", { length: 255 }).notNull().unique(),
  company: varchar("company", { length: 255 }),
  phone: varchar("phone", { length: 50 }),
  address: text("address"),
  cityState: varchar("city_state", { length: 255 }),
  capitalRange: varchar("capital_range", { length: 50 }),
  investmentPreference: varchar("investment_preference", { length: 50 }),
  experienceLevel: varchar("experience_level", { length: 50 }),
  accreditedInvestor: boolean("accredited_investor").default(false),
  notes: text("notes"),
  isApproved: boolean("is_approved").notNull().default(false),
  // Match preferences for dating-app style matching
  preferredRiskLevel: varchar("preferred_risk_level", { length: 20 }), // low, medium, high
  preferredStrategies: text("preferred_strategies").array(), // fix-flip, buy-hold, value-add
  preferredPropertyTypes: text("preferred_property_types").array(), // single-family, multi-family
  preferredLocations: text("preferred_locations").array(),
  minInvestment: integer("min_investment"),
  maxInvestment: integer("max_investment"),
  targetReturnMin: integer("target_return_min"), // percentage
  targetReturnMax: integer("target_return_max"),
  preferredHoldPeriod: varchar("preferred_hold_period", { length: 50 }), // 6-12 months, 1-3 years, etc
  // Activity tracking
  lastActiveAt: timestamp("last_active_at"),
  dealsSaved: integer("deals_saved").default(0),
  dealsPassed: integer("deals_passed").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertInvestorProfileSchema = createInsertSchema(investorProfiles).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertInvestorProfile = z.infer<typeof insertInvestorProfileSchema>;
export type InvestorProfile = typeof investorProfiles.$inferSelect;

// Wholesaler Profiles - for external wholesalers
export const wholesalerProfiles = pgTable("wholesaler_profiles", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id", { length: 255 }).notNull().unique(),
  company: varchar("company", { length: 255 }),
  phone: varchar("phone", { length: 50 }),
  address: text("address"),
  cityState: varchar("city_state", { length: 255 }),
  yearsExperience: integer("years_experience"),
  dealsPerYear: varchar("deals_per_year", { length: 50 }),
  marketAreas: text("market_areas").array(),
  buyersList: boolean("buyers_list").default(false),
  notes: text("notes"),
  isApproved: boolean("is_approved").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertWholesalerProfileSchema = createInsertSchema(wholesalerProfiles).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertWholesalerProfile = z.infer<typeof insertWholesalerProfileSchema>;
export type WholesalerProfile = typeof wholesalerProfiles.$inferSelect;

// Buyer Profiles - for cash buyers and retail home buyers
export const buyerProfiles = pgTable("buyer_profiles", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id", { length: 255 }).notNull().unique(),
  company: varchar("company", { length: 255 }),
  phone: varchar("phone", { length: 50 }),
  address: text("address"),
  cityState: varchar("city_state", { length: 255 }),
  buyerType: varchar("buyer_type", { length: 50 }), // cash_buyer, homeowner, investor_buyer
  budgetRange: varchar("budget_range", { length: 50 }),
  propertyPreference: varchar("property_preference", { length: 50 }), // wholesale, renovated, both
  marketAreas: text("market_areas").array(),
  fundingSource: varchar("funding_source", { length: 100 }),
  preApproved: boolean("pre_approved").default(false),
  notes: text("notes"),
  isApproved: boolean("is_approved").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertBuyerProfileSchema = createInsertSchema(buyerProfiles).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertBuyerProfile = z.infer<typeof insertBuyerProfileSchema>;
export type BuyerProfile = typeof buyerProfiles.$inferSelect;

// Saved Properties - for buyers to save listings they're interested in
export const savedProperties = pgTable("saved_properties", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  propertyType: varchar("property_type", { length: 50 }).notNull(), // wholesale, retail
  propertyId: integer("property_id").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertSavedPropertySchema = createInsertSchema(savedProperties).omit({ id: true, createdAt: true });
export type InsertSavedProperty = z.infer<typeof insertSavedPropertySchema>;
export type SavedProperty = typeof savedProperties.$inferSelect;

// Buyer Offers - offers submitted by buyers on properties
export const buyerOffers = pgTable("buyer_offers", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  propertyType: varchar("property_type", { length: 50 }).notNull(), // wholesale, retail
  propertyId: integer("property_id").notNull(),
  offerAmount: integer("offer_amount").notNull(),
  fundingType: varchar("funding_type", { length: 50 }).notNull(), // cash, hard_money, conventional
  closingTimeline: varchar("closing_timeline", { length: 50 }),
  proofOfFunds: text("proof_of_funds"), // URL to uploaded POF
  message: text("message"),
  status: varchar("status", { length: 50 }).notNull().default("pending"), // pending, reviewing, accepted, rejected, countered
  counterOffer: integer("counter_offer"),
  staffNotes: text("staff_notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertBuyerOfferSchema = createInsertSchema(buyerOffers).omit({ id: true, createdAt: true, updatedAt: true, status: true, counterOffer: true, staffNotes: true });
export type InsertBuyerOffer = z.infer<typeof insertBuyerOfferSchema>;
export type BuyerOffer = typeof buyerOffers.$inferSelect;

// Retail Listings - renovated flip properties for sale
export const retailListings = pgTable("retail_listings", {
  id: serial("id").primaryKey(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
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
  // Pricing
  listPrice: integer("list_price").notNull(),
  originalPurchase: integer("original_purchase"),
  renovationCost: integer("renovation_cost"),
  // Features
  description: text("description"),
  features: text("features").array(),
  highlights: text("highlights").array(),
  // Media
  images: text("images").array(),
  virtualTourUrl: text("virtual_tour_url"),
  // Listing source: off_market, mls
  listingSource: varchar("listing_source", { length: 50 }).notNull().default("off_market"),
  mlsNumber: varchar("mls_number", { length: 50 }),
  // Status: coming_soon, active, pending, sold
  status: varchar("status", { length: 50 }).notNull().default("coming_soon"),
  featured: boolean("featured").default(false),
  // Dates
  listedAt: timestamp("listed_at"),
  soldAt: timestamp("sold_at"),
  soldPrice: integer("sold_price"),
  // Timestamps
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertRetailListingSchema = createInsertSchema(retailListings).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertRetailListing = z.infer<typeof insertRetailListingSchema>;
export type RetailListing = typeof retailListings.$inferSelect;

// Buyer Inquiries - for both wholesale deals and retail listings
export const buyerInquiries = pgTable("buyer_inquiries", {
  id: serial("id").primaryKey(),
  listingType: varchar("listing_type", { length: 50 }).notNull(), // wholesale, retail
  listingId: integer("listing_id").notNull(),
  // Buyer info
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 50 }).notNull(),
  company: varchar("company", { length: 255 }),
  // Details
  buyerType: varchar("buyer_type", { length: 50 }).notNull(), // investor, homeowner, wholesaler
  preApproved: boolean("pre_approved").default(false),
  fundingSource: varchar("funding_source", { length: 100 }),
  message: text("message"),
  // Status
  status: varchar("status", { length: 50 }).notNull().default("new"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertBuyerInquirySchema = createInsertSchema(buyerInquiries).omit({ id: true, createdAt: true, status: true });
export type InsertBuyerInquiry = z.infer<typeof insertBuyerInquirySchema>;
export type BuyerInquiry = typeof buyerInquiries.$inferSelect;

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
  submittedBy: varchar("submitted_by", { length: 255 }), // User ID of submitter (wholesaler)
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
  // Match scoring fields
  riskLevel: varchar("risk_level", { length: 20 }), // low, medium, high
  profitPotential: integer("profit_potential"), // 1-5 rating
  marketDemand: integer("market_demand"), // 1-5 rating
  neighborhoodGrade: varchar("neighborhood_grade", { length: 10 }), // A, B, C, D
  matchScore: integer("match_score"), // 0-100 overall score
  // Featured/Hot deal
  isFeatured: boolean("is_featured").default(false),
  isHot: boolean("is_hot").default(false),
  viewCount: integer("view_count").default(0),
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

// Community Discussion Topics/Categories
export const communityCategories = pgTable("community_categories", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  description: text("description"),
  icon: varchar("icon", { length: 50 }),
  color: varchar("color", { length: 20 }),
  order: integer("order").default(0),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type CommunityCategory = typeof communityCategories.$inferSelect;

// Community Posts/Threads
export const communityPosts = pgTable("community_posts", {
  id: serial("id").primaryKey(),
  categoryId: integer("category_id").notNull(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content").notNull(),
  isPinned: boolean("is_pinned").default(false),
  isLocked: boolean("is_locked").default(false),
  viewCount: integer("view_count").default(0),
  replyCount: integer("reply_count").default(0),
  lastReplyAt: timestamp("last_reply_at"),
  lastReplyBy: varchar("last_reply_by", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertCommunityPostSchema = createInsertSchema(communityPosts).omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true, 
  viewCount: true,
  replyCount: true,
  lastReplyAt: true,
  lastReplyBy: true
});
export type InsertCommunityPost = z.infer<typeof insertCommunityPostSchema>;
export type CommunityPost = typeof communityPosts.$inferSelect;

// Community Replies
export const communityReplies = pgTable("community_replies", {
  id: serial("id").primaryKey(),
  postId: integer("post_id").notNull(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  content: text("content").notNull(),
  isAcceptedAnswer: boolean("is_accepted_answer").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertCommunityReplySchema = createInsertSchema(communityReplies).omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true,
  isAcceptedAnswer: true
});
export type InsertCommunityReply = z.infer<typeof insertCommunityReplySchema>;
export type CommunityReply = typeof communityReplies.$inferSelect;

// Direct Messages
export const directMessages = pgTable("direct_messages", {
  id: serial("id").primaryKey(),
  senderId: varchar("sender_id", { length: 255 }).notNull(),
  receiverId: varchar("receiver_id", { length: 255 }).notNull(),
  subject: varchar("subject", { length: 255 }),
  content: text("content").notNull(),
  isRead: boolean("is_read").default(false),
  parentId: integer("parent_id"), // For threading/replies
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertDirectMessageSchema = createInsertSchema(directMessages).omit({ 
  id: true, 
  createdAt: true,
  isRead: true
});
export type InsertDirectMessage = z.infer<typeof insertDirectMessageSchema>;
export type DirectMessage = typeof directMessages.$inferSelect;

// Capital Projects - for raising capital from investors
export const capitalProjects = pgTable("capital_projects", {
  id: serial("id").primaryKey(),
  createdBy: varchar("created_by", { length: 255 }).notNull(), // Dreamscaper user ID
  linkedDealId: integer("linked_deal_id"), // Optional link to wholesale deal
  // Project details
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").notNull(),
  location: varchar("location", { length: 255 }),
  scopeOfWork: text("scope_of_work"),
  // Funding
  fundingGoal: integer("funding_goal").notNull(),
  amountRaised: integer("amount_raised").default(0),
  minInvestment: integer("min_investment").notNull(),
  maxInvestmentPerInvestor: integer("max_investment_per_investor"),
  // Structure: EQUITY, DEBT, HYBRID
  structure: varchar("structure", { length: 50 }).notNull().default("EQUITY"),
  projectedReturn: varchar("projected_return", { length: 50 }),
  holdPeriod: varchar("hold_period", { length: 50 }),
  // Status: DRAFT, OPEN_FOR_INVESTMENT, FUNDED, IN_PROGRESS, COMPLETED
  status: varchar("status", { length: 50 }).notNull().default("DRAFT"),
  // Timeline
  startDate: timestamp("start_date"),
  estimatedCompletion: timestamp("estimated_completion"),
  // Media
  images: text("images").array(),
  documents: text("documents").array(),
  // Match scoring fields
  riskLevel: varchar("risk_level", { length: 20 }), // low, medium, high
  designAppeal: integer("design_appeal"), // 1-5 rating
  roiPotential: integer("roi_potential"), // 1-5 rating
  marketDemand: integer("market_demand"), // 1-5 rating
  neighborhoodGrade: varchar("neighborhood_grade", { length: 10 }), // A, B, C, D
  strategy: varchar("strategy", { length: 50 }), // fix-flip, buy-hold, value-add, development
  propertyType: varchar("property_type", { length: 50 }), // single-family, multi-family, commercial
  // Investor count
  investorCount: integer("investor_count").default(0),
  // Featured/Hot deal
  isFeatured: boolean("is_featured").default(false),
  isHot: boolean("is_hot").default(false),
  // Timestamps
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertCapitalProjectSchema = createInsertSchema(capitalProjects).omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true,
  amountRaised: true
});
export type InsertCapitalProject = z.infer<typeof insertCapitalProjectSchema>;
export type CapitalProject = typeof capitalProjects.$inferSelect;

// Project Milestones - track project progress
export const projectMilestones = pgTable("project_milestones", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  targetDate: timestamp("target_date"),
  isComplete: boolean("is_complete").default(false),
  completedAt: timestamp("completed_at"),
  order: integer("order").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertProjectMilestoneSchema = createInsertSchema(projectMilestones).omit({ 
  id: true, 
  createdAt: true,
  isComplete: true,
  completedAt: true
});
export type InsertProjectMilestone = z.infer<typeof insertProjectMilestoneSchema>;
export type ProjectMilestone = typeof projectMilestones.$inferSelect;

// Investment Offers - investor proposals to join projects
export const investmentOffers = pgTable("investment_offers", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").notNull(),
  investorId: varchar("investor_id", { length: 255 }).notNull(),
  // Offer details
  amountOffered: integer("amount_offered").notNull(),
  requestedRole: varchar("requested_role", { length: 50 }).notNull().default("LP"), // LP or GP
  proposedEquityPercent: varchar("proposed_equity_percent", { length: 20 }),
  proposedInterestRate: varchar("proposed_interest_rate", { length: 20 }),
  holdPeriod: varchar("hold_period", { length: 50 }),
  notes: text("notes"),
  // Status: PENDING, COUNTERED, ACCEPTED, DECLINED
  status: varchar("status", { length: 50 }).notNull().default("PENDING"),
  // Counter offer fields (set by Dreamscaper)
  counterAmount: integer("counter_amount"),
  counterEquityPercent: varchar("counter_equity_percent", { length: 20 }),
  counterInterestRate: varchar("counter_interest_rate", { length: 20 }),
  counterNotes: text("counter_notes"),
  // Negotiation history stored as JSON
  negotiationHistory: jsonb("negotiation_history").default([]),
  // Timestamps
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertInvestmentOfferSchema = createInsertSchema(investmentOffers).omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true,
  status: true,
  counterAmount: true,
  counterEquityPercent: true,
  counterInterestRate: true,
  counterNotes: true,
  negotiationHistory: true
});
export type InsertInvestmentOffer = z.infer<typeof insertInvestmentOfferSchema>;
export type InvestmentOffer = typeof investmentOffers.$inferSelect;

// Committed Investments - finalized investments
export const committedInvestments = pgTable("committed_investments", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").notNull(),
  investorId: varchar("investor_id", { length: 255 }).notNull(),
  offerId: integer("offer_id"), // Link to original offer
  // Final terms
  committedAmount: integer("committed_amount").notNull(),
  role: varchar("role", { length: 50 }).notNull().default("LP"),
  equityPercent: varchar("equity_percent", { length: 20 }),
  interestRate: varchar("interest_rate", { length: 20 }),
  notes: text("notes"),
  // Timestamps
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertCommittedInvestmentSchema = createInsertSchema(committedInvestments).omit({ 
  id: true, 
  createdAt: true
});
export type InsertCommittedInvestment = z.infer<typeof insertCommittedInvestmentSchema>;
export type CommittedInvestment = typeof committedInvestments.$inferSelect;

// Deal Matches - connecting deals with buyers/investors
export const dealMatches = pgTable("deal_matches", {
  id: serial("id").primaryKey(),
  dealId: integer("deal_id").notNull(),
  matchedUserId: varchar("matched_user_id", { length: 255 }).notNull(), // Buyer or investor
  matchedBy: varchar("matched_by", { length: 255 }).notNull(), // Dreamscaper who made match
  matchType: varchar("match_type", { length: 50 }).notNull(), // buyer, investor, jv_partner
  // Fee structure
  pegasusFee: integer("pegasus_fee"),
  feeType: varchar("fee_type", { length: 50 }), // flat, percentage
  jvSplit: varchar("jv_split", { length: 50 }),
  // Status: proposed, accepted, in_progress, closed
  status: varchar("status", { length: 50 }).notNull().default("proposed"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertDealMatchSchema = createInsertSchema(dealMatches).omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true
});
export type InsertDealMatch = z.infer<typeof insertDealMatchSchema>;
export type DealMatch = typeof dealMatches.$inferSelect;

// Announcements - staff announcements to portal users
export const announcements = pgTable("announcements", {
  id: serial("id").primaryKey(),
  createdBy: varchar("created_by", { length: 255 }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content").notNull(),
  // Audience: ALL, INVESTORS, WHOLESALERS, BUYERS, DREAMSCAPERS
  audience: varchar("audience", { length: 50 }).notNull().default("ALL"),
  isPinned: boolean("is_pinned").default(false),
  isActive: boolean("is_active").default(true),
  ctaText: varchar("cta_text", { length: 100 }),
  ctaLink: varchar("cta_link", { length: 255 }),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertAnnouncementSchema = createInsertSchema(announcements).omit({ 
  id: true, 
  createdAt: true
});
export type InsertAnnouncement = z.infer<typeof insertAnnouncementSchema>;
export type Announcement = typeof announcements.$inferSelect;

// Notifications - user notifications
export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  // Type: investment_offer, counter_offer, offer_accepted, deal_interest, announcement, message, match
  type: varchar("type", { length: 50 }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message"),
  // Link to related entity
  relatedType: varchar("related_type", { length: 50 }), // project, deal, offer, message
  relatedId: integer("related_id"),
  link: varchar("link", { length: 255 }),
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertNotificationSchema = createInsertSchema(notifications).omit({ 
  id: true, 
  createdAt: true,
  isRead: true
});
export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type Notification = typeof notifications.$inferSelect;

// Deal Swipes - track user interactions with deals (like/pass for matching)
export const dealSwipes = pgTable("deal_swipes", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  dealType: varchar("deal_type", { length: 50 }).notNull(), // capital_project, wholesale_deal
  dealId: integer("deal_id").notNull(),
  action: varchar("action", { length: 20 }).notNull(), // like, pass, save, request_intro
  matchScore: integer("match_score"), // calculated at time of swipe
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertDealSwipeSchema = createInsertSchema(dealSwipes).omit({ 
  id: true, 
  createdAt: true
});
export type InsertDealSwipe = z.infer<typeof insertDealSwipeSchema>;
export type DealSwipe = typeof dealSwipes.$inferSelect;

// Investor Activity Feed - recent activity for My Office dashboard
export const investorActivity = pgTable("investor_activity", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  activityType: varchar("activity_type", { length: 50 }).notNull(), // new_match, new_deal, message, investment, community_post
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  relatedType: varchar("related_type", { length: 50 }),
  relatedId: integer("related_id"),
  link: varchar("link", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type InvestorActivity = typeof investorActivity.$inferSelect;
