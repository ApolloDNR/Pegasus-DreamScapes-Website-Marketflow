# Pegasus Website v1 — Routing, Forms, and Data Schema

This document defines the functional intake system for the Pegasus Dreamscapes public website.

## 1. Website Funnel Model

The website is a deal-routing front door.

Primary flow:

**Visitor → Situation → Property/Deal Review → Department Route → Internal Opportunity Record → Follow-up**

Operating spine:

**Acquisitions → Development → Dispositions → Asset Management**

Support tools:

**Strategy Lab → MarketFlow → PeggyAI → Pegasus HQ**

## 2. Visitor Routing

### 2.1 Homepage Situation Router

The homepage must ask:

**What brings you here?**

Cards:

1. **I own a property**
   - Route: `/sellers` or `/submit-property?type=owner`
   - Primary CTA: Start Owner Review
   - Likely departments: Acquisitions, Development, Dispositions, KW representation if applicable

2. **I found a deal**
   - Route: `/deal-finders` or `/submit-property?type=deal-finder`
   - Primary CTA: Submit Deal
   - Likely departments: Acquisitions, Dispositions, MarketFlow

3. **I want to buy**
   - Route: `/buyers`
   - Primary CTA: Work With Apollo or Join MarketFlow
   - Likely departments: Dispositions, MarketFlow, KW representation

4. **I want to partner**
   - Route: `/capital-partners` or `/operators-vendors`
   - Primary CTA: Partner With Pegasus
   - Likely departments: Acquisitions, Development, Asset Management

5. **I need a strategy**
   - Route: `/strategy-lab` or `/submit-property?type=strategy`
   - Primary CTA: Request Strategy Review
   - Likely departments: Strategy Lab first, then routed

---

## 3. Department Routing Logic

### 3.1 Distressed owner

Initial route: Acquisitions

Possible routes:

- Acquisitions → Dispositions
- Acquisitions → Development → Dispositions
- Acquisitions → Development → Asset Management
- Strategy Review → Work With Apollo / Keller Williams
- Passed / Archived

### 3.2 Inherited / probate owner

Initial route: Acquisitions

Possible routes:

- Acquisitions → Dispositions
- Acquisitions → Work With Apollo / Keller Williams
- Acquisitions → Development → Dispositions
- Passed / Archived

### 3.3 Deal finder / wholesaler

Initial route: Acquisitions

Possible routes:

- Acquisitions → Dispositions / MarketFlow
- Acquisitions → Development → Dispositions
- Acquisitions → Passed / Archived

Required note:

Source attribution is recorded at submission. Any JV, assignment, referral, or compensation structure must be agreed in writing before distribution.

### 3.4 Buyer

Initial route: Work With Apollo or MarketFlow

Possible routes:

- Work With Apollo / Keller Williams
- MarketFlow buyer network
- Dispositions

### 3.5 Capital partner

Initial route: Private review

Possible routes:

- Acquisitions project review
- Development project review
- Asset Management long-term hold review
- Passed / Archived

Required note:

No public offering, no guaranteed returns, no pooled fund. Project-by-project private review only.

### 3.6 Vendor / operator

Initial route: Development bench

Possible routes:

- Development vendor bench
- Asset Management vendor bench
- Dispositions marketing partner bench

### 3.7 Referral partner

Initial route: Referral intake

Possible routes:

- Acquisitions
- Dispositions
- Work With Apollo / Keller Williams
- Vendor / partner bench
- Passed / Archived

Required note:

Referral compensation, JV participation, or professional coordination is handled only where lawful, permitted, and agreed in writing.

---

## 4. Submit Property Form

The Submit Property form is the most important conversion flow. It should feel like a professional intake desk, not a generic contact form.

### Step 1 — What brings you here?

Field name: `visitor_type`

Options:

- `owner` — I own the property
- `owner_representative` — I represent or help the owner
- `deal_finder` — I found a deal
- `buyer` — I want to buy
- `capital_partner` — I want to invest/partner
- `vendor_operator` — I am a vendor/operator
- `strategy_only` — I need advice/strategy
- `other` — Other

### Step 2 — Property information

Fields:

- `property_address`
- `city`
- `state`
- `zip_code`
- `property_type`
- `occupancy_status`
- `condition`
- `estimated_value`
- `estimated_debt`
- `photos_docs_upload`
- `urgent_notes`

Property type options:

- Single-family
- Duplex
- Triplex
- Fourplex
- Multifamily 5+
- Land
- Mixed-use
- Commercial
- Other

Occupancy options:

- Owner occupied
- Tenant occupied
- Vacant
- Partially occupied
- Unknown

Condition options:

- Turnkey
- Light cosmetic
- Moderate repairs
- Heavy repairs
- Fire/water damage
- Unfinished project
- Unknown

### Step 3 — Situation

Field name: `situation`

Options:

- Inherited / probate
- Pre-foreclosure
- Behind on payments
- Divorce
- Vacant
- Tenant issue
- Major repairs
- Fire/water damage
- Unfinished project
- Partnership dispute
- Off-market deal
- Need buyer
- Need capital
- Need construction
- Just exploring
- Other

### Step 4 — Goal

Field name: `goal`

Options:

- Sell
- Get offer
- Partner / JV
- List through Apollo / Keller Williams
- Develop / reposition
- Find buyer
- Hold / rent
- Refinance
- Not sure
- Other

### Step 5 — Contact

Fields:

- `contact_name`
- `email`
- `phone`
- `preferred_contact_method`
- `best_time_to_contact`
- `message`
- `consent_accepted`

Consent copy:

By submitting this form, you agree that Pegasus Dreamscapes may contact you about your submission. No agency relationship, offer, or agreement is created by submitting this form.

### Step 6 — Confirmation

Confirmation message:

Your submission has been received. Pegasus will review the property and route it to the appropriate lane: acquisition, development, disposition, asset management, licensed representation, referral, or pass/no-fit.

---

## 5. Additional Forms

### 5.1 Submit Deal

Route: `/deal-finders`

Required fields:

- Contact name
- Email
- Phone
- Role
- Property address
- Deal status
- Asking price / contract price
- Deadline
- Source / relationship to deal
- Documents/photos
- Notes
- Consent

Source protection note:

Source attribution is recorded at submission. Any JV, assignment, referral, or compensation structure must be agreed in writing before distribution.

### 5.2 Strategy Review

Route: `/strategy-lab`

Required fields:

- Contact name
- Email
- Property address or market
- Property type
- Estimated current value
- Purchase price or target price
- Repair estimate
- ARV estimate
- Rent estimate
- Timeline
- Goal
- Known issues
- Desired strategy

Output fields:

- Possible strategy lane
- Estimated all-in basis
- Possible spread
- Missing information
- Risk flags
- Recommended next step

Disclaimer:

Directional only. Not an offer, appraisal, legal advice, tax advice, financial advice, lending commitment, or investment recommendation.

### 5.3 MarketFlow Request Access

Route: `/marketflow`

Fields:

- Name
- Email
- Phone
- Role
- Markets
- Buy box
- Budget/capital range
- Property types
- Strategy interest
- Notes

Role options:

- Buyer
- Investor
- Capital partner
- Deal finder
- Wholesaler
- Agent
- Vendor
- Contractor
- Referral partner
- Other

Confirmation:

Your MarketFlow request has been received. Pegasus reviews access manually and will follow up if there is a fit.

### 5.4 Work With Apollo

Route: `/work-with-apollo`

Fields:

- Name
- Email
- Phone
- Real estate goal
- Buyer/seller/investor/other
- Market
- Timeline
- Message
- Consent

Required display language near form:

Pegasus Dreamscapes Corp. is not a real estate brokerage. Licensed real estate representation, when applicable, is provided by Paolo “Apollo” Duran through Keller Williams East Bay. No agency relationship is created without a written agreement.

### 5.5 Capital Partner Private Review

Route: `/capital-partners`

Fields:

- Name
- Email
- Phone
- Capital partner type
- Investment/project interest
- Capital range
- Preferred structure
- Markets
- Notes
- Consent

Required note:

No public offering, no guaranteed returns, no pooled fund. Any capital relationship is reviewed privately and documented appropriately.

### 5.6 Vendor Bench

Route: `/operators-vendors`

Fields:

- Name / company
- Email
- Phone
- Trade / service
- Markets served
- License / insurance status if applicable
- Portfolio / website
- Notes

### 5.7 Referral Partner

Route: `/referral-partners`

Fields:

- Name
- Email
- Phone
- Relationship to owner/opportunity
- Property address if known
- Situation summary
- Desired follow-up
- Notes
- Consent

Required note:

Referral compensation, JV participation, or professional coordination is handled only where lawful, permitted, and agreed in writing.

---

## 6. Internal Opportunity Record

Every submission should create or be convertible into an internal opportunity record.

Suggested table: `opportunities`

Fields:

```sql
id uuid primary key default gen_random_uuid(),
created_at timestamptz default now(),
updated_at timestamptz default now(),
source_page text,
lead_source text,
visitor_type text,
contact_name text,
email text,
phone text,
preferred_contact_method text,
best_time_to_contact text,
property_address text,
city text,
state text,
zip_code text,
property_type text,
occupancy_status text,
condition text,
situation text,
goal text,
urgency text,
estimated_value numeric,
estimated_debt numeric,
notes text,
recommended_lane text,
assigned_department text,
status text default 'New',
consent_accepted boolean default false,
utm_source text,
utm_medium text,
utm_campaign text,
referrer text
```

Optional supporting tables:

- `contacts`
- `property_submissions`
- `strategy_reviews`
- `marketflow_requests`
- `partner_requests`
- `vendor_requests`
- `referral_submissions`
- `submission_files`

---

## 7. Statuses

Use these exact status labels:

1. New
2. Needs Review
3. Need More Info
4. Strategy Review
5. Routed
6. Active Opportunity
7. Under Contract
8. In Development
9. Disposition
10. Asset Management
11. Closed
12. Passed / Archived

---

## 8. Conversion Events

Track:

- `submit_property_started`
- `submit_property_completed`
- `submit_deal_completed`
- `strategy_review_requested`
- `marketflow_access_requested`
- `apollo_consult_requested`
- `capital_review_requested`
- `vendor_bench_joined`
- `referral_submitted`

Track also:

- CTA clicks
- Form starts
- Form drop-off by step
- Visitor type selected
- Most common situations
- Most common goals
- Source/UTM/referrer
- Device type

---

## 9. Email Notifications

After every form submission:

1. Show confirmation page.
2. Send confirmation email to user.
3. Send internal notification to Apollo.
4. Create database record.

Suggested internal notification subject:

`New Pegasus Website Submission: [Visitor Type] — [Property Address or Contact Name]`

Suggested user confirmation subject:

`Pegasus Dreamscapes received your submission`

Suggested confirmation body:

Thank you for submitting your property, deal, or request to Pegasus Dreamscapes. We received your information and will review it to determine the appropriate lane. If there is a fit or if we need more information, we will follow up with the next step.

No agency relationship, offer, or agreement is created by submitting this form.
