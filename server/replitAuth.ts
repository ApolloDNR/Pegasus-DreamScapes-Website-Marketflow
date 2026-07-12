import * as client from "openid-client";
import { Strategy, type VerifyFunction } from "openid-client/passport";

import passport from "passport";
import session from "express-session";
import type { Express, RequestHandler } from "express";
import memoize from "memoizee";
import connectPg from "connect-pg-simple";
import { storage } from "./storage";
import { ensureUserProfileExists } from "./lib/supabase";
import { extractSupabaseUser } from "./supabaseAuth";

// Replit OIDC is only available when the app runs with a provisioned
// REPL_ID (i.e. on Replit). On other hosts (Render, Railway, ...) the
// app authenticates users exclusively through Supabase bearer tokens
// (see server/supabaseAuth.ts) and OIDC is skipped entirely so boot
// does not depend on reaching replit.com.
export const isReplitOidcEnabled = Boolean(process.env.REPL_ID);

const getOidcConfig = memoize(
  async () => {
    return await client.discovery(
      new URL(process.env.ISSUER_URL ?? "https://replit.com/oidc"),
      process.env.REPL_ID!
    );
  },
  { maxAge: 3600 * 1000 }
);

export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: true,
    ttl: sessionTtl,
    tableName: "sessions",
  });
  
  const isProduction = process.env.NODE_ENV === "production";
  
  return session({
    secret: process.env.SESSION_SECRET!,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "strict" : "lax",
      maxAge: sessionTtl,
    },
  });
}

function updateUserSession(
  user: any,
  tokens: client.TokenEndpointResponse & client.TokenEndpointResponseHelpers
) {
  user.claims = tokens.claims();
  user.access_token = tokens.access_token;
  user.refresh_token = tokens.refresh_token;
  user.expires_at = user.claims?.exp;
}

async function upsertUser(
  claims: any,
) {
  await storage.upsertUser({
    id: claims["sub"],
    email: claims["email"],
    firstName: claims["first_name"],
    lastName: claims["last_name"],
    profileImageUrl: claims["profile_image_url"],
  });
  
  try {
    await ensureUserProfileExists(claims["sub"], {
      email: claims["email"],
      firstName: claims["first_name"],
      lastName: claims["last_name"],
      profileImageUrl: claims["profile_image_url"],
    });
  } catch (error) {
    console.error('Failed to ensure Supabase profile exists:', error);
  }
}

export async function setupAuth(app: Express) {
  app.set("trust proxy", 1);
  app.use(getSession());
  app.use(passport.initialize());
  app.use(passport.session());

  if (!isReplitOidcEnabled) {
    console.warn(
      "[auth] REPL_ID not set — Replit OIDC disabled. Users authenticate via Supabase (see /signup).",
    );
    passport.serializeUser((user: Express.User, cb) => cb(null, user));
    passport.deserializeUser((user: Express.User, cb) => cb(null, user));
    // Keep the legacy entry points alive so old links and client fallbacks
    // land somewhere sensible instead of 404ing.
    app.get("/api/login", (_req, res) => res.redirect("/signup"));
    app.get("/api/callback", (_req, res) => res.redirect("/signup"));
    app.get("/api/logout", (req, res) => {
      req.logout(() => res.redirect("/"));
    });
    return;
  }

  const config = await getOidcConfig();

  const verify: VerifyFunction = async (
    tokens: client.TokenEndpointResponse & client.TokenEndpointResponseHelpers,
    verified: passport.AuthenticateCallback
  ) => {
    const user = {};
    updateUserSession(user, tokens);
    await upsertUser(tokens.claims());
    verified(null, user);
  };

  // Keep track of registered strategies
  const registeredStrategies = new Set<string>();

  // Helper function to ensure strategy exists for a domain
  const ensureStrategy = (domain: string) => {
    const strategyName = `replitauth:${domain}`;
    if (!registeredStrategies.has(strategyName)) {
      const strategy = new Strategy(
        {
          name: strategyName,
          config,
          scope: "openid email profile offline_access",
          callbackURL: `https://${domain}/api/callback`,
        },
        verify,
      );
      passport.use(strategy);
      registeredStrategies.add(strategyName);
    }
  };

  passport.serializeUser((user: Express.User, cb) => cb(null, user));
  passport.deserializeUser((user: Express.User, cb) => cb(null, user));

  app.get("/api/login", (req, res, next) => {
    ensureStrategy(req.hostname);
    passport.authenticate(`replitauth:${req.hostname}`, {
      prompt: "login consent",
      scope: ["openid", "email", "profile", "offline_access"],
    })(req, res, next);
  });

  app.get("/api/callback", (req, res, next) => {
    ensureStrategy(req.hostname);
    passport.authenticate(`replitauth:${req.hostname}`, {
      successReturnToOrRedirect: "/hq",
      failureRedirect: "/api/login",
    })(req, res, next);
  });

  app.get("/api/logout", (req, res) => {
    req.logout((err) => {
      if (err) {
        console.error("Logout error:", err);
      }
      res.redirect(
        client.buildEndSessionUrl(config, {
          client_id: process.env.REPL_ID!,
          post_logout_redirect_uri: `${req.protocol}://${req.hostname}`,
        }).href
      );
    });
  });
}

// Local-user provisioning parity for Supabase-authenticated requests: OIDC
// logins upsert into the app users table at login time; bearer users get the
// same treatment lazily, once per process per user.
const provisionedSupabaseSubs = new Set<string>();
async function ensureLocalUserForSupabase(claims: Record<string, any>) {
  const sub = claims?.sub;
  if (!sub || provisionedSupabaseSubs.has(sub)) return;
  provisionedSupabaseSubs.add(sub);
  try {
    await upsertUser(claims);
  } catch (error) {
    console.error("[auth] failed to provision local user for Supabase sub:", error);
  }
}

export const isAuthenticated: RequestHandler = async (req, res, next) => {
  const user = req.user as any;

  // Supabase bearer path: supabaseAuthMiddleware sets req.user = { claims }
  // (no OIDC session, no expires_at). A verified token is authenticated.
  if (user?.claims?.sub && !user.expires_at) {
    await ensureLocalUserForSupabase(user.claims);
    return next();
  }

  if (!req.isAuthenticated() || !user?.expires_at) {
    // Last chance: verify a Supabase bearer token directly (covers requests
    // that bypass the global middleware ordering).
    const supabaseUser = req.supabaseUser ?? (await extractSupabaseUser(req));
    if (supabaseUser) {
      (req as any).user = { claims: supabaseUser.claims };
      req.supabaseUser = supabaseUser;
      await ensureLocalUserForSupabase(supabaseUser.claims);
      return next();
    }
    return res.status(401).json({ message: "Unauthorized" });
  }

  const now = Math.floor(Date.now() / 1000);
  if (now <= user.expires_at) {
    return next();
  }

  const refreshToken = user.refresh_token;
  if (!refreshToken) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  try {
    const config = await getOidcConfig();
    const tokenResponse = await client.refreshTokenGrant(config, refreshToken);
    updateUserSession(user, tokenResponse);
    return next();
  } catch (error) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }
};
