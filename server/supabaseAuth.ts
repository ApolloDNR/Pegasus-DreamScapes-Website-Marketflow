import { Request, Response, NextFunction } from 'express';
import {
  supabase,
  supabaseAdmin,
  isSupabaseConfigured,
  isSupabaseAdminConfigured,
} from './lib/supabase';

export interface SupabaseUser {
  id: string;
  email: string;
  claims: {
    sub: string;
    email: string;
    [key: string]: any;
  };
}

declare global {
  namespace Express {
    interface Request {
      supabaseUser?: SupabaseUser;
    }
  }
}

export async function extractSupabaseUser(req: Request): Promise<SupabaseUser | null> {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }
    
    const token = authHeader.substring(7);

    // Token verification works with the service-role client when available,
    // and falls back to the anon client (which can also validate user JWTs
    // against the auth server). Without either, bearer auth is unavailable.
    const authClient = isSupabaseAdminConfigured
      ? supabaseAdmin
      : isSupabaseConfigured
        ? supabase
        : null;
    if (!authClient) {
      return null;
    }

    const { data: { user }, error } = await authClient.auth.getUser(token);

    if (error || !user) {
      return null;
    }
    
    return {
      id: user.id,
      email: user.email || '',
      claims: {
        ...user.user_metadata,
        sub: user.id,
        email: user.email || ''
      }
    };
  } catch (err) {
    console.error('Error extracting Supabase user:', err);
    return null;
  }
}

export async function supabaseAuthMiddleware(req: Request, res: Response, next: NextFunction) {
  const supabaseUser = await extractSupabaseUser(req);
  
  if (supabaseUser) {
    req.supabaseUser = supabaseUser;
    if (!req.user) {
      (req as any).user = {
        claims: supabaseUser.claims
      };
    }
  }
  
  next();
}

export function isSupabaseAuthenticated(req: Request, res: Response, next: NextFunction) {
  if (req.supabaseUser || (req as any).user?.claims?.sub) {
    return next();
  }
  
  return res.status(401).json({ message: 'Unauthorized' });
}

export function requireSupabaseAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.supabaseUser) {
    return res.status(401).json({ message: 'Supabase authentication required' });
  }
  next();
}
