import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertSellerLeadSchema, 
  insertInvestorLeadSchema, 
  insertBuyerLeadSchema,
  insertContactSchema,
  insertProjectSchema,
  insertWholesaleDealSchema,
  insertWholesaleRequestSchema,
  insertRetailListingSchema,
  insertBuyerInquirySchema,
  insertInvestorProfileSchema,
  insertWholesalerProfileSchema,
  insertBuyerProfileSchema,
  insertSavedPropertySchema,
  insertBuyerOfferSchema,
  insertCapitalProjectSchema,
  insertProjectMilestoneSchema,
  insertInvestmentOfferSchema,
  insertCommittedInvestmentSchema,
  insertDealMatchSchema,
  insertAnnouncementSchema,
  insertNotificationSchema,
  insertLeadSchema,
  insertSavedAnalysisSchema,
  insertWholesaleDealOfferSchema,
  STAFF_ROLES
} from "@shared/schema";
import { fromError } from "zod-validation-error";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { supabaseAuthMiddleware, extractSupabaseUser } from "./supabaseAuth";
import { generateTermSheetPDF } from "./term-sheet-generator";
import { generateCalculatorPDF, generateDealPacketPDF } from "./pdf";
import peggy from "./peggy";
import { 
  createUserProfile, 
  createUserReputation, 
  getUserProfile, 
  getUserReputation, 
  getUserBadges,
  updateUserProfile
} from "./lib/supabase";
import { sendSellerLeadNotification, sendInvestorLeadNotification, sendBuyerLeadNotification, sendDealSubmissionNotification } from "./email";
import { supabaseStorage } from "./supabase-storage";

// Middleware to require staff roles for HQ access
const requireStaffRole = async (req: any, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.claims?.sub;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    const hasStaffAccess = await storage.hasAnyStaffRole(userId);
    if (!hasStaffAccess) {
      return res.status(403).json({ message: "Forbidden: Staff access required" });
    }
    
    next();
  } catch (error) {
    console.error("Error checking staff role:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Middleware to require specific roles
const requireRole = (...roles: string[]) => async (req: any, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.claims?.sub;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    const userRoles = await storage.getUserRoles(userId);
    const hasRequiredRole = userRoles.some(r => roles.includes(r.role));
    
    if (!hasRequiredRole) {
      return res.status(403).json({ message: `Forbidden: Required roles: ${roles.join(", ")}` });
    }
    
    next();
  } catch (error) {
    console.error("Error checking role:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const isHybridAuthenticated = async (req: any, res: Response, next: NextFunction) => {
  if (req.user?.claims?.sub) {
    return next();
  }
  
  if (req.supabaseUser) {
    req.user = { claims: req.supabaseUser.claims };
    return next();
  }
  
  const supabaseUser = await extractSupabaseUser(req);
  if (supabaseUser) {
    req.user = { claims: supabaseUser.claims };
    req.supabaseUser = supabaseUser;
    return next();
  }
  
  return res.status(401).json({ message: "Unauthorized" });
};

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  // Setup Replit Auth (legacy - for session-based auth)
  await setupAuth(app);
  
  // Add Supabase auth middleware to extract user from JWT tokens
  app.use(supabaseAuthMiddleware);

  // Public config endpoint - exposes only public/safe configuration
  app.get('/api/config/supabase', (_req, res) => {
    res.json({
      url: process.env.SUPABASE_URL || '',
      anonKey: process.env.SUPABASE_ANON_KEY || ''
    });
  });

  // Google Maps API key for address autocomplete (public key)
  app.get('/api/config/google-maps', (_req, res) => {
    res.json({
      apiKey: process.env.GOOGLE_MAPS_API_KEY || ''
    });
  });

  // Supabase user provisioning (called after signup)
  app.post('/api/supabase/provision-user', async (req, res) => {
    try {
      const { userId, role, displayName } = req.body;
      
      if (!userId || !role || !displayName) {
        return res.status(400).json({ message: 'Missing required fields' });
      }
      
      await createUserProfile(userId, {
        primary_role: role,
        display_name: displayName
      });
      
      await createUserReputation(userId);
      
      res.json({ success: true });
    } catch (error) {
      console.error('Error provisioning user:', error);
      res.status(500).json({ message: 'Failed to provision user' });
    }
  });

  // Get user profile from Supabase
  app.get('/api/supabase/profile/:userId', async (req, res) => {
    try {
      const { userId } = req.params;
      const profile = await getUserProfile(userId);
      
      if (!profile) {
        return res.status(404).json({ message: 'Profile not found' });
      }
      
      res.json(profile);
    } catch (error) {
      console.error('Error fetching profile:', error);
      res.status(500).json({ message: 'Failed to fetch profile' });
    }
  });

  // Update user profile (own profile only)
  app.patch('/api/supabase/profile', isHybridAuthenticated, async (req: any, res) => {
    try {
      const userId = getAuthUserId(req);
      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
      
      const { displayName, companyName, location, bio, avatarUrl } = req.body;
      
      const updates: Record<string, any> = {};
      if (displayName !== undefined) updates.display_name = displayName;
      if (companyName !== undefined) updates.company_name = companyName;
      if (location !== undefined) updates.location = location;
      if (bio !== undefined) updates.bio = bio;
      if (avatarUrl !== undefined) updates.avatar_url = avatarUrl;
      
      const profile = await updateUserProfile(userId, updates);
      res.json(profile);
    } catch (error) {
      console.error('Error updating profile:', error);
      res.status(500).json({ message: 'Failed to update profile' });
    }
  });

  // Admin: Assign/update user role
  app.patch('/api/supabase/assign-role/:userId', isHybridAuthenticated, async (req: any, res) => {
    try {
      const adminUserId = getAuthUserId(req);
      if (!adminUserId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
      
      // Check if requester is admin
      const adminProfile = await getUserProfile(adminUserId);
      if (!adminProfile || adminProfile.primary_role !== 'admin') {
        return res.status(403).json({ message: 'Forbidden: Admin access required' });
      }
      
      const { userId } = req.params;
      const { role, isPegasusBadged, pegasusRoleType } = req.body;
      
      const validRoles = [
        'admin', 'pegasus_wholesaler', 'wholesaler', 
        'pegasus_dreamscaper', 'dreamscaper', 
        'investor', 'buyer_retail', 'buyer_investment'
      ];
      
      if (role && !validRoles.includes(role)) {
        return res.status(400).json({ message: 'Invalid role' });
      }
      
      const updates: Record<string, any> = {};
      if (role) updates.primary_role = role;
      if (isPegasusBadged !== undefined) updates.is_pegasus_badged = isPegasusBadged;
      if (pegasusRoleType !== undefined) updates.pegasus_role_type = pegasusRoleType;
      
      const profile = await updateUserProfile(userId, updates);
      res.json(profile);
    } catch (error) {
      console.error('Error assigning role:', error);
      res.status(500).json({ message: 'Failed to assign role' });
    }
  });

  // Get user reputation from Supabase
  app.get('/api/supabase/reputation/:userId', async (req, res) => {
    try {
      const { userId } = req.params;
      const reputation = await getUserReputation(userId);
      
      if (!reputation) {
        return res.status(404).json({ message: 'Reputation not found' });
      }
      
      res.json(reputation);
    } catch (error) {
      console.error('Error fetching reputation:', error);
      res.status(500).json({ message: 'Failed to fetch reputation' });
    }
  });

  // Get user badges from Supabase
  app.get('/api/supabase/badges/:userId', async (req, res) => {
    try {
      const { userId } = req.params;
      const badges = await getUserBadges(userId);
      res.json(badges);
    } catch (error) {
      console.error('Error fetching badges:', error);
      res.status(500).json({ message: 'Failed to fetch badges' });
    }
  });

  // ========== SUPABASE MARKETPLACE ROUTES ==========
  // These routes use Supabase for data persistence
  // Import case transformation utilities
  const getSupabaseStorage = async () => {
    const module = await import('./supabase-storage');
    return {
      storage: module.supabaseStorage,
      toCamelCase: module.toCamelCase,
      toSnakeCase: module.toSnakeCase
    };
  };

  // Helper to extract authenticated user ID from either Replit or Supabase auth
  const getAuthUserId = (req: any): string | null => {
    // Try Replit Auth first
    if (req.user?.claims?.sub) {
      return req.user.claims.sub;
    }
    // Try Supabase Auth
    if (req.supabaseUser?.id) {
      return req.supabaseUser.id;
    }
    // Check for session-based user
    if (req.session?.user?.id) {
      return req.session.user.id;
    }
    return null;
  };

  // --- Saved Items ---
  app.get('/api/supabase/saved-items', isHybridAuthenticated, async (req: any, res) => {
    try {
      const userId = getAuthUserId(req);
      if (!userId) {
        return res.status(401).json({ message: 'User not authenticated' });
      }
      const { type } = req.query;
      const { storage, toCamelCase } = await getSupabaseStorage();
      const items = await storage.getSavedItems(userId, type as any);
      res.json(toCamelCase(items));
    } catch (error) {
      console.error('Error fetching saved items:', error);
      res.status(500).json({ message: 'Failed to fetch saved items' });
    }
  });

  app.post('/api/supabase/saved-items', isHybridAuthenticated, async (req: any, res) => {
    try {
      const userId = getAuthUserId(req);
      if (!userId) {
        return res.status(401).json({ message: 'User not authenticated' });
      }
      const { itemType, itemId } = req.body;
      
      if (!itemType || !itemId) {
        return res.status(400).json({ message: 'Missing itemType or itemId' });
      }
      
      const { storage, toCamelCase } = await getSupabaseStorage();
      const item = await storage.saveItem(userId, itemType, itemId);
      res.status(201).json(toCamelCase(item));
    } catch (error) {
      console.error('Error saving item:', error);
      res.status(500).json({ message: 'Failed to save item' });
    }
  });

  app.delete('/api/supabase/saved-items', isHybridAuthenticated, async (req: any, res) => {
    try {
      const userId = getAuthUserId(req);
      if (!userId) {
        return res.status(401).json({ message: 'User not authenticated' });
      }
      const { itemType, itemId } = req.body;
      
      if (!itemType || !itemId) {
        return res.status(400).json({ message: 'Missing itemType or itemId' });
      }
      
      const { storage } = await getSupabaseStorage();
      const success = await storage.unsaveItem(userId, itemType, itemId);
      res.json({ success });
    } catch (error) {
      console.error('Error unsaving item:', error);
      res.status(500).json({ message: 'Failed to unsave item' });
    }
  });

  app.get('/api/supabase/saved-items/check', isHybridAuthenticated, async (req: any, res) => {
    try {
      const userId = getAuthUserId(req);
      if (!userId) {
        return res.status(401).json({ message: 'User not authenticated' });
      }
      const { itemType, itemId } = req.query;
      
      if (!itemType || !itemId) {
        return res.status(400).json({ message: 'Missing itemType or itemId' });
      }
      
      const { storage } = await getSupabaseStorage();
      const isSaved = await storage.isItemSaved(userId, itemType as any, itemId as string);
      res.json({ isSaved });
    } catch (error) {
      console.error('Error checking saved status:', error);
      res.status(500).json({ message: 'Failed to check saved status' });
    }
  });

  // --- JV Requests (Supabase) ---
  app.post('/api/supabase/jv-requests', isHybridAuthenticated, async (req: any, res) => {
    try {
      const userId = getAuthUserId(req);
      if (!userId) {
        return res.status(401).json({ message: 'User not authenticated' });
      }
      const { dealId, wholesalerId, strategy, fundingSource, proposedFee, message } = req.body;
      
      if (!dealId || !wholesalerId || !strategy) {
        return res.status(400).json({ message: 'Missing required fields' });
      }
      
      const { storage, toCamelCase } = await getSupabaseStorage();
      const request = await storage.createJVRequest({
        deal_id: dealId,
        requester_id: userId,
        wholesaler_id: wholesalerId,
        strategy,
        funding_source: fundingSource,
        proposed_fee: proposedFee,
        message,
        status: 'pending'
      });
      
      if (request) {
        await storage.createNotification({
          user_id: wholesalerId,
          type: 'jv_request',
          title: 'New JV Request',
          message: `You have a new JV request on your deal`,
          link: `/marketplace/wholesaler/requests`
        });
      }
      
      res.status(201).json(toCamelCase(request));
    } catch (error) {
      console.error('Error creating JV request:', error);
      res.status(500).json({ message: 'Failed to create JV request' });
    }
  });

  app.get('/api/supabase/jv-requests', isHybridAuthenticated, async (req: any, res) => {
    try {
      const userId = getAuthUserId(req);
      if (!userId) {
        return res.status(401).json({ message: 'User not authenticated' });
      }
      const { storage, toCamelCase } = await getSupabaseStorage();
      const requests = await storage.getJVRequestsByUser(userId);
      res.json(toCamelCase(requests));
    } catch (error) {
      console.error('Error fetching JV requests:', error);
      res.status(500).json({ message: 'Failed to fetch JV requests' });
    }
  });

  app.patch('/api/supabase/jv-requests/:id', isHybridAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      
      if (!status) {
        return res.status(400).json({ message: 'Missing status' });
      }
      
      const { storage, toCamelCase } = await getSupabaseStorage();
      const updated = await storage.updateJVRequestStatus(id, status);
      res.json(toCamelCase(updated));
    } catch (error) {
      console.error('Error updating JV request:', error);
      res.status(500).json({ message: 'Failed to update JV request' });
    }
  });

  // --- Capital Projects (Supabase) ---
  app.get('/api/supabase/capital-projects', async (req: any, res) => {
    try {
      const { storage, toCamelCase } = await getSupabaseStorage();
      const projects = await storage.getPublicCapitalProjects();
      res.json(toCamelCase(projects));
    } catch (error) {
      console.error('Error fetching capital projects:', error);
      res.status(500).json({ message: 'Failed to fetch capital projects' });
    }
  });

  app.get('/api/supabase/capital-projects/my', isHybridAuthenticated, async (req: any, res) => {
    try {
      const userId = getAuthUserId(req);
      if (!userId) {
        return res.status(401).json({ message: 'User not authenticated' });
      }
      const { storage, toCamelCase } = await getSupabaseStorage();
      const projects = await storage.getCapitalProjectsByUser(userId);
      res.json(toCamelCase(projects));
    } catch (error) {
      console.error('Error fetching user projects:', error);
      res.status(500).json({ message: 'Failed to fetch user projects' });
    }
  });

  app.get('/api/supabase/capital-projects/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const { storage, toCamelCase } = await getSupabaseStorage();
      const project = await storage.getCapitalProject(id);
      
      if (!project) {
        return res.status(404).json({ message: 'Project not found' });
      }
      
      res.json(toCamelCase(project));
    } catch (error) {
      console.error('Error fetching capital project:', error);
      res.status(500).json({ message: 'Failed to fetch capital project' });
    }
  });

  app.post('/api/supabase/capital-projects', isHybridAuthenticated, async (req: any, res) => {
    try {
      const userId = getAuthUserId(req);
      if (!userId) {
        return res.status(401).json({ message: 'User not authenticated' });
      }
      const { storage, toCamelCase, toSnakeCase } = await getSupabaseStorage();
      const projectData = toSnakeCase(req.body);
      
      const project = await storage.createCapitalProject({
        ...projectData,
        owner_id: userId
      });
      
      res.status(201).json(toCamelCase(project));
    } catch (error) {
      console.error('Error creating capital project:', error);
      res.status(500).json({ message: 'Failed to create capital project' });
    }
  });

  // --- Capital Commitments (Supabase) ---
  app.post('/api/supabase/capital-commitments', isHybridAuthenticated, async (req: any, res) => {
    try {
      const userId = getAuthUserId(req);
      if (!userId) {
        return res.status(401).json({ message: 'User not authenticated' });
      }
      const { projectId, amount, structurePreference, notes } = req.body;
      
      if (!projectId || !amount) {
        return res.status(400).json({ message: 'Missing projectId or amount' });
      }
      
      const { storage, toCamelCase } = await getSupabaseStorage();
      
      const project = await storage.getCapitalProject(projectId);
      if (!project) {
        return res.status(404).json({ message: 'Project not found' });
      }
      
      const commitment = await storage.createCapitalCommitment({
        project_id: projectId,
        investor_id: userId,
        amount,
        structure_preference: structurePreference,
        notes,
        status: 'pending'
      });
      
      if (commitment) {
        await storage.createNotification({
          user_id: project.owner_id,
          type: 'capital_commitment',
          title: 'New Investment Commitment',
          message: `An investor has committed $${amount.toLocaleString()} to your project`,
          link: `/marketplace/dreamscaper/projects/${projectId}`
        });
      }
      
      res.status(201).json(toCamelCase(commitment));
    } catch (error) {
      console.error('Error creating capital commitment:', error);
      res.status(500).json({ message: 'Failed to create commitment' });
    }
  });

  app.get('/api/supabase/capital-commitments', isHybridAuthenticated, async (req: any, res) => {
    try {
      const userId = getAuthUserId(req);
      if (!userId) {
        return res.status(401).json({ message: 'User not authenticated' });
      }
      const { storage, toCamelCase } = await getSupabaseStorage();
      const commitments = await storage.getCapitalCommitmentsByUser(userId);
      res.json(toCamelCase(commitments));
    } catch (error) {
      console.error('Error fetching commitments:', error);
      res.status(500).json({ message: 'Failed to fetch commitments' });
    }
  });

  app.get('/api/supabase/capital-projects/:id/commitments', async (req, res) => {
    try {
      const { id } = req.params;
      const { storage, toCamelCase } = await getSupabaseStorage();
      const commitments = await storage.getCapitalCommitmentsByProject(id);
      res.json(toCamelCase(commitments));
    } catch (error) {
      console.error('Error fetching project commitments:', error);
      res.status(500).json({ message: 'Failed to fetch commitments' });
    }
  });

  // --- Wholesale Deals (Supabase) ---
  app.get('/api/supabase/wholesale-deals', async (req: any, res) => {
    try {
      const { storage, toCamelCase } = await getSupabaseStorage();
      const deals = await storage.getPublicWholesaleDeals();
      res.json(toCamelCase(deals));
    } catch (error) {
      console.error('Error fetching wholesale deals:', error);
      res.status(500).json({ message: 'Failed to fetch wholesale deals' });
    }
  });

  app.get('/api/supabase/wholesale-deals/my', isHybridAuthenticated, async (req: any, res) => {
    try {
      const userId = getAuthUserId(req);
      if (!userId) {
        return res.status(401).json({ message: 'User not authenticated' });
      }
      const { storage, toCamelCase } = await getSupabaseStorage();
      const deals = await storage.getWholesaleDealsByUser(userId);
      res.json(toCamelCase(deals));
    } catch (error) {
      console.error('Error fetching user deals:', error);
      res.status(500).json({ message: 'Failed to fetch user deals' });
    }
  });

  app.get('/api/supabase/wholesale-deals/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const { storage, toCamelCase } = await getSupabaseStorage();
      const deal = await storage.getWholesaleDeal(id);
      
      if (!deal) {
        return res.status(404).json({ message: 'Deal not found' });
      }
      
      res.json(toCamelCase(deal));
    } catch (error) {
      console.error('Error fetching wholesale deal:', error);
      res.status(500).json({ message: 'Failed to fetch wholesale deal' });
    }
  });

  app.post('/api/supabase/wholesale-deals', isHybridAuthenticated, async (req: any, res) => {
    try {
      const userId = getAuthUserId(req);
      if (!userId) {
        return res.status(401).json({ message: 'User not authenticated' });
      }
      const { storage, toCamelCase, toSnakeCase } = await getSupabaseStorage();
      const dealData = toSnakeCase(req.body);
      
      const deal = await storage.createWholesaleDeal({
        ...dealData,
        wholesaler_id: userId,
        status: 'Under Review',
        is_public: false,
        raising_capital: false
      });
      
      res.status(201).json(toCamelCase(deal));
    } catch (error) {
      console.error('Error creating wholesale deal:', error);
      res.status(500).json({ message: 'Failed to create wholesale deal' });
    }
  });

  // --- Listings (Supabase) ---
  app.get('/api/supabase/listings', async (req: any, res) => {
    try {
      const { storage, toCamelCase } = await getSupabaseStorage();
      const listings = await storage.getPublicListings();
      res.json(toCamelCase(listings));
    } catch (error) {
      console.error('Error fetching listings:', error);
      res.status(500).json({ message: 'Failed to fetch listings' });
    }
  });

  app.get('/api/supabase/listings/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const { storage, toCamelCase } = await getSupabaseStorage();
      const listing = await storage.getListing(id);
      
      if (!listing) {
        return res.status(404).json({ message: 'Listing not found' });
      }
      
      res.json(toCamelCase(listing));
    } catch (error) {
      console.error('Error fetching listing:', error);
      res.status(500).json({ message: 'Failed to fetch listing' });
    }
  });

  // --- Buyer Offers (Supabase) ---
  app.post('/api/supabase/buyer-offers', isHybridAuthenticated, async (req: any, res) => {
    try {
      const userId = getAuthUserId(req);
      if (!userId) {
        return res.status(401).json({ message: 'User not authenticated' });
      }
      const { listingId, offerAmount, financingType, contingencies, message } = req.body;
      
      if (!listingId || !offerAmount) {
        return res.status(400).json({ message: 'Missing listingId or offerAmount' });
      }
      
      const { storage, toCamelCase } = await getSupabaseStorage();
      
      const listing = await storage.getListing(listingId);
      if (!listing) {
        return res.status(404).json({ message: 'Listing not found' });
      }
      
      const offer = await storage.createBuyerOffer({
        listing_id: listingId,
        buyer_id: userId,
        offer_amount: offerAmount,
        financing_type: financingType,
        contingencies,
        message,
        status: 'pending'
      });
      
      if (offer && listing.owner_id) {
        await storage.createNotification({
          user_id: listing.owner_id,
          type: 'buyer_offer',
          title: 'New Offer Received',
          message: `You received an offer of $${offerAmount.toLocaleString()} on your listing`,
          link: `/marketplace/listings/${listingId}`
        });
      }
      
      res.status(201).json(toCamelCase(offer));
    } catch (error) {
      console.error('Error creating buyer offer:', error);
      res.status(500).json({ message: 'Failed to create offer' });
    }
  });

  app.get('/api/supabase/buyer-offers', isHybridAuthenticated, async (req: any, res) => {
    try {
      const userId = getAuthUserId(req);
      if (!userId) {
        return res.status(401).json({ message: 'User not authenticated' });
      }
      const { storage, toCamelCase } = await getSupabaseStorage();
      const offers = await storage.getBuyerOffersByUser(userId);
      res.json(toCamelCase(offers));
    } catch (error) {
      console.error('Error fetching buyer offers:', error);
      res.status(500).json({ message: 'Failed to fetch offers' });
    }
  });

  // --- Notifications (Supabase) ---
  app.get('/api/supabase/notifications', isHybridAuthenticated, async (req: any, res) => {
    try {
      const userId = getAuthUserId(req);
      if (!userId) {
        return res.status(401).json({ message: 'User not authenticated' });
      }
      const { unreadOnly } = req.query;
      const { storage, toCamelCase } = await getSupabaseStorage();
      const notifications = await storage.getNotifications(userId, unreadOnly === 'true');
      res.json(toCamelCase(notifications));
    } catch (error) {
      console.error('Error fetching notifications:', error);
      res.status(500).json({ message: 'Failed to fetch notifications' });
    }
  });

  app.patch('/api/supabase/notifications/:id/read', isHybridAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const { storage } = await getSupabaseStorage();
      const success = await storage.markNotificationRead(id);
      res.json({ success });
    } catch (error) {
      console.error('Error marking notification read:', error);
      res.status(500).json({ message: 'Failed to mark notification read' });
    }
  });

  app.post('/api/supabase/notifications/mark-all-read', isHybridAuthenticated, async (req: any, res) => {
    try {
      const userId = getAuthUserId(req);
      if (!userId) {
        return res.status(401).json({ message: 'User not authenticated' });
      }
      const { storage } = await getSupabaseStorage();
      const success = await storage.markAllNotificationsRead(userId);
      res.json({ success });
    } catch (error) {
      console.error('Error marking all notifications read:', error);
      res.status(500).json({ message: 'Failed to mark notifications read' });
    }
  });

  // Auth routes
  app.get('/api/auth/user', isHybridAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      const supabaseProfile = await getUserProfile(userId);
      
      if (supabaseProfile) {
        const role = supabaseProfile.primary_role;
        const isPegasus = supabaseProfile.is_pegasus_badged || role?.startsWith('pegasus_');
        
        return res.json({
          id: userId,
          email: req.user.claims.email || supabaseProfile.display_name,
          firstName: supabaseProfile.display_name?.split(' ')[0] || '',
          lastName: supabaseProfile.display_name?.split(' ').slice(1).join(' ') || '',
          profileImageUrl: supabaseProfile.avatar_url,
          displayName: supabaseProfile.display_name,
          primaryRole: role,
          isPegasusBadged: isPegasus,
          roles: [role],
          isStaff: role === 'admin' || isPegasus,
          isInvestor: role === 'investor',
          isWholesaler: role === 'wholesaler' || role === 'pegasus_wholesaler',
          isBuyer: role === 'buyer_retail' || role === 'buyer_investment',
          isDreamscaper: role === 'dreamscaper' || role === 'pegasus_dreamscaper',
          supabaseAuth: true
        });
      }
      
      const user = await storage.getUser(userId);
      const roles = await storage.getUserRoles(userId);
      const roleNames = roles.map(r => r.role);
      const isStaff = roleNames.some(r => STAFF_ROLES.includes(r as any));
      const isDreamscaper = roleNames.includes("dreamscaper") || roleNames.includes("operator");
      
      res.json({ 
        ...user, 
        roles: roleNames,
        isStaff,
        isInvestor: roleNames.includes("investor"),
        isWholesaler: roleNames.includes("wholesaler"),
        isBuyer: roleNames.includes("buyer"),
        isDreamscaper,
        supabaseAuth: false
      });
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Dealflow stats route for authenticated users
  app.get('/api/dealflow/stats', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      // Get user's saved deals (liked)
      const savedDeals = await storage.getUserLikedDeals(userId);
      
      // Get all wholesale deals to count active ones
      const allDeals = await storage.getWholesaleDeals();
      const activeDeals = allDeals.filter((d: any) => d.status === 'available').length;
      
      // Get all saved deals (not passed)
      const allSaved = await storage.getUserSavedDeals(userId);
      
      res.json({
        savedDeals: savedDeals.length,
        activeDeals,
        pendingDeals: allSaved.filter((b: any) => b.action === 'save').length,
        matchScore: 87 // Placeholder for AI matching score
      });
    } catch (error) {
      console.error("Error fetching dealflow stats:", error);
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  // Portal registration routes - investors and wholesalers can register
  app.post('/api/portal/investor/register', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const result = insertInvestorProfileSchema.safeParse({ ...req.body, userId });
      if (!result.success) {
        return res.status(400).json({ message: fromError(result.error).toString() });
      }
      
      // Create investor profile
      const profile = await storage.upsertInvestorProfile(result.data);
      
      // Add investor role if not exists
      const hasRole = await storage.hasRole(userId, "investor");
      if (!hasRole) {
        await storage.addUserRole({ userId, role: "investor" });
      }
      
      return res.status(201).json(profile);
    } catch (error) {
      console.error("Error creating investor profile:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post('/api/portal/wholesaler/register', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const result = insertWholesalerProfileSchema.safeParse({ ...req.body, userId });
      if (!result.success) {
        return res.status(400).json({ message: fromError(result.error).toString() });
      }
      
      // Create wholesaler profile
      const profile = await storage.upsertWholesalerProfile(result.data);
      
      // Add wholesaler role if not exists
      const hasRole = await storage.hasRole(userId, "wholesaler");
      if (!hasRole) {
        await storage.addUserRole({ userId, role: "wholesaler" });
      }
      
      return res.status(201).json(profile);
    } catch (error) {
      console.error("Error creating wholesaler profile:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post('/api/portal/buyer/register', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const result = insertBuyerProfileSchema.safeParse({ ...req.body, userId });
      if (!result.success) {
        return res.status(400).json({ message: fromError(result.error).toString() });
      }
      
      // Create buyer profile
      const profile = await storage.upsertBuyerProfile(result.data);
      
      // Add buyer role if not exists
      const hasRole = await storage.hasRole(userId, "buyer");
      if (!hasRole) {
        await storage.addUserRole({ userId, role: "buyer" });
      }
      
      return res.status(201).json(profile);
    } catch (error) {
      console.error("Error creating buyer profile:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Portal-specific data routes
  app.get('/api/portal/investor/profile', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const profile = await storage.getInvestorProfile(userId);
      if (!profile) {
        return res.status(404).json({ message: "Profile not found" });
      }
      return res.json(profile);
    } catch (error) {
      console.error("Error fetching investor profile:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Investor portfolio routes
  app.get('/api/portal/investor/my-investments', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const investments = await storage.getCommittedInvestmentsByInvestor(userId);
      return res.json(investments || []);
    } catch (error) {
      console.error("Error fetching investor investments:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get('/api/portal/investor/my-offers', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const offers = await storage.getInvestmentOffersByInvestor(userId);
      return res.json(offers || []);
    } catch (error) {
      console.error("Error fetching investor offers:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get('/api/portal/wholesaler/profile', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const profile = await storage.getWholesalerProfile(userId);
      if (!profile) {
        return res.status(404).json({ message: "Profile not found" });
      }
      return res.json(profile);
    } catch (error) {
      console.error("Error fetching wholesaler profile:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get('/api/portal/wholesaler/my-deals', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const deals = await storage.getWholesaleDealsBySubmitter(userId);
      return res.json(deals);
    } catch (error) {
      console.error("Error fetching wholesaler deals:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get('/api/portal/buyer/profile', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const profile = await storage.getBuyerProfile(userId);
      if (!profile) {
        return res.status(404).json({ message: "Profile not found" });
      }
      return res.json(profile);
    } catch (error) {
      console.error("Error fetching buyer profile:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Saved Properties routes (for buyers)
  app.get('/api/portal/buyer/saved-properties', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const saved = await storage.getSavedProperties(userId);
      return res.json(saved);
    } catch (error) {
      console.error("Error fetching saved properties:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post('/api/portal/buyer/saved-properties', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const result = insertSavedPropertySchema.safeParse({ ...req.body, userId });
      if (!result.success) {
        return res.status(400).json({ message: fromError(result.error).toString() });
      }
      
      // Check if already saved
      const isSaved = await storage.isPropertySaved(userId, result.data.propertyType, result.data.propertyId);
      if (isSaved) {
        return res.status(400).json({ message: "Property already saved" });
      }
      
      const saved = await storage.saveProperty(result.data);
      return res.status(201).json(saved);
    } catch (error) {
      console.error("Error saving property:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.delete('/api/portal/buyer/saved-properties/:propertyType/:propertyId', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { propertyType, propertyId } = req.params;
      await storage.removeSavedProperty(userId, propertyType, parseInt(propertyId));
      return res.status(204).send();
    } catch (error) {
      console.error("Error removing saved property:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Buyer Offers routes
  app.get('/api/portal/buyer/offers', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const offers = await storage.getBuyerOffers(userId);
      return res.json(offers);
    } catch (error) {
      console.error("Error fetching buyer offers:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post('/api/portal/buyer/offers', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const result = insertBuyerOfferSchema.safeParse({ ...req.body, userId });
      if (!result.success) {
        return res.status(400).json({ message: fromError(result.error).toString() });
      }
      
      const offer = await storage.createBuyerOffer(result.data);
      return res.status(201).json(offer);
    } catch (error) {
      console.error("Error creating buyer offer:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Dreamscaper (Operator) Portal Routes
  app.get('/api/portal/dreamscaper/my-projects', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const roles = await storage.getUserRoles(userId);
      const roleNames = roles.map(r => r.role);
      const isDreamscaper = roleNames.includes("dreamscaper") || roleNames.includes("operator");
      
      if (!isDreamscaper) {
        return res.status(403).json({ message: "Not authorized as a Dreamscaper" });
      }
      
      const projects = await storage.getCapitalProjectsByCreator(userId);
      return res.json(projects || []);
    } catch (error) {
      console.error("Error fetching dreamscaper projects:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get('/api/portal/dreamscaper/pending-offers', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const roles = await storage.getUserRoles(userId);
      const roleNames = roles.map(r => r.role);
      const isDreamscaper = roleNames.includes("dreamscaper") || roleNames.includes("operator");
      
      if (!isDreamscaper) {
        return res.status(403).json({ message: "Not authorized as a Dreamscaper" });
      }
      
      const userProjects = await storage.getCapitalProjectsByCreator(userId);
      const projectIds = userProjects.map(p => p.id);
      
      const allOffers = [];
      for (const projectId of projectIds) {
        const offers = await storage.getInvestmentOffersByProject(projectId);
        const pendingOffers = offers.filter(o => o.status === 'PENDING');
        allOffers.push(...pendingOffers);
      }
      
      return res.json(allOffers);
    } catch (error) {
      console.error("Error fetching pending offers:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get('/api/portal/dreamscaper/all-investments', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const roles = await storage.getUserRoles(userId);
      const roleNames = roles.map(r => r.role);
      const isDreamscaper = roleNames.includes("dreamscaper") || roleNames.includes("operator");
      
      if (!isDreamscaper) {
        return res.status(403).json({ message: "Not authorized as a Dreamscaper" });
      }
      
      const userProjects = await storage.getCapitalProjectsByCreator(userId);
      const projectIds = userProjects.map(p => p.id);
      
      const allInvestments = [];
      for (const projectId of projectIds) {
        const investments = await storage.getCommittedInvestmentsByProject(projectId);
        allInvestments.push(...investments);
      }
      
      return res.json(allInvestments);
    } catch (error) {
      console.error("Error fetching all investments:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post('/api/investment-offers/:offerId/accept', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const offerId = parseInt(req.params.offerId);
      
      const offer = await storage.getInvestmentOffer(offerId);
      if (!offer) {
        return res.status(404).json({ message: "Offer not found" });
      }
      
      const project = await storage.getCapitalProject(offer.projectId);
      if (!project || project.createdBy !== userId) {
        return res.status(403).json({ message: "Not authorized to manage this offer" });
      }
      
      const updatedOffer = await storage.updateInvestmentOfferStatus(offerId, 'ACCEPTED');
      
      const committedInvestment = await storage.createCommittedInvestment({
        projectId: offer.projectId,
        investorId: offer.investorId,
        committedAmount: offer.amountOffered,
        structureType: offer.structureType,
        interestRate: offer.requestedInterestRate,
        equityPercent: offer.requestedEquityPercent,
        role: offer.requestedRole,
        status: 'ACTIVE'
      });
      
      await storage.updateCapitalProjectFunding(offer.projectId, offer.amountOffered);
      
      return res.json({ offer: updatedOffer, investment: committedInvestment });
    } catch (error) {
      console.error("Error accepting offer:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post('/api/investment-offers/:offerId/decline', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const offerId = parseInt(req.params.offerId);
      
      const offer = await storage.getInvestmentOffer(offerId);
      if (!offer) {
        return res.status(404).json({ message: "Offer not found" });
      }
      
      const project = await storage.getCapitalProject(offer.projectId);
      if (!project || project.createdBy !== userId) {
        return res.status(403).json({ message: "Not authorized to manage this offer" });
      }
      
      const updatedOffer = await storage.updateInvestmentOfferStatus(offerId, 'DECLINED');
      return res.json(updatedOffer);
    } catch (error) {
      console.error("Error declining offer:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
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

  // Buyer Lead Routes
  app.post("/api/buyer-leads", async (req, res) => {
    try {
      const result = insertBuyerLeadSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ 
          message: fromError(result.error).toString() 
        });
      }
      
      const lead = await storage.createBuyerLead(result.data);
      console.log("New buyer lead received:", lead.email);
      return res.status(201).json(lead);
    } catch (error) {
      console.error("Error creating buyer lead:", error);
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

  // Articles/Resources Routes (public)
  app.get("/api/articles", async (req, res) => {
    try {
      const articlesList = await storage.getPublishedArticles();
      return res.json(articlesList);
    } catch (error) {
      console.error("Error fetching articles:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/articles/:slug", async (req, res) => {
    try {
      const article = await storage.getArticleBySlug(req.params.slug);
      if (!article || !article.published) {
        return res.status(404).json({ message: "Article not found" });
      }
      return res.json(article);
    } catch (error) {
      console.error("Error fetching article:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Protected HQ Routes (require staff role)
  app.get("/api/hq/seller-leads", isAuthenticated, requireStaffRole, async (req, res) => {
    try {
      const leads = await storage.getSellerLeads();
      return res.json(leads);
    } catch (error) {
      console.error("Error fetching seller leads:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/hq/investor-leads", isAuthenticated, requireStaffRole, async (req, res) => {
    try {
      const leads = await storage.getInvestorLeads();
      return res.json(leads);
    } catch (error) {
      console.error("Error fetching investor leads:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/hq/buyer-leads", isAuthenticated, requireStaffRole, async (req, res) => {
    try {
      const leads = await storage.getBuyerLeads();
      return res.json(leads);
    } catch (error) {
      console.error("Error fetching buyer leads:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.patch("/api/hq/buyer-leads/:id/status", isAuthenticated, requireStaffRole, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { status } = req.body;
      const updated = await storage.updateBuyerLeadStatus(id, status);
      if (!updated) {
        return res.status(404).json({ message: "Lead not found" });
      }
      return res.json(updated);
    } catch (error) {
      console.error("Error updating buyer lead status:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/hq/contacts", isAuthenticated, requireStaffRole, async (req, res) => {
    try {
      const contactsList = await storage.getContacts();
      return res.json(contactsList);
    } catch (error) {
      console.error("Error fetching contacts:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.patch("/api/hq/seller-leads/:id/status", isAuthenticated, requireStaffRole, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { status } = req.body;
      const updated = await storage.updateSellerLeadStatus(id, status);
      if (!updated) {
        return res.status(404).json({ message: "Lead not found" });
      }
      return res.json(updated);
    } catch (error) {
      console.error("Error updating seller lead status:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.patch("/api/hq/investor-leads/:id/status", isAuthenticated, requireStaffRole, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { status } = req.body;
      const updated = await storage.updateInvestorLeadStatus(id, status);
      if (!updated) {
        return res.status(404).json({ message: "Lead not found" });
      }
      return res.json(updated);
    } catch (error) {
      console.error("Error updating investor lead status:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.patch("/api/hq/contacts/:id/status", isAuthenticated, requireStaffRole, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { status } = req.body;
      const updated = await storage.updateContactStatus(id, status);
      if (!updated) {
        return res.status(404).json({ message: "Contact not found" });
      }
      return res.json(updated);
    } catch (error) {
      console.error("Error updating contact status:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Lead Activities Routes (for CRM - staff only)
  app.get("/api/hq/activities/:leadType/:leadId", isAuthenticated, requireStaffRole, async (req, res) => {
    try {
      const { leadType, leadId } = req.params;
      const activities = await storage.getLeadActivities(leadType, parseInt(leadId));
      return res.json(activities);
    } catch (error) {
      console.error("Error fetching lead activities:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/hq/activities", isAuthenticated, requireStaffRole, async (req, res) => {
    try {
      const { leadType, leadId, activityType, notes, followUpDate } = req.body;
      const activity = await storage.createLeadActivity({
        leadType,
        leadId: parseInt(leadId),
        activityType,
        notes,
        followUpDate: followUpDate ? new Date(followUpDate) : undefined,
      });
      return res.status(201).json(activity);
    } catch (error) {
      console.error("Error creating lead activity:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.patch("/api/hq/activities/:id/complete", isAuthenticated, requireStaffRole, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updated = await storage.markActivityCompleted(id);
      if (!updated) {
        return res.status(404).json({ message: "Activity not found" });
      }
      return res.json(updated);
    } catch (error) {
      console.error("Error marking activity as completed:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Queue Routes (for work queue/task management - staff only)
  app.get("/api/hq/queue", isAuthenticated, requireStaffRole, async (req, res) => {
    try {
      const queueItems = await storage.getQueueItems();
      return res.json(queueItems);
    } catch (error) {
      console.error("Error fetching queue:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Projects Routes (public)
  app.get("/api/projects", async (req, res) => {
    try {
      const projectsList = await storage.getProjects();
      return res.json(projectsList);
    } catch (error) {
      console.error("Error fetching projects:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/projects/:slug", async (req, res) => {
    try {
      const project = await storage.getProjectBySlug(req.params.slug);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      return res.json(project);
    } catch (error) {
      console.error("Error fetching project:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Wholesale Deals Routes (public - only available deals)
  app.get("/api/wholesale-deals", async (req, res) => {
    try {
      const deals = await storage.getAvailableWholesaleDeals();
      return res.json(deals);
    } catch (error) {
      console.error("Error fetching wholesale deals:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/wholesale-deals-active", async (req, res) => {
    try {
      const deals = await storage.getAvailableWholesaleDeals();
      const activeDeals = deals.filter(d => d.status === "available" || d.status === "ACTIVE");
      return res.json(activeDeals);
    } catch (error) {
      console.error("Error fetching active wholesale deals:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/wholesale-deals/:id", async (req, res) => {
    try {
      const deal = await storage.getWholesaleDeal(parseInt(req.params.id));
      if (!deal || deal.status !== "available") {
        return res.status(404).json({ message: "Deal not found" });
      }
      return res.json(deal);
    } catch (error) {
      console.error("Error fetching wholesale deal:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Wholesale Request (public - investors can request deals)
  app.post("/api/wholesale-requests", async (req, res) => {
    try {
      const result = insertWholesaleRequestSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ 
          message: fromError(result.error).toString() 
        });
      }
      
      const request = await storage.createWholesaleRequest(result.data);
      console.log("New wholesale request received:", request.email);
      return res.status(201).json(request);
    } catch (error) {
      console.error("Error creating wholesale request:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Wholesaler deal submission (authenticated wholesalers)
  app.post("/api/wholesale-deals", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      // Check if user has a wholesaler profile
      const profile = await storage.getWholesalerProfile(userId);
      if (!profile) {
        return res.status(403).json({ message: "Please complete your wholesaler profile first" });
      }
      
      const result = insertWholesaleDealSchema.safeParse({
        ...req.body,
        submittedBy: userId,
        status: "under_review", // All submitted deals start under review
      });
      
      if (!result.success) {
        return res.status(400).json({ 
          message: fromError(result.error).toString() 
        });
      }
      
      const deal = await storage.createWholesaleDeal(result.data);
      console.log("New wholesale deal submitted by wholesaler:", deal.propertyAddress);
      
      // Send email notification (non-blocking)
      sendDealSubmissionNotification({
        propertyAddress: deal.propertyAddress,
        city: deal.city,
        state: deal.state,
        contractPrice: deal.contractPrice,
        assignmentFee: deal.assignmentFee,
        arv: deal.arv || undefined,
        submittedBy: profile.companyName || profile.contactName || userId,
      }).catch(err => console.error('Failed to send deal submission notification:', err));
      
      return res.status(201).json(deal);
    } catch (error) {
      console.error("Error submitting wholesale deal:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Protected HQ Wholesale Routes (staff only)
  app.get("/api/hq/wholesale-deals", isAuthenticated, requireStaffRole, async (req, res) => {
    try {
      const deals = await storage.getWholesaleDeals();
      return res.json(deals);
    } catch (error) {
      console.error("Error fetching all wholesale deals:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/hq/wholesale-deals", isAuthenticated, requireStaffRole, async (req, res) => {
    try {
      const result = insertWholesaleDealSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ 
          message: fromError(result.error).toString() 
        });
      }
      
      const deal = await storage.createWholesaleDeal(result.data);
      console.log("New wholesale deal created:", deal.propertyAddress);
      return res.status(201).json(deal);
    } catch (error) {
      console.error("Error creating wholesale deal:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.patch("/api/hq/wholesale-deals/:id/status", isAuthenticated, requireStaffRole, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { status, notes } = req.body;
      const updated = await storage.updateWholesaleDealStatus(id, status, notes);
      if (!updated) {
        return res.status(404).json({ message: "Deal not found" });
      }
      return res.json(updated);
    } catch (error) {
      console.error("Error updating wholesale deal status:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.patch("/api/hq/wholesale-deals/:id", isAuthenticated, requireStaffRole, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updated = await storage.updateWholesaleDeal(id, req.body);
      if (!updated) {
        return res.status(404).json({ message: "Deal not found" });
      }
      return res.json(updated);
    } catch (error) {
      console.error("Error updating wholesale deal:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/hq/wholesale-requests", isAuthenticated, requireStaffRole, async (req, res) => {
    try {
      const requests = await storage.getWholesaleRequests();
      return res.json(requests);
    } catch (error) {
      console.error("Error fetching wholesale requests:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/hq/wholesale-deals/:id/requests", isAuthenticated, requireStaffRole, async (req, res) => {
    try {
      const dealId = parseInt(req.params.id);
      const requests = await storage.getWholesaleRequestsByDeal(dealId);
      return res.json(requests);
    } catch (error) {
      console.error("Error fetching deal requests:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.patch("/api/hq/wholesale-requests/:id/status", isAuthenticated, requireStaffRole, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { status } = req.body;
      const updated = await storage.updateWholesaleRequestStatus(id, status);
      if (!updated) {
        return res.status(404).json({ message: "Request not found" });
      }
      return res.json(updated);
    } catch (error) {
      console.error("Error updating wholesale request status:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // ============ RETAIL LISTINGS ROUTES ============

  // Public Routes - Active retail listings for buyers
  app.get("/api/retail-listings", async (req, res) => {
    try {
      const listings = await storage.getActiveRetailListings();
      return res.json(listings);
    } catch (error) {
      console.error("Error fetching retail listings:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/retail-listings/:slug", async (req, res) => {
    try {
      const listing = await storage.getRetailListingBySlug(req.params.slug);
      if (!listing || (listing.status !== "active" && listing.status !== "coming_soon")) {
        return res.status(404).json({ message: "Listing not found" });
      }
      return res.json(listing);
    } catch (error) {
      console.error("Error fetching retail listing:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Buyer Inquiries (public)
  app.post("/api/buyer-inquiries", async (req, res) => {
    try {
      const result = insertBuyerInquirySchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: fromError(result.error).toString() });
      }
      
      const inquiry = await storage.createBuyerInquiry(result.data);
      console.log("New buyer inquiry received:", inquiry.email);
      return res.status(201).json(inquiry);
    } catch (error) {
      console.error("Error creating buyer inquiry:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Protected HQ Routes for Retail Listings (staff only)
  app.get("/api/hq/retail-listings", isAuthenticated, requireStaffRole, async (req, res) => {
    try {
      const listings = await storage.getRetailListings();
      return res.json(listings);
    } catch (error) {
      console.error("Error fetching all retail listings:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/hq/retail-listings", isAuthenticated, requireStaffRole, async (req, res) => {
    try {
      const result = insertRetailListingSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: fromError(result.error).toString() });
      }
      
      const listing = await storage.createRetailListing(result.data);
      console.log("New retail listing created:", listing.propertyAddress);
      return res.status(201).json(listing);
    } catch (error) {
      console.error("Error creating retail listing:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.patch("/api/hq/retail-listings/:id", isAuthenticated, requireStaffRole, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updated = await storage.updateRetailListing(id, req.body);
      if (!updated) {
        return res.status(404).json({ message: "Listing not found" });
      }
      return res.json(updated);
    } catch (error) {
      console.error("Error updating retail listing:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.patch("/api/hq/retail-listings/:id/status", isAuthenticated, requireStaffRole, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { status } = req.body;
      const updated = await storage.updateRetailListingStatus(id, status);
      if (!updated) {
        return res.status(404).json({ message: "Listing not found" });
      }
      return res.json(updated);
    } catch (error) {
      console.error("Error updating retail listing status:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Protected HQ Routes for Buyer Inquiries (staff only)
  app.get("/api/hq/buyer-inquiries", isAuthenticated, requireStaffRole, async (req, res) => {
    try {
      const inquiries = await storage.getBuyerInquiries();
      return res.json(inquiries);
    } catch (error) {
      console.error("Error fetching buyer inquiries:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.patch("/api/hq/buyer-inquiries/:id/status", isAuthenticated, requireStaffRole, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { status } = req.body;
      const updated = await storage.updateBuyerInquiryStatus(id, status);
      if (!updated) {
        return res.status(404).json({ message: "Inquiry not found" });
      }
      return res.json(updated);
    } catch (error) {
      console.error("Error updating buyer inquiry status:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // ============ ADMIN ROUTES FOR USER/ROLE MANAGEMENT ============

  // Admin-only routes for managing staff and portal users
  app.get("/api/hq/users/roles", isAuthenticated, requireRole("admin"), async (req, res) => {
    try {
      const allUsers = await storage.getAllStaffProfiles();
      const investors = await storage.getAllInvestorProfiles();
      const wholesalers = await storage.getAllWholesalerProfiles();
      return res.json({ staff: allUsers, investors, wholesalers });
    } catch (error) {
      console.error("Error fetching user profiles:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/hq/investor-profiles", isAuthenticated, requireRole("admin"), async (req, res) => {
    try {
      const profiles = await storage.getAllInvestorProfiles();
      return res.json(profiles);
    } catch (error) {
      console.error("Error fetching investor profiles:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/hq/wholesaler-profiles", isAuthenticated, requireRole("admin"), async (req, res) => {
    try {
      const profiles = await storage.getAllWholesalerProfiles();
      return res.json(profiles);
    } catch (error) {
      console.error("Error fetching wholesaler profiles:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/hq/buyer-profiles", isAuthenticated, requireRole("admin"), async (req, res) => {
    try {
      const profiles = await storage.getAllBuyerProfiles();
      return res.json(profiles);
    } catch (error) {
      console.error("Error fetching buyer profiles:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/hq/users/:userId/roles", isAuthenticated, requireRole("admin"), async (req, res) => {
    try {
      const { userId } = req.params;
      const { role } = req.body;
      
      // Check if role already exists
      const hasRole = await storage.hasRole(userId, role);
      if (hasRole) {
        return res.status(400).json({ message: "User already has this role" });
      }
      
      const userRole = await storage.addUserRole({ userId, role });
      return res.status(201).json(userRole);
    } catch (error) {
      console.error("Error adding user role:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.delete("/api/hq/users/:userId/roles/:role", isAuthenticated, requireRole("admin"), async (req, res) => {
    try {
      const { userId, role } = req.params;
      await storage.removeUserRole(userId, role);
      return res.json({ message: "Role removed successfully" });
    } catch (error) {
      console.error("Error removing user role:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.patch("/api/hq/investors/:userId/approve", isAuthenticated, requireRole("admin"), async (req, res) => {
    try {
      const { userId } = req.params;
      const { isApproved } = req.body;
      const updated = await storage.updateInvestorApproval(userId, isApproved);
      if (!updated) {
        return res.status(404).json({ message: "Investor profile not found" });
      }
      return res.json(updated);
    } catch (error) {
      console.error("Error updating investor approval:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.patch("/api/hq/wholesalers/:userId/approve", isAuthenticated, requireRole("admin"), async (req, res) => {
    try {
      const { userId } = req.params;
      const { isApproved } = req.body;
      const updated = await storage.updateWholesalerApproval(userId, isApproved);
      if (!updated) {
        return res.status(404).json({ message: "Wholesaler profile not found" });
      }
      return res.json(updated);
    } catch (error) {
      console.error("Error updating wholesaler approval:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.patch("/api/hq/buyers/:userId/approve", isAuthenticated, requireRole("admin"), async (req, res) => {
    try {
      const { userId } = req.params;
      const { isApproved } = req.body;
      const updated = await storage.updateBuyerApproval(userId, isApproved);
      if (!updated) {
        return res.status(404).json({ message: "Buyer profile not found" });
      }
      return res.json(updated);
    } catch (error) {
      console.error("Error updating buyer approval:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Check staff access route (for frontend to verify before accessing HQ)
  app.get("/api/auth/check-staff", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const isStaff = await storage.hasAnyStaffRole(userId);
      return res.json({ isStaff });
    } catch (error) {
      console.error("Error checking staff access:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // =====================================================
  // Community Routes
  // =====================================================
  
  // Get all community categories
  app.get("/api/community/categories", async (req, res) => {
    try {
      const categories = await storage.getCommunityCategories();
      return res.json(categories);
    } catch (error) {
      console.error("Error fetching community categories:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get community category by slug
  app.get("/api/community/categories/:slug", async (req, res) => {
    try {
      const { slug } = req.params;
      const category = await storage.getCommunityCategory(slug);
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }
      return res.json(category);
    } catch (error) {
      console.error("Error fetching community category:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Create community category (admin only)
  app.post("/api/community/categories", isAuthenticated, requireRole("admin"), async (req, res) => {
    try {
      const { name, slug, description, icon, color, order } = req.body;
      const category = await storage.createCommunityCategory({ name, slug, description, icon, color, order });
      return res.status(201).json(category);
    } catch (error) {
      console.error("Error creating community category:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get community posts (optionally filtered by category)
  app.get("/api/community/posts", async (req, res) => {
    try {
      const categoryId = req.query.categoryId ? Number(req.query.categoryId) : undefined;
      const posts = await storage.getCommunityPosts(categoryId);
      return res.json(posts);
    } catch (error) {
      console.error("Error fetching community posts:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get single community post
  app.get("/api/community/posts/:id", async (req, res) => {
    try {
      const id = Number(req.params.id);
      const post = await storage.getCommunityPost(id);
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }
      // Increment view count
      await storage.incrementPostViews(id);
      return res.json(post);
    } catch (error) {
      console.error("Error fetching community post:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Create community post (authenticated users only)
  app.post("/api/community/posts", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { categoryId, title, content, isPinned, isLocked } = req.body;
      
      const post = await storage.createCommunityPost({
        categoryId,
        userId,
        title,
        content,
        isPinned: isPinned || false,
        isLocked: isLocked || false
      });
      return res.status(201).json(post);
    } catch (error) {
      console.error("Error creating community post:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Update community post (owner or admin)
  app.patch("/api/community/posts/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const id = Number(req.params.id);
      const post = await storage.getCommunityPost(id);
      
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }
      
      // Check if user is owner or admin
      const userRoles = await storage.getUserRoles(userId);
      const isAdmin = userRoles.some(r => r.role === "admin");
      if (post.userId !== userId && !isAdmin) {
        return res.status(403).json({ message: "Not authorized to edit this post" });
      }
      
      const { title, content, isPinned, isLocked } = req.body;
      const updated = await storage.updateCommunityPost(id, { title, content, isPinned, isLocked });
      return res.json(updated);
    } catch (error) {
      console.error("Error updating community post:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get replies for a post
  app.get("/api/community/posts/:id/replies", async (req, res) => {
    try {
      const postId = Number(req.params.id);
      const replies = await storage.getCommunityReplies(postId);
      return res.json(replies);
    } catch (error) {
      console.error("Error fetching community replies:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Create reply to a post (authenticated users only)
  app.post("/api/community/posts/:id/replies", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const postId = Number(req.params.id);
      const { content } = req.body;
      
      // Check if post exists and isn't locked
      const post = await storage.getCommunityPost(postId);
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }
      if (post.isLocked) {
        return res.status(403).json({ message: "This thread is locked" });
      }
      
      const reply = await storage.createCommunityReply({
        postId,
        userId,
        content
      });
      return res.status(201).json(reply);
    } catch (error) {
      console.error("Error creating community reply:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Social Feed - get all posts across categories
  app.get("/api/community/feed", async (req, res) => {
    try {
      const limit = Number(req.query.limit) || 50;
      const posts = await storage.getSocialFeedPosts(limit);
      return res.json(posts);
    } catch (error) {
      console.error("Error fetching social feed:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Toggle like on a post
  app.post("/api/community/posts/:id/like", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const postId = Number(req.params.id);
      const result = await storage.togglePostLike(postId, userId);
      return res.json(result);
    } catch (error) {
      console.error("Error toggling like:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Check if user has liked a post
  app.get("/api/community/posts/:id/liked", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const postId = Number(req.params.id);
      const liked = await storage.isPostLiked(postId, userId);
      return res.json({ liked });
    } catch (error) {
      console.error("Error checking like:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Toggle bookmark on a post
  app.post("/api/community/posts/:id/bookmark", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const postId = Number(req.params.id);
      const result = await storage.togglePostBookmark(postId, userId);
      return res.json(result);
    } catch (error) {
      console.error("Error toggling bookmark:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Check if user has bookmarked a post
  app.get("/api/community/posts/:id/bookmarked", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const postId = Number(req.params.id);
      const bookmarked = await storage.isPostBookmarked(postId, userId);
      return res.json({ bookmarked });
    } catch (error) {
      console.error("Error checking bookmark:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get user's bookmarked posts
  app.get("/api/community/bookmarks", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const posts = await storage.getUserBookmarks(userId);
      return res.json(posts);
    } catch (error) {
      console.error("Error fetching bookmarks:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // =====================================================
  // Deal Bookmark Routes
  // =====================================================

  // Save/like/pass on a deal
  app.post("/api/deals/action", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { dealType, dealId, action } = req.body;
      
      if (!dealType || !dealId || !action) {
        return res.status(400).json({ message: "Missing required fields" });
      }
      
      const result = await storage.saveDeal(userId, dealType, dealId, action);
      return res.json(result);
    } catch (error) {
      console.error("Error saving deal action:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get user's saved deals
  app.get("/api/deals/saved", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const savedDeals = await storage.getUserSavedDeals(userId);
      
      // Enrich with deal details
      const enrichedDeals = await Promise.all(savedDeals.map(async (bookmark) => {
        if (bookmark.dealType === "capital_project") {
          const project = await storage.getCapitalProject(bookmark.dealId);
          return { ...bookmark, deal: project };
        } else if (bookmark.dealType === "wholesale_deal") {
          const deal = await storage.getWholesaleDeal(bookmark.dealId);
          return { ...bookmark, deal };
        }
        return bookmark;
      }));
      
      return res.json(enrichedDeals);
    } catch (error) {
      console.error("Error fetching saved deals:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get user's liked deals (matches)
  app.get("/api/deals/liked", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const likedDeals = await storage.getUserLikedDeals(userId);
      
      // Enrich with deal details
      const enrichedDeals = await Promise.all(likedDeals.map(async (bookmark) => {
        if (bookmark.dealType === "capital_project") {
          const project = await storage.getCapitalProject(bookmark.dealId);
          return { ...bookmark, deal: project };
        } else if (bookmark.dealType === "wholesale_deal") {
          const deal = await storage.getWholesaleDeal(bookmark.dealId);
          return { ...bookmark, deal };
        }
        return bookmark;
      }));
      
      return res.json(enrichedDeals);
    } catch (error) {
      console.error("Error fetching liked deals:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Remove a saved deal
  app.delete("/api/deals/:dealType/:dealId/saved", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { dealType, dealId } = req.params;
      
      await storage.removeDealBookmark(userId, dealType, Number(dealId));
      return res.json({ success: true });
    } catch (error) {
      console.error("Error removing saved deal:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // =====================================================
  // Direct Messaging Routes
  // =====================================================
  
  // Get user's messages
  app.get("/api/messages", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const messages = await storage.getDirectMessages(userId);
      return res.json(messages);
    } catch (error) {
      console.error("Error fetching messages:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get conversation with another user
  app.get("/api/messages/conversation/:otherUserId", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { otherUserId } = req.params;
      const messages = await storage.getConversation(userId, otherUserId);
      return res.json(messages);
    } catch (error) {
      console.error("Error fetching conversation:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Send a message
  app.post("/api/messages", isAuthenticated, async (req: any, res) => {
    try {
      const senderId = req.user.claims.sub;
      const { receiverId, subject, content, parentId } = req.body;
      
      const message = await storage.createDirectMessage({
        senderId,
        receiverId,
        subject,
        content,
        parentId
      });
      return res.status(201).json(message);
    } catch (error) {
      console.error("Error sending message:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Mark message as read
  app.patch("/api/messages/:id/read", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const id = Number(req.params.id);
      
      // Verify the message belongs to this user
      const messages = await storage.getDirectMessages(userId);
      const message = messages.find(m => m.id === id);
      if (!message || message.receiverId !== userId) {
        return res.status(404).json({ message: "Message not found" });
      }
      
      const updated = await storage.markMessageRead(id);
      return res.json(updated);
    } catch (error) {
      console.error("Error marking message as read:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get unread message count
  app.get("/api/messages/unread-count", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const count = await storage.getUnreadMessageCount(userId);
      return res.json({ count });
    } catch (error) {
      console.error("Error getting unread count:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // =====================================================
  // Capital Projects Routes (Staff only for management)
  // =====================================================
  
  // Get all capital projects
  app.get("/api/capital-projects", async (req, res) => {
    try {
      const projects = await storage.getCapitalProjects();
      return res.json(projects);
    } catch (error) {
      console.error("Error fetching capital projects:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get active capital projects for investors
  app.get("/api/capital-projects/active", async (req, res) => {
    try {
      const projects = await storage.getActiveCapitalProjects();
      return res.json(projects);
    } catch (error) {
      console.error("Error fetching active capital projects:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get single capital project
  app.get("/api/capital-projects/:id", async (req, res) => {
    try {
      const id = Number(req.params.id);
      const project = await storage.getCapitalProject(id);
      if (!project) {
        return res.status(404).json({ message: "Capital project not found" });
      }
      return res.json(project);
    } catch (error) {
      console.error("Error fetching capital project:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get all capital projects (Staff only - for HQ)
  app.get("/api/hq/capital-projects", isAuthenticated, requireStaffRole, async (req: any, res) => {
    try {
      const projects = await storage.getCapitalProjects();
      return res.json(projects);
    } catch (error) {
      console.error("Error fetching capital projects:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get all investment offers (Staff only - for HQ)
  app.get("/api/hq/investment-offers", isAuthenticated, requireStaffRole, async (req: any, res) => {
    try {
      const offers = await storage.getInvestmentOffers();
      return res.json(offers);
    } catch (error) {
      console.error("Error fetching investment offers:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Create capital project (Staff only)
  app.post("/api/hq/capital-projects", isAuthenticated, requireStaffRole, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const result = insertCapitalProjectSchema.safeParse({ ...req.body, createdBy: userId });
      if (!result.success) {
        return res.status(400).json({ message: fromError(result.error).toString() });
      }
      const project = await storage.createCapitalProject(result.data);
      return res.status(201).json(project);
    } catch (error) {
      console.error("Error creating capital project:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Update capital project (Staff only)
  app.patch("/api/hq/capital-projects/:id", isAuthenticated, requireStaffRole, async (req: any, res) => {
    try {
      const id = Number(req.params.id);
      const project = await storage.updateCapitalProject(id, req.body);
      if (!project) {
        return res.status(404).json({ message: "Capital project not found" });
      }
      return res.json(project);
    } catch (error) {
      console.error("Error updating capital project:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // =====================================================
  // Milestones Routes
  // =====================================================
  
  // Get milestones for a capital project
  app.get("/api/capital-projects/:projectId/milestones", async (req, res) => {
    try {
      const projectId = Number(req.params.projectId);
      const milestones = await storage.getProjectMilestones(projectId);
      return res.json(milestones);
    } catch (error) {
      console.error("Error fetching milestones:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Create milestone (Staff only)
  app.post("/api/hq/capital-projects/:projectId/milestones", isAuthenticated, requireStaffRole, async (req: any, res) => {
    try {
      const projectId = Number(req.params.projectId);
      const result = insertProjectMilestoneSchema.safeParse({ ...req.body, projectId });
      if (!result.success) {
        return res.status(400).json({ message: fromError(result.error).toString() });
      }
      const milestone = await storage.createProjectMilestone(result.data);
      return res.status(201).json(milestone);
    } catch (error) {
      console.error("Error creating milestone:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Update milestone (Staff only)
  app.patch("/api/hq/milestones/:id", isAuthenticated, requireStaffRole, async (req: any, res) => {
    try {
      const id = Number(req.params.id);
      const milestone = await storage.updateProjectMilestone(id, req.body);
      if (!milestone) {
        return res.status(404).json({ message: "Milestone not found" });
      }
      return res.json(milestone);
    } catch (error) {
      console.error("Error updating milestone:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // =====================================================
  // Investment Offers Routes (Negotiation)
  // =====================================================
  
  // Get investment offers for a project (Staff sees all, investors see theirs)
  app.get("/api/capital-projects/:projectId/offers", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const projectId = Number(req.params.projectId);
      const isStaff = await storage.hasAnyStaffRole(userId);
      
      if (isStaff) {
        const offers = await storage.getInvestmentOffersByProject(projectId);
        return res.json(offers);
      } else {
        const offers = await storage.getInvestmentOffersByInvestor(userId);
        const filtered = offers.filter(o => o.projectId === projectId);
        return res.json(filtered);
      }
    } catch (error) {
      console.error("Error fetching investment offers:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get my investment offers (for investors)
  app.get("/api/my-investment-offers", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const offers = await storage.getInvestmentOffersByInvestor(userId);
      return res.json(offers);
    } catch (error) {
      console.error("Error fetching my investment offers:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Create investment offer (Investors)
  app.post("/api/investment-offers", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const result = insertInvestmentOfferSchema.safeParse({ ...req.body, investorId: userId });
      if (!result.success) {
        return res.status(400).json({ message: fromError(result.error).toString() });
      }
      const offer = await storage.createInvestmentOffer(result.data);
      return res.status(201).json(offer);
    } catch (error) {
      console.error("Error creating investment offer:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Respond to investment offer (Staff only - accept/decline/counter)
  app.post("/api/hq/investment-offers/:id/respond", isAuthenticated, requireStaffRole, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const id = Number(req.params.id);
      const { status, counterTerms, notes } = req.body;
      
      if (!["accepted", "declined", "countered"].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }
      
      const offer = await storage.respondToInvestmentOffer(id, status, counterTerms, notes, userId);
      if (!offer) {
        return res.status(404).json({ message: "Investment offer not found" });
      }
      
      // If accepted, create committed investment
      if (status === "accepted") {
        await storage.createCommittedInvestment({
          projectId: offer.projectId,
          investorId: offer.investorId,
          committedAmount: offer.amountOffered,
          role: offer.requestedRole,
          equityPercent: offer.proposedEquityPercent,
          interestRate: offer.proposedInterestRate,
          notes: offer.notes || "",
          offerId: offer.id
        });
      }
      
      return res.json(offer);
    } catch (error) {
      console.error("Error responding to investment offer:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // =====================================================
  // Committed Investments Routes
  // =====================================================
  
  // Get committed investments for a project
  app.get("/api/capital-projects/:projectId/commitments", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const projectId = Number(req.params.projectId);
      const isStaff = await storage.hasAnyStaffRole(userId);
      
      if (isStaff) {
        const commitments = await storage.getCommittedInvestmentsByProject(projectId);
        return res.json(commitments);
      } else {
        const commitments = await storage.getCommittedInvestmentsByInvestor(userId);
        const filtered = commitments.filter(c => c.projectId === projectId);
        return res.json(filtered);
      }
    } catch (error) {
      console.error("Error fetching committed investments:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get my committed investments
  app.get("/api/my-committed-investments", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const commitments = await storage.getCommittedInvestmentsByInvestor(userId);
      return res.json(commitments);
    } catch (error) {
      console.error("Error fetching my committed investments:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // =====================================================
  // Term Sheet PDF Generation Routes
  // =====================================================
  
  // Generate term sheet PDF for an investment
  app.post("/api/investments/:investmentId/term-sheet", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const investmentId = Number(req.params.investmentId);
      
      // Get the investment offer
      const offers = await storage.getInvestmentOffersByInvestor(userId);
      const offer = offers.find(o => o.id === investmentId);
      
      if (!offer) {
        return res.status(404).json({ message: "Investment offer not found" });
      }
      
      // Get the project
      const project = await storage.getCapitalProject(offer.projectId);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      
      // Get the user
      const user = await storage.getUser(userId);
      
      // Generate PDF
      const { buffer, filename } = await generateTermSheetPDF(
        project,
        { 
          firstName: user?.firstName, 
          lastName: user?.lastName, 
          email: user?.email 
        },
        {
          investmentAmount: offer.amountOffered,
          structureType: (offer.structureType as "equity" | "debt" | "hybrid") || "equity",
          role: offer.requestedRole,
          equityPercent: offer.proposedEquityPercent || undefined,
          profitSplit: offer.proposedProfitSplit || undefined,
          interestRate: offer.proposedInterestRate || undefined,
          loanDuration: offer.proposedLoanDuration || undefined,
          isAcceptingOperatorTerms: offer.isAcceptingOperatorTerms || false
        }
      );
      
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
      res.send(buffer);
    } catch (error) {
      console.error("Error generating term sheet:", error);
      return res.status(500).json({ message: "Failed to generate term sheet" });
    }
  });
  
  // Generate preview term sheet PDF (before confirming investment)
  app.post("/api/capital-projects/:projectId/term-sheet-preview", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const projectId = Number(req.params.projectId);
      const { investmentAmount, structureType, role, equityPercent, profitSplit, interestRate, loanDuration, isAcceptingOperatorTerms } = req.body;
      
      // Get the project
      const project = await storage.getCapitalProject(projectId);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      
      // Get the user
      const user = await storage.getUser(userId);
      
      // Generate PDF
      const { buffer, filename } = await generateTermSheetPDF(
        project,
        { 
          firstName: user?.firstName, 
          lastName: user?.lastName, 
          email: user?.email 
        },
        {
          investmentAmount: investmentAmount || 0,
          structureType: structureType || "equity",
          role: role || "LP",
          equityPercent,
          profitSplit,
          interestRate,
          loanDuration,
          isAcceptingOperatorTerms: isAcceptingOperatorTerms || false
        }
      );
      
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `inline; filename="${filename}"`);
      res.send(buffer);
    } catch (error) {
      console.error("Error generating term sheet preview:", error);
      return res.status(500).json({ message: "Failed to generate term sheet preview" });
    }
  });

  // =====================================================
  // Deal Matches Routes
  // =====================================================
  
  // Get deal matches for staff
  app.get("/api/hq/deal-matches", isAuthenticated, requireStaffRole, async (req: any, res) => {
    try {
      const matches = await storage.getDealMatches();
      return res.json(matches);
    } catch (error) {
      console.error("Error fetching deal matches:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get my deal matches (buyers/investors)
  app.get("/api/my-deal-matches", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const matches = await storage.getDealMatchesByUser(userId);
      return res.json(matches);
    } catch (error) {
      console.error("Error fetching my deal matches:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Create deal match (Staff only)
  app.post("/api/hq/deal-matches", isAuthenticated, requireStaffRole, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const result = insertDealMatchSchema.safeParse({ ...req.body, matchedBy: userId });
      if (!result.success) {
        return res.status(400).json({ message: fromError(result.error).toString() });
      }
      const match = await storage.createDealMatch(result.data);
      return res.status(201).json(match);
    } catch (error) {
      console.error("Error creating deal match:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Update deal match status
  app.patch("/api/deal-matches/:id/status", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const id = Number(req.params.id);
      const { status } = req.body;
      
      // Verify user can update this match
      const matches = await storage.getDealMatchesByUser(userId);
      const isStaff = await storage.hasAnyStaffRole(userId);
      const match = matches.find(m => m.id === id);
      
      if (!match && !isStaff) {
        return res.status(403).json({ message: "Not authorized to update this match" });
      }
      
      const updated = await storage.updateDealMatchStatus(id, status);
      if (!updated) {
        return res.status(404).json({ message: "Deal match not found" });
      }
      return res.json(updated);
    } catch (error) {
      console.error("Error updating deal match status:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // =====================================================
  // Announcements Routes
  // =====================================================
  
  // Get announcements for current user's role
  app.get("/api/announcements", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const roles = await storage.getUserRoles(userId);
      const roleNames = roles.map(r => r.role);
      
      // Determine audience based on roles
      let audience = "ALL";
      if (roleNames.some(r => STAFF_ROLES.includes(r as any))) {
        audience = "STAFF";
      } else if (roleNames.includes("investor")) {
        audience = "INVESTORS";
      } else if (roleNames.includes("wholesaler")) {
        audience = "WHOLESALERS";
      } else if (roleNames.includes("buyer")) {
        audience = "BUYERS";
      }
      
      const announcements = await storage.getAnnouncementsForAudience(audience);
      return res.json(announcements);
    } catch (error) {
      console.error("Error fetching announcements:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get all announcements (Staff only)
  app.get("/api/hq/announcements", isAuthenticated, requireStaffRole, async (req: any, res) => {
    try {
      const announcements = await storage.getAnnouncements();
      return res.json(announcements);
    } catch (error) {
      console.error("Error fetching all announcements:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Create announcement (Staff only)
  app.post("/api/hq/announcements", isAuthenticated, requireStaffRole, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const result = insertAnnouncementSchema.safeParse({ ...req.body, createdBy: userId });
      if (!result.success) {
        return res.status(400).json({ message: fromError(result.error).toString() });
      }
      const announcement = await storage.createAnnouncement(result.data);
      return res.status(201).json(announcement);
    } catch (error) {
      console.error("Error creating announcement:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Update announcement (Staff only)
  app.patch("/api/hq/announcements/:id", isAuthenticated, requireStaffRole, async (req: any, res) => {
    try {
      const id = Number(req.params.id);
      const announcement = await storage.updateAnnouncement(id, req.body);
      if (!announcement) {
        return res.status(404).json({ message: "Announcement not found" });
      }
      return res.json(announcement);
    } catch (error) {
      console.error("Error updating announcement:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Delete announcement (Staff only)
  app.delete("/api/hq/announcements/:id", isAuthenticated, requireStaffRole, async (req: any, res) => {
    try {
      const id = Number(req.params.id);
      await storage.deleteAnnouncement(id);
      return res.status(204).send();
    } catch (error) {
      console.error("Error deleting announcement:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // =====================================================
  // Staff Management Routes (Admin only)
  // =====================================================
  
  // Get all staff members with their roles
  app.get("/api/hq/staff", isAuthenticated, requireRole("admin"), async (req: any, res) => {
    try {
      const profiles = await storage.getAllStaffProfiles();
      // Get roles for each staff member
      const staffWithRoles = await Promise.all(
        profiles.map(async (profile) => {
          const user = await storage.getUser(profile.userId);
          const roles = await storage.getUserRoles(profile.userId);
          return {
            ...profile,
            user,
            roles: roles.map(r => r.role),
          };
        })
      );
      return res.json(staffWithRoles);
    } catch (error) {
      console.error("Error fetching staff:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get all users with staff roles (for listing team)
  app.get("/api/hq/staff/all-users", isAuthenticated, requireRole("admin"), async (req: any, res) => {
    try {
      const allUsers = await storage.getAllUsers();
      // Get roles for each user
      const usersWithRoles = await Promise.all(
        allUsers.map(async (user) => {
          const roles = await storage.getUserRoles(user.id);
          return {
            ...user,
            roles: roles.map(r => r.role),
          };
        })
      );
      return res.json(usersWithRoles);
    } catch (error) {
      console.error("Error fetching all users:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Add role to user
  app.post("/api/hq/staff/roles", isAuthenticated, requireRole("admin"), async (req: any, res) => {
    try {
      const { userId, role } = req.body;
      if (!userId || !role) {
        return res.status(400).json({ message: "userId and role are required" });
      }
      
      // Check if user exists
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Add the role
      await storage.addUserRole({ userId, role });
      
      // Return updated roles
      const roles = await storage.getUserRoles(userId);
      return res.json({ userId, roles: roles.map(r => r.role) });
    } catch (error) {
      console.error("Error adding role:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Remove role from user
  app.delete("/api/hq/staff/roles", isAuthenticated, requireRole("admin"), async (req: any, res) => {
    try {
      const { userId, role } = req.body;
      if (!userId || !role) {
        return res.status(400).json({ message: "userId and role are required" });
      }
      
      // Remove the role
      await storage.removeUserRole(userId, role);
      
      // Return updated roles
      const roles = await storage.getUserRoles(userId);
      return res.json({ userId, roles: roles.map(r => r.role) });
    } catch (error) {
      console.error("Error removing role:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Create or update staff profile
  app.post("/api/hq/staff/profile", isAuthenticated, requireRole("admin"), async (req: any, res) => {
    try {
      const profile = await storage.upsertStaffProfile(req.body);
      return res.json(profile);
    } catch (error) {
      console.error("Error creating/updating staff profile:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // =====================================================
  // Notifications Routes
  // =====================================================
  
  // Get my notifications
  app.get("/api/notifications", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const notifications = await storage.getNotifications(userId);
      return res.json(notifications);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get unread notifications
  app.get("/api/notifications/unread", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const notifications = await storage.getUnreadNotifications(userId);
      return res.json(notifications);
    } catch (error) {
      console.error("Error fetching unread notifications:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get unread notification count
  app.get("/api/notifications/unread-count", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const count = await storage.getUnreadNotificationCount(userId);
      return res.json({ count });
    } catch (error) {
      console.error("Error getting unread notification count:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Mark notification as read
  app.patch("/api/notifications/:id/read", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const id = Number(req.params.id);
      
      // Verify notification belongs to user
      const notifications = await storage.getNotifications(userId);
      const notification = notifications.find(n => n.id === id);
      if (!notification) {
        return res.status(404).json({ message: "Notification not found" });
      }
      
      const updated = await storage.markNotificationRead(id);
      return res.json(updated);
    } catch (error) {
      console.error("Error marking notification as read:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Mark all notifications as read
  app.post("/api/notifications/mark-all-read", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      await storage.markAllNotificationsRead(userId);
      return res.json({ success: true });
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Create notification (Staff only - for manual notifications)
  app.post("/api/hq/notifications", isAuthenticated, requireStaffRole, async (req: any, res) => {
    try {
      const result = insertNotificationSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: fromError(result.error).toString() });
      }
      const notification = await storage.createNotification(result.data);
      return res.status(201).json(notification);
    } catch (error) {
      console.error("Error creating notification:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // =====================================================
  // Investor Wanted Deals Routes
  // =====================================================
  
  // Get all active investor wanted deals (public)
  app.get("/api/investor-wanted-deals", async (req, res) => {
    try {
      const deals = await storage.getActiveInvestorWantedDeals();
      return res.json(deals);
    } catch (error) {
      console.error("Error fetching investor wanted deals:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get my investor wanted deals
  app.get("/api/my-investor-wanted-deals", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const deals = await storage.getInvestorWantedDealsByUser(userId);
      return res.json(deals);
    } catch (error) {
      console.error("Error fetching my investor wanted deals:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get user's investment preferences (for matching)
  app.get("/api/my-investor-preferences", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const deals = await storage.getInvestorWantedDealsByUser(userId);
      
      if (deals.length === 0) {
        return res.json({});
      }
      
      const primaryDeal = deals.find(d => d.activelyLooking) || deals[0];
      
      return res.json({
        propertyTypes: primaryDeal.propertyTypes || [],
        strategies: primaryDeal.strategies || [],
        locations: primaryDeal.locations || [],
        minBudget: primaryDeal.minBudget,
        maxBudget: primaryDeal.maxBudget,
        targetReturnMin: primaryDeal.targetReturnMin,
        targetReturnMax: primaryDeal.targetReturnMax,
        preferredStructure: primaryDeal.preferredStructure,
        holdPeriodPreference: primaryDeal.holdPeriodPreference,
      });
    } catch (error) {
      console.error("Error fetching investor preferences:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get single investor wanted deal
  app.get("/api/investor-wanted-deals/:id", async (req, res) => {
    try {
      const id = Number(req.params.id);
      const deal = await storage.getInvestorWantedDeal(id);
      if (!deal) {
        return res.status(404).json({ message: "Investor wanted deal not found" });
      }
      return res.json(deal);
    } catch (error) {
      console.error("Error fetching investor wanted deal:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Create investor wanted deal
  app.post("/api/investor-wanted-deals", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const deal = await storage.createInvestorWantedDeal({ ...req.body, userId });
      return res.status(201).json(deal);
    } catch (error) {
      console.error("Error creating investor wanted deal:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Update investor wanted deal
  app.patch("/api/investor-wanted-deals/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const id = Number(req.params.id);
      
      // Verify ownership
      const existingDeal = await storage.getInvestorWantedDeal(id);
      if (!existingDeal) {
        return res.status(404).json({ message: "Investor wanted deal not found" });
      }
      if (existingDeal.userId !== userId) {
        return res.status(403).json({ message: "Not authorized to update this deal" });
      }
      
      const deal = await storage.updateInvestorWantedDeal(id, req.body);
      return res.json(deal);
    } catch (error) {
      console.error("Error updating investor wanted deal:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Delete investor wanted deal
  app.delete("/api/investor-wanted-deals/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const id = Number(req.params.id);
      
      // Verify ownership
      const existingDeal = await storage.getInvestorWantedDeal(id);
      if (!existingDeal) {
        return res.status(404).json({ message: "Investor wanted deal not found" });
      }
      if (existingDeal.userId !== userId) {
        const isStaff = await storage.hasAnyStaffRole(userId);
        if (!isStaff) {
          return res.status(403).json({ message: "Not authorized to delete this deal" });
        }
      }
      
      await storage.deleteInvestorWantedDeal(id);
      return res.status(204).send();
    } catch (error) {
      console.error("Error deleting investor wanted deal:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // =====================================================
  // User Profile Routes
  // =====================================================
  
  // Get user profile by ID
  app.get("/api/users/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      const roles = await storage.getUserRoles(userId);
      return res.json({
        ...user,
        roles: roles.map(r => r.role)
      });
    } catch (error) {
      console.error("Error fetching user profile:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // =====================================================
  // User Reviews Routes
  // =====================================================
  
  // Get reviews for a user
  app.get("/api/users/:userId/reviews", async (req, res) => {
    try {
      const { userId } = req.params;
      const reviews = await storage.getUserReviews(userId);
      return res.json(reviews);
    } catch (error) {
      console.error("Error fetching user reviews:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get my given reviews
  app.get("/api/my-reviews", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const reviews = await storage.getReviewsByReviewer(userId);
      return res.json(reviews);
    } catch (error) {
      console.error("Error fetching my reviews:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Create review
  app.post("/api/reviews", isAuthenticated, async (req: any, res) => {
    try {
      const reviewerId = req.user.claims.sub;
      const { revieweeId, dealType, dealId, transactionRole, overallRating, 
              communicationRating, reliabilityRating, professionalismRating, title, content } = req.body;
      
      if (!revieweeId || !overallRating) {
        return res.status(400).json({ message: "Reviewee ID and rating are required" });
      }
      
      if (reviewerId === revieweeId) {
        return res.status(400).json({ message: "Cannot review yourself" });
      }
      
      const review = await storage.createUserReview({
        reviewerId,
        revieweeId,
        dealType,
        dealId,
        transactionRole,
        overallRating,
        communicationRating,
        reliabilityRating,
        professionalismRating,
        title,
        content
      });
      return res.status(201).json(review);
    } catch (error) {
      console.error("Error creating review:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Respond to review (reviewee only)
  app.post("/api/reviews/:id/respond", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const id = Number(req.params.id);
      const { response } = req.body;
      
      // Verify this is the reviewee
      const review = await storage.getUserReview(id);
      if (!review) {
        return res.status(404).json({ message: "Review not found" });
      }
      if (review.revieweeId !== userId) {
        return res.status(403).json({ message: "Only the reviewee can respond to this review" });
      }
      
      const updated = await storage.respondToReview(id, response);
      return res.json(updated);
    } catch (error) {
      console.error("Error responding to review:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // =====================================================
  // User Stats Routes
  // =====================================================
  
  // Get user stats
  app.get("/api/users/:userId/stats", async (req, res) => {
    try {
      const { userId } = req.params;
      const stats = await storage.getUserStats(userId);
      return res.json(stats || {});
    } catch (error) {
      console.error("Error fetching user stats:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get user activity (timeline of recent actions)
  app.get("/api/users/:userId/activity", async (req, res) => {
    try {
      const { userId } = req.params;
      const activities = await storage.getUserActivity(userId);
      return res.json(activities);
    } catch (error) {
      console.error("Error fetching user activity:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get user reputation
  app.get("/api/users/:userId/reputation", async (req, res) => {
    try {
      const { userId } = req.params;
      if (!userId || userId.length < 1 || userId.length > 100) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      const reputation = await storage.getUserReputation(userId);
      return res.json(reputation || null);
    } catch (error) {
      console.error("Error fetching user reputation:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get user badges
  app.get("/api/users/:userId/badges", async (req, res) => {
    try {
      const { userId } = req.params;
      if (!userId || userId.length < 1 || userId.length > 100) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      const badges = await storage.getUserBadges(userId);
      return res.json(badges || []);
    } catch (error) {
      console.error("Error fetching user badges:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // =====================================================
  // Deal Negotiations Routes
  // =====================================================
  
  // Get negotiations for a deal
  app.get("/api/negotiations/:dealType/:dealId", isAuthenticated, async (req: any, res) => {
    try {
      const { dealType, dealId } = req.params;
      const negotiations = await storage.getDealNegotiations(dealType, Number(dealId));
      return res.json(negotiations);
    } catch (error) {
      console.error("Error fetching deal negotiations:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get my negotiations
  app.get("/api/my-negotiations", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const negotiations = await storage.getNegotiationsByUser(userId);
      return res.json(negotiations);
    } catch (error) {
      console.error("Error fetching my negotiations:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Create negotiation (make offer/counter-offer)
  app.post("/api/negotiations", isAuthenticated, async (req: any, res) => {
    try {
      const initiatorId = req.user.claims.sub;
      const { dealType, dealId, responderId, structureType, 
              proposedEquityPercent, proposedInterestRate, proposedAmount, proposedLoanTerm,
              proposedPreferredReturn, proposedProfitSplit, proposedHoldPeriod, exitStrategy,
              notes, isCounterOffer, parentNegotiationId } = req.body;
      
      if (!dealType || !dealId || !responderId || !structureType) {
        return res.status(400).json({ message: "Deal type, deal ID, responder ID, and structure type are required" });
      }
      
      const negotiation = await storage.createDealNegotiation({
        dealType,
        dealId,
        initiatorId,
        responderId,
        structureType,
        proposedEquityPercent,
        proposedInterestRate,
        proposedAmount,
        proposedLoanTerm,
        proposedPreferredReturn,
        proposedProfitSplit,
        proposedHoldPeriod,
        exitStrategy,
        notes,
        isCounterOffer: isCounterOffer || false,
        parentNegotiationId
      });
      return res.status(201).json(negotiation);
    } catch (error) {
      console.error("Error creating negotiation:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get negotiation thread (original + all counter-offers)
  app.get("/api/negotiations/:id/thread", isAuthenticated, async (req: any, res) => {
    try {
      const id = Number(req.params.id);
      const thread = await storage.getNegotiationThread(id);
      return res.json(thread);
    } catch (error) {
      console.error("Error fetching negotiation thread:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Respond to negotiation (accept/decline/counter)
  app.post("/api/negotiations/:id/respond", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const id = Number(req.params.id);
      const { status } = req.body;
      
      if (!["accepted", "declined", "countered"].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }
      
      // Verify user is the responder
      const negotiation = await storage.getDealNegotiation(id);
      if (!negotiation) {
        return res.status(404).json({ message: "Negotiation not found" });
      }
      if (negotiation.responderId !== userId) {
        return res.status(403).json({ message: "Only the responder can respond to this negotiation" });
      }
      
      const updated = await storage.updateNegotiationStatus(id, status);
      return res.json(updated);
    } catch (error) {
      console.error("Error responding to negotiation:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // =====================================================
  // Deal Messages (Chat) Routes
  // =====================================================
  
  // Get messages for a deal
  app.get("/api/deal-messages/:dealType/:dealId", isAuthenticated, async (req: any, res) => {
    try {
      const { dealType, dealId } = req.params;
      const userId = req.user.claims.sub;
      
      // Mark messages as read
      await storage.markDealMessagesRead(dealType, Number(dealId), userId);
      
      const messages = await storage.getDealMessages(dealType, Number(dealId));
      return res.json(messages);
    } catch (error) {
      console.error("Error fetching deal messages:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // Send a message
  app.post("/api/deal-messages", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      const message = await storage.createDealMessage({
        ...req.body,
        senderId: userId,
        senderName: user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'User' : 'User',
        senderAvatar: user?.profileImageUrl || undefined,
      });
      return res.status(201).json(message);
    } catch (error) {
      console.error("Error sending deal message:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // Get unread message count
  app.get("/api/deal-messages/:dealType/:dealId/unread", isAuthenticated, async (req: any, res) => {
    try {
      const { dealType, dealId } = req.params;
      const userId = req.user.claims.sub;
      
      const count = await storage.getUnreadDealMessageCount(dealType, Number(dealId), userId);
      return res.json({ count });
    } catch (error) {
      console.error("Error fetching unread count:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // =====================================================
  // Wholesale Deal Documents Routes
  // =====================================================
  
  // Get documents for a wholesale deal
  app.get("/api/wholesale-deals/:dealId/documents", async (req, res) => {
    try {
      const dealId = Number(req.params.dealId);
      const documents = await storage.getWholesaleDealDocuments(dealId);
      return res.json(documents);
    } catch (error) {
      console.error("Error fetching wholesale deal documents:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Upload document (wholesaler only)
  app.post("/api/wholesale-deals/:dealId/documents", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const dealId = Number(req.params.dealId);
      
      // Verify ownership of deal
      const deal = await storage.getWholesaleDeal(dealId);
      if (!deal) {
        return res.status(404).json({ message: "Wholesale deal not found" });
      }
      if (deal.submittedBy !== userId) {
        const isStaff = await storage.hasAnyStaffRole(userId);
        if (!isStaff) {
          return res.status(403).json({ message: "Not authorized to add documents to this deal" });
        }
      }
      
      const document = await storage.createWholesaleDealDocument({
        dealId,
        uploadedBy: userId,
        ...req.body
      });
      return res.status(201).json(document);
    } catch (error) {
      console.error("Error uploading document:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Delete document
  app.delete("/api/wholesale-deal-documents/:id", isAuthenticated, async (req: any, res) => {
    try {
      const id = Number(req.params.id);
      await storage.deleteWholesaleDealDocument(id);
      return res.status(204).send();
    } catch (error) {
      console.error("Error deleting document:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // =====================================================
  // Deal Analyzer Routes
  // =====================================================
  
  // Get my analyzer results
  app.get("/api/my-deal-analyses", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const results = await storage.getDealAnalyzerResults(userId);
      return res.json(results);
    } catch (error) {
      console.error("Error fetching deal analyses:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Save analyzer result
  app.post("/api/deal-analyses", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const result = await storage.createDealAnalyzerResult({
        userId,
        ...req.body
      });
      return res.status(201).json(result);
    } catch (error) {
      console.error("Error saving deal analysis:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Delete analyzer result
  app.delete("/api/deal-analyses/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const id = Number(req.params.id);
      
      // Verify ownership
      const result = await storage.getDealAnalyzerResult(id);
      if (!result) {
        return res.status(404).json({ message: "Analysis not found" });
      }
      if (result.userId !== userId) {
        return res.status(403).json({ message: "Not authorized to delete this analysis" });
      }
      
      await storage.deleteDealAnalyzerResult(id);
      return res.status(204).send();
    } catch (error) {
      console.error("Error deleting deal analysis:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // =====================================================
  // PEGGY AI ASSISTANT ROUTES
  // =====================================================

  // Get or create a conversation
  app.post("/api/peggy/conversations", async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const sessionId = req.body.sessionId || req.sessionID || `anon_${Date.now()}`;
      const context = req.body.context || {};
      
      const conversation = await peggy.getOrCreateConversation(userId, sessionId, context);
      res.json(conversation);
    } catch (error) {
      console.error("Error getting/creating Peggy conversation:", error);
      res.status(500).json({ message: "Failed to get/create conversation" });
    }
  });

  // Start a new conversation
  app.post("/api/peggy/conversations/new", async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const sessionId = req.body.sessionId || req.sessionID || `anon_${Date.now()}`;
      const context = req.body.context || {};
      
      const conversation = await peggy.startConversation(userId, sessionId, context);
      res.json(conversation);
    } catch (error) {
      console.error("Error starting new Peggy conversation:", error);
      res.status(500).json({ message: "Failed to start conversation" });
    }
  });

  // Get conversation history
  app.get("/api/peggy/conversations/:id", async (req: any, res) => {
    try {
      const conversationId = Number(req.params.id);
      const conversation = await storage.getPeggyConversation(conversationId);
      
      if (!conversation) {
        return res.status(404).json({ message: "Conversation not found" });
      }
      
      const messages = await storage.getPeggyMessages(conversationId);
      res.json({ conversation, messages });
    } catch (error) {
      console.error("Error fetching Peggy conversation:", error);
      res.status(500).json({ message: "Failed to fetch conversation" });
    }
  });

  // Get user's conversations list
  app.get("/api/peggy/conversations", async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const sessionId = req.query.sessionId as string;
      
      const conversations = await storage.getPeggyConversations(userId, sessionId);
      res.json(conversations);
    } catch (error) {
      console.error("Error fetching Peggy conversations:", error);
      res.status(500).json({ message: "Failed to fetch conversations" });
    }
  });

  // Send a message to Peggy
  app.post("/api/peggy/chat", async (req: any, res) => {
    try {
      const { conversationId, message, context } = req.body;
      
      if (!conversationId || !message) {
        return res.status(400).json({ message: "conversationId and message are required" });
      }
      
      const result = await peggy.chat(message, conversationId, context);
      res.json(result);
    } catch (error) {
      console.error("Error in Peggy chat:", error);
      res.status(500).json({ message: "Failed to get response from Peggy" });
    }
  });

  // Get context-aware suggestions
  app.post("/api/peggy/suggestions", async (req: any, res) => {
    try {
      const context = req.body.context || {};
      const suggestions = peggy.getSuggestions(context);
      res.json({ suggestions });
    } catch (error) {
      console.error("Error getting Peggy suggestions:", error);
      res.status(500).json({ message: "Failed to get suggestions" });
    }
  });

  // Analyze calculator results (Ask Peggy button)
  app.post("/api/peggy/analyze-calculator", async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const sessionId = req.body.sessionId || req.sessionID || `anon_${Date.now()}`;
      const { calculatorType, inputs, results } = req.body;
      
      if (!calculatorType || !inputs || !results) {
        return res.status(400).json({ message: "calculatorType, inputs, and results are required" });
      }
      
      const response = await peggy.analyzeCalculatorResults(
        calculatorType,
        inputs,
        results,
        userId,
        sessionId
      );
      
      res.json(response);
    } catch (error) {
      console.error("Error in Peggy calculator analysis:", error);
      res.status(500).json({ message: "Failed to analyze calculator results" });
    }
  });

  // Provide feedback on a message
  app.post("/api/peggy/messages/:id/feedback", async (req: any, res) => {
    try {
      const messageId = Number(req.params.id);
      const { feedback, feedbackNotes } = req.body;
      
      if (!feedback || !['helpful', 'not_helpful'].includes(feedback)) {
        return res.status(400).json({ message: "Valid feedback (helpful/not_helpful) is required" });
      }
      
      const message = await storage.updatePeggyMessageFeedback(messageId, feedback, feedbackNotes);
      res.json(message);
    } catch (error) {
      console.error("Error saving Peggy message feedback:", error);
      res.status(500).json({ message: "Failed to save feedback" });
    }
  });

  // =====================================================
  // UNIFIED LEADS PIPELINE ROUTES
  // =====================================================

  // Get all leads (staff only)
  app.get("/api/hq/leads", isAuthenticated, requireStaffRole, async (req: any, res) => {
    try {
      const leadType = req.query.leadType as string | undefined;
      const stage = req.query.stage as string | undefined;
      const assignedTo = req.query.assignedTo as string | undefined;
      
      const leads = await storage.getLeads({ leadType, stage, assignedTo });
      res.json(leads);
    } catch (error) {
      console.error("Error fetching leads:", error);
      res.status(500).json({ message: "Failed to fetch leads" });
    }
  });

  // Get single lead (staff only)
  app.get("/api/hq/leads/:id", isAuthenticated, requireStaffRole, async (req: any, res) => {
    try {
      const id = Number(req.params.id);
      const lead = await storage.getLead(id);
      
      if (!lead) {
        return res.status(404).json({ message: "Lead not found" });
      }
      
      res.json(lead);
    } catch (error) {
      console.error("Error fetching lead:", error);
      res.status(500).json({ message: "Failed to fetch lead" });
    }
  });

  // Create a new lead (public or authenticated)
  app.post("/api/leads", async (req: any, res) => {
    try {
      const parseResult = insertLeadSchema.safeParse(req.body);
      if (!parseResult.success) {
        return res.status(400).json({ 
          message: "Invalid lead data", 
          errors: fromError(parseResult.error).toString() 
        });
      }
      
      const lead = await storage.createLead(parseResult.data);
      
      // Send email notification based on lead type (non-blocking)
      const leadData = parseResult.data;
      const fullName = `${leadData.firstName || ''} ${leadData.lastName || ''}`.trim() || 'Unknown';
      
      if (leadData.leadType === 'seller') {
        sendSellerLeadNotification({
          name: fullName,
          email: leadData.email || '',
          phone: leadData.phone || '',
          address: leadData.address || '',
          propertyType: (leadData.leadData as any)?.propertyType || 'Unknown',
          condition: (leadData.leadData as any)?.condition || 'Unknown',
          timeline: (leadData.leadData as any)?.timeline || 'Unknown',
          notes: leadData.notes || undefined,
        }).catch(err => console.error('Failed to send seller lead notification:', err));
      } else if (leadData.leadType === 'investor') {
        sendInvestorLeadNotification({
          name: fullName,
          email: leadData.email || '',
          phone: leadData.phone || '',
          investmentRange: (leadData.leadData as any)?.investmentRange || 'Unknown',
          strategy: (leadData.leadData as any)?.strategy || 'Unknown',
          notes: leadData.notes || undefined,
        }).catch(err => console.error('Failed to send investor lead notification:', err));
      } else if (leadData.leadType === 'buyer') {
        sendBuyerLeadNotification({
          name: fullName,
          email: leadData.email || '',
          phone: leadData.phone || '',
          buyerType: (leadData.leadData as any)?.buyerType || 'Unknown',
          priceRange: (leadData.leadData as any)?.priceRange || 'Unknown',
          locations: (leadData.leadData as any)?.locations,
          notes: leadData.notes || undefined,
        }).catch(err => console.error('Failed to send buyer lead notification:', err));
      }
      
      res.status(201).json(lead);
    } catch (error) {
      console.error("Error creating lead:", error);
      res.status(500).json({ message: "Failed to create lead" });
    }
  });

  // Update lead (staff only)
  app.patch("/api/hq/leads/:id", isAuthenticated, requireStaffRole, async (req: any, res) => {
    try {
      const id = Number(req.params.id);
      const lead = await storage.updateLead(id, req.body);
      
      if (!lead) {
        return res.status(404).json({ message: "Lead not found" });
      }
      
      res.json(lead);
    } catch (error) {
      console.error("Error updating lead:", error);
      res.status(500).json({ message: "Failed to update lead" });
    }
  });

  // Update lead stage (staff only)
  app.patch("/api/hq/leads/:id/stage", isAuthenticated, requireStaffRole, async (req: any, res) => {
    try {
      const id = Number(req.params.id);
      const { stage } = req.body;
      
      if (!stage) {
        return res.status(400).json({ message: "Stage is required" });
      }
      
      const lead = await storage.updateLeadStage(id, stage);
      
      if (!lead) {
        return res.status(404).json({ message: "Lead not found" });
      }
      
      res.json(lead);
    } catch (error) {
      console.error("Error updating lead stage:", error);
      res.status(500).json({ message: "Failed to update lead stage" });
    }
  });

  // Assign lead (staff only)
  app.patch("/api/hq/leads/:id/assign", isAuthenticated, requireStaffRole, async (req: any, res) => {
    try {
      const id = Number(req.params.id);
      const { assignedTo } = req.body;
      
      if (!assignedTo) {
        return res.status(400).json({ message: "assignedTo is required" });
      }
      
      const lead = await storage.assignLead(id, assignedTo);
      
      if (!lead) {
        return res.status(404).json({ message: "Lead not found" });
      }
      
      res.json(lead);
    } catch (error) {
      console.error("Error assigning lead:", error);
      res.status(500).json({ message: "Failed to assign lead" });
    }
  });

  // =====================================================
  // SAVED ANALYSES ROUTES (Enhanced Calculator Saves)
  // =====================================================

  // Get user's saved analyses
  app.get("/api/saved-analyses", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const calculatorType = req.query.calculatorType as string | undefined;
      
      const analyses = await storage.getSavedAnalyses(userId, calculatorType);
      res.json(analyses);
    } catch (error) {
      console.error("Error fetching saved analyses:", error);
      res.status(500).json({ message: "Failed to fetch analyses" });
    }
  });

  // Get single saved analysis
  app.get("/api/saved-analyses/:id", isAuthenticated, async (req: any, res) => {
    try {
      const id = Number(req.params.id);
      const analysis = await storage.getSavedAnalysis(id);
      
      if (!analysis) {
        return res.status(404).json({ message: "Analysis not found" });
      }
      
      // Check ownership
      if (analysis.userId !== req.user.claims.sub) {
        return res.status(403).json({ message: "Not authorized" });
      }
      
      res.json(analysis);
    } catch (error) {
      console.error("Error fetching analysis:", error);
      res.status(500).json({ message: "Failed to fetch analysis" });
    }
  });

  // Get shared analysis by token (public)
  app.get("/api/shared-analyses/:token", async (req: any, res) => {
    try {
      const token = req.params.token;
      const analysis = await storage.getSavedAnalysisByShareToken(token);
      
      if (!analysis) {
        return res.status(404).json({ message: "Shared analysis not found" });
      }
      
      res.json(analysis);
    } catch (error) {
      console.error("Error fetching shared analysis:", error);
      res.status(500).json({ message: "Failed to fetch shared analysis" });
    }
  });

  // Create saved analysis
  app.post("/api/saved-analyses", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      const parseResult = insertSavedAnalysisSchema.safeParse({
        ...req.body,
        userId
      });
      
      if (!parseResult.success) {
        return res.status(400).json({ 
          message: "Invalid analysis data", 
          errors: fromError(parseResult.error).toString() 
        });
      }
      
      const analysis = await storage.createSavedAnalysis(parseResult.data);
      res.status(201).json(analysis);
    } catch (error) {
      console.error("Error saving analysis:", error);
      res.status(500).json({ message: "Failed to save analysis" });
    }
  });

  // Update saved analysis
  app.patch("/api/saved-analyses/:id", isAuthenticated, async (req: any, res) => {
    try {
      const id = Number(req.params.id);
      const userId = req.user.claims.sub;
      
      // Verify ownership
      const existing = await storage.getSavedAnalysis(id);
      if (!existing) {
        return res.status(404).json({ message: "Analysis not found" });
      }
      if (existing.userId !== userId) {
        return res.status(403).json({ message: "Not authorized" });
      }
      
      const analysis = await storage.updateSavedAnalysis(id, req.body);
      res.json(analysis);
    } catch (error) {
      console.error("Error updating analysis:", error);
      res.status(500).json({ message: "Failed to update analysis" });
    }
  });

  // Delete saved analysis
  app.delete("/api/saved-analyses/:id", isAuthenticated, async (req: any, res) => {
    try {
      const id = Number(req.params.id);
      const userId = req.user.claims.sub;
      
      // Verify ownership
      const existing = await storage.getSavedAnalysis(id);
      if (!existing) {
        return res.status(404).json({ message: "Analysis not found" });
      }
      if (existing.userId !== userId) {
        return res.status(403).json({ message: "Not authorized" });
      }
      
      await storage.deleteSavedAnalysis(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting analysis:", error);
      res.status(500).json({ message: "Failed to delete analysis" });
    }
  });

  // =====================================================
  // WHOLESALE DEAL OFFERS ROUTES
  // =====================================================

  // Get offers for a deal
  app.get("/api/wholesale-deals/:dealId/offers", isAuthenticated, async (req: any, res) => {
    try {
      const dealId = Number(req.params.dealId);
      const offers = await storage.getWholesaleDealOffers(dealId);
      res.json(offers);
    } catch (error) {
      console.error("Error fetching deal offers:", error);
      res.status(500).json({ message: "Failed to fetch offers" });
    }
  });

  // Get my offers
  app.get("/api/my-wholesale-offers", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const offers = await storage.getWholesaleDealOffersByBuyer(userId);
      res.json(offers);
    } catch (error) {
      console.error("Error fetching my offers:", error);
      res.status(500).json({ message: "Failed to fetch offers" });
    }
  });

  // Create offer on a deal
  app.post("/api/wholesale-deals/:dealId/offers", isAuthenticated, async (req: any, res) => {
    try {
      const dealId = Number(req.params.dealId);
      const buyerId = req.user.claims.sub;
      
      const parseResult = insertWholesaleDealOfferSchema.safeParse({
        ...req.body,
        dealId,
        buyerId
      });
      
      if (!parseResult.success) {
        return res.status(400).json({ 
          message: "Invalid offer data", 
          errors: fromError(parseResult.error).toString() 
        });
      }
      
      const offer = await storage.createWholesaleDealOffer(parseResult.data);
      res.status(201).json(offer);
    } catch (error) {
      console.error("Error creating offer:", error);
      res.status(500).json({ message: "Failed to create offer" });
    }
  });

  // Update offer status (wholesaler accepting/rejecting)
  app.patch("/api/wholesale-offers/:id/status", isAuthenticated, async (req: any, res) => {
    try {
      const id = Number(req.params.id);
      const { status } = req.body;
      
      if (!status || !['accepted', 'rejected', 'expired'].includes(status)) {
        return res.status(400).json({ message: "Valid status is required" });
      }
      
      const offer = await storage.updateWholesaleDealOfferStatus(id, status);
      
      if (!offer) {
        return res.status(404).json({ message: "Offer not found" });
      }
      
      res.json(offer);
    } catch (error) {
      console.error("Error updating offer status:", error);
      res.status(500).json({ message: "Failed to update offer status" });
    }
  });

  // Counter an offer
  app.post("/api/wholesale-offers/:id/counter", isAuthenticated, async (req: any, res) => {
    try {
      const id = Number(req.params.id);
      const { counterAmount, counterNotes } = req.body;
      
      if (!counterAmount) {
        return res.status(400).json({ message: "counterAmount is required" });
      }
      
      const offer = await storage.counterWholesaleDealOffer(id, counterAmount, counterNotes);
      
      if (!offer) {
        return res.status(404).json({ message: "Offer not found" });
      }
      
      res.json(offer);
    } catch (error) {
      console.error("Error countering offer:", error);
      res.status(500).json({ message: "Failed to counter offer" });
    }
  });

  // ============== PDF GENERATION ROUTES ==============
  
  // Generate calculator analysis PDF
  app.post("/api/pdf/calculator", async (req, res) => {
    try {
      const { calculatorType, inputs, outputs } = req.body;
      
      if (!calculatorType || !inputs || !outputs) {
        return res.status(400).json({ 
          message: "calculatorType, inputs, and outputs are required" 
        });
      }
      
      const buffer = await generateCalculatorPDF(calculatorType, inputs, outputs);
      
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition", 
        `attachment; filename="${calculatorType}-analysis-${Date.now()}.pdf"`
      );
      res.send(buffer);
    } catch (error) {
      console.error("Error generating calculator PDF:", error);
      res.status(500).json({ message: "Failed to generate PDF" });
    }
  });

  // Generate deal packet PDF
  app.post("/api/pdf/deal-packet", async (req, res) => {
    try {
      const dealData = req.body;
      
      if (!dealData.title || !dealData.type || !dealData.propertyAddress) {
        return res.status(400).json({ 
          message: "title, type, and propertyAddress are required" 
        });
      }
      
      const buffer = await generateDealPacketPDF(dealData);
      
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition", 
        `attachment; filename="deal-packet-${Date.now()}.pdf"`
      );
      res.send(buffer);
    } catch (error) {
      console.error("Error generating deal packet PDF:", error);
      res.status(500).json({ message: "Failed to generate PDF" });
    }
  });

  // Generate wholesale deal PDF
  app.get("/api/pdf/wholesale-deal/:id", async (req, res) => {
    try {
      const dealId = Number(req.params.id);
      const deal = await storage.getWholesaleDeal(dealId);
      
      if (!deal) {
        return res.status(404).json({ message: "Deal not found" });
      }
      
      const buffer = await generateDealPacketPDF({
        title: deal.propertyAddress,
        type: "wholesale",
        propertyAddress: deal.propertyAddress,
        city: deal.city || undefined,
        state: deal.state || undefined,
        propertyType: deal.propertyType || undefined,
        beds: deal.bedrooms || undefined,
        baths: deal.bathrooms ? parseFloat(deal.bathrooms) : undefined,
        sqft: deal.sqft || undefined,
        arv: deal.arv || undefined,
        purchasePrice: deal.askingPrice || undefined,
        rehabCost: deal.estimatedRepairs || undefined,
        assignmentFee: deal.assignmentFee || undefined,
        description: deal.description || undefined,
        highlights: deal.sellerSituation ? [deal.sellerSituation] : undefined,
      });
      
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition", 
        `attachment; filename="wholesale-deal-${dealId}-${Date.now()}.pdf"`
      );
      res.send(buffer);
    } catch (error) {
      console.error("Error generating wholesale deal PDF:", error);
      res.status(500).json({ message: "Failed to generate PDF" });
    }
  });

  // ========================================
  // MARKETPLACE DASHBOARD API ENDPOINTS
  // ========================================

  // Wholesaler Dashboard Stats
  app.get("/api/marketplace/wholesaler/stats", async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const wholesaleDeals = await storage.getWholesaleDealsBySubmitter(userId);
      
      const stats = {
        active: wholesaleDeals.filter(d => d.status === "listed" || d.status === "approved").length,
        pending: wholesaleDeals.filter(d => d.status === "pending_review" || d.status === "under_review").length,
        sold: wholesaleDeals.filter(d => d.status === "sold" || d.status === "closed").length,
        totalVolume: wholesaleDeals
          .filter(d => d.status === "sold" || d.status === "closed")
          .reduce((sum, d) => sum + (d.assignmentFee || 0), 0),
      };

      res.json(stats);
    } catch (error) {
      console.error("Error fetching wholesaler stats:", error);
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  // Wholesaler Recent Deals
  app.get("/api/marketplace/wholesaler/deals", async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const deals = await storage.getWholesaleDealsBySubmitter(userId);
      res.json(deals.slice(0, 10));
    } catch (error) {
      console.error("Error fetching wholesaler deals:", error);
      res.status(500).json({ message: "Failed to fetch deals" });
    }
  });

  // Wholesaler JV Requests (requests on their deals)
  app.get("/api/marketplace/wholesaler/jv-requests", async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const requests = await storage.getJvRequestsByWholesaler(userId);
      res.json(requests);
    } catch (error) {
      console.error("Error fetching wholesaler JV requests:", error);
      res.status(500).json({ message: "Failed to fetch JV requests" });
    }
  });

  // Update JV Request Status (accept/reject)
  app.patch("/api/marketplace/jv-requests/:id", async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const requestId = Number(req.params.id);
      const { status } = req.body;

      if (!["accepted", "rejected", "pending"].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }

      const jvRequest = await storage.getJvRequest(requestId);
      if (!jvRequest) {
        return res.status(404).json({ message: "JV request not found" });
      }

      // Verify the user is the wholesaler for this deal
      if (jvRequest.wholesalerId !== userId) {
        return res.status(403).json({ message: "Not authorized to update this request" });
      }

      const updated = await storage.updateJvRequestStatus(requestId, status);
      res.json(updated);
    } catch (error) {
      console.error("Error updating JV request:", error);
      res.status(500).json({ message: "Failed to update JV request" });
    }
  });

  // Investor Dashboard Stats
  app.get("/api/marketplace/investor/stats", async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const investorProfile = await storage.getInvestorProfile(userId);
      const investmentOffers = await storage.getInvestmentOffersByInvestor(userId);
      const savedDeals = await storage.getUserSavedDeals(userId);

      const stats = {
        totalInvested: investmentOffers
          .filter(o => o.status === "accepted")
          .reduce((sum, o) => sum + (o.amountOffered || 0), 0),
        activeDeals: investmentOffers.filter(o => o.status === "accepted" && o.projectId).length,
        savedDeals: savedDeals.length,
        pendingOffers: investmentOffers.filter(o => o.status === "pending").length,
      };

      res.json(stats);
    } catch (error) {
      console.error("Error fetching investor stats:", error);
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  // Investor Saved/Bookmarked Deals
  app.get("/api/marketplace/investor/saved", async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const bookmarks = await storage.getUserSavedDeals(userId);
      res.json(bookmarks);
    } catch (error) {
      console.error("Error fetching investor saved deals:", error);
      res.status(500).json({ message: "Failed to fetch saved deals" });
    }
  });

  // Investor Commitments - Get investments with project details
  app.get("/api/marketplace/investor/commitments", async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const commitments = await storage.getCommittedInvestmentsByInvestor(userId);
      
      // Enrich with project details
      const enrichedCommitments = await Promise.all(
        commitments.map(async (commitment) => {
          const project = await storage.getCapitalProject(commitment.projectId);
          return { ...commitment, project };
        })
      );
      
      res.json(enrichedCommitments);
    } catch (error) {
      console.error("Error fetching investor commitments:", error);
      res.status(500).json({ message: "Failed to fetch commitments" });
    }
  });

  // Dreamscaper Dashboard Stats  
  app.get("/api/marketplace/dreamscaper/stats", async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const projects = await storage.getCapitalProjectsByCreator(userId);
      
      const stats = {
        activeProjects: projects.filter(p => p.status === "funding" || p.status === "active").length,
        totalRaised: projects.reduce((sum, p) => sum + (p.amountRaised || 0), 0),
        totalFundingGoal: projects.reduce((sum, p) => sum + (p.fundingGoal || 0), 0),
        projectsCompleted: projects.filter(p => p.status === "completed" || p.status === "exited").length,
      };

      res.json(stats);
    } catch (error) {
      console.error("Error fetching dreamscaper stats:", error);
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  // Dreamscaper Recent Projects
  app.get("/api/marketplace/dreamscaper/projects", async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const projects = await storage.getCapitalProjectsByCreator(userId);
      res.json(projects.slice(0, 10));
    } catch (error) {
      console.error("Error fetching dreamscaper projects:", error);
      res.status(500).json({ message: "Failed to fetch projects" });
    }
  });

  // Buyer Dashboard Stats
  app.get("/api/marketplace/buyer/stats", async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const savedProperties = await storage.getSavedProperties(userId);
      const offers = await storage.getBuyerOffers(userId);

      const stats = {
        savedProperties: savedProperties.length,
        pendingOffers: offers.filter(o => o.status === "pending").length,
        acceptedOffers: offers.filter(o => o.status === "accepted").length,
        totalPurchases: offers.filter(o => o.status === "closed").length,
      };

      res.json(stats);
    } catch (error) {
      console.error("Error fetching buyer stats:", error);
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  // Buyer Saved Properties
  app.get("/api/marketplace/buyer/saved", async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const savedProperties = await storage.getSavedProperties(userId);
      // Enrich with property details
      const enrichedProperties = await Promise.all(
        savedProperties.map(async (saved) => {
          if (saved.propertyType === "retail") {
            const listing = await storage.getRetailListing(saved.propertyId);
            return { ...saved, listing };
          } else if (saved.propertyType === "wholesale") {
            const deal = await storage.getWholesaleDeal(saved.propertyId);
            return { ...saved, deal };
          }
          return saved;
        })
      );
      res.json(enrichedProperties);
    } catch (error) {
      console.error("Error fetching buyer saved properties:", error);
      res.status(500).json({ message: "Failed to fetch saved properties" });
    }
  });

  // Buyer Offers - get user's offers
  app.get("/api/marketplace/buyer/offers", async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const offers = await storage.getBuyerOffers(userId);
      // Enrich with property details
      const enrichedOffers = await Promise.all(
        offers.map(async (offer) => {
          if (offer.propertyType === "retail") {
            const listing = await storage.getRetailListing(offer.propertyId);
            return { ...offer, listing };
          } else if (offer.propertyType === "wholesale") {
            const deal = await storage.getWholesaleDeal(offer.propertyId);
            return { ...offer, deal };
          }
          return offer;
        })
      );
      res.json(enrichedOffers);
    } catch (error) {
      console.error("Error fetching buyer offers:", error);
      res.status(500).json({ message: "Failed to fetch offers" });
    }
  });

  // Submit a buyer offer
  app.post("/api/marketplace/buyer/offers", async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const { propertyType, propertyId, offerAmount, fundingType, closingTimeline, message } = req.body;
      
      if (!propertyType || !propertyId || !offerAmount || !fundingType) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      const offer = await storage.createBuyerOffer({
        userId,
        propertyType,
        propertyId: Number(propertyId),
        offerAmount: Number(offerAmount),
        fundingType,
        closingTimeline: closingTimeline || null,
        message: message || null,
        proofOfFunds: null,
      });

      res.status(201).json(offer);
    } catch (error) {
      console.error("Error creating buyer offer:", error);
      res.status(500).json({ message: "Failed to submit offer" });
    }
  });

  // Toggle save/unsave a property
  app.post("/api/marketplace/buyer/save", async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const { propertyType, propertyId } = req.body;
      
      if (!propertyType || !propertyId) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      const saved = await storage.toggleSavedProperty(userId, propertyType, Number(propertyId));
      res.json({ saved });
    } catch (error) {
      console.error("Error toggling saved property:", error);
      res.status(500).json({ message: "Failed to toggle saved property" });
    }
  });

  // Submit buyer inquiry (schedule showing, ask question)
  app.post("/api/marketplace/buyer/inquiries", async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const { propertyType, propertyId, name, email, phone, message, requestType } = req.body;

      if (!propertyType || !propertyId || !name || !email || !requestType) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      const inquiry = await storage.createBuyerInquiry({
        userId: userId || null,
        propertyType,
        propertyId: Number(propertyId),
        name,
        email,
        phone: phone || null,
        message: message || null,
        requestType,
      });

      res.json(inquiry);
    } catch (error) {
      console.error("Error creating buyer inquiry:", error);
      res.status(500).json({ message: "Failed to submit inquiry" });
    }
  });

  // Get retail listings (public browse)
  app.get("/api/marketplace/properties", async (req: any, res) => {
    try {
      const listings = await storage.getRetailListings();
      // Filter to only show active listings
      const activeListings = listings.filter(l => 
        l.status === "active" || l.status === "coming_soon" || l.status === "pending"
      );
      res.json(activeListings);
    } catch (error) {
      console.error("Error fetching retail listings:", error);
      res.status(500).json({ message: "Failed to fetch properties" });
    }
  });

  // Get single retail listing
  app.get("/api/marketplace/properties/:id", async (req: any, res) => {
    try {
      const listingId = Number(req.params.id);
      if (isNaN(listingId)) {
        return res.status(400).json({ message: "Invalid listing ID" });
      }
      
      const listing = await storage.getRetailListing(listingId);
      if (!listing) {
        return res.status(404).json({ message: "Property not found" });
      }
      
      res.json(listing);
    } catch (error) {
      console.error("Error fetching retail listing:", error);
      res.status(500).json({ message: "Failed to fetch property" });
    }
  });

  // Admin Dashboard Stats
  app.get("/api/marketplace/admin/stats", requireStaffRole, async (req: any, res) => {
    try {
      const [sellerLeads, investorLeads, wholesaleDeals, projects] = await Promise.all([
        storage.getSellerLeads(),
        storage.getInvestorLeads(),
        storage.getWholesaleDeals(),
        storage.getCapitalProjects(),
      ]);

      const stats = {
        totalSellerLeads: sellerLeads.length,
        pendingSellerLeads: sellerLeads.filter(l => l.status === "new" || l.status === "pending").length,
        totalInvestorLeads: investorLeads.length,
        activeWholesaleDeals: wholesaleDeals.filter(d => d.status === "listed" || d.status === "approved").length,
        activeCapitalProjects: projects.filter(p => p.status === "funding" || p.status === "active").length,
      };

      res.json(stats);
    } catch (error) {
      console.error("Error fetching admin stats:", error);
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  // Get pending items requiring admin action
  app.get("/api/marketplace/admin/pending", requireStaffRole, async (req: any, res) => {
    try {
      const [wholesaleDeals, projects, users] = await Promise.all([
        storage.getWholesaleDeals(),
        storage.getCapitalProjects(),
        storage.getAllUsers(),
      ]);
      
      const pendingDeals = wholesaleDeals
        .filter(d => d.status === "pending_review" || d.status === "under_review" || d.status === "submitted")
        .slice(0, 10);
      
      const pendingProjects = projects
        .filter(p => p.status === "pending_approval" || p.status === "submitted")
        .slice(0, 10);
      
      const pendingItems = [
        ...pendingDeals.map(d => ({
          id: d.id,
          type: "wholesale_deal" as const,
          title: "Wholesale Deal Submission",
          description: d.address || "New deal submission",
          submittedBy: d.submittedBy,
          createdAt: d.createdAt,
        })),
        ...pendingProjects.map(p => ({
          id: p.id,
          type: "capital_project" as const,
          title: "Capital Project Submission",
          description: p.title || "New project submission",
          submittedBy: p.operatorId,
          createdAt: p.createdAt,
        })),
      ].sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
      
      res.json(pendingItems);
    } catch (error) {
      console.error("Error fetching pending items:", error);
      res.status(500).json({ message: "Failed to fetch pending items" });
    }
  });

  // Get recent users for admin
  app.get("/api/marketplace/admin/users", requireStaffRole, async (req: any, res) => {
    try {
      const users = await storage.getAllUsers();
      const usersWithRoles = await Promise.all(
        users.slice(0, 20).map(async (user) => {
          const roles = await storage.getUserRoles(user.id);
          return {
            ...user,
            roles: roles.map(r => r.role),
          };
        })
      );
      res.json(usersWithRoles);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  // Get recent leads for admin
  app.get("/api/marketplace/admin/leads", requireStaffRole, async (req: any, res) => {
    try {
      const [sellerLeads, investorLeads] = await Promise.all([
        storage.getSellerLeads(),
        storage.getInvestorLeads(),
      ]);
      
      const leads = [
        ...sellerLeads.slice(0, 10).map(l => ({
          id: l.id,
          type: "seller" as const,
          name: `${l.firstName || ""} ${l.lastName || ""}`.trim() || "Property Owner",
          description: `${l.propertyAddress || "Property"} | ${l.motivation || "Inquiry"}`,
          status: l.status,
          createdAt: l.createdAt,
        })),
        ...investorLeads.slice(0, 10).map(l => ({
          id: l.id,
          type: "investor" as const,
          name: `${l.firstName || ""} ${l.lastName || ""}`.trim() || "Investor",
          description: `Budget: ${l.capitalAvailable ? "$" + l.capitalAvailable : "TBD"} | ${l.investmentTypes?.join(", ") || "Various"}`,
          status: l.status,
          createdAt: l.createdAt,
        })),
      ].sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
      
      res.json(leads.slice(0, 15));
    } catch (error) {
      console.error("Error fetching leads:", error);
      res.status(500).json({ message: "Failed to fetch leads" });
    }
  });

  // Approve or reject a wholesale deal
  app.patch("/api/marketplace/admin/deals/:id/status", requireStaffRole, async (req: any, res) => {
    try {
      const dealId = Number(req.params.id);
      const { status, rejectionReason } = req.body;
      
      if (!["approved", "listed", "rejected", "under_review"].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }
      
      const deal = await storage.getWholesaleDeal(dealId);
      if (!deal) {
        return res.status(404).json({ message: "Deal not found" });
      }
      
      const updated = await storage.updateWholesaleDeal(dealId, { 
        status,
        ...(rejectionReason && { notes: rejectionReason })
      });
      
      if (deal.submittedBy) {
        const notificationType = status === "approved" || status === "listed" ? "deal_update" : "deal_update";
        const notificationTitle = status === "approved" || status === "listed" 
          ? `Your deal at ${deal.propertyAddress || "property"} has been approved!`
          : status === "rejected"
          ? `Your deal submission requires attention`
          : `Your deal status has been updated`;
        const notificationMessage = status === "rejected" && rejectionReason
          ? `Reason: ${rejectionReason}`
          : status === "approved" || status === "listed"
          ? "Your deal is now live on the marketplace."
          : undefined;
        
        await storage.createNotification({
          userId: deal.submittedBy,
          type: notificationType,
          title: notificationTitle,
          message: notificationMessage,
          relatedType: "deal",
          relatedId: dealId,
          link: `/marketplace/wholesaler/deals`,
        });
      }
      
      res.json(updated);
    } catch (error) {
      console.error("Error updating deal status:", error);
      res.status(500).json({ message: "Failed to update deal status" });
    }
  });

  // Approve or reject a capital project
  app.patch("/api/marketplace/admin/projects/:id/status", requireStaffRole, async (req: any, res) => {
    try {
      const projectId = Number(req.params.id);
      const { status, rejectionReason } = req.body;
      
      if (!["approved", "funding", "rejected", "under_review"].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }
      
      const project = await storage.getCapitalProject(projectId);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      
      const updated = await storage.updateCapitalProject(projectId, { 
        status,
        ...(rejectionReason && { notes: rejectionReason })
      });
      
      if (project.operatorId) {
        const notificationTitle = status === "approved" || status === "funding" 
          ? `Your project "${project.title}" has been approved!`
          : status === "rejected"
          ? `Your project submission requires attention`
          : `Your project status has been updated`;
        const notificationMessage = status === "rejected" && rejectionReason
          ? `Reason: ${rejectionReason}`
          : status === "approved" || status === "funding"
          ? "Your project is now open for investment."
          : undefined;
        
        await storage.createNotification({
          userId: project.operatorId,
          type: "deal_update",
          title: notificationTitle,
          message: notificationMessage,
          relatedType: "project",
          relatedId: projectId,
          link: `/marketplace/dreamscaper/projects`,
        });
      }
      
      res.json(updated);
    } catch (error) {
      console.error("Error updating project status:", error);
      res.status(500).json({ message: "Failed to update project status" });
    }
  });

  // ========================================
  // SUPABASE-BASED STATS ENDPOINTS (with hybrid auth support)
  // ========================================

  // Helper to check if user authenticated via Replit Auth (uses external_user_id columns)
  const isReplitAuthUser = (req: any): boolean => {
    return !!req.user?.claims?.sub && !req.supabaseUser;
  };

  // Supabase Wholesaler Stats
  app.get("/api/supabase/marketplace/wholesaler/stats", isHybridAuthenticated, async (req: any, res) => {
    try {
      const userId = getAuthUserId(req);
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const { storage } = await getSupabaseStorage();
      
      // For Replit Auth users, try external_user_id columns first, then fall back to regular
      // For Supabase Auth users, use regular columns
      let deals = await storage.getWholesaleDealsByUser(userId);
      if (deals.length === 0 && isReplitAuthUser(req)) {
        deals = await supabaseStorage.getWholesaleDealsByExternalUser(userId);
      }
      
      let jvRequests = await storage.getJVRequestsByUser(userId);
      if (jvRequests.length === 0 && isReplitAuthUser(req)) {
        jvRequests = await supabaseStorage.getJVRequestsForWholesalerByExternalId(userId);
      }

      const stats = {
        active: deals.filter(d => d.status === "listed" || d.status === "approved" || d.status === "ACTIVE" || d.status === "Available").length,
        pending: deals.filter(d => d.status === "pending_review" || d.status === "under_review" || d.status === "PENDING" || d.status === "Under Review").length,
        sold: deals.filter(d => d.status === "sold" || d.status === "closed" || d.status === "CLOSED" || d.status === "Sold").length,
        totalVolume: deals
          .filter(d => d.status === "sold" || d.status === "closed" || d.status === "CLOSED" || d.status === "Sold")
          .reduce((sum, d) => sum + (d.assignment_fee || 0), 0),
        jvRequestsReceived: jvRequests.length,
        jvRequestsPending: jvRequests.filter(r => r.status === "pending" || r.status === "PENDING").length,
      };

      res.json(stats);
    } catch (error) {
      console.error("Error fetching Supabase wholesaler stats:", error);
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  // Supabase Wholesaler Deals
  app.get("/api/supabase/marketplace/wholesaler/deals", isHybridAuthenticated, async (req: any, res) => {
    try {
      const userId = getAuthUserId(req);
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const { storage, toCamelCase } = await getSupabaseStorage();
      let deals = await storage.getWholesaleDealsByUser(userId);
      if (deals.length === 0 && isReplitAuthUser(req)) {
        deals = await supabaseStorage.getWholesaleDealsByExternalUser(userId);
      }
      res.json(toCamelCase(deals));
    } catch (error) {
      console.error("Error fetching Supabase wholesaler deals:", error);
      res.status(500).json({ message: "Failed to fetch deals" });
    }
  });

  // Supabase Investor Stats
  app.get("/api/supabase/marketplace/investor/stats", isHybridAuthenticated, async (req: any, res) => {
    try {
      const userId = getAuthUserId(req);
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const { storage } = await getSupabaseStorage();
      let commitments = await storage.getCapitalCommitmentsByUser(userId);
      if (commitments.length === 0 && isReplitAuthUser(req)) {
        commitments = await supabaseStorage.getCapitalCommitmentsByExternalUser(userId);
      }
      
      let savedItems = await storage.getSavedItems(userId);
      if (savedItems.length === 0 && isReplitAuthUser(req)) {
        savedItems = await supabaseStorage.getSavedItemsByExternalUser(userId);
      }

      const stats = {
        totalInvested: commitments
          .filter(c => c.status === "accepted" || c.status === "ACCEPTED" || c.status === "committed" || c.status === "Accepted")
          .reduce((sum, c) => sum + (c.amount || 0), 0),
        activeDeals: commitments.filter(c => 
          c.status === "accepted" || c.status === "ACCEPTED" || c.status === "committed" || c.status === "Accepted"
        ).length,
        savedDeals: savedItems.length,
        pendingOffers: commitments.filter(c => 
          c.status === "pending" || c.status === "PENDING" || c.status === "Pending"
        ).length,
      };

      res.json(stats);
    } catch (error) {
      console.error("Error fetching Supabase investor stats:", error);
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  // Supabase Investor Commitments
  app.get("/api/supabase/marketplace/investor/commitments", isHybridAuthenticated, async (req: any, res) => {
    try {
      const userId = getAuthUserId(req);
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const { storage, toCamelCase } = await getSupabaseStorage();
      let commitments = await storage.getCapitalCommitmentsByUser(userId);
      if (commitments.length === 0 && isReplitAuthUser(req)) {
        commitments = await supabaseStorage.getCapitalCommitmentsByExternalUser(userId);
      }
      res.json(toCamelCase(commitments));
    } catch (error) {
      console.error("Error fetching Supabase investor commitments:", error);
      res.status(500).json({ message: "Failed to fetch commitments" });
    }
  });

  // Supabase Dreamscaper Stats
  app.get("/api/supabase/marketplace/dreamscaper/stats", isHybridAuthenticated, async (req: any, res) => {
    try {
      const userId = getAuthUserId(req);
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const { storage } = await getSupabaseStorage();
      let projects = await storage.getCapitalProjectsByUser(userId);
      if (projects.length === 0 && isReplitAuthUser(req)) {
        projects = await supabaseStorage.getCapitalProjectsByExternalUser(userId);
      }
      
      let jvRequests = await storage.getJVRequestsByUser(userId);
      if (jvRequests.length === 0 && isReplitAuthUser(req)) {
        jvRequests = await supabaseStorage.getJVRequestsByExternalUser(userId);
      }

      const stats = {
        activeProjects: projects.filter(p => 
          p.status === "funding" || p.status === "active" || p.status === "ACTIVE" || p.status === "FUNDING" || p.status === "Funding"
        ).length,
        totalRaised: projects.reduce((sum, p) => sum + (p.amount_raised || 0), 0),
        totalFundingGoal: projects.reduce((sum, p) => sum + (p.funding_goal || 0), 0),
        projectsCompleted: projects.filter(p => 
          p.status === "completed" || p.status === "exited" || p.status === "COMPLETED" || p.status === "Completed"
        ).length,
        jvRequestsSent: jvRequests.length,
      };

      res.json(stats);
    } catch (error) {
      console.error("Error fetching Supabase dreamscaper stats:", error);
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  // Supabase Dreamscaper Projects
  app.get("/api/supabase/marketplace/dreamscaper/projects", isHybridAuthenticated, async (req: any, res) => {
    try {
      const userId = getAuthUserId(req);
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const { storage, toCamelCase } = await getSupabaseStorage();
      let projects = await storage.getCapitalProjectsByUser(userId);
      if (projects.length === 0 && isReplitAuthUser(req)) {
        projects = await supabaseStorage.getCapitalProjectsByExternalUser(userId);
      }
      res.json(toCamelCase(projects));
    } catch (error) {
      console.error("Error fetching Supabase dreamscaper projects:", error);
      res.status(500).json({ message: "Failed to fetch projects" });
    }
  });

  // Supabase Buyer Stats
  app.get("/api/supabase/marketplace/buyer/stats", isHybridAuthenticated, async (req: any, res) => {
    try {
      const userId = getAuthUserId(req);
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const { storage } = await getSupabaseStorage();
      let offers = await storage.getBuyerOffersByUser(userId);
      if (offers.length === 0 && isReplitAuthUser(req)) {
        offers = await supabaseStorage.getBuyerOffersByExternalUser(userId);
      }
      
      let savedItems = await storage.getSavedItems(userId);
      if (savedItems.length === 0 && isReplitAuthUser(req)) {
        savedItems = await supabaseStorage.getSavedItemsByExternalUser(userId);
      }

      const stats = {
        savedProperties: savedItems.filter(s => 
          s.item_type === "listing" || s.item_type === "wholesale_deal"
        ).length,
        pendingOffers: offers.filter(o => o.status === "pending" || o.status === "PENDING" || o.status === "Pending").length,
        acceptedOffers: offers.filter(o => o.status === "accepted" || o.status === "ACCEPTED" || o.status === "Accepted").length,
        totalPurchases: offers.filter(o => o.status === "closed" || o.status === "CLOSED" || o.status === "Closed").length,
      };

      res.json(stats);
    } catch (error) {
      console.error("Error fetching Supabase buyer stats:", error);
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  // Supabase Buyer Offers
  app.get("/api/supabase/marketplace/buyer/offers", isHybridAuthenticated, async (req: any, res) => {
    try {
      const userId = getAuthUserId(req);
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const { storage, toCamelCase } = await getSupabaseStorage();
      let offers = await storage.getBuyerOffersByUser(userId);
      if (offers.length === 0 && isReplitAuthUser(req)) {
        offers = await supabaseStorage.getBuyerOffersByExternalUser(userId);
      }
      res.json(toCamelCase(offers));
    } catch (error) {
      console.error("Error fetching Supabase buyer offers:", error);
      res.status(500).json({ message: "Failed to fetch offers" });
    }
  });

  // Supabase Saved Items
  app.get("/api/supabase/marketplace/saved", isHybridAuthenticated, async (req: any, res) => {
    try {
      const userId = getAuthUserId(req);
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const { storage, toCamelCase } = await getSupabaseStorage();
      let savedItems = await storage.getSavedItems(userId);
      if (savedItems.length === 0 && isReplitAuthUser(req)) {
        savedItems = await supabaseStorage.getSavedItemsByExternalUser(userId);
      }
      res.json(toCamelCase(savedItems));
    } catch (error) {
      console.error("Error fetching saved items:", error);
      res.status(500).json({ message: "Failed to fetch saved items" });
    }
  });

  // ========================================
  // MARKETPLACE BROWSE API ENDPOINTS
  // ========================================

  // Get all public/listed wholesale deals for browsing
  app.get("/api/marketplace/deals", async (req: any, res) => {
    try {
      const deals = await storage.getWholesaleDeals();
      
      const filteredDeals = deals.filter(d => d.status === "listed" || d.status === "approved" || d.status === "available");
      
      const uniqueSubmitterIds = [...new Set(filteredDeals.map(d => d.submittedBy).filter(Boolean))] as string[];
      
      let userMap = new Map<string, any>();
      let rolesMap = new Map<string, any[]>();
      let reputationMap = new Map<string, any>();
      let badgesMap = new Map<string, any[]>();
      
      try {
        const [usersResult, roles, reputations, badges] = await Promise.all([
          storage.getUsersByIds(uniqueSubmitterIds),
          storage.getRolesForUsers(uniqueSubmitterIds),
          storage.getReputationsForUsers(uniqueSubmitterIds),
          storage.getBadgesForUsers(uniqueSubmitterIds)
        ]);
        userMap = usersResult;
        rolesMap = roles;
        reputationMap = reputations;
        badgesMap = badges;
      } catch (err) {
        console.warn("Warning: Failed to fetch some user data for deals:", err);
      }
      
      const pegasusUserIds = new Set<string>();
      for (const [id, roles] of rolesMap) {
        if (roles && Array.isArray(roles) && roles.some((r: any) => r.role?.startsWith("pegasus_"))) {
          pegasusUserIds.add(id);
        }
      }
      
      const publicDeals = filteredDeals.map((d) => {
        const submitter = d.submittedBy ? userMap.get(d.submittedBy) : null;
        const reputation = d.submittedBy ? reputationMap.get(d.submittedBy) || null : null;
        const badges = d.submittedBy ? badgesMap.get(d.submittedBy) || [] : [];
        
        return {
          ...d,
          isPegasusDeal: d.submittedBy ? pegasusUserIds.has(d.submittedBy) : false,
          wholesalerInfo: submitter ? {
            id: submitter.id,
            firstName: submitter.firstName,
            lastName: submitter.lastName,
            profileImageUrl: submitter.profileImageUrl,
          } : null,
          wholesalerReputation: reputation ? {
            trustScore: reputation.trustScore ?? null,
            rating: reputation.rating ?? null,
            dealsClosedCount: reputation.dealsClosedCount ?? null,
            onTimeClosingsCount: reputation.onTimeClosingsCount ?? null,
          } : null,
          wholesalerBadges: Array.isArray(badges) ? badges.filter((b: any) => b?.isActive).map((b: any) => ({
            type: b.badgeType,
            label: b.label,
            icon: b.icon,
            color: b.color,
          })) : [],
        };
      });
      
      const sortedDeals = publicDeals.sort((a, b) => {
        if (a.isPegasusDeal && !b.isPegasusDeal) return -1;
        if (!a.isPegasusDeal && b.isPegasusDeal) return 1;
        return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      });
      
      res.json(sortedDeals);
    } catch (error) {
      console.error("Error fetching marketplace deals:", error);
      res.status(500).json({ message: "Failed to fetch deals" });
    }
  });

  // Get a single wholesale deal by ID
  app.get("/api/marketplace/deals/:id", async (req: any, res) => {
    try {
      const dealId = Number(req.params.id);
      if (isNaN(dealId)) {
        return res.status(400).json({ message: "Invalid deal ID" });
      }
      
      const deal = await storage.getWholesaleDeal(dealId);
      if (!deal) {
        return res.status(404).json({ message: "Deal not found" });
      }
      
      res.json(deal);
    } catch (error) {
      console.error("Error fetching deal:", error);
      res.status(500).json({ message: "Failed to fetch deal" });
    }
  });

  // Submit a JV request for a deal
  app.post("/api/marketplace/jv-requests", async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const { dealId, wholesalerId, message, intendedStrategy, fundingSource, proposedAssignmentFee } = req.body;
      
      if (!dealId) {
        return res.status(400).json({ message: "Deal ID is required" });
      }

      const deal = await storage.getWholesaleDeal(dealId);
      
      const jvRequest = await storage.createJvRequest({
        dealId,
        dreamscaperId: userId,
        wholesalerId: wholesalerId || "",
        message: message || null,
        intendedStrategy: intendedStrategy || null,
        fundingSource: fundingSource || null,
        proposedAssignmentFee: proposedAssignmentFee || null,
      });

      if (deal && deal.submittedBy) {
        await storage.createNotification({
          userId: deal.submittedBy,
          type: "deal_interest",
          title: `New JV request on your deal`,
          message: deal.propertyAddress ? `A dreamscaper is interested in ${deal.propertyAddress}` : "Someone is interested in your wholesale deal",
          relatedType: "deal",
          relatedId: dealId,
          link: `/marketplace/wholesaler/deals`,
        });
      }

      res.status(201).json(jvRequest);
    } catch (error) {
      console.error("Error creating JV request:", error);
      res.status(500).json({ message: "Failed to submit JV request" });
    }
  });

  // Get all capital projects for browsing (public)
  app.get("/api/marketplace/projects", async (req: any, res) => {
    try {
      const projects = await storage.getCapitalProjects();
      const users = await storage.getAllUsers();
      
      const pegasusUserIds = new Set<string>();
      for (const user of users) {
        const roles = await storage.getUserRoles(user.id);
        const hasPegasusRole = roles.some(r => r.role.startsWith("pegasus_"));
        if (hasPegasusRole) {
          pegasusUserIds.add(user.id);
        }
      }
      
      const publicProjects = projects
        .filter(p => 
          p.status === "OPEN_FOR_INVESTMENT" || 
          p.status === "funding" || 
          p.status === "active" ||
          p.status === "FUNDED"
        )
        .map(p => ({
          ...p,
          isPegasusProject: p.operatorId ? pegasusUserIds.has(p.operatorId) : false,
        }))
        .sort((a, b) => {
          if (a.isPegasusProject && !b.isPegasusProject) return -1;
          if (!a.isPegasusProject && b.isPegasusProject) return 1;
          return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
        });
      
      res.json(publicProjects);
    } catch (error) {
      console.error("Error fetching marketplace projects:", error);
      res.status(500).json({ message: "Failed to fetch projects" });
    }
  });

  // Get a single capital project by ID
  app.get("/api/marketplace/projects/:id", async (req: any, res) => {
    try {
      const projectId = Number(req.params.id);
      if (isNaN(projectId)) {
        return res.status(400).json({ message: "Invalid project ID" });
      }
      
      const project = await storage.getCapitalProject(projectId);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      
      res.json(project);
    } catch (error) {
      console.error("Error fetching project:", error);
      res.status(500).json({ message: "Failed to fetch project" });
    }
  });

  // Submit investment interest for a capital project
  app.post("/api/marketplace/investment-interest", async (req: any, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const { projectId, amount, structurePreference, notes } = req.body;
      
      if (!projectId || !amount) {
        return res.status(400).json({ message: "Project ID and amount are required" });
      }

      const project = await storage.getCapitalProject(Number(projectId));
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }

      if (amount < (project.minInvestment || 0)) {
        return res.status(400).json({ 
          message: `Minimum investment is $${project.minInvestment?.toLocaleString()}` 
        });
      }

      // Create an investment offer
      const offer = await storage.createInvestmentOffer({
        projectId: Number(projectId),
        investorId: req.user.id,
        amountOffered: Number(amount),
        structureType: structurePreference || project.structure,
        notes: notes || null,
        status: "pending",
        role: "LP",
        requestedInterestRate: null,
        requestedEquityPercent: null,
        requestedProfitSplit: null,
        requestedPreferredReturn: null,
        requestedPoints: null,
        requestedDuration: null,
        counterOfferRate: null,
        counterOfferEquity: null,
        counterOfferNotes: null,
        negotiationHistory: null,
      });

      if (project.operatorId) {
        await storage.createNotification({
          userId: project.operatorId,
          type: "investment_offer",
          title: `New investment interest in "${project.title}"`,
          message: `An investor is interested in investing $${Number(amount).toLocaleString()}`,
          relatedType: "project",
          relatedId: Number(projectId),
          link: `/marketplace/dreamscaper/projects`,
        });
      }

      res.status(201).json({ 
        message: "Investment interest submitted successfully",
        offerId: offer.id 
      });
    } catch (error) {
      console.error("Error submitting investment interest:", error);
      res.status(500).json({ message: "Failed to submit investment interest" });
    }
  });

  // ========================================
  // END MARKETPLACE DASHBOARD API ENDPOINTS
  // ========================================

  // Generate capital project PDF
  app.get("/api/pdf/capital-project/:id", async (req, res) => {
    try {
      const projectId = Number(req.params.id);
      const project = await storage.getCapitalProject(projectId);
      
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      
      const buffer = await generateDealPacketPDF({
        title: project.title,
        type: "capital",
        propertyAddress: project.location || "",
        propertyType: project.propertyType || undefined,
        arv: project.projectedARV || undefined,
        purchasePrice: project.purchasePrice || undefined,
        rehabCost: project.rehabBudget || undefined,
        expectedProfit: project.projectedReturn ? 
          (project.fundingGoal || 0) * (parseFloat(project.projectedReturn) / 100) : 
          undefined,
        description: project.description || undefined,
        highlights: undefined,
        timeline: project.holdPeriod || undefined,
        operatorName: project.createdBy || "Dreamscaper Operator",
      });
      
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition", 
        `attachment; filename="capital-project-${projectId}-${Date.now()}.pdf"`
      );
      res.send(buffer);
    } catch (error) {
      console.error("Error generating capital project PDF:", error);
      res.status(500).json({ message: "Failed to generate PDF" });
    }
  });

  return httpServer;
}
