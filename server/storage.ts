import { db } from "./db";
import { eq, and, desc, lte, isNotNull, asc, or, inArray } from "drizzle-orm";
import { 
  users, sellerLeads, investorLeads, contacts, projects, articles, leadActivities,
  wholesaleDeals, wholesaleRequests, userRoles, staffProfiles, investorProfiles, 
  wholesalerProfiles, retailListings, buyerInquiries, STAFF_ROLES,
  type User, type UpsertUser,
  type SellerLead, type InsertSellerLead,
  type InvestorLead, type InsertInvestorLead,
  type Contact, type InsertContact,
  type Project, type InsertProject,
  type Article, type InsertArticle,
  type LeadActivity, type InsertLeadActivity,
  type WholesaleDeal, type InsertWholesaleDeal,
  type WholesaleRequest, type InsertWholesaleRequest,
  type UserRole, type InsertUserRole,
  type StaffProfile, type InsertStaffProfile,
  type InvestorProfile, type InsertInvestorProfile,
  type WholesalerProfile, type InsertWholesalerProfile,
  type RetailListing, type InsertRetailListing,
  type BuyerInquiry, type InsertBuyerInquiry
} from "@shared/schema";

export interface QueueItem {
  id: string;
  type: 'follow_up' | 'new_lead';
  priority: 'overdue' | 'today' | 'upcoming' | 'new';
  leadType: 'seller' | 'investor' | 'contact';
  leadId: number;
  leadName: string;
  leadEmail: string;
  description: string;
  dueDate?: Date;
  activityId?: number;
  createdAt: Date;
}

export interface IStorage {
  // Users - Replit Auth
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;

  // Seller Leads
  createSellerLead(lead: InsertSellerLead): Promise<SellerLead>;
  getSellerLeads(): Promise<SellerLead[]>;
  getSellerLead(id: number): Promise<SellerLead | undefined>;
  updateSellerLeadStatus(id: number, status: string): Promise<SellerLead | undefined>;

  // Investor Leads
  createInvestorLead(lead: InsertInvestorLead): Promise<InvestorLead>;
  getInvestorLeads(): Promise<InvestorLead[]>;
  getInvestorLead(id: number): Promise<InvestorLead | undefined>;
  updateInvestorLeadStatus(id: number, status: string): Promise<InvestorLead | undefined>;

  // Contacts
  createContact(contact: InsertContact): Promise<Contact>;
  getContacts(): Promise<Contact[]>;
  getContact(id: number): Promise<Contact | undefined>;
  updateContactStatus(id: number, status: string): Promise<Contact | undefined>;

  // Projects
  createProject(project: InsertProject): Promise<Project>;
  getProjects(): Promise<Project[]>;
  getProjectBySlug(slug: string): Promise<Project | undefined>;
  getProjectById(id: number): Promise<Project | undefined>;

  // Articles
  createArticle(article: InsertArticle): Promise<Article>;
  getArticles(): Promise<Article[]>;
  getPublishedArticles(): Promise<Article[]>;
  getArticleBySlug(slug: string): Promise<Article | undefined>;

  // Lead Activities
  createLeadActivity(activity: InsertLeadActivity): Promise<LeadActivity>;
  getLeadActivities(leadType: string, leadId: number): Promise<LeadActivity[]>;
  markActivityCompleted(activityId: number): Promise<LeadActivity | undefined>;

  // Queue
  getQueueItems(): Promise<QueueItem[]>;

  // Wholesale Deals
  createWholesaleDeal(deal: InsertWholesaleDeal): Promise<WholesaleDeal>;
  getWholesaleDeals(): Promise<WholesaleDeal[]>;
  getAvailableWholesaleDeals(): Promise<WholesaleDeal[]>;
  getWholesaleDeal(id: number): Promise<WholesaleDeal | undefined>;
  updateWholesaleDealStatus(id: number, status: string, notes?: string): Promise<WholesaleDeal | undefined>;
  updateWholesaleDeal(id: number, data: Partial<InsertWholesaleDeal>): Promise<WholesaleDeal | undefined>;

  // Wholesale Requests
  createWholesaleRequest(request: InsertWholesaleRequest): Promise<WholesaleRequest>;
  getWholesaleRequests(): Promise<WholesaleRequest[]>;
  getWholesaleRequestsByDeal(dealId: number): Promise<WholesaleRequest[]>;
  updateWholesaleRequestStatus(id: number, status: string): Promise<WholesaleRequest | undefined>;

  // User Roles
  getUserRoles(userId: string): Promise<UserRole[]>;
  addUserRole(role: InsertUserRole): Promise<UserRole>;
  removeUserRole(userId: string, role: string): Promise<void>;
  hasRole(userId: string, role: string): Promise<boolean>;
  hasAnyStaffRole(userId: string): Promise<boolean>;

  // Staff Profiles
  getStaffProfile(userId: string): Promise<StaffProfile | undefined>;
  upsertStaffProfile(profile: InsertStaffProfile): Promise<StaffProfile>;
  getAllStaffProfiles(): Promise<StaffProfile[]>;

  // Investor Profiles
  getInvestorProfile(userId: string): Promise<InvestorProfile | undefined>;
  upsertInvestorProfile(profile: InsertInvestorProfile): Promise<InvestorProfile>;
  getAllInvestorProfiles(): Promise<InvestorProfile[]>;
  updateInvestorApproval(userId: string, isApproved: boolean): Promise<InvestorProfile | undefined>;

  // Wholesaler Profiles
  getWholesalerProfile(userId: string): Promise<WholesalerProfile | undefined>;
  upsertWholesalerProfile(profile: InsertWholesalerProfile): Promise<WholesalerProfile>;
  getAllWholesalerProfiles(): Promise<WholesalerProfile[]>;
  updateWholesalerApproval(userId: string, isApproved: boolean): Promise<WholesalerProfile | undefined>;

  // Retail Listings
  createRetailListing(listing: InsertRetailListing): Promise<RetailListing>;
  getRetailListings(): Promise<RetailListing[]>;
  getActiveRetailListings(): Promise<RetailListing[]>;
  getRetailListingBySlug(slug: string): Promise<RetailListing | undefined>;
  getRetailListingById(id: number): Promise<RetailListing | undefined>;
  updateRetailListing(id: number, data: Partial<InsertRetailListing>): Promise<RetailListing | undefined>;
  updateRetailListingStatus(id: number, status: string): Promise<RetailListing | undefined>;

  // Buyer Inquiries
  createBuyerInquiry(inquiry: InsertBuyerInquiry): Promise<BuyerInquiry>;
  getBuyerInquiries(): Promise<BuyerInquiry[]>;
  getBuyerInquiriesByListing(listingType: string, listingId: number): Promise<BuyerInquiry[]>;
  updateBuyerInquiryStatus(id: number, status: string): Promise<BuyerInquiry | undefined>;
}

export class DatabaseStorage implements IStorage {
  // Users - Replit Auth
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Seller Leads
  async createSellerLead(lead: InsertSellerLead): Promise<SellerLead> {
    const [created] = await db.insert(sellerLeads).values(lead).returning();
    return created;
  }

  async getSellerLeads(): Promise<SellerLead[]> {
    return db.select().from(sellerLeads).orderBy(sellerLeads.createdAt);
  }

  async getSellerLead(id: number): Promise<SellerLead | undefined> {
    const [lead] = await db.select().from(sellerLeads).where(eq(sellerLeads.id, id));
    return lead;
  }

  async updateSellerLeadStatus(id: number, status: string): Promise<SellerLead | undefined> {
    const [updated] = await db.update(sellerLeads).set({ status }).where(eq(sellerLeads.id, id)).returning();
    return updated;
  }

  // Investor Leads
  async createInvestorLead(lead: InsertInvestorLead): Promise<InvestorLead> {
    const [created] = await db.insert(investorLeads).values(lead).returning();
    return created;
  }

  async getInvestorLeads(): Promise<InvestorLead[]> {
    return db.select().from(investorLeads).orderBy(investorLeads.createdAt);
  }

  async getInvestorLead(id: number): Promise<InvestorLead | undefined> {
    const [lead] = await db.select().from(investorLeads).where(eq(investorLeads.id, id));
    return lead;
  }

  async updateInvestorLeadStatus(id: number, status: string): Promise<InvestorLead | undefined> {
    const [updated] = await db.update(investorLeads).set({ status }).where(eq(investorLeads.id, id)).returning();
    return updated;
  }

  // Contacts
  async createContact(contact: InsertContact): Promise<Contact> {
    const [created] = await db.insert(contacts).values(contact).returning();
    return created;
  }

  async getContacts(): Promise<Contact[]> {
    return db.select().from(contacts).orderBy(contacts.createdAt);
  }

  async getContact(id: number): Promise<Contact | undefined> {
    const [contact] = await db.select().from(contacts).where(eq(contacts.id, id));
    return contact;
  }

  async updateContactStatus(id: number, status: string): Promise<Contact | undefined> {
    const [updated] = await db.update(contacts).set({ status }).where(eq(contacts.id, id)).returning();
    return updated;
  }

  // Projects
  async createProject(project: InsertProject): Promise<Project> {
    const [created] = await db.insert(projects).values(project).returning();
    return created;
  }

  async getProjects(): Promise<Project[]> {
    return db.select().from(projects).orderBy(projects.createdAt);
  }

  async getProjectBySlug(slug: string): Promise<Project | undefined> {
    const [project] = await db.select().from(projects).where(eq(projects.slug, slug));
    return project;
  }

  async getProjectById(id: number): Promise<Project | undefined> {
    const [project] = await db.select().from(projects).where(eq(projects.id, id));
    return project;
  }

  // Articles
  async createArticle(article: InsertArticle): Promise<Article> {
    const [created] = await db.insert(articles).values(article).returning();
    return created;
  }

  async getArticles(): Promise<Article[]> {
    return db.select().from(articles).orderBy(articles.createdAt);
  }

  async getPublishedArticles(): Promise<Article[]> {
    return db.select().from(articles).where(eq(articles.published, true)).orderBy(articles.publishedAt);
  }

  async getArticleBySlug(slug: string): Promise<Article | undefined> {
    const [article] = await db.select().from(articles).where(eq(articles.slug, slug));
    return article;
  }

  // Lead Activities
  async createLeadActivity(activity: InsertLeadActivity): Promise<LeadActivity> {
    const [created] = await db.insert(leadActivities).values(activity).returning();
    return created;
  }

  async getLeadActivities(leadType: string, leadId: number): Promise<LeadActivity[]> {
    return db.select().from(leadActivities)
      .where(and(eq(leadActivities.leadType, leadType), eq(leadActivities.leadId, leadId)))
      .orderBy(desc(leadActivities.createdAt));
  }

  async markActivityCompleted(activityId: number): Promise<LeadActivity | undefined> {
    const [updated] = await db.update(leadActivities)
      .set({ followUpDate: null })
      .where(eq(leadActivities.id, activityId))
      .returning();
    return updated;
  }

  // Queue - get all pending follow-ups and new leads
  async getQueueItems(): Promise<QueueItem[]> {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    const queueItems: QueueItem[] = [];

    // Get all follow-up activities with due dates
    const followUpActivities = await db.select().from(leadActivities)
      .where(and(
        isNotNull(leadActivities.followUpDate),
        lte(leadActivities.followUpDate, nextWeek)
      ))
      .orderBy(asc(leadActivities.followUpDate));

    // Get lead details for each activity
    for (const activity of followUpActivities) {
      let leadName = "";
      let leadEmail = "";
      
      if (activity.leadType === "seller") {
        const lead = await this.getSellerLead(activity.leadId);
        if (lead) {
          leadName = lead.name;
          leadEmail = lead.email;
        }
      } else if (activity.leadType === "investor") {
        const lead = await this.getInvestorLead(activity.leadId);
        if (lead) {
          leadName = lead.name;
          leadEmail = lead.email;
        }
      } else if (activity.leadType === "contact") {
        const contact = await this.getContact(activity.leadId);
        if (contact) {
          leadName = contact.name;
          leadEmail = contact.email;
        }
      }

      if (!leadName) continue;

      const dueDate = activity.followUpDate!;
      let priority: QueueItem['priority'] = 'upcoming';
      
      if (dueDate < today) {
        priority = 'overdue';
      } else if (dueDate < tomorrow) {
        priority = 'today';
      }

      queueItems.push({
        id: `followup-${activity.id}`,
        type: 'follow_up',
        priority,
        leadType: activity.leadType as 'seller' | 'investor' | 'contact',
        leadId: activity.leadId,
        leadName,
        leadEmail,
        description: activity.notes || 'Follow-up scheduled',
        dueDate,
        activityId: activity.id,
        createdAt: activity.createdAt,
      });
    }

    // Get new leads that haven't been contacted
    const newSellerLeads = await db.select().from(sellerLeads)
      .where(eq(sellerLeads.status, 'new'))
      .orderBy(asc(sellerLeads.createdAt));

    for (const lead of newSellerLeads) {
      queueItems.push({
        id: `newlead-seller-${lead.id}`,
        type: 'new_lead',
        priority: 'new',
        leadType: 'seller',
        leadId: lead.id,
        leadName: lead.name,
        leadEmail: lead.email,
        description: `New seller lead: ${lead.propertyAddress}`,
        createdAt: lead.createdAt,
      });
    }

    const newInvestorLeads = await db.select().from(investorLeads)
      .where(eq(investorLeads.status, 'new'))
      .orderBy(asc(investorLeads.createdAt));

    for (const lead of newInvestorLeads) {
      queueItems.push({
        id: `newlead-investor-${lead.id}`,
        type: 'new_lead',
        priority: 'new',
        leadType: 'investor',
        leadId: lead.id,
        leadName: lead.name,
        leadEmail: lead.email,
        description: `New investor lead: ${lead.capitalRange || 'TBD'} budget`,
        createdAt: lead.createdAt,
      });
    }

    const newContacts = await db.select().from(contacts)
      .where(eq(contacts.status, 'new'))
      .orderBy(asc(contacts.createdAt));

    for (const contact of newContacts) {
      queueItems.push({
        id: `newlead-contact-${contact.id}`,
        type: 'new_lead',
        priority: 'new',
        leadType: 'contact',
        leadId: contact.id,
        leadName: contact.name,
        leadEmail: contact.email,
        description: `New contact: ${contact.subject}`,
        createdAt: contact.createdAt,
      });
    }

    // Sort: overdue first, then today, then upcoming, then new leads
    const priorityOrder = { overdue: 0, today: 1, upcoming: 2, new: 3 };
    queueItems.sort((a, b) => {
      const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
      if (priorityDiff !== 0) return priorityDiff;
      
      // Within same priority, sort by date
      if (a.dueDate && b.dueDate) {
        return a.dueDate.getTime() - b.dueDate.getTime();
      }
      return a.createdAt.getTime() - b.createdAt.getTime();
    });

    return queueItems;
  }

  // Wholesale Deals
  async createWholesaleDeal(deal: InsertWholesaleDeal): Promise<WholesaleDeal> {
    const [created] = await db.insert(wholesaleDeals).values(deal).returning();
    return created;
  }

  async getWholesaleDeals(): Promise<WholesaleDeal[]> {
    return db.select().from(wholesaleDeals).orderBy(desc(wholesaleDeals.createdAt));
  }

  async getAvailableWholesaleDeals(): Promise<WholesaleDeal[]> {
    return db.select().from(wholesaleDeals)
      .where(eq(wholesaleDeals.status, "available"))
      .orderBy(desc(wholesaleDeals.createdAt));
  }

  async getWholesaleDeal(id: number): Promise<WholesaleDeal | undefined> {
    const [deal] = await db.select().from(wholesaleDeals).where(eq(wholesaleDeals.id, id));
    return deal;
  }

  async updateWholesaleDealStatus(id: number, status: string, notes?: string): Promise<WholesaleDeal | undefined> {
    const updateData: any = { status, updatedAt: new Date() };
    if (notes !== undefined) {
      if (status === "accepted" || status === "rejected") {
        updateData.developmentNotes = notes;
      } else {
        updateData.acquisitionsNotes = notes;
      }
    }
    const [updated] = await db.update(wholesaleDeals)
      .set(updateData)
      .where(eq(wholesaleDeals.id, id))
      .returning();
    return updated;
  }

  async updateWholesaleDeal(id: number, data: Partial<InsertWholesaleDeal>): Promise<WholesaleDeal | undefined> {
    const [updated] = await db.update(wholesaleDeals)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(wholesaleDeals.id, id))
      .returning();
    return updated;
  }

  // Wholesale Requests
  async createWholesaleRequest(request: InsertWholesaleRequest): Promise<WholesaleRequest> {
    const [created] = await db.insert(wholesaleRequests).values(request).returning();
    return created;
  }

  async getWholesaleRequests(): Promise<WholesaleRequest[]> {
    return db.select().from(wholesaleRequests).orderBy(desc(wholesaleRequests.createdAt));
  }

  async getWholesaleRequestsByDeal(dealId: number): Promise<WholesaleRequest[]> {
    return db.select().from(wholesaleRequests)
      .where(eq(wholesaleRequests.dealId, dealId))
      .orderBy(desc(wholesaleRequests.createdAt));
  }

  async updateWholesaleRequestStatus(id: number, status: string): Promise<WholesaleRequest | undefined> {
    const [updated] = await db.update(wholesaleRequests)
      .set({ status })
      .where(eq(wholesaleRequests.id, id))
      .returning();
    return updated;
  }

  // User Roles
  async getUserRoles(userId: string): Promise<UserRole[]> {
    return db.select().from(userRoles).where(eq(userRoles.userId, userId));
  }

  async addUserRole(role: InsertUserRole): Promise<UserRole> {
    const [created] = await db.insert(userRoles).values(role).returning();
    return created;
  }

  async removeUserRole(userId: string, role: string): Promise<void> {
    await db.delete(userRoles).where(
      and(eq(userRoles.userId, userId), eq(userRoles.role, role))
    );
  }

  async hasRole(userId: string, role: string): Promise<boolean> {
    const [found] = await db.select().from(userRoles)
      .where(and(eq(userRoles.userId, userId), eq(userRoles.role, role)));
    return !!found;
  }

  async hasAnyStaffRole(userId: string): Promise<boolean> {
    const roles = await this.getUserRoles(userId);
    return roles.some(r => STAFF_ROLES.includes(r.role as any));
  }

  // Staff Profiles
  async getStaffProfile(userId: string): Promise<StaffProfile | undefined> {
    const [profile] = await db.select().from(staffProfiles).where(eq(staffProfiles.userId, userId));
    return profile;
  }

  async upsertStaffProfile(profile: InsertStaffProfile): Promise<StaffProfile> {
    const [upserted] = await db
      .insert(staffProfiles)
      .values(profile)
      .onConflictDoUpdate({
        target: staffProfiles.userId,
        set: { ...profile, updatedAt: new Date() },
      })
      .returning();
    return upserted;
  }

  async getAllStaffProfiles(): Promise<StaffProfile[]> {
    return db.select().from(staffProfiles).orderBy(staffProfiles.createdAt);
  }

  // Investor Profiles
  async getInvestorProfile(userId: string): Promise<InvestorProfile | undefined> {
    const [profile] = await db.select().from(investorProfiles).where(eq(investorProfiles.userId, userId));
    return profile;
  }

  async upsertInvestorProfile(profile: InsertInvestorProfile): Promise<InvestorProfile> {
    const [upserted] = await db
      .insert(investorProfiles)
      .values(profile)
      .onConflictDoUpdate({
        target: investorProfiles.userId,
        set: { ...profile, updatedAt: new Date() },
      })
      .returning();
    return upserted;
  }

  async getAllInvestorProfiles(): Promise<InvestorProfile[]> {
    return db.select().from(investorProfiles).orderBy(investorProfiles.createdAt);
  }

  async updateInvestorApproval(userId: string, isApproved: boolean): Promise<InvestorProfile | undefined> {
    const [updated] = await db.update(investorProfiles)
      .set({ isApproved, updatedAt: new Date() })
      .where(eq(investorProfiles.userId, userId))
      .returning();
    return updated;
  }

  // Wholesaler Profiles
  async getWholesalerProfile(userId: string): Promise<WholesalerProfile | undefined> {
    const [profile] = await db.select().from(wholesalerProfiles).where(eq(wholesalerProfiles.userId, userId));
    return profile;
  }

  async upsertWholesalerProfile(profile: InsertWholesalerProfile): Promise<WholesalerProfile> {
    const [upserted] = await db
      .insert(wholesalerProfiles)
      .values(profile)
      .onConflictDoUpdate({
        target: wholesalerProfiles.userId,
        set: { ...profile, updatedAt: new Date() },
      })
      .returning();
    return upserted;
  }

  async getAllWholesalerProfiles(): Promise<WholesalerProfile[]> {
    return db.select().from(wholesalerProfiles).orderBy(wholesalerProfiles.createdAt);
  }

  async updateWholesalerApproval(userId: string, isApproved: boolean): Promise<WholesalerProfile | undefined> {
    const [updated] = await db.update(wholesalerProfiles)
      .set({ isApproved, updatedAt: new Date() })
      .where(eq(wholesalerProfiles.userId, userId))
      .returning();
    return updated;
  }

  // Retail Listings
  async createRetailListing(listing: InsertRetailListing): Promise<RetailListing> {
    const [created] = await db.insert(retailListings).values(listing).returning();
    return created;
  }

  async getRetailListings(): Promise<RetailListing[]> {
    return db.select().from(retailListings).orderBy(desc(retailListings.createdAt));
  }

  async getActiveRetailListings(): Promise<RetailListing[]> {
    return db.select().from(retailListings)
      .where(or(eq(retailListings.status, "active"), eq(retailListings.status, "coming_soon")))
      .orderBy(desc(retailListings.featured), desc(retailListings.createdAt));
  }

  async getRetailListingBySlug(slug: string): Promise<RetailListing | undefined> {
    const [listing] = await db.select().from(retailListings).where(eq(retailListings.slug, slug));
    return listing;
  }

  async getRetailListingById(id: number): Promise<RetailListing | undefined> {
    const [listing] = await db.select().from(retailListings).where(eq(retailListings.id, id));
    return listing;
  }

  async updateRetailListing(id: number, data: Partial<InsertRetailListing>): Promise<RetailListing | undefined> {
    const [updated] = await db.update(retailListings)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(retailListings.id, id))
      .returning();
    return updated;
  }

  async updateRetailListingStatus(id: number, status: string): Promise<RetailListing | undefined> {
    const updateData: any = { status, updatedAt: new Date() };
    if (status === "active" && !updateData.listedAt) {
      updateData.listedAt = new Date();
    } else if (status === "sold") {
      updateData.soldAt = new Date();
    }
    const [updated] = await db.update(retailListings)
      .set(updateData)
      .where(eq(retailListings.id, id))
      .returning();
    return updated;
  }

  // Buyer Inquiries
  async createBuyerInquiry(inquiry: InsertBuyerInquiry): Promise<BuyerInquiry> {
    const [created] = await db.insert(buyerInquiries).values(inquiry).returning();
    return created;
  }

  async getBuyerInquiries(): Promise<BuyerInquiry[]> {
    return db.select().from(buyerInquiries).orderBy(desc(buyerInquiries.createdAt));
  }

  async getBuyerInquiriesByListing(listingType: string, listingId: number): Promise<BuyerInquiry[]> {
    return db.select().from(buyerInquiries)
      .where(and(
        eq(buyerInquiries.listingType, listingType),
        eq(buyerInquiries.listingId, listingId)
      ))
      .orderBy(desc(buyerInquiries.createdAt));
  }

  async updateBuyerInquiryStatus(id: number, status: string): Promise<BuyerInquiry | undefined> {
    const [updated] = await db.update(buyerInquiries)
      .set({ status })
      .where(eq(buyerInquiries.id, id))
      .returning();
    return updated;
  }
}

export const storage = new DatabaseStorage();
