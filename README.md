# Pegasus DreamScapes Website + MarketFlow

## Overview
Public website for Pegasus Dreamscapes (Development • Investments • Systems) plus MarketFlow private beta workflows.

## Local setup
1. Install deps: `npm install`
2. Copy env vars into `.env`
3. Run development server: `npm run dev`

## Required environment variables
See `.env.example`.

## Commands
- Dev: `npm run dev`
- Typecheck/lint checks: `npm run check`
- Build: `npm run build`
- Production start: `npm run start`

## Deployment notes
- Configure all production environment variables.
- Configure Supabase Auth Site URL and allowed redirect URLs for your production domain.
- Configure outbound email provider (SendGrid) and verified sender address.
- Confirm database migration/push workflow used by your host before deploy.
- App should run on a standard Node host that supports `npm run build` and `npm run start`.

## Known beta limitations
- MarketFlow is private beta; features and access may be limited.
- Advanced role dashboards are still in-progress.
- Deal visibility/matching workflows are review-based during beta.
