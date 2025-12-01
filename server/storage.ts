import { db } from "./db";
import { eq, and, desc } from "drizzle-orm";
import { 
  users, sellerLeads, investorLeads, contacts, projects, articles, leadActivities,
  type User, type InsertUser,
  type SellerLead, type InsertSellerLead,
  type InvestorLead, type InsertInvestorLead,
  type Contact, type InsertContact,
  type Project, type InsertProject,
  type Article, type InsertArticle,
  type LeadActivity, type InsertLeadActivity
} from "@shared/schema";

export interface IStorage {
  // Users
  createUser(user: InsertUser): Promise<User>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserById(id: number): Promise<User | undefined>;

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
}

export class DatabaseStorage implements IStorage {
  // Users
  async createUser(user: InsertUser): Promise<User> {
    const [created] = await db.insert(users).values(user).returning();
    return created;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async getUserById(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
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
}

export const storage = new DatabaseStorage();
