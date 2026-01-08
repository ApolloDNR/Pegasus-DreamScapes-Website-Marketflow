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
export const STAFF_ROLES = ["admin", "project_manager", "acquisitions", "dispositions", "it"] as const;
export const PORTAL_ROLES = ["investor", "wholesaler", "buyer", "dreamscaper"] as const;
export const ALL_ROLES = [...STAFF_ROLES, ...PORTAL_ROLES] as const;
export type StaffRole = typeof STAFF_ROLES[number];
export type PortalRole = typeof PORTAL_ROLES[number];
export type Role = typeof ALL_ROLES[number];

// =====================================================
// CONSOLIDATED 8-TIER MARKETPLACE ROLE SYSTEM (Supabase)
// =====================================================
// This is the unified role system used across the marketplace platform
// Each role has specific capabilities and access levels

export const MARKETPLACE_ROLES = [
  "admin",              // Full platform admin - can manage all users, deals, projects
  "pegasus_wholesaler", // Internal Pegasus team wholesaler - enhanced features, trusted status
  "wholesaler",         // External wholesaler - submit deals, track status
  "pegasus_dreamscaper", // Internal Pegasus project operator - enhanced capital raising
  "dreamscaper",        // External operator - post projects, raise capital
  "investor",           // Capital provider - browse projects, commit funds
  "buyer_retail",       // Retail homebuyer - browse listings, make offers
  "buyer_investment",   // Investment buyer - browse wholesale deals, make offers
] as const;

export type MarketplaceRole = typeof MARKETPLACE_ROLES[number];

// Role metadata with labels, descriptions, and dashboard paths
export const MARKETPLACE_ROLE_CONFIG = {
  admin: {
    label: "Administrator",
    description: "Full platform access with all administrative permissions",
    dashboardPath: "/marketplace/admin",
    isPegasus: true,
    permissions: ["manage_users", "manage_deals", "manage_projects", "manage_capital", "view_analytics", "approve_submissions"],
  },
  pegasus_wholesaler: {
    label: "Pegasus Wholesaler",
    description: "Internal team member handling wholesale acquisitions",
    dashboardPath: "/marketplace/wholesaler",
    isPegasus: true,
    permissions: ["submit_deals", "view_all_deals", "manage_own_deals", "view_analytics"],
  },
  wholesaler: {
    label: "Wholesaler",
    description: "External wholesaler submitting deals to the marketplace",
    dashboardPath: "/marketplace/wholesaler",
    isPegasus: false,
    permissions: ["submit_deals", "manage_own_deals", "view_public_deals"],
  },
  pegasus_dreamscaper: {
    label: "Pegasus Dreamscaper",
    description: "Internal team member managing capital raising projects",
    dashboardPath: "/marketplace/dreamscaper",
    isPegasus: true,
    permissions: ["create_projects", "view_all_projects", "manage_investors", "view_analytics"],
  },
  dreamscaper: {
    label: "Dreamscaper",
    description: "Property operator raising capital for projects",
    dashboardPath: "/marketplace/dreamscaper",
    isPegasus: false,
    permissions: ["create_projects", "manage_own_projects", "view_investors"],
  },
  investor: {
    label: "Investor",
    description: "Capital provider investing in real estate projects",
    dashboardPath: "/marketplace/investor",
    isPegasus: false,
    permissions: ["browse_projects", "commit_capital", "view_commitments", "submit_jv_requests"],
  },
  buyer_retail: {
    label: "Retail Buyer",
    description: "Homebuyer looking for renovated properties",
    dashboardPath: "/marketplace/buyer",
    isPegasus: false,
    permissions: ["browse_listings", "save_properties", "make_offers"],
  },
  buyer_investment: {
    label: "Investment Buyer",
    description: "Investor buying wholesale or distressed properties",
    dashboardPath: "/marketplace/buyer",
    isPegasus: false,
    permissions: ["browse_deals", "browse_listings", "save_properties", "make_offers"],
  },
} as const;

export type MarketplacePermission = 
  | "manage_users"
  | "manage_deals"
  | "manage_projects"
  | "manage_capital"
  | "view_analytics"
  | "approve_submissions"
  | "submit_deals"
  | "view_all_deals"
  | "manage_own_deals"
  | "view_public_deals"
  | "create_projects"
  | "view_all_projects"
  | "manage_own_projects"
  | "manage_investors"
  | "view_investors"
  | "browse_projects"
  | "commit_capital"
  | "view_commitments"
  | "submit_jv_requests"
  | "browse_listings"
  | "browse_deals"
  | "save_properties"
  | "make_offers";

// Helper functions for role system
export function isValidMarketplaceRole(role: string): role is MarketplaceRole {
  return MARKETPLACE_ROLES.includes(role as MarketplaceRole);
}

export function isPegasusRole(role: MarketplaceRole): boolean {
  return MARKETPLACE_ROLE_CONFIG[role].isPegasus;
}

export function getRoleDashboard(role: MarketplaceRole): string {
  return MARKETPLACE_ROLE_CONFIG[role].dashboardPath;
}

export function getRoleLabel(role: MarketplaceRole): string {
  return MARKETPLACE_ROLE_CONFIG[role].label;
}

export function hasMarketplacePermission(role: MarketplaceRole, permission: MarketplacePermission): boolean {
  return (MARKETPLACE_ROLE_CONFIG[role].permissions as readonly string[]).includes(permission);
}

// =====================================================
// DEAL TYPE ENUM - Drives forms, buttons, and negotiation schemas
// =====================================================
// Every deal/listing/project MUST have a dealType that determines:
// - Which buttons show on cards
// - Which canonical form opens
// - Which negotiation room schema is used
// - Which fields are available

export const DEAL_TYPES = [
  "WHOLESALE_ASSIGNMENT", // Wholesale assignment deals - uses WholesaleAssignmentOfferModal
  "CAPITAL_RAISE",        // Capital raise projects - uses OfferStudio
  "LISTING",              // Ready-to-move-in properties - uses ListingInquiryModal
] as const;

export type DealType = typeof DEAL_TYPES[number];

// Action types that can be performed on deals
export const DEAL_ACTIONS = [
  "VIEW",              // View deal details
  "ACCEPT",            // Accept terms as-is
  "COUNTER",           // Counter with different terms
  "OFFER",             // Make an offer (wholesale assignment)
  "JV",                // Request JV partnership (wholesaler-to-wholesaler)
  "INVEST",            // Invest in capital raise
  "INQUIRE",           // Send inquiry (listings)
  "SCHEDULE",          // Schedule showing (listings)
  "NEGOTIATION_ROOM",  // Open negotiation room
] as const;

export type DealAction = typeof DEAL_ACTIONS[number];

// Helper to validate deal type
export function isValidDealType(type: string): type is DealType {
  return DEAL_TYPES.includes(type as DealType);
}

// Role category helpers
export function isAdminRole(role: string): boolean {
  return role === "admin";
}

export function isWholesalerRole(role: string): boolean {
  return role === "wholesaler" || role === "pegasus_wholesaler";
}

export function isDreamscaperRole(role: string): boolean {
  return role === "dreamscaper" || role === "pegasus_dreamscaper";
}

export function isInvestorRole(role: string): boolean {
  return role === "investor";
}

export function isBuyerRole(role: string): boolean {
  return role === "buyer_retail" || role === "buyer_investment";
}

// Supabase user profile type (matches supabase-schema.sql)
export interface SupabaseUserProfile {
  id: string;
  userId: string;
  primaryRole: MarketplaceRole;
  displayName: string;
  companyName?: string | null;
  location?: string | null;
  avatarUrl?: string | null;
  bio?: string | null;
  isPegasusBadged: boolean;
  pegasusRoleType?: string | null;
  createdAt: string;
  updatedAt: string;
}

// Staff Role Permissions - defines what each role can access/do
export const STAFF_PERMISSIONS = {
  admin: {
    label: "Administrator",
    description: "Full system access with all permissions",
    permissions: [
      "manage_staff",
      "manage_users", 
      "manage_leads",
      "manage_deals",
      "manage_projects",
      "manage_capital",
      "manage_announcements",
      "manage_community",
      "view_analytics",
      "manage_settings",
    ],
  },
  project_manager: {
    label: "Project Manager",
    description: "Manages projects, timelines, and team coordination",
    permissions: [
      "manage_projects",
      "manage_deals",
      "view_leads",
      "manage_capital",
      "view_analytics",
      "manage_community",
    ],
  },
  acquisitions: {
    label: "Acquisitions",
    description: "Handles property acquisitions and seller leads",
    permissions: [
      "manage_leads",
      "manage_deals",
      "view_projects",
      "view_analytics",
    ],
  },
  dispositions: {
    label: "Dispositions",
    description: "Handles property sales and buyer management",
    permissions: [
      "manage_leads",
      "manage_deals",
      "view_projects",
      "view_analytics",
    ],
  },
  it: {
    label: "IT / Tech Support",
    description: "Technical support and system maintenance",
    permissions: [
      "manage_settings",
      "view_analytics",
      "view_users",
    ],
  },
} as const;

export type StaffPermission = 
  | "manage_staff"
  | "manage_users"
  | "manage_leads"
  | "manage_deals"
  | "manage_projects"
  | "manage_capital"
  | "manage_announcements"
  | "manage_community"
  | "view_analytics"
  | "manage_settings"
  | "view_leads"
  | "view_projects"
  | "view_users";

// Helper function to check if a role has a specific permission
export function hasPermission(roles: string[], permission: StaffPermission): boolean {
  return roles.some(role => {
    const staffRole = STAFF_PERMISSIONS[role as StaffRole];
    return staffRole?.permissions.includes(permission as any);
  });
}

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
  status: varchar("status", { length: 50 }).notNull().default("pending"), // pending, reviewing, accepted, rejected, countered, under_contract, closing, closed
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

// Buyer Leads table
export const buyerLeads = pgTable("buyer_leads", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 50 }).notNull(),
  cityState: varchar("city_state", { length: 255 }).notNull(),
  buyerType: varchar("buyer_type", { length: 50 }).notNull(),
  propertyTypes: varchar("property_types", { length: 255 }).notNull(),
  budgetRange: varchar("budget_range", { length: 50 }).notNull(),
  timeline: varchar("timeline", { length: 50 }).notNull(),
  fundingStatus: varchar("funding_status", { length: 50 }).notNull(),
  notes: text("notes"),
  status: varchar("status", { length: 50 }).notNull().default("new"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertBuyerLeadSchema = createInsertSchema(buyerLeads).omit({ id: true, createdAt: true, status: true });
export type InsertBuyerLead = z.infer<typeof insertBuyerLeadSchema>;
export type BuyerLead = typeof buyerLeads.$inferSelect;

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

// Wholesale Deal Pipeline Stages
export const WHOLESALE_PIPELINE_STAGES = [
  "sourcing",      // Lead identified, researching
  "underwriting",  // Analyzing numbers, running comps
  "negotiating",   // Making offers, negotiating terms
  "under_contract", // Contract signed, in DD period
  "marketing",     // Listed for assignment
  "assigned",      // Assigned to end buyer
  "closed",        // Deal completed
  "dead"           // Deal fell through
] as const;

export type WholesalePipelineStage = typeof WHOLESALE_PIPELINE_STAGES[number];

// Wholesale Deals table - off-market properties for assignment
export const wholesaleDeals = pgTable("wholesale_deals", {
  id: serial("id").primaryKey(),
  submittedBy: varchar("submitted_by", { length: 255 }), // User ID of submitter (wholesaler)
  
  // === PROPERTY DETAILS ===
  propertyAddress: text("property_address").notNull(),
  city: varchar("city", { length: 100 }).notNull(),
  state: varchar("state", { length: 50 }).notNull(),
  zipCode: varchar("zip_code", { length: 20 }).notNull(),
  county: varchar("county", { length: 100 }),
  propertyType: varchar("property_type", { length: 50 }).notNull(),
  bedrooms: integer("bedrooms"),
  bathrooms: varchar("bathrooms", { length: 10 }),
  sqft: integer("sqft"),
  yearBuilt: integer("year_built"),
  lotSize: varchar("lot_size", { length: 50 }),
  
  // === SELLER INFORMATION ===
  sellerName: varchar("seller_name", { length: 255 }),
  sellerPhone: varchar("seller_phone", { length: 50 }),
  sellerEmail: varchar("seller_email", { length: 255 }),
  sellerMotivation: varchar("seller_motivation", { length: 100 }), // divorce, foreclosure, inherited, relocation, tired_landlord, etc.
  motivationLevel: integer("motivation_level"), // 1-10 scale
  sellerSituation: text("seller_situation"), // Detailed notes about seller's circumstances
  
  // === FINANCIAL DETAILS ===
  askingPrice: integer("asking_price"), // What seller initially asked
  contractPrice: integer("contract_price").notNull(),
  assignmentFee: integer("assignment_fee").notNull(),
  maxAssignmentFee: integer("max_assignment_fee"), // Ceiling for negotiation
  arv: integer("arv"),
  estimatedRepairs: integer("estimated_repairs"),
  repairDetails: text("repair_details"), // Breakdown of repairs needed
  holdingCosts: integer("holding_costs"), // Monthly carrying costs
  closingCosts: integer("closing_costs"),
  
  // === EARNEST MONEY ===
  emdAmount: integer("emd_amount"), // Earnest Money Deposit
  emdDueDate: timestamp("emd_due_date"),
  emdHeldBy: varchar("emd_held_by", { length: 255 }), // Title company or escrow
  emdStatus: varchar("emd_status", { length: 50 }), // pending, deposited, released, forfeited
  
  // === CONTRACT DATES ===
  contractDate: timestamp("contract_date"), // When contract was signed
  inspectionDeadline: timestamp("inspection_deadline"),
  dueDiligenceDeadline: timestamp("due_diligence_deadline"),
  financingDeadline: timestamp("financing_deadline"),
  closingDate: timestamp("closing_date"),
  contractExpiration: timestamp("contract_expiration"),
  
  // === PROPERTY ACCESS ===
  occupancyStatus: varchar("occupancy_status", { length: 50 }), // vacant, owner_occupied, tenant_occupied
  accessInstructions: text("access_instructions"), // How to show property
  lockboxCode: varchar("lockbox_code", { length: 50 }),
  showingAvailability: text("showing_availability"), // When property can be shown
  tenantInfo: text("tenant_info"), // Lease details if tenant-occupied
  
  // === TITLE & ESCROW ===
  titleCompany: varchar("title_company", { length: 255 }),
  titleContact: varchar("title_contact", { length: 255 }),
  titlePhone: varchar("title_phone", { length: 50 }),
  titleIssues: text("title_issues"), // Known title problems
  
  // === DEAL INFO ===
  strategy: varchar("strategy", { length: 50 }).notNull(), // flip, rental, wholetail, etc.
  exitStrategy: varchar("exit_strategy", { length: 50 }), // How end buyer will profit
  description: text("description"),
  highlights: text("highlights").array(),
  images: text("images").array(),
  documents: text("documents").array(), // Contract, disclosures, etc.
  
  // === BUYER REQUIREMENTS ===
  idealBuyerType: varchar("ideal_buyer_type", { length: 100 }), // cash_buyer, hard_money, conventional
  buyerExperienceRequired: varchar("buyer_experience_required", { length: 50 }), // none, beginner, experienced
  proofOfFundsRequired: boolean("proof_of_funds_required").default(true),
  assignmentNotes: text("assignment_notes"), // Special assignment terms
  
  // === PIPELINE STATUS ===
  pipelineStage: varchar("pipeline_stage", { length: 50 }).notNull().default("sourcing"),
  status: varchar("status", { length: 50 }).notNull().default("under_review"),
  dispositionPath: varchar("disposition_path", { length: 50 }), // assignment, double_close, novation
  
  // === MANAGEMENT NOTES ===
  acquisitionsNotes: text("acquisitions_notes"),
  developmentNotes: text("development_notes"),
  internalNotes: text("internal_notes"), // Staff-only notes
  
  // === MATCH SCORING ===
  riskLevel: varchar("risk_level", { length: 20 }), // low, medium, high
  profitPotential: integer("profit_potential"), // 1-5 rating
  marketDemand: integer("market_demand"), // 1-5 rating
  neighborhoodGrade: varchar("neighborhood_grade", { length: 10 }), // A, B, C, D
  matchScore: integer("match_score"), // 0-100 overall score
  dealScore: integer("deal_score"), // Calculated deal quality score
  
  // === MARKETING ===
  isFeatured: boolean("is_featured").default(false),
  isHot: boolean("is_hot").default(false),
  viewCount: integer("view_count").default(0),
  inquiryCount: integer("inquiry_count").default(0),
  marketingStartDate: timestamp("marketing_start_date"),
  daysOnMarket: integer("days_on_market").default(0),
  
  // === TIMESTAMPS ===
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

// =====================================================
// LISTINGS - Ready-to-move-in properties (dealType: LISTING)
// =====================================================
// Properties that are ready for retail buyers or investors
// Uses ListingInquiryModal for inquiries and showing scheduling

export const listings = pgTable("listings", {
  id: serial("id").primaryKey(),
  submittedBy: varchar("submitted_by", { length: 255 }), // User ID of listing agent/owner
  
  // === PROPERTY DETAILS ===
  propertyAddress: text("property_address").notNull(),
  city: varchar("city", { length: 100 }).notNull(),
  state: varchar("state", { length: 50 }).notNull(),
  zipCode: varchar("zip_code", { length: 20 }).notNull(),
  county: varchar("county", { length: 100 }),
  propertyType: varchar("property_type", { length: 50 }).notNull(), // single_family, multi_family, condo, townhouse, commercial
  bedrooms: integer("bedrooms"),
  bathrooms: varchar("bathrooms", { length: 10 }),
  sqft: integer("sqft"),
  yearBuilt: integer("year_built"),
  lotSize: varchar("lot_size", { length: 50 }),
  
  // === LISTING DETAILS ===
  listingType: varchar("listing_type", { length: 50 }).notNull().default("on_market"), // on_market, off_market
  listPrice: integer("list_price").notNull(),
  pricePerSqft: integer("price_per_sqft"),
  
  // === PROPERTY CONDITION ===
  condition: varchar("condition", { length: 50 }), // move_in_ready, needs_minor_updates, needs_renovation
  renovationYear: integer("renovation_year"), // Year of last major renovation
  amenities: text("amenities").array(), // pool, garage, fireplace, etc.
  hoa: integer("hoa"), // Monthly HOA fee
  
  // === DESCRIPTION ===
  description: text("description"),
  highlights: text("highlights").array(),
  images: text("images").array(),
  virtualTourUrl: varchar("virtual_tour_url", { length: 500 }),
  
  // === SHOWING INFORMATION ===
  showingInstructions: text("showing_instructions"),
  lockboxCode: varchar("lockbox_code", { length: 50 }),
  occupancyStatus: varchar("occupancy_status", { length: 50 }), // vacant, owner_occupied, tenant_occupied
  availableDate: timestamp("available_date"),
  
  // === CONTACT INFO ===
  agentName: varchar("agent_name", { length: 255 }),
  agentPhone: varchar("agent_phone", { length: 50 }),
  agentEmail: varchar("agent_email", { length: 255 }),
  
  // === STATUS ===
  status: varchar("status", { length: 50 }).notNull().default("active"), // active, pending, sold, off_market, expired
  daysOnMarket: integer("days_on_market").default(0),
  viewCount: integer("view_count").default(0),
  inquiryCount: integer("inquiry_count").default(0),
  isFeatured: boolean("is_featured").default(false),
  
  // === TIMESTAMPS ===
  listedAt: timestamp("listed_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertListingSchema = createInsertSchema(listings).omit({ id: true, createdAt: true, updatedAt: true, status: true });
export type InsertListing = z.infer<typeof insertListingSchema>;
export type Listing = typeof listings.$inferSelect;

// Listing Inquiries - inquiries and showing requests for listings
export const listingInquiries = pgTable("listing_inquiries", {
  id: serial("id").primaryKey(),
  listingId: integer("listing_id").notNull(),
  userId: varchar("user_id", { length: 255 }), // Optional - can be guest inquiries
  
  // === CONTACT INFO ===
  fullName: varchar("full_name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 50 }),
  
  // === INQUIRY DETAILS ===
  interestType: varchar("interest_type", { length: 50 }).notNull(), // request_info, schedule_showing, ask_about_offer, ask_about_financing
  preferredShowingDates: text("preferred_showing_dates").array(), // Array of preferred date/time strings
  preApproved: boolean("pre_approved").default(false),
  message: text("message"),
  
  // === STATUS ===
  status: varchar("status", { length: 50 }).notNull().default("pending"), // pending, contacted, scheduled, completed, cancelled
  assignedTo: varchar("assigned_to", { length: 255 }), // Agent handling the inquiry
  notes: text("notes"), // Internal notes
  
  // === TIMESTAMPS ===
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertListingInquirySchema = createInsertSchema(listingInquiries).omit({ id: true, createdAt: true, updatedAt: true, status: true });
export type InsertListingInquiry = z.infer<typeof insertListingInquirySchema>;
export type ListingInquiry = typeof listingInquiries.$inferSelect;

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

// Community Posts/Threads - Social media style with rich content
export const communityPosts = pgTable("community_posts", {
  id: serial("id").primaryKey(),
  categoryId: integer("category_id").notNull(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  title: varchar("title", { length: 255 }),
  content: text("content").notNull(),
  // Social media style fields
  postType: varchar("post_type", { length: 50 }).default("text"), // text, image, project, deal, poll
  images: text("images").array(), // Array of image URLs
  linkedProjectId: integer("linked_project_id"), // Link to capital project for showcasing
  linkedDealId: integer("linked_deal_id"), // Link to wholesale deal
  tags: text("tags").array(), // Hashtags for discovery
  mentions: text("mentions").array(), // User mentions
  // Engagement metrics
  likeCount: integer("like_count").default(0),
  shareCount: integer("share_count").default(0),
  bookmarkCount: integer("bookmark_count").default(0),
  // Original fields
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
  likeCount: true,
  shareCount: true,
  bookmarkCount: true,
  lastReplyAt: true,
  lastReplyBy: true
});
export type InsertCommunityPost = z.infer<typeof insertCommunityPostSchema>;
export type CommunityPost = typeof communityPosts.$inferSelect;

// Post Likes - Track who liked what
export const postLikes = pgTable("post_likes", {
  id: serial("id").primaryKey(),
  postId: integer("post_id").notNull(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertPostLikeSchema = createInsertSchema(postLikes).omit({ id: true, createdAt: true });
export type InsertPostLike = z.infer<typeof insertPostLikeSchema>;
export type PostLike = typeof postLikes.$inferSelect;

// Post Bookmarks - Track saved posts
export const postBookmarks = pgTable("post_bookmarks", {
  id: serial("id").primaryKey(),
  postId: integer("post_id").notNull(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertPostBookmarkSchema = createInsertSchema(postBookmarks).omit({ id: true, createdAt: true });
export type InsertPostBookmark = z.infer<typeof insertPostBookmarkSchema>;
export type PostBookmark = typeof postBookmarks.$inferSelect;

// Deal Bookmarks - Track saved capital projects and wholesale deals
export const dealBookmarks = pgTable("deal_bookmarks", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  dealType: varchar("deal_type", { length: 50 }).notNull(), // 'capital_project' or 'wholesale_deal'
  dealId: integer("deal_id").notNull(),
  action: varchar("action", { length: 20 }).default("save"), // 'like', 'pass', 'save'
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertDealBookmarkSchema = createInsertSchema(dealBookmarks).omit({ id: true, createdAt: true });
export type InsertDealBookmark = z.infer<typeof insertDealBookmarkSchema>;
export type DealBookmark = typeof dealBookmarks.$inferSelect;

// Deal Documents - file attachments for deals
export const dealDocuments = pgTable("deal_documents", {
  id: serial("id").primaryKey(),
  dealId: integer("deal_id").notNull(),
  dealType: varchar("deal_type", { length: 50 }).notNull(), // 'wholesale', 'capital', 'listing'
  userId: varchar("user_id", { length: 255 }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  fileType: varchar("file_type", { length: 100 }).notNull(),
  fileSize: integer("file_size").notNull(),
  objectPath: text("object_path").notNull(),
  category: varchar("category", { length: 50 }).notNull().default("other"), // inspection, title, contract, financial, photos, other
  uploadedAt: timestamp("uploaded_at").defaultNow().notNull(),
});

export const insertDealDocumentSchema = createInsertSchema(dealDocuments).omit({ id: true, uploadedAt: true });
export type InsertDealDocument = z.infer<typeof insertDealDocumentSchema>;
export type DealDocument = typeof dealDocuments.$inferSelect;

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
  // Operator Asking Terms - Debt Structure
  askingInterestRate: varchar("asking_interest_rate", { length: 20 }), // e.g., "10%", "12% annual"
  askingLoanDuration: varchar("asking_loan_duration", { length: 50 }), // e.g., "12 months", "18 months"
  askingPoints: varchar("asking_points", { length: 20 }), // e.g., "2 points", "1.5%"
  // Operator Asking Terms - Equity Structure
  askingEquityPercent: integer("asking_equity_percent"), // e.g., 20 for 20% to investor
  askingProfitSplit: varchar("asking_profit_split", { length: 50 }), // e.g., "70/30" (investor/operator)
  askingPreferredReturn: varchar("asking_preferred_return", { length: 20 }), // e.g., "8% pref"
  // Hybrid Terms
  askingDebtPortion: integer("asking_debt_portion"), // percentage of funding as debt
  askingEquityPortion: integer("asking_equity_portion"), // percentage of funding as equity
  // Capital Stack Breakdown - for transparency
  purchasePrice: integer("purchase_price"), // Property purchase price
  rehabBudget: integer("rehab_budget"), // Renovation/construction budget
  softCosts: integer("soft_costs"), // Closing costs, permits, fees, etc.
  operatorEquity: integer("operator_equity"), // Operator's own capital contribution
  contingency: integer("contingency"), // Buffer for unexpected costs
  seniorLoan: integer("senior_loan"), // Senior debt amount (bank/hard money loan)
  projectedARV: integer("projected_arv"), // After Repair Value for equity/flip projects
  projectedProfit: integer("projected_profit"), // Expected gross profit (base case)
  projectedProfitLow: integer("projected_profit_low"), // Low scenario profit estimate
  projectedProfitHigh: integer("projected_profit_high"), // High scenario profit estimate
  // Status: DRAFT, OPEN_FOR_INVESTMENT, FUNDED, IN_PROGRESS, COMPLETED
  status: varchar("status", { length: 50 }).notNull().default("DRAFT"),
  // Timeline - detailed phases
  startDate: timestamp("start_date"),
  estimatedCompletion: timestamp("estimated_completion"),
  acquisitionDate: timestamp("acquisition_date"), // Property purchase date
  constructionStart: timestamp("construction_start"),
  constructionEnd: timestamp("construction_end"),
  stabilizationDate: timestamp("stabilization_date"), // For rentals
  exitDate: timestamp("exit_date"), // Target sale/refinance date
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
  structureType: varchar("structure_type", { length: 50 }), // equity, debt, hybrid
  proposedEquityPercent: varchar("proposed_equity_percent", { length: 20 }),
  proposedProfitSplit: varchar("proposed_profit_split", { length: 50 }),
  proposedInterestRate: varchar("proposed_interest_rate", { length: 20 }),
  proposedLoanDuration: varchar("proposed_loan_duration", { length: 50 }),
  holdPeriod: varchar("hold_period", { length: 50 }),
  isAcceptingOperatorTerms: boolean("is_accepting_operator_terms").default(false),
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
  structureType: varchar("structure_type", { length: 50 }), // equity, debt, hybrid
  equityPercent: varchar("equity_percent", { length: 20 }),
  interestRate: varchar("interest_rate", { length: 20 }),
  loanDuration: varchar("loan_duration", { length: 50 }),
  profitSplit: varchar("profit_split", { length: 50 }),
  notes: text("notes"),
  // Term Sheet PDF
  termSheetUrl: text("term_sheet_url"), // Generated PDF term sheet URL
  termSheetGeneratedAt: timestamp("term_sheet_generated_at"),
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

// Investor Wanted Deals - investors posting what they're looking for
export const investorWantedDeals = pgTable("investor_wanted_deals", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  // Investment criteria
  propertyTypes: text("property_types").array(), // single-family, multi-family, commercial, industrial
  strategies: text("strategies").array(), // fix-flip, buy-hold, BRRRR, development
  locations: text("locations").array(), // target markets
  // Budget
  minBudget: integer("min_budget"),
  maxBudget: integer("max_budget"),
  // Returns
  targetReturnMin: integer("target_return_min"), // percentage
  targetReturnMax: integer("target_return_max"),
  targetIRR: varchar("target_irr", { length: 50 }),
  // Deal structure preferences
  preferredStructure: varchar("preferred_structure", { length: 50 }), // equity, debt, hybrid
  maxEquityPercent: integer("max_equity_percent"),
  maxInterestRate: varchar("max_interest_rate", { length: 20 }),
  // Capacity
  activelyLooking: boolean("actively_looking").default(true),
  availableCapital: integer("available_capital"),
  dealsWanted: integer("deals_wanted"), // how many deals they want to fund
  // Timeline
  urgency: varchar("urgency", { length: 50 }), // immediate, this_month, this_quarter
  holdPeriodPreference: varchar("hold_period_preference", { length: 50 }),
  // Status
  isPublic: boolean("is_public").default(true),
  isFeatured: boolean("is_featured").default(false),
  viewCount: integer("view_count").default(0),
  responseCount: integer("response_count").default(0),
  // Timestamps
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertInvestorWantedDealSchema = createInsertSchema(investorWantedDeals).omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true,
  viewCount: true,
  responseCount: true
});
export type InsertInvestorWantedDeal = z.infer<typeof insertInvestorWantedDealSchema>;
export type InvestorWantedDeal = typeof investorWantedDeals.$inferSelect;

// User Reviews - ratings and reviews between users
export const userReviews = pgTable("user_reviews", {
  id: serial("id").primaryKey(),
  reviewerId: varchar("reviewer_id", { length: 255 }).notNull(),
  revieweeId: varchar("reviewee_id", { length: 255 }).notNull(),
  // Transaction context
  dealType: varchar("deal_type", { length: 50 }), // capital_project, wholesale_deal
  dealId: integer("deal_id"),
  transactionRole: varchar("transaction_role", { length: 50 }), // investor, wholesaler, dreamscaper
  // Ratings (1-5 stars)
  overallRating: integer("overall_rating").notNull(),
  communicationRating: integer("communication_rating"),
  reliabilityRating: integer("reliability_rating"),
  professionalismRating: integer("professionalism_rating"),
  // Review content
  title: varchar("title", { length: 255 }),
  content: text("content"),
  // Response from reviewee
  response: text("response"),
  responseAt: timestamp("response_at"),
  // Status
  isPublic: boolean("is_public").default(true),
  isVerified: boolean("is_verified").default(false), // verified transaction
  // Timestamps
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertUserReviewSchema = createInsertSchema(userReviews).omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true,
  response: true,
  responseAt: true,
  isVerified: true
});
export type InsertUserReview = z.infer<typeof insertUserReviewSchema>;
export type UserReview = typeof userReviews.$inferSelect;

// User Stats - aggregated statistics for user profiles
export const userStats = pgTable("user_stats", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id", { length: 255 }).notNull().unique(),
  // Deal statistics
  totalDealsCompleted: integer("total_deals_completed").default(0),
  totalDealsValue: integer("total_deals_value").default(0),
  totalInvested: integer("total_invested").default(0),
  totalReturns: integer("total_returns").default(0),
  avgReturnRate: varchar("avg_return_rate", { length: 20 }),
  // Ratings
  avgOverallRating: varchar("avg_overall_rating", { length: 10 }),
  totalReviews: integer("total_reviews").default(0),
  // Activity
  dealsListed: integer("deals_listed").default(0),
  projectsFunded: integer("projects_funded").default(0),
  communityPosts: integer("community_posts").default(0),
  responseRate: varchar("response_rate", { length: 10 }),
  avgResponseTime: varchar("avg_response_time", { length: 50 }),
  // Badges/Achievements
  badges: text("badges").array(),
  verificationLevel: varchar("verification_level", { length: 50 }).default("basic"), // basic, verified, premium
  // Member since
  memberSince: timestamp("member_since"),
  lastActiveAt: timestamp("last_active_at"),
  // Timestamps
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type UserStats = typeof userStats.$inferSelect;

// Deal Negotiations - detailed negotiation history for deals
export const dealNegotiations = pgTable("deal_negotiations", {
  id: serial("id").primaryKey(),
  // Deal reference
  dealType: varchar("deal_type", { length: 50 }).notNull(), // capital_project, wholesale_deal
  dealId: integer("deal_id").notNull(),
  offerId: integer("offer_id"), // reference to investment_offers if applicable
  // Participants
  initiatorId: varchar("initiator_id", { length: 255 }).notNull(),
  responderId: varchar("responder_id", { length: 255 }).notNull(),
  // Structure type
  structureType: varchar("structure_type", { length: 50 }).notNull(), // debt, equity, hybrid
  // Current terms (for debt deals)
  proposedInterestRate: varchar("proposed_interest_rate", { length: 20 }),
  proposedLoanTerm: varchar("proposed_loan_term", { length: 50 }),
  proposedLTV: integer("proposed_ltv"), // loan to value percentage
  proposedPoints: varchar("proposed_points", { length: 20 }),
  // Current terms (for equity deals)
  proposedEquityPercent: integer("proposed_equity_percent"),
  proposedPreferredReturn: varchar("proposed_preferred_return", { length: 20 }),
  proposedProfitSplit: varchar("proposed_profit_split", { length: 50 }), // e.g., "70/30"
  proposedVestingSchedule: varchar("proposed_vesting_schedule", { length: 255 }),
  // General terms
  proposedAmount: integer("proposed_amount"),
  proposedHoldPeriod: varchar("proposed_hold_period", { length: 50 }),
  exitStrategy: varchar("exit_strategy", { length: 100 }),
  notes: text("notes"),
  // Counter offer fields
  isCounterOffer: boolean("is_counter_offer").default(false),
  parentNegotiationId: integer("parent_negotiation_id"),
  // Status: pending, accepted, rejected, countered, expired
  status: varchar("status", { length: 50 }).notNull().default("pending"),
  expiresAt: timestamp("expires_at"),
  respondedAt: timestamp("responded_at"),
  // Timestamps
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertDealNegotiationSchema = createInsertSchema(dealNegotiations).omit({ 
  id: true, 
  createdAt: true,
  respondedAt: true,
  status: true
});
export type InsertDealNegotiation = z.infer<typeof insertDealNegotiationSchema>;
export type DealNegotiation = typeof dealNegotiations.$inferSelect;

// Wholesale Deal Documents - files and images for wholesale deals
export const wholesaleDealDocuments = pgTable("wholesale_deal_documents", {
  id: serial("id").primaryKey(),
  dealId: integer("deal_id").notNull(),
  // Document info
  fileName: varchar("file_name", { length: 255 }).notNull(),
  fileUrl: text("file_url").notNull(),
  fileType: varchar("file_type", { length: 50 }).notNull(), // image, pdf, spreadsheet, contract
  fileSize: integer("file_size"),
  // Category
  category: varchar("category", { length: 100 }), // property_photos, before_photos, inspection, title, contract, comps
  description: text("description"),
  // Access control
  isPublic: boolean("is_public").default(true),
  accessLevel: varchar("access_level", { length: 50 }).default("all"), // all, verified, approved_buyers
  // Timestamps
  uploadedBy: varchar("uploaded_by", { length: 255 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertWholesaleDealDocumentSchema = createInsertSchema(wholesaleDealDocuments).omit({ 
  id: true, 
  createdAt: true
});
export type InsertWholesaleDealDocument = z.infer<typeof insertWholesaleDealDocumentSchema>;
export type WholesaleDealDocument = typeof wholesaleDealDocuments.$inferSelect;

// Deal Analyzer Results - saved calculator results for deals
export const dealAnalyzerResults = pgTable("deal_analyzer_results", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  dealType: varchar("deal_type", { length: 50 }), // wholesale_deal, capital_project, custom
  dealId: integer("deal_id"),
  name: varchar("name", { length: 255 }),
  // Input values
  purchasePrice: integer("purchase_price"),
  arv: integer("arv"),
  repairCost: integer("repair_cost"),
  holdingCosts: integer("holding_costs"),
  closingCosts: integer("closing_costs"),
  sellingCosts: integer("selling_costs"),
  assignmentFee: integer("assignment_fee"),
  // Loan info
  loanAmount: integer("loan_amount"),
  interestRate: varchar("interest_rate", { length: 20 }),
  loanTerm: integer("loan_term"),
  points: varchar("points", { length: 20 }),
  // Calculated results
  totalInvestment: integer("total_investment"),
  potentialProfit: integer("potential_profit"),
  roi: varchar("roi", { length: 20 }),
  cashOnCash: varchar("cash_on_cash", { length: 20 }),
  capRate: varchar("cap_rate", { length: 20 }),
  mao: integer("mao"), // max allowable offer
  // Analysis type
  analysisType: varchar("analysis_type", { length: 50 }).default("flip"), // flip, rental, brrrr, wholesale
  // Full calculation data
  calculationData: jsonb("calculation_data"),
  // Timestamps
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertDealAnalyzerResultSchema = createInsertSchema(dealAnalyzerResults).omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true
});
export type InsertDealAnalyzerResult = z.infer<typeof insertDealAnalyzerResultSchema>;
export type DealAnalyzerResult = typeof dealAnalyzerResults.$inferSelect;

// Deal Messages - chat messages for deals/projects
export const dealMessages = pgTable("deal_messages", {
  id: serial("id").primaryKey(),
  dealType: varchar("deal_type", { length: 50 }).notNull(), // capital_project, wholesale_deal
  dealId: integer("deal_id").notNull(),
  senderId: varchar("sender_id", { length: 255 }).notNull(),
  senderName: varchar("sender_name", { length: 255 }),
  senderAvatar: varchar("sender_avatar"),
  message: text("message").notNull(),
  // Message type
  messageType: varchar("message_type", { length: 50 }).default("text"), // text, offer, counter_offer, system
  // Metadata for offer-related messages
  relatedOfferId: integer("related_offer_id"),
  // Read status
  isRead: boolean("is_read").default(false),
  readAt: timestamp("read_at"),
  // Timestamps
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertDealMessageSchema = createInsertSchema(dealMessages).omit({ 
  id: true, 
  createdAt: true,
  isRead: true,
  readAt: true
});
export type InsertDealMessage = z.infer<typeof insertDealMessageSchema>;
export type DealMessage = typeof dealMessages.$inferSelect;

// ============================================
// UNIFIED LEADS PIPELINE
// ============================================

// Lead Types for unified pipeline
export const LEAD_TYPES = [
  "seller",        // Property sellers
  "investor",      // Investment inquiries
  "buyer",         // Property buyers
  "contact",       // General contact forms
  "dreamscaper",   // Dreamscaper/Operator applications
  "wholesaler",    // Wholesaler applications
] as const;
export type LeadType = typeof LEAD_TYPES[number];

// Lead Sources - where the lead came from
export const LEAD_SOURCES = [
  "sell_page",        // /sell form
  "invest_page",      // /invest form
  "buy_page",         // /buy form
  "contact_page",     // /contact form
  "apply_dreamscaper", // Dreamscaper application
  "apply_wholesaler", // Wholesaler application
  "deal_inquiry",     // From a specific deal
  "referral",         // Referred by another user
  "manual",           // Staff-entered lead
] as const;
export type LeadSource = typeof LEAD_SOURCES[number];

// Lead Pipeline Stages
export const LEAD_STAGES = [
  "new",           // Just submitted
  "contacted",     // First contact made
  "qualified",     // Lead is qualified
  "nurturing",     // In nurturing sequence
  "negotiating",   // Active negotiation
  "converted",     // Became a user/deal
  "lost",          // Lead lost/closed
  "archived",      // Archived for reference
] as const;
export type LeadStage = typeof LEAD_STAGES[number];

// Unified Leads - single table for all lead types
export const leads = pgTable("leads", {
  id: serial("id").primaryKey(),
  
  // === CORE LEAD INFO ===
  leadType: varchar("lead_type", { length: 50 }).notNull(), // seller, investor, buyer, contact, dreamscaper, wholesaler
  source: varchar("source", { length: 50 }).notNull(), // where lead came from
  stage: varchar("stage", { length: 50 }).notNull().default("new"),
  
  // === CONTACT INFO ===
  firstName: varchar("first_name", { length: 255 }).notNull(),
  lastName: varchar("last_name", { length: 255 }),
  email: varchar("email", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 50 }),
  company: varchar("company", { length: 255 }),
  
  // === LOCATION ===
  address: text("address"),
  city: varchar("city", { length: 100 }),
  state: varchar("state", { length: 50 }),
  zipCode: varchar("zip_code", { length: 20 }),
  
  // === TYPE-SPECIFIC FIELDS (JSON) ===
  // Seller fields: propertyType, condition, timeline, motivation
  // Investor fields: capitalRange, investmentPreference, experienceLevel, accredited
  // Buyer fields: buyerType, budgetRange, propertyTypes, fundingStatus
  // Contact fields: subject, message
  // Dreamscaper fields: bio, experience, portfolio, strategy
  leadData: jsonb("lead_data"), // Flexible storage for type-specific fields
  
  // === DEAL REFERENCE ===
  relatedDealType: varchar("related_deal_type", { length: 50 }), // wholesale_deal, capital_project, retail_listing
  relatedDealId: integer("related_deal_id"),
  
  // === SCORING & PRIORITY ===
  priority: varchar("priority", { length: 20 }).default("medium"), // low, medium, high, urgent
  score: integer("score"), // 0-100 lead quality score
  motivationLevel: integer("motivation_level"), // 1-10 for sellers
  
  // === ASSIGNMENT ===
  assignedTo: varchar("assigned_to", { length: 255 }), // Staff user ID
  assignedAt: timestamp("assigned_at"),
  
  // === TRACKING ===
  lastContactAt: timestamp("last_contact_at"),
  nextFollowUpAt: timestamp("next_follow_up_at"),
  contactAttempts: integer("contact_attempts").default(0),
  
  // === CONVERSION ===
  convertedToUserId: varchar("converted_to_user_id", { length: 255 }), // If converted to registered user
  convertedToDealId: integer("converted_to_deal_id"),
  conversionDate: timestamp("conversion_date"),
  
  // === NOTES ===
  notes: text("notes"),
  internalNotes: text("internal_notes"), // Staff only
  
  // === UTM/ATTRIBUTION ===
  utmSource: varchar("utm_source", { length: 100 }),
  utmMedium: varchar("utm_medium", { length: 100 }),
  utmCampaign: varchar("utm_campaign", { length: 100 }),
  referredBy: varchar("referred_by", { length: 255 }), // User ID if referral
  
  // === TIMESTAMPS ===
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertLeadSchema = createInsertSchema(leads).omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true,
  stage: true,
  assignedAt: true,
  contactAttempts: true,
  conversionDate: true
});
export type InsertLead = z.infer<typeof insertLeadSchema>;
export type Lead = typeof leads.$inferSelect;

// ============================================
// PEGGY AI CONVERSATIONS
// ============================================

// Peggy Chat Conversations
export const peggyConversations = pgTable("peggy_conversations", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id", { length: 255 }), // null for anonymous users
  sessionId: varchar("session_id", { length: 255 }).notNull(), // Browser session for anonymous
  
  // === CONTEXT ===
  // What page/context the conversation started in
  contextType: varchar("context_type", { length: 50 }), // calculator, deal, page, general
  contextPage: varchar("context_page", { length: 255 }), // URL path
  contextDealType: varchar("context_deal_type", { length: 50 }),
  contextDealId: integer("context_deal_id"),
  contextCalculator: varchar("context_calculator", { length: 50 }), // arv, roi, brrrr, cashflow, mao
  
  // === METADATA ===
  title: varchar("title", { length: 255 }), // Auto-generated or user-set title
  messageCount: integer("message_count").default(0),
  lastMessageAt: timestamp("last_message_at"),
  
  // === STATUS ===
  isActive: boolean("is_active").default(true),
  isPinned: boolean("is_pinned").default(false),
  
  // === TIMESTAMPS ===
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertPeggyConversationSchema = createInsertSchema(peggyConversations).omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true,
  messageCount: true,
  lastMessageAt: true
});
export type InsertPeggyConversation = z.infer<typeof insertPeggyConversationSchema>;
export type PeggyConversation = typeof peggyConversations.$inferSelect;

// Peggy Chat Messages
export const peggyMessages = pgTable("peggy_messages", {
  id: serial("id").primaryKey(),
  conversationId: integer("conversation_id").notNull(),
  
  // === MESSAGE ===
  role: varchar("role", { length: 20 }).notNull(), // user, assistant, system
  content: text("content").notNull(),
  
  // === CONTEXT AT TIME OF MESSAGE ===
  contextSnapshot: jsonb("context_snapshot"), // Snapshot of context when message sent
  
  // === AI METADATA ===
  model: varchar("model", { length: 100 }), // gpt-4, gpt-3.5-turbo, etc.
  tokensUsed: integer("tokens_used"),
  
  // === FEEDBACK ===
  feedback: varchar("feedback", { length: 20 }), // helpful, not_helpful
  feedbackNotes: text("feedback_notes"),
  
  // === TIMESTAMPS ===
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertPeggyMessageSchema = createInsertSchema(peggyMessages).omit({ 
  id: true, 
  createdAt: true,
  tokensUsed: true,
  feedback: true,
  feedbackNotes: true
});
export type InsertPeggyMessage = z.infer<typeof insertPeggyMessageSchema>;
export type PeggyMessage = typeof peggyMessages.$inferSelect;

// ============================================
// ENHANCED SAVED ANALYSES (Calculator Results)
// ============================================

// Calculator Types
export const CALCULATOR_TYPES = [
  "arv",       // After Repair Value
  "roi",       // Return on Investment
  "brrrr",     // Buy, Rehab, Rent, Refinance, Repeat
  "cashflow",  // Cash Flow Analysis
  "mao",       // Maximum Allowable Offer (Wholesale)
] as const;
export type CalculatorType = typeof CALCULATOR_TYPES[number];

// Saved Calculator Analyses - enhanced for all calculator types
export const savedAnalyses = pgTable("saved_analyses", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  
  // === ANALYSIS INFO ===
  name: varchar("name", { length: 255 }).notNull(),
  calculatorType: varchar("calculator_type", { length: 50 }).notNull(), // arv, roi, brrrr, cashflow, mao
  
  // === DEAL REFERENCE ===
  dealType: varchar("deal_type", { length: 50 }), // wholesale_deal, capital_project, retail_listing, custom
  dealId: integer("deal_id"),
  propertyAddress: text("property_address"),
  
  // === INPUT VALUES (stored as JSON for flexibility) ===
  inputs: jsonb("inputs").notNull(), // All calculator inputs
  
  // === CALCULATED RESULTS (stored as JSON for flexibility) ===
  results: jsonb("results").notNull(), // All calculated outputs
  
  // === KEY METRICS (denormalized for quick display/filtering) ===
  // These are extracted from results for easy access
  primaryMetric: varchar("primary_metric", { length: 50 }), // Main result label (e.g., "ROI", "MAO", "Cash Flow")
  primaryValue: varchar("primary_value", { length: 100 }), // Main result value
  secondaryMetric: varchar("secondary_metric", { length: 50 }),
  secondaryValue: varchar("secondary_value", { length: 100 }),
  dealGrade: varchar("deal_grade", { length: 10 }), // A, B, C, D, F
  
  // === COMPARISON ===
  isScenario: boolean("is_scenario").default(false), // Part of a comparison set
  scenarioGroupId: integer("scenario_group_id"), // Links related scenarios
  scenarioLabel: varchar("scenario_label", { length: 100 }), // "Conservative", "Optimistic", etc.
  
  // === SHARING ===
  isShared: boolean("is_shared").default(false),
  shareToken: varchar("share_token", { length: 100 }),
  sharedAt: timestamp("shared_at"),
  viewCount: integer("view_count").default(0),
  
  // === PDF EXPORT ===
  pdfUrl: text("pdf_url"),
  pdfGeneratedAt: timestamp("pdf_generated_at"),
  
  // === NOTES ===
  notes: text("notes"),
  
  // === TIMESTAMPS ===
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertSavedAnalysisSchema = createInsertSchema(savedAnalyses).omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true,
  shareToken: true,
  sharedAt: true,
  viewCount: true,
  pdfUrl: true,
  pdfGeneratedAt: true
});
export type InsertSavedAnalysis = z.infer<typeof insertSavedAnalysisSchema>;
export type SavedAnalysis = typeof savedAnalyses.$inferSelect;

// ============================================
// WHOLESALE NEGOTIATION ENHANCEMENTS
// ============================================

// Wholesale Deal Offers - separate from capital project offers
export const wholesaleDealOffers = pgTable("wholesale_deal_offers", {
  id: serial("id").primaryKey(),
  dealId: integer("deal_id").notNull(),
  buyerId: varchar("buyer_id", { length: 255 }).notNull(),
  
  // === OFFER DETAILS ===
  offerAmount: integer("offer_amount").notNull(),
  fundingType: varchar("funding_type", { length: 50 }).notNull(), // cash, hard_money, conventional
  closingTimeline: varchar("closing_timeline", { length: 50 }),
  earnestMoney: integer("earnest_money"),
  proofOfFunds: boolean("proof_of_funds").default(false),
  
  // === CONTINGENCIES ===
  inspectionContingency: boolean("inspection_contingency").default(true),
  financingContingency: boolean("financing_contingency").default(false),
  appraisalContingency: boolean("appraisal_contingency").default(false),
  contingencyNotes: text("contingency_notes"),
  
  // === BUYER DETAILS ===
  buyerExperience: varchar("buyer_experience", { length: 50 }),
  intendedStrategy: varchar("intended_strategy", { length: 50 }), // flip, rental, wholetail
  notes: text("notes"),
  
  // === STATUS ===
  status: varchar("status", { length: 50 }).notNull().default("pending"), // pending, countered, accepted, rejected, expired, withdrawn
  
  // === COUNTER OFFER ===
  counterAmount: integer("counter_amount"),
  counterNotes: text("counter_notes"),
  counteredAt: timestamp("countered_at"),
  
  // === NEGOTIATION HISTORY ===
  negotiationHistory: jsonb("negotiation_history").default([]),
  
  // === EXPIRATION ===
  expiresAt: timestamp("expires_at"),
  
  // === TIMESTAMPS ===
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertWholesaleDealOfferSchema = createInsertSchema(wholesaleDealOffers).omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true,
  status: true,
  counterAmount: true,
  counterNotes: true,
  counteredAt: true,
  negotiationHistory: true
});
export type InsertWholesaleDealOffer = z.infer<typeof insertWholesaleDealOfferSchema>;
export type WholesaleDealOffer = typeof wholesaleDealOffers.$inferSelect;

// ============================================
// USER BADGES & REPUTATION SYSTEM
// ============================================

// User Badges - verification and achievement badges
export const userBadges = pgTable("user_badges", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  badgeType: varchar("badge_type", { length: 100 }).notNull(), // pegasus_wholesaler, pegasus_dreamscaper, verified_investor, trusted_buyer, etc.
  label: varchar("label", { length: 255 }).notNull(),
  description: text("description"),
  icon: varchar("icon", { length: 100 }),
  color: varchar("color", { length: 50 }),
  isActive: boolean("is_active").default(true),
  awardedBy: varchar("awarded_by", { length: 255 }), // Admin who awarded
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserBadgeSchema = createInsertSchema(userBadges).omit({ 
  id: true, 
  createdAt: true 
});
export type InsertUserBadge = z.infer<typeof insertUserBadgeSchema>;
export type UserBadge = typeof userBadges.$inferSelect;

// User Reputation - trust scores and metrics
export const userReputation = pgTable("user_reputation", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id", { length: 255 }).notNull().unique(),
  trustScore: integer("trust_score").default(50), // 0-100 scale
  rating: varchar("rating", { length: 10 }).default("0"), // 1-5 average rating
  dealsClosedCount: integer("deals_closed_count").default(0),
  onTimeClosingsCount: integer("on_time_closings_count").default(0),
  cancellationsCount: integer("cancellations_count").default(0),
  totalVolumeTransacted: integer("total_volume_transacted").default(0),
  responseRate: integer("response_rate").default(100), // percentage
  avgResponseTimeHours: integer("avg_response_time_hours"),
  lastUpdatedAt: timestamp("last_updated_at").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserReputationSchema = createInsertSchema(userReputation).omit({ 
  id: true, 
  createdAt: true,
  lastUpdatedAt: true
});
export type InsertUserReputation = z.infer<typeof insertUserReputationSchema>;
export type UserReputation = typeof userReputation.$inferSelect;

// User Rank History - tracking rank tier changes over time
export const RANK_TIERS = ["bronze", "silver", "gold", "pegasus"] as const;
export type RankTier = typeof RANK_TIERS[number];

export const userRankHistory = pgTable("user_rank_history", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  previousRank: varchar("previous_rank", { length: 50 }),
  newRank: varchar("new_rank", { length: 50 }).notNull(), // bronze, silver, gold, pegasus
  reason: text("reason"), // Why rank changed
  triggeredBy: varchar("triggered_by", { length: 255 }), // system, admin, deal_completion
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserRankHistorySchema = createInsertSchema(userRankHistory).omit({ 
  id: true, 
  createdAt: true 
});
export type InsertUserRankHistory = z.infer<typeof insertUserRankHistorySchema>;
export type UserRankHistory = typeof userRankHistory.$inferSelect;

// ============================================
// JV REQUESTS - Dreamscapers requesting deals from Wholesalers
// ============================================

export const JV_REQUEST_STATUS = ["pending", "approved", "rejected", "negotiating", "under_contract", "completed", "cancelled"] as const;
export type JVRequestStatus = typeof JV_REQUEST_STATUS[number];

export const jvRequests = pgTable("jv_requests", {
  id: serial("id").primaryKey(),
  dealId: integer("deal_id").notNull(), // wholesale_deals.id
  dreamscaperId: varchar("dreamscaper_id", { length: 255 }).notNull(), // User making the request
  wholesalerId: varchar("wholesaler_id", { length: 255 }).notNull(), // Owner of the deal
  
  // === REQUEST DETAILS ===
  message: text("message"), // Initial interest message
  intendedStrategy: varchar("intended_strategy", { length: 100 }), // fix-flip, rental, development
  estimatedBudget: integer("estimated_budget"),
  experienceNotes: text("experience_notes"),
  fundingSource: varchar("funding_source", { length: 100 }), // cash, private_money, hard_money
  
  // === PROPOSED TERMS ===
  proposedAssignmentFee: integer("proposed_assignment_fee"),
  proposedJVSplit: varchar("proposed_jv_split", { length: 50 }), // e.g. "70/30"
  proposedTimeline: varchar("proposed_timeline", { length: 100 }),
  
  // === STATUS ===
  status: varchar("status", { length: 50 }).notNull().default("pending"),
  
  // === RESPONSE FROM WHOLESALER ===
  responseMessage: text("response_message"),
  responseAt: timestamp("response_at"),
  
  // === TIMESTAMPS ===
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertJVRequestSchema = createInsertSchema(jvRequests).omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true,
  status: true,
  responseMessage: true,
  responseAt: true
});
export type InsertJVRequest = z.infer<typeof insertJVRequestSchema>;
export type JVRequest = typeof jvRequests.$inferSelect;

// ============================================
// SHOWING REQUESTS - Buyers requesting property showings
// ============================================

export const SHOWING_REQUEST_STATUS = ["pending", "scheduled", "completed", "cancelled", "no_show"] as const;
export type ShowingRequestStatus = typeof SHOWING_REQUEST_STATUS[number];

export const showingRequests = pgTable("showing_requests", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id", { length: 255 }).notNull(), // Buyer requesting
  propertyType: varchar("property_type", { length: 50 }).notNull(), // retail_listing, wholesale_deal
  propertyId: integer("property_id").notNull(),
  
  // === REQUEST DETAILS ===
  preferredDate1: timestamp("preferred_date_1"),
  preferredDate2: timestamp("preferred_date_2"),
  preferredDate3: timestamp("preferred_date_3"),
  preferredTimeOfDay: varchar("preferred_time_of_day", { length: 50 }), // morning, afternoon, evening
  notes: text("notes"),
  
  // === SCHEDULING ===
  scheduledDate: timestamp("scheduled_date"),
  confirmationSent: boolean("confirmation_sent").default(false),
  reminderSent: boolean("reminder_sent").default(false),
  
  // === STATUS ===
  status: varchar("status", { length: 50 }).notNull().default("pending"),
  
  // === ASSIGNMENT ===
  assignedTo: varchar("assigned_to", { length: 255 }), // Staff member handling
  
  // === FEEDBACK (after showing) ===
  buyerFeedback: text("buyer_feedback"),
  buyerInterestLevel: integer("buyer_interest_level"), // 1-10
  staffNotes: text("staff_notes"),
  
  // === TIMESTAMPS ===
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertShowingRequestSchema = createInsertSchema(showingRequests).omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true,
  status: true,
  confirmationSent: true,
  reminderSent: true,
  scheduledDate: true,
  assignedTo: true,
  buyerFeedback: true,
  buyerInterestLevel: true,
  staffNotes: true
});
export type InsertShowingRequest = z.infer<typeof insertShowingRequestSchema>;
export type ShowingRequest = typeof showingRequests.$inferSelect;

// ============================================
// SAVED ITEMS - Generic saved items for users
// ============================================

export const savedItems = pgTable("saved_items", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  entityType: varchar("entity_type", { length: 50 }).notNull(), // wholesale_deal, capital_project, retail_listing, user
  entityId: integer("entity_id").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertSavedItemSchema = createInsertSchema(savedItems).omit({ 
  id: true, 
  createdAt: true 
});
export type InsertSavedItem = z.infer<typeof insertSavedItemSchema>;
export type SavedItem = typeof savedItems.$inferSelect;

// ============================================
// USER PROFILES - Extended marketplace profile
// ============================================

// User Profiles for marketplace - extends the basic users table
export const userProfiles = pgTable("user_profiles", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id", { length: 255 }).notNull().unique(),
  
  // === BASIC INFO ===
  displayName: varchar("display_name", { length: 255 }),
  companyName: varchar("company_name", { length: 255 }),
  location: varchar("location", { length: 255 }),
  avatarUrl: text("avatar_url"),
  bio: text("bio"),
  
  // === PRIMARY ROLE ===
  primaryRole: varchar("primary_role", { length: 50 }).notNull(), // admin, pegasus_wholesaler, wholesaler, pegasus_dreamscaper, dreamscaper, investor, buyer_retail, buyer_investment
  
  // === PEGASUS STATUS ===
  isPegasusBadged: boolean("is_pegasus_badged").default(false),
  pegasusRoleType: varchar("pegasus_role_type", { length: 100 }), // "Pegasus Wholesaler", "Pegasus Dreamscaper"
  
  // === RANK ===
  currentRank: varchar("current_rank", { length: 50 }).default("bronze"), // bronze, silver, gold, pegasus
  
  // === CONTACT ===
  phone: varchar("phone", { length: 50 }),
  website: varchar("website", { length: 255 }),
  linkedIn: varchar("linkedin", { length: 255 }),
  
  // === VERIFICATION ===
  emailVerified: boolean("email_verified").default(false),
  phoneVerified: boolean("phone_verified").default(false),
  identityVerified: boolean("identity_verified").default(false),
  
  // === TIMESTAMPS ===
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertUserProfileSchema = createInsertSchema(userProfiles).omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true
});
export type InsertUserProfile = z.infer<typeof insertUserProfileSchema>;
export type UserProfile = typeof userProfiles.$inferSelect;

// ============================================
// ADMIN AUDIT LOG - Tracking all admin actions
// ============================================

export const AUDIT_ACTION_TYPES = [
  "user_created",
  "user_updated", 
  "user_deleted",
  "role_assigned",
  "role_removed",
  "deal_approved",
  "deal_rejected",
  "deal_deleted",
  "project_approved",
  "project_rejected",
  "badge_awarded",
  "badge_revoked",
  "setting_changed",
  "announcement_created",
  "announcement_deleted",
  "login",
  "logout",
  "permission_changed",
] as const;

export type AuditActionType = typeof AUDIT_ACTION_TYPES[number];

export const adminAuditLog = pgTable("admin_audit_log", {
  id: serial("id").primaryKey(),
  
  // === ACTOR INFO ===
  adminUserId: varchar("admin_user_id", { length: 255 }).notNull(),
  adminEmail: varchar("admin_email", { length: 255 }),
  adminName: varchar("admin_name", { length: 255 }),
  
  // === ACTION DETAILS ===
  actionType: varchar("action_type", { length: 100 }).notNull(),
  resourceType: varchar("resource_type", { length: 100 }), // user, deal, project, badge, setting
  resourceId: varchar("resource_id", { length: 255 }), // ID of affected resource
  
  // === CHANGE DETAILS ===
  description: text("description").notNull(),
  previousValue: text("previous_value"), // JSON stringified
  newValue: text("new_value"), // JSON stringified
  
  // === METADATA ===
  ipAddress: varchar("ip_address", { length: 45 }),
  userAgent: text("user_agent"),
  
  // === TIMESTAMP ===
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertAdminAuditLogSchema = createInsertSchema(adminAuditLog).omit({ 
  id: true, 
  createdAt: true 
});
export type InsertAdminAuditLog = z.infer<typeof insertAdminAuditLogSchema>;
export type AdminAuditLog = typeof adminAuditLog.$inferSelect;
