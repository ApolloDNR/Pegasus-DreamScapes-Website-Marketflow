import { db } from "./db";
import { projects, articles, communityCategories } from "@shared/schema";
import { eq } from "drizzle-orm";

const initialProjects = [
  {
    slug: "nelson-dr",
    name: "Nelson Drive Flip",
    address: "1234 Nelson Dr",
    city: "Richmond",
    state: "CA",
    strategy: "fix-flip",
    status: "completed",
    purchasePrice: 425000,
    rehabCost: 85000,
    arv: 625000,
    salePrice: 615000,
    profit: 105000,
    roi: "20.6%",
    holdTime: "4 months",
    bedrooms: 3,
    bathrooms: "2",
    sqft: 1450,
    yearBuilt: 1962,
    description: "This classic Richmond ranch was transformed from a dated property into a modern family home. The renovation included a complete kitchen overhaul with quartz countertops and new cabinetry, updated bathrooms, new flooring throughout, fresh interior and exterior paint, and professional landscaping. The project was completed on time and under budget, resulting in a strong return for our investors.",
    beforeImages: [
      "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800",
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800"
    ],
    afterImages: [
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800",
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800"
    ],
    highlights: [
      "Complete kitchen renovation with quartz countertops",
      "Updated bathrooms with modern fixtures",
      "New LVP flooring throughout",
      "Fresh interior and exterior paint",
      "Professional landscaping and curb appeal improvements",
      "New HVAC system installed"
    ]
  },
  {
    slug: "maple-street",
    name: "Maple Street Rental",
    address: "567 Maple Street",
    city: "Oakland",
    state: "CA",
    strategy: "buy-hold",
    status: "active",
    purchasePrice: 380000,
    rehabCost: 45000,
    arv: 485000,
    bedrooms: 2,
    bathrooms: "1",
    sqft: 1100,
    yearBuilt: 1955,
    description: "A strategic buy-and-hold acquisition in a rapidly appreciating Oakland neighborhood. This 2-bedroom property was renovated to maximize rental income while maintaining long-term appreciation potential. Updates focused on durability and tenant appeal, including a modernized kitchen, refreshed bathroom, and new flooring.",
    beforeImages: [
      "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800"
    ],
    afterImages: [
      "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800",
      "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800"
    ],
    highlights: [
      "Modernized kitchen with stainless appliances",
      "Updated bathroom with new vanity and tile",
      "Durable LVP flooring for rental longevity",
      "Fresh neutral paint throughout",
      "Strong rental income in growing neighborhood"
    ]
  },
  {
    slug: "bay-view-duplex",
    name: "Bay View Duplex",
    address: "890 Bay View Avenue",
    city: "San Francisco",
    state: "CA",
    strategy: "fix-flip",
    status: "completed",
    purchasePrice: 950000,
    rehabCost: 175000,
    arv: 1350000,
    salePrice: 1325000,
    profit: 200000,
    roi: "17.8%",
    holdTime: "6 months",
    bedrooms: 4,
    bathrooms: "3",
    sqft: 2200,
    yearBuilt: 1928,
    description: "This stunning Bay View duplex conversion project transformed a deteriorating multi-family property into a highly desirable single-family home with income potential. The extensive renovation preserved original charm while adding modern amenities, creating tremendous value for our investors.",
    beforeImages: [
      "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800"
    ],
    afterImages: [
      "https://images.unsplash.com/photo-1600047509782-20d39509f26d?w=800",
      "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=800"
    ],
    highlights: [
      "Full duplex-to-single-family conversion",
      "Premium kitchen with custom cabinetry",
      "Original hardwood floors restored",
      "Three completely renovated bathrooms",
      "New electrical and plumbing throughout",
      "ADU potential maintained for future value"
    ]
  }
];

const initialArticles = [
  {
    slug: "70-percent-rule-explained",
    title: "The 70% Rule in Real Estate: A Complete Guide",
    excerpt: "Learn how the 70% rule helps real estate investors quickly evaluate fix-and-flip opportunities and avoid overpaying for properties.",
    content: `# The 70% Rule in Real Estate: A Complete Guide

The 70% rule is one of the most fundamental tools in a real estate investor's toolkit. It provides a quick way to determine the maximum price you should pay for a fix-and-flip property.

## What is the 70% Rule?

The 70% rule states that an investor should pay no more than 70% of a property's After Repair Value (ARV), minus the cost of repairs.

**Formula:** Maximum Purchase Price = (ARV × 0.70) − Repair Costs

## Example Calculation

Let's say you find a property with:
- ARV: $500,000
- Estimated Repairs: $75,000

Maximum Purchase Price = ($500,000 × 0.70) − $75,000 = $275,000

## Why 70%?

The 30% margin accounts for:
- **Closing costs** (buying and selling): ~6-10%
- **Holding costs** (utilities, taxes, insurance): ~2-4%
- **Financing costs**: ~3-5%
- **Your profit margin**: ~10-15%

## When to Use the 70% Rule

This rule works best for:
- Quick property analysis
- Competitive bidding situations
- Screening multiple deals
- Setting initial offer prices

## Limitations

The 70% rule is a starting point, not a final answer. You should also consider:
- Market conditions (hot markets may require adjustments)
- Your holding period
- Financing terms
- Your experience level

## Conclusion

While the 70% rule isn't perfect, it's an excellent screening tool that has stood the test of time. Use it to quickly filter opportunities, then dive deeper into deals that pass the initial test.

Ready to analyze your next deal? Use our [Deal Calculator](/calculators) to run the numbers.`,
    category: "Investment Strategies",
    author: "Pegasus Dreamscapes Team",
    imageUrl: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800",
    published: true,
    publishedAt: new Date("2024-11-15"),
  },
  {
    slug: "fix-and-flip-vs-buy-and-hold",
    title: "Fix & Flip vs. Buy & Hold: Which Strategy is Right for You?",
    excerpt: "Compare the two most popular real estate investment strategies and discover which one aligns with your financial goals and risk tolerance.",
    content: `# Fix & Flip vs. Buy & Hold: Which Strategy is Right for You?

When it comes to real estate investing, two strategies dominate the conversation: fix-and-flip and buy-and-hold. Each has its own advantages, challenges, and ideal use cases.

## Fix & Flip Overview

**What it is:** Purchase a distressed property, renovate it, and sell it for a profit within a short timeframe (typically 3-6 months).

**Pros:**
- Quick returns on investment
- No landlord responsibilities
- Capital recycling for new deals
- Active income generation

**Cons:**
- Higher risk if market shifts
- Active management required
- Capital gains taxes
- Renovation surprises

## Buy & Hold Overview

**What it is:** Purchase a property (often with light renovations) and rent it out for ongoing passive income and long-term appreciation.

**Pros:**
- Passive monthly income
- Long-term appreciation
- Tax advantages (depreciation)
- Wealth building over time

**Cons:**
- Landlord responsibilities
- Property management costs
- Tenant issues
- Capital tied up longer

## Which is Right for You?

**Choose Fix & Flip if you:**
- Want quick returns
- Have renovation experience or a reliable team
- Can handle active project management
- Have strong local market knowledge

**Choose Buy & Hold if you:**
- Want passive income
- Are focused on long-term wealth
- Prefer less active involvement
- Want tax advantages

## Our Approach at Pegasus

We use both strategies depending on the opportunity. Some properties are perfect flip candidates, while others make better rentals. Our team analyzes each deal individually to maximize returns.

Interested in partnering on either strategy? [Become an investor](/invest) or [sell us your property](/sell).`,
    category: "Investment Strategies",
    author: "Pegasus Dreamscapes Team",
    imageUrl: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800",
    published: true,
    publishedAt: new Date("2024-10-28"),
  },
  {
    slug: "california-real-estate-market-2024",
    title: "California Real Estate Market Outlook: What Investors Need to Know",
    excerpt: "An analysis of the California real estate market trends, including Bay Area dynamics, interest rate impacts, and opportunities for investors.",
    content: `# California Real Estate Market Outlook: What Investors Need to Know

California remains one of the most dynamic real estate markets in the country. Here's what investors need to know about current conditions and opportunities.

## Current Market Conditions

The California market has experienced significant shifts:
- **Inventory levels** are gradually increasing
- **Days on market** have extended compared to 2021-2022
- **Price growth** has moderated but remains positive in many areas
- **Rental demand** continues to be strong

## Bay Area Dynamics

The Bay Area presents unique opportunities:
- Tech sector layoffs have created more seller motivation
- Premium properties still command strong prices
- Suburban markets are seeing increased demand
- ADU (Accessory Dwelling Unit) opportunities abound

## Interest Rate Impact

Higher interest rates have:
- Reduced buyer pool for traditional purchases
- Created opportunities for cash buyers
- Made rental properties more attractive (fewer can afford to buy)
- Increased seller motivation

## Opportunities for Investors

**Fix & Flip:**
- Properties needing significant work are more negotiable
- Less competition from retail buyers
- Renovation costs have stabilized

**Buy & Hold:**
- Strong rental demand
- Potential for rent growth
- Long-term appreciation in key markets

## Our Focus Areas

At Pegasus Dreamscapes, we're focusing on:
- Richmond and East Bay submarkets
- Properties with value-add potential
- Multi-family conversion opportunities
- ADU development projects

## Conclusion

Despite challenges, California continues to offer opportunities for informed investors. The key is having the right team and strategy.

Want to discuss California investment opportunities? [Contact us](/contact) or [explore our projects](/projects).`,
    category: "Market Insights",
    author: "Pegasus Dreamscapes Team",
    imageUrl: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800",
    published: true,
    publishedAt: new Date("2024-11-01"),
  },
  {
    slug: "first-time-investor-mistakes",
    title: "5 Common Mistakes First-Time Real Estate Investors Make",
    excerpt: "Avoid costly errors by learning from the experiences of others. These five mistakes can derail your first real estate investment.",
    content: `# 5 Common Mistakes First-Time Real Estate Investors Make

Real estate investing can be incredibly rewarding, but first-time investors often make avoidable mistakes that eat into their returns or cause deals to fail entirely.

## Mistake #1: Underestimating Repair Costs

**The Problem:** Inexperienced investors often underestimate renovation costs by 20-40%.

**The Solution:**
- Get multiple contractor bids
- Add a 15-20% contingency
- Walk properties with an experienced investor or contractor
- Use detailed scope of work documents

## Mistake #2: Overestimating ARV

**The Problem:** Using best-case comparable sales instead of realistic ones.

**The Solution:**
- Use conservative comparable sales
- Account for market conditions
- Get input from local agents
- Consider listing below market for a quick sale

## Mistake #3: Ignoring Holding Costs

**The Problem:** Forgetting that every month you hold a property costs money.

**The Solution:**
- Calculate all monthly costs (mortgage, utilities, taxes, insurance)
- Add 2-3 months buffer to your timeline
- Factor holding costs into your maximum purchase price

## Mistake #4: Not Having a Team

**The Problem:** Trying to do everything yourself.

**The Solution:**
- Build relationships with contractors
- Find a reliable real estate agent
- Connect with other investors
- Consider partnering on first deals

## Mistake #5: Analysis Paralysis

**The Problem:** Waiting for the "perfect" deal and never taking action.

**The Solution:**
- Set clear investment criteria
- Analyze multiple deals weekly
- Make offers regularly
- Learn from each experience

## How We Help

At Pegasus Dreamscapes, we help new investors avoid these mistakes by:
- Providing detailed deal analysis
- Managing renovation projects
- Offering partnership opportunities
- Sharing our experience and network

Ready to start your investment journey the right way? [Become an investor](/invest) or use our [deal calculators](/calculators) to analyze opportunities.`,
    category: "Education",
    author: "Pegasus Dreamscapes Team",
    imageUrl: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800",
    published: true,
    publishedAt: new Date("2024-10-15"),
  },
  {
    slug: "brrrr-method-explained",
    title: "The BRRRR Method: Build Wealth Through Real Estate Recycling",
    excerpt: "Discover how the BRRRR strategy allows investors to recycle their capital and build a rental portfolio with limited funds.",
    content: `# The BRRRR Method: Build Wealth Through Real Estate Recycling

The BRRRR method is one of the most powerful wealth-building strategies in real estate. It allows investors to continuously recycle their capital to build a substantial rental portfolio.

## What is BRRRR?

BRRRR stands for:
- **B**uy - Purchase undervalued property
- **R**ehab - Renovate to add value
- **R**ent - Place quality tenants
- **R**efinance - Cash-out refinance at new value
- **R**epeat - Use proceeds for next deal

## The Power of BRRRR

The magic of BRRRR lies in the refinance step. When executed correctly, you can:
- Recover your initial investment
- Keep the cash-flowing property
- Use recovered funds for the next deal

## Example Deal

**Initial Investment:**
- Purchase Price: $120,000
- Rehab Costs: $40,000
- Closing Costs: $5,000
- **Total Investment: $165,000**

**After Renovation:**
- New Appraised Value: $220,000
- Monthly Rent: $1,800
- 75% LTV Refinance: $165,000

**Result:** All money back, plus a cash-flowing rental!

## Keys to Success

1. **Buy Right** - Find properties at 65-70% of ARV
2. **Control Rehab Costs** - Stay within budget
3. **Add Real Value** - Focus on improvements that increase appraisals
4. **Build Lender Relationships** - Have financing lined up

## Is BRRRR Right for You?

BRRRR works best for investors who:
- Have some upfront capital
- Want to build a rental portfolio
- Are patient (process takes 6-12 months per property)
- Have strong local market knowledge

Learn more about [how we execute BRRRR deals](/services) or [partner with us](/invest).`,
    category: "Investment Strategies",
    author: "Pegasus Dreamscapes Team",
    imageUrl: "https://images.unsplash.com/photo-1582407947304-fd86f028f716?w=800",
    published: true,
    publishedAt: new Date("2024-11-01"),
  },
  {
    slug: "wholesale-real-estate-guide",
    title: "Wholesale Real Estate: A Beginner's Complete Guide",
    excerpt: "Learn how wholesaling works, the key steps involved, and whether this low-capital entry strategy is right for you.",
    content: `# Wholesale Real Estate: A Beginner's Complete Guide

Wholesaling is one of the most accessible ways to enter real estate investing. It requires little to no capital but does require hustle, knowledge, and negotiation skills.

## What is Wholesaling?

Wholesaling involves:
1. Finding deeply discounted properties
2. Getting them under contract
3. Assigning the contract to an end buyer
4. Earning an assignment fee

You're essentially a deal finder who connects motivated sellers with cash buyers.

## The Wholesaling Process

### Step 1: Find Motivated Sellers
- Driving for dollars
- Direct mail campaigns
- Online marketing
- Networking with agents
- Probate and foreclosure lists

### Step 2: Analyze the Deal
Use the 70% rule:
- **MAO = (ARV × 70%) - Repairs - Your Fee**

### Step 3: Get It Under Contract
- Use an assignable purchase agreement
- Include appropriate contingencies
- Secure earnest money

### Step 4: Find Your Buyer
- Build a buyers list
- Market the deal quickly
- Verify proof of funds

### Step 5: Assign and Close
- Execute an assignment agreement
- Collect your fee at closing

## Profit Potential

Average wholesale fees range from $5,000 to $25,000 per deal. Experienced wholesalers do 2-5 deals per month.

## Common Mistakes to Avoid

1. Not knowing your buyers' criteria
2. Overestimating ARV
3. Underestimating repairs
4. Not building a buyers list first
5. Poor follow-up with leads

## Ready to Start?

Check out our [wholesale deals](/wholesale) or [submit a property](/sell) you've found.`,
    category: "Investment Strategies",
    author: "Pegasus Dreamscapes Team",
    imageUrl: "https://images.unsplash.com/photo-1560520653-9e0e4c89eb11?w=800",
    published: true,
    publishedAt: new Date("2024-09-20"),
  },
  {
    slug: "financing-options-real-estate-investors",
    title: "Financing Options for Real Estate Investors: Complete Overview",
    excerpt: "Explore the different financing strategies available to real estate investors, from traditional loans to creative financing.",
    content: `# Financing Options for Real Estate Investors

Understanding your financing options is crucial to success in real estate investing. Each option has its own advantages, requirements, and ideal use cases.

## Traditional Financing

### Conventional Loans
- Down Payment: 20-25%
- Interest Rates: Competitive
- Best For: Primary residences, long-term holds
- Challenges: Strict qualification, limited properties

### FHA Loans (House Hacking)
- Down Payment: 3.5%
- Must be owner-occupied
- Great for getting started
- Live in one unit, rent others

## Investment-Specific Financing

### Hard Money Loans
- Fast closing (7-14 days)
- Asset-based (less focus on credit)
- Higher interest (12-18%)
- Short term (6-12 months)
- Best for fix-and-flip

### Private Money
- From individual investors
- Negotiable terms
- Relationship-based
- More flexible than hard money

### DSCR Loans
- Based on property cash flow
- No personal income verification
- Ideal for investors with multiple properties
- Competitive rates for rentals

## Creative Financing

### Seller Financing
- Seller acts as the bank
- Flexible terms possible
- Often lower down payments
- Good for unique situations

### Subject-To
- Take over existing mortgage
- No new financing needed
- Seller stays on loan
- Requires careful legal work

### Partnerships
- Split capital and work
- Access to more deals
- Shared risk and reward
- Important to document properly

## Choosing the Right Option

**For Flips:** Hard money or private money
**For Rentals:** DSCR loans or conventional
**For Getting Started:** FHA house hacking
**For Scaling:** Private money or partnerships

[Contact us](/contact) to discuss financing options for your next deal.`,
    category: "Financing",
    author: "Pegasus Dreamscapes Team",
    imageUrl: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800",
    published: true,
    publishedAt: new Date("2024-11-10"),
  },
  {
    slug: "finding-contractors-renovation-projects",
    title: "How to Find and Manage Contractors for Your Renovation",
    excerpt: "A practical guide to finding reliable contractors, getting accurate bids, and managing renovation projects effectively.",
    content: `# How to Find and Manage Contractors for Your Renovation

Finding reliable contractors is one of the biggest challenges for real estate investors. A great contractor can make your project profitable; a bad one can destroy your margins.

## Finding Quality Contractors

### Sources for Contractors
- Other investors (best referrals)
- Real estate agents
- Home Depot/Lowe's pro desk
- Online reviews (be cautious)
- Local REI meetups

### Red Flags to Watch For
- No references
- No license or insurance
- Requires large upfront payment
- Cannot provide written contract
- Prices significantly below market

## The Bidding Process

### Getting Multiple Bids
- Get 3-5 bids for major work
- Use detailed scope of work
- Compare apples to apples
- Don't always go cheapest

### Scope of Work
Include:
- Specific materials and brands
- Timeline expectations
- Payment schedule
- Who handles permits
- Cleanup responsibilities

## Managing the Project

### Payment Structure
- 10% to start (materials)
- Progress payments tied to milestones
- 10% holdback until completion
- Never pay in full upfront

### Communication
- Weekly check-ins minimum
- Document everything in writing
- Take photos regularly
- Address issues immediately

### Common Issues and Solutions

**Problem:** Work is behind schedule
**Solution:** Build buffer into timeline, milestone-based payments

**Problem:** Costs are exceeding estimates
**Solution:** Detailed scope upfront, contingency budget (10-15%)

**Problem:** Quality issues
**Solution:** Clear specifications, periodic inspections, holdback payment

## Building Your Team

Over time, build relationships with:
- General contractor
- Electrician
- Plumber
- HVAC technician
- Roofer
- Handyman

A reliable team is your competitive advantage. [Learn more about our renovation services](/services).`,
    category: "Construction",
    author: "Pegasus Dreamscapes Team",
    imageUrl: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800",
    published: true,
    publishedAt: new Date("2024-10-05"),
  }
];

export async function seedProjects() {
  console.log("Checking for existing projects...");
  
  for (const project of initialProjects) {
    const existing = await db.select().from(projects).where(eq(projects.slug, project.slug));
    
    if (existing.length === 0) {
      console.log(`Seeding project: ${project.name}`);
      await db.insert(projects).values(project);
    } else {
      console.log(`Project already exists: ${project.name}`);
    }
  }
  
  console.log("Project seeding complete.");
}

export async function seedArticles() {
  console.log("Checking for existing articles...");
  
  for (const article of initialArticles) {
    const existing = await db.select().from(articles).where(eq(articles.slug, article.slug));
    
    if (existing.length === 0) {
      console.log(`Seeding article: ${article.title}`);
      await db.insert(articles).values(article);
    } else {
      console.log(`Article already exists: ${article.title}`);
    }
  }
  
  console.log("Article seeding complete.");
}

const initialCommunityCategories = [
  {
    name: "Deal Analysis",
    slug: "deals",
    description: "Discuss deal analysis, property evaluations, and investment opportunities",
    icon: "TrendingUp",
    color: "emerald",
    order: 1
  },
  {
    name: "Construction & Rehab",
    slug: "construction",
    description: "Share renovation tips, contractor recommendations, and project management advice",
    icon: "Hammer",
    color: "amber",
    order: 2
  },
  {
    name: "Financing & Lending",
    slug: "finance",
    description: "Discuss financing options, lending strategies, and capital raising",
    icon: "DollarSign",
    color: "blue",
    order: 3
  },
  {
    name: "Education & Learning",
    slug: "education",
    description: "Share resources, ask questions, and help others learn about real estate investing",
    icon: "BookOpen",
    color: "purple",
    order: 4
  },
  {
    name: "General Discussion",
    slug: "general",
    description: "Network, introduce yourself, and discuss topics that don't fit elsewhere",
    icon: "MessageSquare",
    color: "gray",
    order: 5
  }
];

export async function seedCommunityCategories() {
  console.log("Checking for existing community categories...");
  
  for (const category of initialCommunityCategories) {
    const existing = await db.select().from(communityCategories).where(eq(communityCategories.slug, category.slug));
    
    if (existing.length === 0) {
      console.log(`Seeding community category: ${category.name}`);
      await db.insert(communityCategories).values(category);
    } else {
      console.log(`Community category already exists: ${category.name}`);
    }
  }
  
  console.log("Community category seeding complete.");
}
