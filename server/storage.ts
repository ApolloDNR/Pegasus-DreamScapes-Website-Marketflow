import { 
  type SellerLead, 
  type InsertSellerLead,
  type InvestorLead,
  type InsertInvestorLead,
  type Contact,
  type InsertContact
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Seller Leads
  createSellerLead(lead: InsertSellerLead): Promise<SellerLead>;
  getSellerLeads(): Promise<SellerLead[]>;
  getSellerLead(id: string): Promise<SellerLead | undefined>;

  // Investor Leads
  createInvestorLead(lead: InsertInvestorLead): Promise<InvestorLead>;
  getInvestorLeads(): Promise<InvestorLead[]>;
  getInvestorLead(id: string): Promise<InvestorLead | undefined>;

  // Contacts
  createContact(contact: InsertContact): Promise<Contact>;
  getContacts(): Promise<Contact[]>;
  getContact(id: string): Promise<Contact | undefined>;
}

export class MemStorage implements IStorage {
  private sellerLeads: Map<string, SellerLead>;
  private investorLeads: Map<string, InvestorLead>;
  private contacts: Map<string, Contact>;

  constructor() {
    this.sellerLeads = new Map();
    this.investorLeads = new Map();
    this.contacts = new Map();
  }

  // Seller Leads
  async createSellerLead(insertLead: InsertSellerLead): Promise<SellerLead> {
    const id = randomUUID();
    const lead: SellerLead = { 
      ...insertLead, 
      id,
      createdAt: new Date().toISOString()
    };
    this.sellerLeads.set(id, lead);
    return lead;
  }

  async getSellerLeads(): Promise<SellerLead[]> {
    return Array.from(this.sellerLeads.values());
  }

  async getSellerLead(id: string): Promise<SellerLead | undefined> {
    return this.sellerLeads.get(id);
  }

  // Investor Leads
  async createInvestorLead(insertLead: InsertInvestorLead): Promise<InvestorLead> {
    const id = randomUUID();
    const lead: InvestorLead = { 
      ...insertLead, 
      id,
      createdAt: new Date().toISOString()
    };
    this.investorLeads.set(id, lead);
    return lead;
  }

  async getInvestorLeads(): Promise<InvestorLead[]> {
    return Array.from(this.investorLeads.values());
  }

  async getInvestorLead(id: string): Promise<InvestorLead | undefined> {
    return this.investorLeads.get(id);
  }

  // Contacts
  async createContact(insertContact: InsertContact): Promise<Contact> {
    const id = randomUUID();
    const contact: Contact = { 
      ...insertContact, 
      id,
      createdAt: new Date().toISOString()
    };
    this.contacts.set(id, contact);
    return contact;
  }

  async getContacts(): Promise<Contact[]> {
    return Array.from(this.contacts.values());
  }

  async getContact(id: string): Promise<Contact | undefined> {
    return this.contacts.get(id);
  }
}

export const storage = new MemStorage();
