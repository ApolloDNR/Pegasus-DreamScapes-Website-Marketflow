import { db } from "./db";
import { eq, and, desc, lte, isNotNull, asc } from "drizzle-orm";
import { 
  users, sellerLeads, investorLeads, contacts, projects, articles, leadActivities,
  type User, type UpsertUser,
  type SellerLead, type InsertSellerLead,
  type InvestorLead, type InsertInvestorLead,
  type Contact, type InsertContact,
  type Project, type InsertProject,
  type Article, type InsertArticle,
  type LeadActivity, type InsertLeadActivity
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
}

export const storage = new DatabaseStorage();
