import { db } from "./db";
import { eq, and, desc, lte, isNotNull, isNull, asc, or, inArray, sql, gte, ne } from "drizzle-orm";
import { 
  users, sellerLeads, investorLeads, buyerLeads, contacts, projects, articles, leadActivities,
  wholesaleDeals, wholesaleRequests, userRoles, staffProfiles, investorProfiles, 
  wholesalerProfiles, buyerProfiles, savedProperties, buyerOffers, retailListings, buyerInquiries,
  communityCategories, communityPosts, communityReplies, postLikes, postBookmarks, dealBookmarks,
  directMessages, STAFF_ROLES,
  capitalProjects, projectMilestones, investmentOffers, committedInvestments, dealMatches,
  announcements, notifications,
  investorWantedDeals, userReviews, userStats, dealNegotiations, wholesaleDealDocuments, dealAnalyzerResults,
  dealMessages,
  leads, peggyConversations, peggyMessages, savedAnalyses, wholesaleDealOffers, jvRequests,
  type User, type UpsertUser,
  type SellerLead, type InsertSellerLead,
  type InvestorLead, type InsertInvestorLead,
  type BuyerLead, type InsertBuyerLead,
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
  type BuyerProfile, type InsertBuyerProfile,
  type SavedProperty, type InsertSavedProperty,
  type BuyerOffer, type InsertBuyerOffer,
  type RetailListing, type InsertRetailListing,
  type BuyerInquiry, type InsertBuyerInquiry,
  type CommunityCategory,
  type CommunityPost, type InsertCommunityPost,
  type CommunityReply, type InsertCommunityReply,
  type PostLike, type InsertPostLike,
  type PostBookmark, type InsertPostBookmark,
  type DealBookmark, type InsertDealBookmark,
  type DirectMessage, type InsertDirectMessage,
  type CapitalProject, type InsertCapitalProject,
  type ProjectMilestone, type InsertProjectMilestone,
  type InvestmentOffer, type InsertInvestmentOffer,
  type CommittedInvestment, type InsertCommittedInvestment,
  type DealMatch, type InsertDealMatch,
  type Announcement, type InsertAnnouncement,
  type Notification, type InsertNotification,
  type InvestorWantedDeal, type InsertInvestorWantedDeal,
  type UserReview, type InsertUserReview,
  type UserStats,
  type DealNegotiation, type InsertDealNegotiation,
  type WholesaleDealDocument, type InsertWholesaleDealDocument,
  type DealAnalyzerResult, type InsertDealAnalyzerResult,
  type DealMessage, type InsertDealMessage,
  type Lead, type InsertLead,
  type PeggyConversation, type InsertPeggyConversation,
  type PeggyMessage, type InsertPeggyMessage,
  type SavedAnalysis, type InsertSavedAnalysis,
  type WholesaleDealOffer, type InsertWholesaleDealOffer,
  type JVRequest, type InsertJVRequest
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
  getAllUsers(): Promise<User[]>;
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

  // Buyer Leads
  createBuyerLead(lead: InsertBuyerLead): Promise<BuyerLead>;
  getBuyerLeads(): Promise<BuyerLead[]>;
  getBuyerLead(id: number): Promise<BuyerLead | undefined>;
  updateBuyerLeadStatus(id: number, status: string): Promise<BuyerLead | undefined>;

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
  getWholesaleDealsBySubmitter(submitterId: string): Promise<WholesaleDeal[]>;
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
  getRetailListing(id: number): Promise<RetailListing | undefined>;
  updateRetailListing(id: number, data: Partial<InsertRetailListing>): Promise<RetailListing | undefined>;
  updateRetailListingStatus(id: number, status: string): Promise<RetailListing | undefined>;

  // Buyer Inquiries
  createBuyerInquiry(inquiry: InsertBuyerInquiry): Promise<BuyerInquiry>;
  getBuyerInquiries(): Promise<BuyerInquiry[]>;
  getBuyerInquiriesByListing(listingType: string, listingId: number): Promise<BuyerInquiry[]>;
  updateBuyerInquiryStatus(id: number, status: string): Promise<BuyerInquiry | undefined>;

  // Buyer Profiles
  getBuyerProfile(userId: string): Promise<BuyerProfile | undefined>;
  upsertBuyerProfile(profile: InsertBuyerProfile): Promise<BuyerProfile>;
  getAllBuyerProfiles(): Promise<BuyerProfile[]>;
  updateBuyerApproval(userId: string, isApproved: boolean): Promise<BuyerProfile | undefined>;

  // Saved Properties
  saveProperty(savedProperty: InsertSavedProperty): Promise<SavedProperty>;
  getSavedProperties(userId: string): Promise<SavedProperty[]>;
  removeSavedProperty(userId: string, propertyType: string, propertyId: number): Promise<void>;
  isPropertySaved(userId: string, propertyType: string, propertyId: number): Promise<boolean>;
  toggleSavedProperty(userId: string, propertyType: string, propertyId: number): Promise<boolean>;

  // Buyer Offers
  createBuyerOffer(offer: InsertBuyerOffer): Promise<BuyerOffer>;
  getBuyerOffers(userId: string): Promise<BuyerOffer[]>;
  getAllBuyerOffers(): Promise<BuyerOffer[]>;
  getBuyerOffersByProperty(propertyType: string, propertyId: number): Promise<BuyerOffer[]>;
  updateBuyerOfferStatus(id: number, status: string, staffNotes?: string, counterOffer?: number): Promise<BuyerOffer | undefined>;

  // Community Categories
  getCommunityCategories(): Promise<CommunityCategory[]>;
  getCommunityCategory(slug: string): Promise<CommunityCategory | undefined>;
  createCommunityCategory(category: { name: string; slug: string; description?: string; icon?: string; color?: string; order?: number }): Promise<CommunityCategory>;

  // Community Posts
  getCommunityPosts(categoryId?: number): Promise<CommunityPost[]>;
  getCommunityPost(id: number): Promise<CommunityPost | undefined>;
  createCommunityPost(post: InsertCommunityPost): Promise<CommunityPost>;
  updateCommunityPost(id: number, data: Partial<InsertCommunityPost>): Promise<CommunityPost | undefined>;
  incrementPostViews(id: number): Promise<void>;

  // Community Replies
  getCommunityReplies(postId: number): Promise<CommunityReply[]>;
  createCommunityReply(reply: InsertCommunityReply): Promise<CommunityReply>;
  updateCommunityReply(id: number, content: string): Promise<CommunityReply | undefined>;

  // Direct Messages
  getDirectMessages(userId: string): Promise<DirectMessage[]>;
  getConversation(userId1: string, userId2: string): Promise<DirectMessage[]>;
  createDirectMessage(message: InsertDirectMessage): Promise<DirectMessage>;
  markMessageRead(id: number): Promise<DirectMessage | undefined>;
  getUnreadMessageCount(userId: string): Promise<number>;

  // Capital Projects
  createCapitalProject(project: InsertCapitalProject): Promise<CapitalProject>;
  getCapitalProjects(): Promise<CapitalProject[]>;
  getActiveCapitalProjects(): Promise<CapitalProject[]>;
  getOpenCapitalProjects(): Promise<CapitalProject[]>;
  getCapitalProject(id: number): Promise<CapitalProject | undefined>;
  getCapitalProjectsByCreator(creatorId: string): Promise<CapitalProject[]>;
  updateCapitalProject(id: number, data: Partial<InsertCapitalProject>): Promise<CapitalProject | undefined>;
  updateCapitalProjectStatus(id: number, status: string): Promise<CapitalProject | undefined>;
  updateCapitalProjectFunding(id: number, amountRaised: number): Promise<CapitalProject | undefined>;

  // Project Milestones
  createProjectMilestone(milestone: InsertProjectMilestone): Promise<ProjectMilestone>;
  getProjectMilestones(projectId: number): Promise<ProjectMilestone[]>;
  updateMilestoneCompletion(id: number, isComplete: boolean): Promise<ProjectMilestone | undefined>;
  updateProjectMilestone(id: number, data: Partial<InsertProjectMilestone>): Promise<ProjectMilestone | undefined>;

  // Investment Offers
  createInvestmentOffer(offer: InsertInvestmentOffer): Promise<InvestmentOffer>;
  getInvestmentOffers(): Promise<InvestmentOffer[]>;
  getInvestmentOffersByProject(projectId: number): Promise<InvestmentOffer[]>;
  getInvestmentOffersByInvestor(investorId: string): Promise<InvestmentOffer[]>;
  getInvestmentOffer(id: number): Promise<InvestmentOffer | undefined>;
  updateInvestmentOfferStatus(id: number, status: string): Promise<InvestmentOffer | undefined>;
  respondToInvestmentOffer(id: number, status: string, counterTerms?: string, notes?: string, respondedBy?: string): Promise<InvestmentOffer | undefined>;
  counterInvestmentOffer(id: number, counterData: { counterAmount?: number; counterEquityPercent?: string; counterInterestRate?: string; counterNotes?: string }): Promise<InvestmentOffer | undefined>;
  addNegotiationEntry(id: number, entry: { by: string; action: string; details: string; timestamp: Date }): Promise<InvestmentOffer | undefined>;

  // Committed Investments
  createCommittedInvestment(investment: InsertCommittedInvestment): Promise<CommittedInvestment>;
  getCommittedInvestmentsByProject(projectId: number): Promise<CommittedInvestment[]>;
  getCommittedInvestmentsByInvestor(investorId: string): Promise<CommittedInvestment[]>;

  // Deal Matches
  createDealMatch(match: InsertDealMatch): Promise<DealMatch>;
  getDealMatches(): Promise<DealMatch[]>;
  getDealMatchesByDeal(dealId: number): Promise<DealMatch[]>;
  getDealMatchesByUser(userId: string): Promise<DealMatch[]>;
  updateDealMatchStatus(id: number, status: string): Promise<DealMatch | undefined>;

  // Announcements
  createAnnouncement(announcement: InsertAnnouncement): Promise<Announcement>;
  getAnnouncements(): Promise<Announcement[]>;
  getAnnouncementsForAudience(audience: string): Promise<Announcement[]>;
  updateAnnouncement(id: number, data: Partial<InsertAnnouncement>): Promise<Announcement | undefined>;
  deleteAnnouncement(id: number): Promise<void>;

  // Notifications
  createNotification(notification: InsertNotification): Promise<Notification>;
  getNotifications(userId: string): Promise<Notification[]>;
  getUnreadNotifications(userId: string): Promise<Notification[]>;
  markNotificationRead(id: number): Promise<Notification | undefined>;
  markAllNotificationsRead(userId: string): Promise<void>;
  getUnreadNotificationCount(userId: string): Promise<number>;

  // Investor Wanted Deals
  createInvestorWantedDeal(deal: InsertInvestorWantedDeal): Promise<InvestorWantedDeal>;
  getInvestorWantedDeals(): Promise<InvestorWantedDeal[]>;
  getActiveInvestorWantedDeals(): Promise<InvestorWantedDeal[]>;
  getInvestorWantedDealsByUser(userId: string): Promise<InvestorWantedDeal[]>;
  getInvestorWantedDeal(id: number): Promise<InvestorWantedDeal | undefined>;
  updateInvestorWantedDeal(id: number, data: Partial<InsertInvestorWantedDeal>): Promise<InvestorWantedDeal | undefined>;
  deleteInvestorWantedDeal(id: number): Promise<void>;

  // User Reviews
  createUserReview(review: InsertUserReview): Promise<UserReview>;
  getUserReviews(revieweeId: string): Promise<UserReview[]>;
  getReviewsByReviewer(reviewerId: string): Promise<UserReview[]>;
  getUserReview(id: number): Promise<UserReview | undefined>;
  respondToReview(id: number, response: string): Promise<UserReview | undefined>;

  // User Stats
  getUserStats(userId: string): Promise<UserStats | undefined>;
  updateUserStats(userId: string, data: Partial<UserStats>): Promise<UserStats>;
  getUserActivity(userId: string): Promise<{ id: number; type: string; title: string; description: string; amount?: number; createdAt: Date }[]>;

  // Deal Negotiations
  createDealNegotiation(negotiation: InsertDealNegotiation): Promise<DealNegotiation>;
  getDealNegotiations(dealType: string, dealId: number): Promise<DealNegotiation[]>;
  getNegotiationsByUser(userId: string): Promise<DealNegotiation[]>;
  getDealNegotiation(id: number): Promise<DealNegotiation | undefined>;
  getNegotiationThread(negotiationId: number): Promise<DealNegotiation[]>;
  updateNegotiationStatus(id: number, status: string): Promise<DealNegotiation | undefined>;

  // Wholesale Deal Documents
  createWholesaleDealDocument(doc: InsertWholesaleDealDocument): Promise<WholesaleDealDocument>;
  getWholesaleDealDocuments(dealId: number): Promise<WholesaleDealDocument[]>;
  deleteWholesaleDealDocument(id: number): Promise<void>;

  // Deal Analyzer Results
  createDealAnalyzerResult(result: InsertDealAnalyzerResult): Promise<DealAnalyzerResult>;
  getDealAnalyzerResults(userId: string): Promise<DealAnalyzerResult[]>;
  getDealAnalyzerResult(id: number): Promise<DealAnalyzerResult | undefined>;
  deleteDealAnalyzerResult(id: number): Promise<void>;

  // Deal Messages (Chat)
  createDealMessage(message: InsertDealMessage): Promise<DealMessage>;
  getDealMessages(dealType: string, dealId: number): Promise<DealMessage[]>;
  markDealMessagesRead(dealType: string, dealId: number, userId: string): Promise<void>;
  getUnreadDealMessageCount(dealType: string, dealId: number, userId: string): Promise<number>;

  // Unified Leads
  createLead(lead: InsertLead): Promise<Lead>;
  getLeads(filters?: { leadType?: string; stage?: string; assignedTo?: string }): Promise<Lead[]>;
  getLead(id: number): Promise<Lead | undefined>;
  updateLead(id: number, data: Partial<InsertLead>): Promise<Lead | undefined>;
  updateLeadStage(id: number, stage: string): Promise<Lead | undefined>;
  assignLead(id: number, assignedTo: string): Promise<Lead | undefined>;
  
  // Peggy AI Conversations
  createPeggyConversation(conversation: InsertPeggyConversation): Promise<PeggyConversation>;
  getPeggyConversations(userId?: string, sessionId?: string): Promise<PeggyConversation[]>;
  getPeggyConversation(id: number): Promise<PeggyConversation | undefined>;
  updatePeggyConversation(id: number, data: Partial<InsertPeggyConversation>): Promise<PeggyConversation | undefined>;
  
  // Peggy AI Messages
  createPeggyMessage(message: InsertPeggyMessage): Promise<PeggyMessage>;
  getPeggyMessages(conversationId: number): Promise<PeggyMessage[]>;
  updatePeggyMessageFeedback(id: number, feedback: string, feedbackNotes?: string): Promise<PeggyMessage | undefined>;
  
  // Saved Analyses (Calculators)
  createSavedAnalysis(analysis: InsertSavedAnalysis): Promise<SavedAnalysis>;
  getSavedAnalyses(userId: string, calculatorType?: string): Promise<SavedAnalysis[]>;
  getSavedAnalysis(id: number): Promise<SavedAnalysis | undefined>;
  getSavedAnalysisByShareToken(shareToken: string): Promise<SavedAnalysis | undefined>;
  updateSavedAnalysis(id: number, data: Partial<InsertSavedAnalysis>): Promise<SavedAnalysis | undefined>;
  deleteSavedAnalysis(id: number): Promise<void>;
  
  // Wholesale Deal Offers
  createWholesaleDealOffer(offer: InsertWholesaleDealOffer): Promise<WholesaleDealOffer>;
  getWholesaleDealOffers(dealId: number): Promise<WholesaleDealOffer[]>;
  getWholesaleDealOffersByBuyer(buyerId: string): Promise<WholesaleDealOffer[]>;
  getWholesaleDealOffer(id: number): Promise<WholesaleDealOffer | undefined>;
  updateWholesaleDealOfferStatus(id: number, status: string): Promise<WholesaleDealOffer | undefined>;
  counterWholesaleDealOffer(id: number, counterAmount: number, counterNotes?: string): Promise<WholesaleDealOffer | undefined>;
  
  // JV Requests
  createJvRequest(request: InsertJVRequest): Promise<JVRequest>;
  getJvRequests(): Promise<JVRequest[]>;
  getJvRequestsByDeal(dealId: number): Promise<JVRequest[]>;
  getJvRequestsByDreamscaper(dreamscaperId: string): Promise<JVRequest[]>;
  getJvRequestsByWholesaler(wholesalerId: string): Promise<JVRequest[]>;
  getJvRequest(id: number): Promise<JVRequest | undefined>;
  updateJvRequestStatus(id: number, status: string): Promise<JVRequest | undefined>;
}

export class DatabaseStorage implements IStorage {
  // Users - Replit Auth
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    return db.select().from(users).orderBy(desc(users.createdAt));
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

  // Buyer Leads
  async createBuyerLead(lead: InsertBuyerLead): Promise<BuyerLead> {
    const [created] = await db.insert(buyerLeads).values(lead).returning();
    return created;
  }

  async getBuyerLeads(): Promise<BuyerLead[]> {
    return db.select().from(buyerLeads).orderBy(buyerLeads.createdAt);
  }

  async getBuyerLead(id: number): Promise<BuyerLead | undefined> {
    const [lead] = await db.select().from(buyerLeads).where(eq(buyerLeads.id, id));
    return lead;
  }

  async updateBuyerLeadStatus(id: number, status: string): Promise<BuyerLead | undefined> {
    const [updated] = await db.update(buyerLeads).set({ status }).where(eq(buyerLeads.id, id)).returning();
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

  async getWholesaleDealsBySubmitter(submitterId: string): Promise<WholesaleDeal[]> {
    return db.select().from(wholesaleDeals)
      .where(eq(wholesaleDeals.submittedBy, submitterId))
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

  async getRetailListing(id: number): Promise<RetailListing | undefined> {
    return this.getRetailListingById(id);
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

  // Buyer Profiles
  async getBuyerProfile(userId: string): Promise<BuyerProfile | undefined> {
    const [profile] = await db.select().from(buyerProfiles).where(eq(buyerProfiles.userId, userId));
    return profile;
  }

  async upsertBuyerProfile(profile: InsertBuyerProfile): Promise<BuyerProfile> {
    const [upserted] = await db
      .insert(buyerProfiles)
      .values(profile)
      .onConflictDoUpdate({
        target: buyerProfiles.userId,
        set: { ...profile, updatedAt: new Date() },
      })
      .returning();
    return upserted;
  }

  async getAllBuyerProfiles(): Promise<BuyerProfile[]> {
    return db.select().from(buyerProfiles).orderBy(buyerProfiles.createdAt);
  }

  async updateBuyerApproval(userId: string, isApproved: boolean): Promise<BuyerProfile | undefined> {
    const [updated] = await db.update(buyerProfiles)
      .set({ isApproved, updatedAt: new Date() })
      .where(eq(buyerProfiles.userId, userId))
      .returning();
    return updated;
  }

  // Saved Properties
  async saveProperty(savedProperty: InsertSavedProperty): Promise<SavedProperty> {
    const [created] = await db.insert(savedProperties).values(savedProperty).returning();
    return created;
  }

  async getSavedProperties(userId: string): Promise<SavedProperty[]> {
    return db.select().from(savedProperties)
      .where(eq(savedProperties.userId, userId))
      .orderBy(desc(savedProperties.createdAt));
  }

  async removeSavedProperty(userId: string, propertyType: string, propertyId: number): Promise<void> {
    await db.delete(savedProperties).where(
      and(
        eq(savedProperties.userId, userId),
        eq(savedProperties.propertyType, propertyType),
        eq(savedProperties.propertyId, propertyId)
      )
    );
  }

  async isPropertySaved(userId: string, propertyType: string, propertyId: number): Promise<boolean> {
    const [found] = await db.select().from(savedProperties)
      .where(and(
        eq(savedProperties.userId, userId),
        eq(savedProperties.propertyType, propertyType),
        eq(savedProperties.propertyId, propertyId)
      ));
    return !!found;
  }

  async toggleSavedProperty(userId: string, propertyType: string, propertyId: number): Promise<boolean> {
    const isSaved = await this.isPropertySaved(userId, propertyType, propertyId);
    if (isSaved) {
      await this.removeSavedProperty(userId, propertyType, propertyId);
      return false;
    } else {
      await this.saveProperty({ userId, propertyType, propertyId });
      return true;
    }
  }

  // Buyer Offers
  async createBuyerOffer(offer: InsertBuyerOffer): Promise<BuyerOffer> {
    const [created] = await db.insert(buyerOffers).values(offer).returning();
    return created;
  }

  async getBuyerOffers(userId: string): Promise<BuyerOffer[]> {
    return db.select().from(buyerOffers)
      .where(eq(buyerOffers.userId, userId))
      .orderBy(desc(buyerOffers.createdAt));
  }

  async getAllBuyerOffers(): Promise<BuyerOffer[]> {
    return db.select().from(buyerOffers).orderBy(desc(buyerOffers.createdAt));
  }

  async getBuyerOffersByProperty(propertyType: string, propertyId: number): Promise<BuyerOffer[]> {
    return db.select().from(buyerOffers)
      .where(and(
        eq(buyerOffers.propertyType, propertyType),
        eq(buyerOffers.propertyId, propertyId)
      ))
      .orderBy(desc(buyerOffers.createdAt));
  }

  async updateBuyerOfferStatus(id: number, status: string, staffNotes?: string, counterOffer?: number): Promise<BuyerOffer | undefined> {
    const updateData: any = { status, updatedAt: new Date() };
    if (staffNotes !== undefined) updateData.staffNotes = staffNotes;
    if (counterOffer !== undefined) updateData.counterOffer = counterOffer;
    
    const [updated] = await db.update(buyerOffers)
      .set(updateData)
      .where(eq(buyerOffers.id, id))
      .returning();
    return updated;
  }

  // Community Categories
  async getCommunityCategories(): Promise<CommunityCategory[]> {
    return db.select().from(communityCategories)
      .where(eq(communityCategories.isActive, true))
      .orderBy(asc(communityCategories.order));
  }

  async getCommunityCategory(slug: string): Promise<CommunityCategory | undefined> {
    const [category] = await db.select().from(communityCategories)
      .where(eq(communityCategories.slug, slug));
    return category;
  }

  async createCommunityCategory(category: { name: string; slug: string; description?: string; icon?: string; color?: string; order?: number }): Promise<CommunityCategory> {
    const [created] = await db.insert(communityCategories).values(category).returning();
    return created;
  }

  // Community Posts
  async getCommunityPosts(categoryId?: number): Promise<CommunityPost[]> {
    if (categoryId) {
      return db.select().from(communityPosts)
        .where(eq(communityPosts.categoryId, categoryId))
        .orderBy(desc(communityPosts.isPinned), desc(communityPosts.createdAt));
    }
    return db.select().from(communityPosts)
      .orderBy(desc(communityPosts.isPinned), desc(communityPosts.createdAt));
  }

  async getCommunityPost(id: number): Promise<CommunityPost | undefined> {
    const [post] = await db.select().from(communityPosts)
      .where(eq(communityPosts.id, id));
    return post;
  }

  async createCommunityPost(post: InsertCommunityPost): Promise<CommunityPost> {
    const [created] = await db.insert(communityPosts).values(post).returning();
    return created;
  }

  async updateCommunityPost(id: number, data: Partial<InsertCommunityPost>): Promise<CommunityPost | undefined> {
    const [updated] = await db.update(communityPosts)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(communityPosts.id, id))
      .returning();
    return updated;
  }

  async incrementPostViews(id: number): Promise<void> {
    await db.update(communityPosts)
      .set({ viewCount: sql`${communityPosts.viewCount} + 1` })
      .where(eq(communityPosts.id, id));
  }

  // Community Replies
  async getCommunityReplies(postId: number): Promise<CommunityReply[]> {
    return db.select().from(communityReplies)
      .where(eq(communityReplies.postId, postId))
      .orderBy(asc(communityReplies.createdAt));
  }

  async createCommunityReply(reply: InsertCommunityReply): Promise<CommunityReply> {
    const [created] = await db.insert(communityReplies).values(reply).returning();
    
    // Update post reply count and last reply info
    await db.update(communityPosts)
      .set({ 
        replyCount: sql`${communityPosts.replyCount} + 1`,
        lastReplyAt: new Date(),
        lastReplyBy: reply.userId,
        updatedAt: new Date()
      })
      .where(eq(communityPosts.id, reply.postId));
    
    return created;
  }

  async updateCommunityReply(id: number, content: string): Promise<CommunityReply | undefined> {
    const [updated] = await db.update(communityReplies)
      .set({ content, updatedAt: new Date() })
      .where(eq(communityReplies.id, id))
      .returning();
    return updated;
  }

  // Post Likes
  async togglePostLike(postId: number, userId: string): Promise<{ liked: boolean; likeCount: number }> {
    const existingLike = await db.select().from(postLikes)
      .where(and(eq(postLikes.postId, postId), eq(postLikes.userId, userId)));
    
    if (existingLike.length > 0) {
      await db.delete(postLikes).where(eq(postLikes.id, existingLike[0].id));
      await db.update(communityPosts)
        .set({ likeCount: sql`GREATEST(0, ${communityPosts.likeCount} - 1)` })
        .where(eq(communityPosts.id, postId));
      const [post] = await db.select({ likeCount: communityPosts.likeCount }).from(communityPosts).where(eq(communityPosts.id, postId));
      return { liked: false, likeCount: post?.likeCount || 0 };
    } else {
      await db.insert(postLikes).values({ postId, userId });
      await db.update(communityPosts)
        .set({ likeCount: sql`${communityPosts.likeCount} + 1` })
        .where(eq(communityPosts.id, postId));
      const [post] = await db.select({ likeCount: communityPosts.likeCount }).from(communityPosts).where(eq(communityPosts.id, postId));
      return { liked: true, likeCount: post?.likeCount || 0 };
    }
  }

  async isPostLiked(postId: number, userId: string): Promise<boolean> {
    const result = await db.select().from(postLikes)
      .where(and(eq(postLikes.postId, postId), eq(postLikes.userId, userId)));
    return result.length > 0;
  }

  async getPostLikes(postId: number): Promise<PostLike[]> {
    return db.select().from(postLikes).where(eq(postLikes.postId, postId));
  }

  // Post Bookmarks
  async togglePostBookmark(postId: number, userId: string): Promise<{ bookmarked: boolean; bookmarkCount: number }> {
    const existingBookmark = await db.select().from(postBookmarks)
      .where(and(eq(postBookmarks.postId, postId), eq(postBookmarks.userId, userId)));
    
    if (existingBookmark.length > 0) {
      await db.delete(postBookmarks).where(eq(postBookmarks.id, existingBookmark[0].id));
      await db.update(communityPosts)
        .set({ bookmarkCount: sql`GREATEST(0, ${communityPosts.bookmarkCount} - 1)` })
        .where(eq(communityPosts.id, postId));
      const [post] = await db.select({ bookmarkCount: communityPosts.bookmarkCount }).from(communityPosts).where(eq(communityPosts.id, postId));
      return { bookmarked: false, bookmarkCount: post?.bookmarkCount || 0 };
    } else {
      await db.insert(postBookmarks).values({ postId, userId });
      await db.update(communityPosts)
        .set({ bookmarkCount: sql`${communityPosts.bookmarkCount} + 1` })
        .where(eq(communityPosts.id, postId));
      const [post] = await db.select({ bookmarkCount: communityPosts.bookmarkCount }).from(communityPosts).where(eq(communityPosts.id, postId));
      return { bookmarked: true, bookmarkCount: post?.bookmarkCount || 0 };
    }
  }

  async isPostBookmarked(postId: number, userId: string): Promise<boolean> {
    const result = await db.select().from(postBookmarks)
      .where(and(eq(postBookmarks.postId, postId), eq(postBookmarks.userId, userId)));
    return result.length > 0;
  }

  async getUserBookmarks(userId: string): Promise<CommunityPost[]> {
    const bookmarks = await db.select({ postId: postBookmarks.postId })
      .from(postBookmarks).where(eq(postBookmarks.userId, userId));
    if (bookmarks.length === 0) return [];
    const postIds = bookmarks.map(b => b.postId);
    return db.select().from(communityPosts).where(inArray(communityPosts.id, postIds));
  }

  // Get social feed posts (all posts ordered by recent, with user engagement info)
  async getSocialFeedPosts(limit: number = 50): Promise<CommunityPost[]> {
    return db.select().from(communityPosts)
      .orderBy(desc(communityPosts.isPinned), desc(communityPosts.createdAt))
      .limit(limit);
  }

  // Deal Bookmarks
  async saveDeal(userId: string, dealType: string, dealId: number, action: string = "save"): Promise<DealBookmark> {
    // Remove existing action if any
    await db.delete(dealBookmarks).where(
      and(eq(dealBookmarks.userId, userId), eq(dealBookmarks.dealType, dealType), eq(dealBookmarks.dealId, dealId))
    );
    
    // Add new action (skip if pass)
    if (action !== "pass") {
      const [bookmark] = await db.insert(dealBookmarks).values({
        userId,
        dealType,
        dealId,
        action,
      }).returning();
      return bookmark;
    }
    
    return { id: 0, userId, dealType, dealId, action, createdAt: new Date() };
  }

  async removeDealBookmark(userId: string, dealType: string, dealId: number): Promise<void> {
    await db.delete(dealBookmarks).where(
      and(eq(dealBookmarks.userId, userId), eq(dealBookmarks.dealType, dealType), eq(dealBookmarks.dealId, dealId))
    );
  }

  async getUserSavedDeals(userId: string): Promise<DealBookmark[]> {
    return db.select().from(dealBookmarks)
      .where(and(eq(dealBookmarks.userId, userId), ne(dealBookmarks.action, "pass")))
      .orderBy(desc(dealBookmarks.createdAt));
  }

  async getUserLikedDeals(userId: string): Promise<DealBookmark[]> {
    return db.select().from(dealBookmarks)
      .where(and(eq(dealBookmarks.userId, userId), eq(dealBookmarks.action, "like")))
      .orderBy(desc(dealBookmarks.createdAt));
  }

  async isDealSaved(userId: string, dealType: string, dealId: number): Promise<DealBookmark | undefined> {
    const [result] = await db.select().from(dealBookmarks)
      .where(and(eq(dealBookmarks.userId, userId), eq(dealBookmarks.dealType, dealType), eq(dealBookmarks.dealId, dealId)));
    return result;
  }

  // Direct Messages
  async getDirectMessages(userId: string): Promise<DirectMessage[]> {
    return db.select().from(directMessages)
      .where(or(
        eq(directMessages.senderId, userId),
        eq(directMessages.receiverId, userId)
      ))
      .orderBy(desc(directMessages.createdAt));
  }

  async getConversation(userId1: string, userId2: string): Promise<DirectMessage[]> {
    return db.select().from(directMessages)
      .where(or(
        and(eq(directMessages.senderId, userId1), eq(directMessages.receiverId, userId2)),
        and(eq(directMessages.senderId, userId2), eq(directMessages.receiverId, userId1))
      ))
      .orderBy(asc(directMessages.createdAt));
  }

  async createDirectMessage(message: InsertDirectMessage): Promise<DirectMessage> {
    const [created] = await db.insert(directMessages).values(message).returning();
    return created;
  }

  async markMessageRead(id: number): Promise<DirectMessage | undefined> {
    const [updated] = await db.update(directMessages)
      .set({ isRead: true })
      .where(eq(directMessages.id, id))
      .returning();
    return updated;
  }

  async getUnreadMessageCount(userId: string): Promise<number> {
    const result = await db.select({ count: sql<number>`count(*)` })
      .from(directMessages)
      .where(and(
        eq(directMessages.receiverId, userId),
        eq(directMessages.isRead, false)
      ));
    return Number(result[0]?.count || 0);
  }

  // Capital Projects
  async createCapitalProject(project: InsertCapitalProject): Promise<CapitalProject> {
    const [created] = await db.insert(capitalProjects).values(project).returning();
    return created;
  }

  async getCapitalProjects(): Promise<CapitalProject[]> {
    return db.select().from(capitalProjects).orderBy(desc(capitalProjects.createdAt));
  }

  async getActiveCapitalProjects(): Promise<CapitalProject[]> {
    return db.select().from(capitalProjects)
      .where(or(
        eq(capitalProjects.status, "OPEN_FOR_INVESTMENT"),
        eq(capitalProjects.status, "FUNDED"),
        eq(capitalProjects.status, "IN_PROGRESS")
      ))
      .orderBy(desc(capitalProjects.createdAt));
  }

  async getOpenCapitalProjects(): Promise<CapitalProject[]> {
    return db.select().from(capitalProjects)
      .where(eq(capitalProjects.status, "OPEN_FOR_INVESTMENT"))
      .orderBy(desc(capitalProjects.createdAt));
  }

  async getCapitalProject(id: number): Promise<CapitalProject | undefined> {
    const [project] = await db.select().from(capitalProjects).where(eq(capitalProjects.id, id));
    return project;
  }

  async getCapitalProjectsByCreator(creatorId: string): Promise<CapitalProject[]> {
    return db.select().from(capitalProjects)
      .where(eq(capitalProjects.createdBy, creatorId))
      .orderBy(desc(capitalProjects.createdAt));
  }

  async updateCapitalProject(id: number, data: Partial<InsertCapitalProject>): Promise<CapitalProject | undefined> {
    const [updated] = await db.update(capitalProjects)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(capitalProjects.id, id))
      .returning();
    return updated;
  }

  async updateCapitalProjectStatus(id: number, status: string): Promise<CapitalProject | undefined> {
    const [updated] = await db.update(capitalProjects)
      .set({ status, updatedAt: new Date() })
      .where(eq(capitalProjects.id, id))
      .returning();
    return updated;
  }

  async updateCapitalProjectFunding(id: number, amountRaised: number): Promise<CapitalProject | undefined> {
    const [updated] = await db.update(capitalProjects)
      .set({ amountRaised, updatedAt: new Date() })
      .where(eq(capitalProjects.id, id))
      .returning();
    return updated;
  }

  // Project Milestones
  async createProjectMilestone(milestone: InsertProjectMilestone): Promise<ProjectMilestone> {
    const [created] = await db.insert(projectMilestones).values(milestone).returning();
    return created;
  }

  async getProjectMilestones(projectId: number): Promise<ProjectMilestone[]> {
    return db.select().from(projectMilestones)
      .where(eq(projectMilestones.projectId, projectId))
      .orderBy(asc(projectMilestones.order));
  }

  async updateMilestoneCompletion(id: number, isComplete: boolean): Promise<ProjectMilestone | undefined> {
    const [updated] = await db.update(projectMilestones)
      .set({ 
        isComplete, 
        completedAt: isComplete ? new Date() : null 
      })
      .where(eq(projectMilestones.id, id))
      .returning();
    return updated;
  }

  async updateProjectMilestone(id: number, data: Partial<InsertProjectMilestone>): Promise<ProjectMilestone | undefined> {
    const [updated] = await db.update(projectMilestones)
      .set(data)
      .where(eq(projectMilestones.id, id))
      .returning();
    return updated;
  }

  // Investment Offers
  async createInvestmentOffer(offer: InsertInvestmentOffer): Promise<InvestmentOffer> {
    const [created] = await db.insert(investmentOffers).values(offer).returning();
    return created;
  }

  async getInvestmentOffers(): Promise<InvestmentOffer[]> {
    return db.select().from(investmentOffers).orderBy(desc(investmentOffers.createdAt));
  }

  async getInvestmentOffersByProject(projectId: number): Promise<InvestmentOffer[]> {
    return db.select().from(investmentOffers)
      .where(eq(investmentOffers.projectId, projectId))
      .orderBy(desc(investmentOffers.createdAt));
  }

  async getInvestmentOffersByInvestor(investorId: string): Promise<InvestmentOffer[]> {
    return db.select().from(investmentOffers)
      .where(eq(investmentOffers.investorId, investorId))
      .orderBy(desc(investmentOffers.createdAt));
  }

  async getInvestmentOffer(id: number): Promise<InvestmentOffer | undefined> {
    const [offer] = await db.select().from(investmentOffers).where(eq(investmentOffers.id, id));
    return offer;
  }

  async updateInvestmentOfferStatus(id: number, status: string): Promise<InvestmentOffer | undefined> {
    const [updated] = await db.update(investmentOffers)
      .set({ status, updatedAt: new Date() })
      .where(eq(investmentOffers.id, id))
      .returning();
    return updated;
  }

  async respondToInvestmentOffer(
    id: number, 
    status: string, 
    counterTerms?: string, 
    notes?: string, 
    respondedBy?: string
  ): Promise<InvestmentOffer | undefined> {
    const offer = await this.getInvestmentOffer(id);
    if (!offer) return undefined;
    
    const updateData: any = { 
      status, 
      updatedAt: new Date() 
    };
    
    if (counterTerms) {
      updateData.counterNotes = counterTerms;
    }
    if (notes) {
      updateData.counterNotes = notes;
    }
    
    const history = Array.isArray(offer.negotiationHistory) ? offer.negotiationHistory : [];
    updateData.negotiationHistory = [
      ...history,
      {
        by: respondedBy || "staff",
        action: status,
        details: notes || counterTerms || "",
        timestamp: new Date().toISOString()
      }
    ];
    
    const [updated] = await db.update(investmentOffers)
      .set(updateData)
      .where(eq(investmentOffers.id, id))
      .returning();
    return updated;
  }

  async counterInvestmentOffer(id: number, counterData: { counterAmount?: number; counterEquityPercent?: string; counterInterestRate?: string; counterNotes?: string }): Promise<InvestmentOffer | undefined> {
    const [updated] = await db.update(investmentOffers)
      .set({ 
        ...counterData, 
        status: "COUNTERED",
        updatedAt: new Date() 
      })
      .where(eq(investmentOffers.id, id))
      .returning();
    return updated;
  }

  async addNegotiationEntry(id: number, entry: { by: string; action: string; details: string; timestamp: Date }): Promise<InvestmentOffer | undefined> {
    const offer = await this.getInvestmentOffer(id);
    if (!offer) return undefined;
    
    const history = Array.isArray(offer.negotiationHistory) ? offer.negotiationHistory : [];
    const [updated] = await db.update(investmentOffers)
      .set({ 
        negotiationHistory: [...history, entry],
        updatedAt: new Date() 
      })
      .where(eq(investmentOffers.id, id))
      .returning();
    return updated;
  }

  // Committed Investments
  async createCommittedInvestment(investment: InsertCommittedInvestment): Promise<CommittedInvestment> {
    const [created] = await db.insert(committedInvestments).values(investment).returning();
    
    // Update project funding amount
    const projectInvestments = await this.getCommittedInvestmentsByProject(investment.projectId);
    const totalRaised = projectInvestments.reduce((sum, inv) => sum + inv.committedAmount, 0);
    await this.updateCapitalProjectFunding(investment.projectId, totalRaised);
    
    return created;
  }

  async getCommittedInvestmentsByProject(projectId: number): Promise<CommittedInvestment[]> {
    return db.select().from(committedInvestments)
      .where(eq(committedInvestments.projectId, projectId))
      .orderBy(desc(committedInvestments.createdAt));
  }

  async getCommittedInvestmentsByInvestor(investorId: string): Promise<CommittedInvestment[]> {
    return db.select().from(committedInvestments)
      .where(eq(committedInvestments.investorId, investorId))
      .orderBy(desc(committedInvestments.createdAt));
  }

  // Deal Matches
  async createDealMatch(match: InsertDealMatch): Promise<DealMatch> {
    const [created] = await db.insert(dealMatches).values(match).returning();
    return created;
  }

  async getDealMatches(): Promise<DealMatch[]> {
    return db.select().from(dealMatches).orderBy(desc(dealMatches.createdAt));
  }

  async getDealMatchesByDeal(dealId: number): Promise<DealMatch[]> {
    return db.select().from(dealMatches)
      .where(eq(dealMatches.dealId, dealId))
      .orderBy(desc(dealMatches.createdAt));
  }

  async getDealMatchesByUser(userId: string): Promise<DealMatch[]> {
    return db.select().from(dealMatches)
      .where(eq(dealMatches.matchedUserId, userId))
      .orderBy(desc(dealMatches.createdAt));
  }

  async updateDealMatchStatus(id: number, status: string): Promise<DealMatch | undefined> {
    const [updated] = await db.update(dealMatches)
      .set({ status, updatedAt: new Date() })
      .where(eq(dealMatches.id, id))
      .returning();
    return updated;
  }

  // Announcements
  async createAnnouncement(announcement: InsertAnnouncement): Promise<Announcement> {
    const [created] = await db.insert(announcements).values(announcement).returning();
    return created;
  }

  async getAnnouncements(): Promise<Announcement[]> {
    return db.select().from(announcements)
      .where(eq(announcements.isActive, true))
      .orderBy(desc(announcements.isPinned), desc(announcements.createdAt));
  }

  async getAnnouncementsForAudience(audience: string): Promise<Announcement[]> {
    const now = new Date();
    return db.select().from(announcements)
      .where(and(
        eq(announcements.isActive, true),
        or(
          eq(announcements.audience, "ALL"),
          eq(announcements.audience, audience)
        ),
        or(
          isNull(announcements.expiresAt),
          gte(announcements.expiresAt, now)
        )
      ))
      .orderBy(desc(announcements.isPinned), desc(announcements.createdAt));
  }

  async updateAnnouncement(id: number, data: Partial<InsertAnnouncement>): Promise<Announcement | undefined> {
    const [updated] = await db.update(announcements)
      .set(data)
      .where(eq(announcements.id, id))
      .returning();
    return updated;
  }

  async deleteAnnouncement(id: number): Promise<void> {
    await db.delete(announcements).where(eq(announcements.id, id));
  }

  // Notifications
  async createNotification(notification: InsertNotification): Promise<Notification> {
    const [created] = await db.insert(notifications).values(notification).returning();
    return created;
  }

  async getNotifications(userId: string): Promise<Notification[]> {
    return db.select().from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt))
      .limit(50);
  }

  async getUnreadNotifications(userId: string): Promise<Notification[]> {
    return db.select().from(notifications)
      .where(and(
        eq(notifications.userId, userId),
        eq(notifications.isRead, false)
      ))
      .orderBy(desc(notifications.createdAt));
  }

  async markNotificationRead(id: number): Promise<Notification | undefined> {
    const [updated] = await db.update(notifications)
      .set({ isRead: true })
      .where(eq(notifications.id, id))
      .returning();
    return updated;
  }

  async markAllNotificationsRead(userId: string): Promise<void> {
    await db.update(notifications)
      .set({ isRead: true })
      .where(eq(notifications.userId, userId));
  }

  async getUnreadNotificationCount(userId: string): Promise<number> {
    const result = await db.select({ count: sql<number>`count(*)` })
      .from(notifications)
      .where(and(
        eq(notifications.userId, userId),
        eq(notifications.isRead, false)
      ));
    return Number(result[0]?.count || 0);
  }

  // Investor Wanted Deals
  async createInvestorWantedDeal(deal: InsertInvestorWantedDeal): Promise<InvestorWantedDeal> {
    const [created] = await db.insert(investorWantedDeals).values(deal).returning();
    return created;
  }

  async getInvestorWantedDeals(): Promise<InvestorWantedDeal[]> {
    return db.select().from(investorWantedDeals).orderBy(desc(investorWantedDeals.createdAt));
  }

  async getActiveInvestorWantedDeals(): Promise<InvestorWantedDeal[]> {
    return db.select().from(investorWantedDeals)
      .where(and(
        eq(investorWantedDeals.isPublic, true),
        eq(investorWantedDeals.activelyLooking, true)
      ))
      .orderBy(desc(investorWantedDeals.createdAt));
  }

  async getInvestorWantedDealsByUser(userId: string): Promise<InvestorWantedDeal[]> {
    return db.select().from(investorWantedDeals)
      .where(eq(investorWantedDeals.userId, userId))
      .orderBy(desc(investorWantedDeals.createdAt));
  }

  async getInvestorWantedDeal(id: number): Promise<InvestorWantedDeal | undefined> {
    const [deal] = await db.select().from(investorWantedDeals).where(eq(investorWantedDeals.id, id));
    return deal;
  }

  async updateInvestorWantedDeal(id: number, data: Partial<InsertInvestorWantedDeal>): Promise<InvestorWantedDeal | undefined> {
    const [updated] = await db.update(investorWantedDeals)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(investorWantedDeals.id, id))
      .returning();
    return updated;
  }

  async deleteInvestorWantedDeal(id: number): Promise<void> {
    await db.delete(investorWantedDeals).where(eq(investorWantedDeals.id, id));
  }

  // User Reviews
  async createUserReview(review: InsertUserReview): Promise<UserReview> {
    const [created] = await db.insert(userReviews).values(review).returning();
    return created;
  }

  async getUserReviews(revieweeId: string): Promise<UserReview[]> {
    return db.select().from(userReviews)
      .where(eq(userReviews.revieweeId, revieweeId))
      .orderBy(desc(userReviews.createdAt));
  }

  async getReviewsByReviewer(reviewerId: string): Promise<UserReview[]> {
    return db.select().from(userReviews)
      .where(eq(userReviews.reviewerId, reviewerId))
      .orderBy(desc(userReviews.createdAt));
  }

  async getUserReview(id: number): Promise<UserReview | undefined> {
    const [review] = await db.select().from(userReviews).where(eq(userReviews.id, id));
    return review;
  }

  async respondToReview(id: number, response: string): Promise<UserReview | undefined> {
    const [updated] = await db.update(userReviews)
      .set({ response, responseAt: new Date(), updatedAt: new Date() })
      .where(eq(userReviews.id, id))
      .returning();
    return updated;
  }

  // User Stats
  async getUserStats(userId: string): Promise<UserStats | undefined> {
    const [stats] = await db.select().from(userStats).where(eq(userStats.userId, userId));
    return stats;
  }

  async updateUserStats(userId: string, data: Partial<UserStats>): Promise<UserStats> {
    const existing = await this.getUserStats(userId);
    if (existing) {
      const [updated] = await db.update(userStats)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(userStats.userId, userId))
        .returning();
      return updated;
    } else {
      const [created] = await db.insert(userStats)
        .values({ userId, ...data } as any)
        .returning();
      return created;
    }
  }

  async getUserActivity(userId: string): Promise<{ id: number; type: string; title: string; description: string; amount?: number; createdAt: Date }[]> {
    const activities: { id: number; type: string; title: string; description: string; amount?: number; createdAt: Date }[] = [];
    
    const reviewsGiven = await db.select().from(userReviews)
      .where(eq(userReviews.reviewerId, userId))
      .orderBy(desc(userReviews.createdAt))
      .limit(5);
    for (const review of reviewsGiven) {
      activities.push({
        id: review.id * 100,
        type: "review_given",
        title: "Gave a Review",
        description: review.title || "Review submitted",
        createdAt: review.createdAt,
      });
    }
    
    const reviewsReceived = await db.select().from(userReviews)
      .where(eq(userReviews.revieweeId, userId))
      .orderBy(desc(userReviews.createdAt))
      .limit(5);
    for (const review of reviewsReceived) {
      activities.push({
        id: review.id * 100 + 1,
        type: "review_received",
        title: "Received a Review",
        description: review.title || "Review received",
        createdAt: review.createdAt,
      });
    }
    
    const deals = await db.select().from(wholesaleDeals)
      .where(eq(wholesaleDeals.submittedBy, userId))
      .orderBy(desc(wholesaleDeals.createdAt))
      .limit(5);
    for (const deal of deals) {
      activities.push({
        id: deal.id * 100 + 2,
        type: "deal_submitted",
        title: "Deal Submitted",
        description: deal.address || "Wholesale deal submitted",
        amount: deal.askingPrice || undefined,
        createdAt: deal.createdAt || new Date(),
      });
    }
    
    const negotiations = await db.select().from(dealNegotiations)
      .where(eq(dealNegotiations.initiatorId, userId))
      .orderBy(desc(dealNegotiations.createdAt))
      .limit(5);
    for (const neg of negotiations) {
      activities.push({
        id: neg.id * 100 + 3,
        type: "offer_made",
        title: "Offer Made",
        description: `${neg.structureType} offer on ${neg.dealType}`,
        amount: neg.proposedAmount || undefined,
        createdAt: neg.createdAt,
      });
    }
    
    activities.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    return activities.slice(0, 20);
  }

  // Deal Negotiations
  async createDealNegotiation(negotiation: InsertDealNegotiation): Promise<DealNegotiation> {
    const [created] = await db.insert(dealNegotiations).values(negotiation).returning();
    return created;
  }

  async getDealNegotiations(dealType: string, dealId: number): Promise<DealNegotiation[]> {
    return db.select().from(dealNegotiations)
      .where(and(
        eq(dealNegotiations.dealType, dealType),
        eq(dealNegotiations.dealId, dealId)
      ))
      .orderBy(desc(dealNegotiations.createdAt));
  }

  async getNegotiationsByUser(userId: string): Promise<DealNegotiation[]> {
    return db.select().from(dealNegotiations)
      .where(or(
        eq(dealNegotiations.initiatorId, userId),
        eq(dealNegotiations.responderId, userId)
      ))
      .orderBy(desc(dealNegotiations.createdAt));
  }

  async getDealNegotiation(id: number): Promise<DealNegotiation | undefined> {
    const [negotiation] = await db.select().from(dealNegotiations).where(eq(dealNegotiations.id, id));
    return negotiation;
  }

  async getNegotiationThread(negotiationId: number): Promise<DealNegotiation[]> {
    const negotiation = await this.getDealNegotiation(negotiationId);
    if (!negotiation) return [];
    
    const rootId = negotiation.parentNegotiationId || negotiation.id;
    
    return db.select().from(dealNegotiations)
      .where(or(
        eq(dealNegotiations.id, rootId),
        eq(dealNegotiations.parentNegotiationId, rootId)
      ))
      .orderBy(dealNegotiations.createdAt);
  }

  async updateNegotiationStatus(id: number, status: string): Promise<DealNegotiation | undefined> {
    const [updated] = await db.update(dealNegotiations)
      .set({ status, respondedAt: new Date() })
      .where(eq(dealNegotiations.id, id))
      .returning();
    return updated;
  }

  // Wholesale Deal Documents
  async createWholesaleDealDocument(doc: InsertWholesaleDealDocument): Promise<WholesaleDealDocument> {
    const [created] = await db.insert(wholesaleDealDocuments).values(doc).returning();
    return created;
  }

  async getWholesaleDealDocuments(dealId: number): Promise<WholesaleDealDocument[]> {
    return db.select().from(wholesaleDealDocuments)
      .where(eq(wholesaleDealDocuments.dealId, dealId))
      .orderBy(wholesaleDealDocuments.createdAt);
  }

  async deleteWholesaleDealDocument(id: number): Promise<void> {
    await db.delete(wholesaleDealDocuments).where(eq(wholesaleDealDocuments.id, id));
  }

  // Deal Analyzer Results
  async createDealAnalyzerResult(result: InsertDealAnalyzerResult): Promise<DealAnalyzerResult> {
    const [created] = await db.insert(dealAnalyzerResults).values(result).returning();
    return created;
  }

  async getDealAnalyzerResults(userId: string): Promise<DealAnalyzerResult[]> {
    return db.select().from(dealAnalyzerResults)
      .where(eq(dealAnalyzerResults.userId, userId))
      .orderBy(desc(dealAnalyzerResults.createdAt));
  }

  async getDealAnalyzerResult(id: number): Promise<DealAnalyzerResult | undefined> {
    const [result] = await db.select().from(dealAnalyzerResults).where(eq(dealAnalyzerResults.id, id));
    return result;
  }

  async deleteDealAnalyzerResult(id: number): Promise<void> {
    await db.delete(dealAnalyzerResults).where(eq(dealAnalyzerResults.id, id));
  }

  // Deal Messages (Chat)
  async createDealMessage(message: InsertDealMessage): Promise<DealMessage> {
    const [created] = await db.insert(dealMessages).values(message).returning();
    return created;
  }

  async getDealMessages(dealType: string, dealId: number): Promise<DealMessage[]> {
    return db.select().from(dealMessages)
      .where(and(
        eq(dealMessages.dealType, dealType),
        eq(dealMessages.dealId, dealId)
      ))
      .orderBy(asc(dealMessages.createdAt));
  }

  async markDealMessagesRead(dealType: string, dealId: number, userId: string): Promise<void> {
    await db.update(dealMessages)
      .set({ isRead: true, readAt: new Date() })
      .where(and(
        eq(dealMessages.dealType, dealType),
        eq(dealMessages.dealId, dealId),
        ne(dealMessages.senderId, userId),
        eq(dealMessages.isRead, false)
      ));
  }

  async getUnreadDealMessageCount(dealType: string, dealId: number, userId: string): Promise<number> {
    const result = await db.select({ count: sql<number>`count(*)` })
      .from(dealMessages)
      .where(and(
        eq(dealMessages.dealType, dealType),
        eq(dealMessages.dealId, dealId),
        ne(dealMessages.senderId, userId),
        eq(dealMessages.isRead, false)
      ));
    return result[0]?.count || 0;
  }

  // ============================================
  // UNIFIED LEADS
  // ============================================
  
  async createLead(lead: InsertLead): Promise<Lead> {
    const [created] = await db.insert(leads).values(lead).returning();
    return created;
  }

  async getLeads(filters?: { leadType?: string; stage?: string; assignedTo?: string }): Promise<Lead[]> {
    let query = db.select().from(leads);
    const conditions = [];
    
    if (filters?.leadType) {
      conditions.push(eq(leads.leadType, filters.leadType));
    }
    if (filters?.stage) {
      conditions.push(eq(leads.stage, filters.stage));
    }
    if (filters?.assignedTo) {
      conditions.push(eq(leads.assignedTo, filters.assignedTo));
    }
    
    if (conditions.length > 0) {
      return db.select().from(leads).where(and(...conditions)).orderBy(desc(leads.createdAt));
    }
    return db.select().from(leads).orderBy(desc(leads.createdAt));
  }

  async getLead(id: number): Promise<Lead | undefined> {
    const [lead] = await db.select().from(leads).where(eq(leads.id, id));
    return lead;
  }

  async updateLead(id: number, data: Partial<InsertLead>): Promise<Lead | undefined> {
    const [updated] = await db.update(leads)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(leads.id, id))
      .returning();
    return updated;
  }

  async updateLeadStage(id: number, stage: string): Promise<Lead | undefined> {
    const [updated] = await db.update(leads)
      .set({ stage, updatedAt: new Date() })
      .where(eq(leads.id, id))
      .returning();
    return updated;
  }

  async assignLead(id: number, assignedTo: string): Promise<Lead | undefined> {
    const [updated] = await db.update(leads)
      .set({ assignedTo, assignedAt: new Date(), updatedAt: new Date() })
      .where(eq(leads.id, id))
      .returning();
    return updated;
  }

  // ============================================
  // PEGGY AI CONVERSATIONS
  // ============================================
  
  async createPeggyConversation(conversation: InsertPeggyConversation): Promise<PeggyConversation> {
    const [created] = await db.insert(peggyConversations).values(conversation).returning();
    return created;
  }

  async getPeggyConversations(userId?: string, sessionId?: string): Promise<PeggyConversation[]> {
    if (userId) {
      return db.select().from(peggyConversations)
        .where(eq(peggyConversations.userId, userId))
        .orderBy(desc(peggyConversations.updatedAt));
    }
    if (sessionId) {
      return db.select().from(peggyConversations)
        .where(eq(peggyConversations.sessionId, sessionId))
        .orderBy(desc(peggyConversations.updatedAt));
    }
    return [];
  }

  async getPeggyConversation(id: number): Promise<PeggyConversation | undefined> {
    const [conversation] = await db.select().from(peggyConversations).where(eq(peggyConversations.id, id));
    return conversation;
  }

  async updatePeggyConversation(id: number, data: Partial<InsertPeggyConversation>): Promise<PeggyConversation | undefined> {
    const [updated] = await db.update(peggyConversations)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(peggyConversations.id, id))
      .returning();
    return updated;
  }

  // ============================================
  // PEGGY AI MESSAGES
  // ============================================
  
  async createPeggyMessage(message: InsertPeggyMessage): Promise<PeggyMessage> {
    const [created] = await db.insert(peggyMessages).values(message).returning();
    
    // Update conversation message count and last message time
    await db.update(peggyConversations)
      .set({ 
        messageCount: sql`${peggyConversations.messageCount} + 1`,
        lastMessageAt: new Date(),
        updatedAt: new Date()
      })
      .where(eq(peggyConversations.id, message.conversationId));
    
    return created;
  }

  async getPeggyMessages(conversationId: number): Promise<PeggyMessage[]> {
    return db.select().from(peggyMessages)
      .where(eq(peggyMessages.conversationId, conversationId))
      .orderBy(asc(peggyMessages.createdAt));
  }

  async updatePeggyMessageFeedback(id: number, feedback: string, feedbackNotes?: string): Promise<PeggyMessage | undefined> {
    const [updated] = await db.update(peggyMessages)
      .set({ feedback, feedbackNotes })
      .where(eq(peggyMessages.id, id))
      .returning();
    return updated;
  }

  // ============================================
  // SAVED ANALYSES (CALCULATORS)
  // ============================================
  
  async createSavedAnalysis(analysis: InsertSavedAnalysis): Promise<SavedAnalysis> {
    const [created] = await db.insert(savedAnalyses).values(analysis).returning();
    return created;
  }

  async getSavedAnalyses(userId: string, calculatorType?: string): Promise<SavedAnalysis[]> {
    if (calculatorType) {
      return db.select().from(savedAnalyses)
        .where(and(
          eq(savedAnalyses.userId, userId),
          eq(savedAnalyses.calculatorType, calculatorType)
        ))
        .orderBy(desc(savedAnalyses.updatedAt));
    }
    return db.select().from(savedAnalyses)
      .where(eq(savedAnalyses.userId, userId))
      .orderBy(desc(savedAnalyses.updatedAt));
  }

  async getSavedAnalysis(id: number): Promise<SavedAnalysis | undefined> {
    const [analysis] = await db.select().from(savedAnalyses).where(eq(savedAnalyses.id, id));
    return analysis;
  }

  async getSavedAnalysisByShareToken(shareToken: string): Promise<SavedAnalysis | undefined> {
    const [analysis] = await db.select().from(savedAnalyses)
      .where(and(
        eq(savedAnalyses.shareToken, shareToken),
        eq(savedAnalyses.isShared, true)
      ));
    if (analysis) {
      // Increment view count
      await db.update(savedAnalyses)
        .set({ viewCount: sql`${savedAnalyses.viewCount} + 1` })
        .where(eq(savedAnalyses.id, analysis.id));
    }
    return analysis;
  }

  async updateSavedAnalysis(id: number, data: Partial<InsertSavedAnalysis>): Promise<SavedAnalysis | undefined> {
    const [updated] = await db.update(savedAnalyses)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(savedAnalyses.id, id))
      .returning();
    return updated;
  }

  async deleteSavedAnalysis(id: number): Promise<void> {
    await db.delete(savedAnalyses).where(eq(savedAnalyses.id, id));
  }

  // ============================================
  // WHOLESALE DEAL OFFERS
  // ============================================
  
  async createWholesaleDealOffer(offer: InsertWholesaleDealOffer): Promise<WholesaleDealOffer> {
    const [created] = await db.insert(wholesaleDealOffers).values(offer).returning();
    return created;
  }

  async getWholesaleDealOffers(dealId: number): Promise<WholesaleDealOffer[]> {
    return db.select().from(wholesaleDealOffers)
      .where(eq(wholesaleDealOffers.dealId, dealId))
      .orderBy(desc(wholesaleDealOffers.createdAt));
  }

  async getWholesaleDealOffersByBuyer(buyerId: string): Promise<WholesaleDealOffer[]> {
    return db.select().from(wholesaleDealOffers)
      .where(eq(wholesaleDealOffers.buyerId, buyerId))
      .orderBy(desc(wholesaleDealOffers.createdAt));
  }

  async getWholesaleDealOffer(id: number): Promise<WholesaleDealOffer | undefined> {
    const [offer] = await db.select().from(wholesaleDealOffers).where(eq(wholesaleDealOffers.id, id));
    return offer;
  }

  async updateWholesaleDealOfferStatus(id: number, status: string): Promise<WholesaleDealOffer | undefined> {
    const [updated] = await db.update(wholesaleDealOffers)
      .set({ status, updatedAt: new Date() })
      .where(eq(wholesaleDealOffers.id, id))
      .returning();
    return updated;
  }

  async counterWholesaleDealOffer(id: number, counterAmount: number, counterNotes?: string): Promise<WholesaleDealOffer | undefined> {
    const offer = await this.getWholesaleDealOffer(id);
    if (!offer) return undefined;
    
    // Build negotiation history entry
    const historyEntry = {
      action: 'counter',
      amount: counterAmount,
      notes: counterNotes,
      timestamp: new Date().toISOString()
    };
    
    const currentHistory = (offer.negotiationHistory as any[]) || [];
    
    const [updated] = await db.update(wholesaleDealOffers)
      .set({ 
        status: 'countered',
        counterAmount,
        counterNotes,
        counteredAt: new Date(),
        negotiationHistory: [...currentHistory, historyEntry],
        updatedAt: new Date()
      })
      .where(eq(wholesaleDealOffers.id, id))
      .returning();
    return updated;
  }

  // ============================================
  // JV REQUESTS
  // ============================================

  async createJvRequest(request: InsertJVRequest): Promise<JVRequest> {
    const [created] = await db.insert(jvRequests).values({
      ...request,
      status: "pending"
    }).returning();
    return created;
  }

  async getJvRequests(): Promise<JVRequest[]> {
    return db.select().from(jvRequests).orderBy(desc(jvRequests.createdAt));
  }

  async getJvRequestsByDeal(dealId: number): Promise<JVRequest[]> {
    return db.select().from(jvRequests)
      .where(eq(jvRequests.dealId, dealId))
      .orderBy(desc(jvRequests.createdAt));
  }

  async getJvRequestsByDreamscaper(dreamscaperId: string): Promise<JVRequest[]> {
    return db.select().from(jvRequests)
      .where(eq(jvRequests.dreamscaperId, dreamscaperId))
      .orderBy(desc(jvRequests.createdAt));
  }

  async getJvRequestsByWholesaler(wholesalerId: string): Promise<JVRequest[]> {
    return db.select().from(jvRequests)
      .where(eq(jvRequests.wholesalerId, wholesalerId))
      .orderBy(desc(jvRequests.createdAt));
  }

  async getJvRequest(id: number): Promise<JVRequest | undefined> {
    const [request] = await db.select().from(jvRequests).where(eq(jvRequests.id, id));
    return request;
  }

  async updateJvRequestStatus(id: number, status: string): Promise<JVRequest | undefined> {
    const [updated] = await db.update(jvRequests)
      .set({ status, updatedAt: new Date() })
      .where(eq(jvRequests.id, id))
      .returning();
    return updated;
  }
}

export const storage = new DatabaseStorage();
