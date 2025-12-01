import { db } from "./db";
import { projects, articles } from "@shared/schema";
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
