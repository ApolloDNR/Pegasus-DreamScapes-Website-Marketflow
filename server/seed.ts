import { db } from "./db";
import { 
  projects, 
  articles, 
  communityCategories, 
  capitalProjects, 
  wholesaleDeals, 
  communityPosts,
  communityReplies,
  directMessages,
  users,
  investorProfiles,
  notifications,
  investorActivity,
  libraryBeginnerSteps,
  libraryGlossaryTerms,
  siteContent
} from "@shared/schema";
import { eq } from "drizzle-orm";

const initialProjects = [
  {
    slug: "nelson-dr",
    name: "4369 Nelson Dr",
    address: "4369 Nelson Dr",
    city: "Richmond",
    state: "CA",
    strategy: "fix-flip",
    status: "completed",
    purchasePrice: 600000,
    rehabCost: 95000,
    arv: null,
    salePrice: 840000,
    profit: null,
    roi: null,
    holdTime: "~6 months",
    bedrooms: null,
    bathrooms: null,
    sqft: null,
    yearBuilt: null,
    description: "The first Pegasus-controlled project. A complex East Bay single-family acquisition that taught us permit planning, scope control, and the communication discipline that became the foundation of how Pegasus operates today.",
    beforeImages: [],
    afterImages: [
      "/nelson/nelson-01.webp",
      "/nelson/nelson-02.webp",
      "/nelson/nelson-03.webp",
      "/nelson/nelson-04.webp",
      "/nelson/nelson-05.webp",
      "/nelson/nelson-06.webp",
      "/nelson/nelson-07.webp",
      "/nelson/nelson-08.webp",
      "/nelson/nelson-09.webp",
      "/nelson/nelson-10.webp",
      "/nelson/nelson-11.webp",
      "/nelson/nelson-12.webp",
      "/nelson/nelson-13.webp",
      "/nelson/nelson-14.webp",
      "/nelson/nelson-15.webp",
      "/nelson/nelson-16.webp",
      "/nelson/nelson-17.webp",
      "/nelson/nelson-18.webp",
      "/nelson/nelson-19.webp",
      "/nelson/nelson-20.webp",
      "/nelson/nelson-21.webp",
      "/nelson/nelson-22.webp",
      "/nelson/nelson-23.webp",
      "/nelson/nelson-24.webp",
      "/nelson/nelson-25.webp",
      "/nelson/nelson-26.webp",
      "/nelson/nelson-27.webp",
      "/nelson/nelson-28.webp",
      "/nelson/nelson-29.webp",
      "/nelson/nelson-30.webp",
      "/nelson/nelson-31.webp",
      "/nelson/nelson-32.webp",
      "/nelson/nelson-33.webp",
      "/nelson/nelson-34.webp",
      "/nelson/nelson-35.webp",
      "/nelson/nelson-37.webp"
    ],
    highlights: [
      "Full interior renovation: kitchen, bathrooms, flooring, paint",
      "Electrical and plumbing updates to meet inspection standards",
      "Permit coordination with the City of Richmond",
      "Exterior refresh including landscaping and curb appeal",
      "Staging and resale execution"
    ]
  }
];

const initialArticles = [
  {
    slug: "70-percent-rule-explained",
    title: "The 70% Rule in Real Estate: A Complete Guide",
    excerpt: "Learn how the 70% rule helps real estate investors quickly evaluate fix-and-flip opportunities.",
    content: `# The 70% Rule in Real Estate\n\nThe 70% rule is a fundamental tool for real estate investors. It provides a quick way to determine the maximum price you should pay for a fix-and-flip property.\n\n## Formula\nMaximum Purchase Price = (ARV x 0.70) - Repair Costs`,
    category: "Investment Strategies",
    author: "Pegasus Dreamscapes Team",
    imageUrl: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800",
    published: true,
    publishedAt: new Date("2024-11-15"),
  },
  // Strategy Library curated articles (v1.3.1 blueprint §11)
  {
    slug: "what-is-creative-finance",
    title: "What is creative finance?",
    excerpt: "Why most distressed properties don't need cash buyers. The four levers (terms, time, structure, position) that unlock deals traditional financing kills.",
    content: `# What is creative finance?\n\nCreative finance is the practice of structuring real estate purchases around terms, time, structure, and position rather than cash and conventional debt.\n\n## The four levers\n- **Terms.** Interest rate, amortization, balloon date.\n- **Time.** When the seller actually receives proceeds.\n- **Structure.** Subject-to, seller financing, lease-option, wraps, JV.\n- **Position.** Where the new financing sits in priority.\n\nMost distressed properties don't need a cash buyer. They need a structure that solves the seller's actual problem (timeline, equity, lien stack, tax exposure) without forcing a fire sale.\n\n*Educational only. Not legal, tax, or securities advice.*`,
    category: "Creative Finance",
    author: "Pegasus Dreamscapes",
    published: true,
    publishedAt: new Date("2025-01-10"),
    featuredInLibrary: true,
    libraryCategoryKey: "creative-finance",
    libraryOrder: 10,
  },
  {
    slug: "seller-financing-explained",
    title: "Seller financing explained.",
    excerpt: "How owner-carried notes actually work, where they protect both sides, and the variables that decide whether a seller-finance offer is real or theater.",
    content: `# Seller financing explained\n\nIn a seller-financed deal, the seller acts as the lender. Instead of receiving full cash at closing, they carry back a promissory note secured by a deed of trust against the property.\n\n## The variables that decide if it's real\n- Down payment\n- Interest rate\n- Amortization and balloon\n- Default and cure language\n- Subordination and lien position\n- Tax treatment for the seller\n\nA seller-finance offer that doesn't address all six is theater. A real one protects both sides.\n\n*Educational only. Not legal, tax, or securities advice.*`,
    category: "Creative Finance",
    author: "Pegasus Dreamscapes",
    published: true,
    publishedAt: new Date("2025-01-12"),
    featuredInLibrary: true,
    libraryCategoryKey: "creative-finance",
    libraryOrder: 20,
  },
  {
    slug: "what-does-subject-to-mean",
    title: "What does subject-to mean?",
    excerpt: "Taking title subject to existing financing. What it solves, what it risks, and the disclosures and protections that have to be in place before anyone signs.",
    content: `# What does subject-to mean?\n\nA subject-to purchase is when a buyer takes title to a property while leaving the seller's existing mortgage in place, in the seller's name.\n\n## What it solves\n- Sellers who can't qualify for a payoff\n- Properties with low-rate legacy financing\n- Distressed timelines where conventional refinance is too slow\n\n## What it risks\n- Due-on-sale acceleration\n- Insurance and escrow handling\n- Seller credit exposure\n- Disclosure requirements that vary by state\n\nDone right, subject-to is a documented, disclosed, protected transaction. Done wrong, it harms the seller. Pegasus only structures these when both sides are protected.\n\n*Educational only. Not legal, tax, or securities advice.*`,
    category: "Creative Finance",
    author: "Pegasus Dreamscapes",
    published: true,
    publishedAt: new Date("2025-01-15"),
    featuredInLibrary: true,
    libraryCategoryKey: "creative-finance",
    libraryOrder: 30,
  },
  {
    slug: "jv-structures-in-real-estate",
    title: "JV structures in real estate.",
    excerpt: "Equity splits, preferred returns, waterfall basics, and how decision rights get assigned when operator and capital are different people.",
    content: `# JV structures in real estate\n\nA joint venture is the defined partnership between an operator and capital. Good JVs make the splits, the decision rights, and the exit explicit before the first dollar moves.\n\n## The pieces every JV defines\n- Equity split and preferred return\n- Waterfall (return of capital, pref, then promote)\n- Decision rights (major decisions vs. day-to-day)\n- Reporting cadence\n- Exit triggers and buy-sell\n\n## Why this matters\nMost JV disputes aren't about the deal. They're about something the JV agreement didn't cover. Pegasus structures JVs so the boring questions are answered in writing, in advance.\n\n*Educational only. Not legal, tax, or securities advice.*`,
    category: "Capital & Partnerships",
    author: "Pegasus Dreamscapes",
    published: true,
    publishedAt: new Date("2025-01-18"),
    featuredInLibrary: true,
    libraryCategoryKey: "capital",
    libraryOrder: 10,
  },
  {
    slug: "what-makes-an-adu-opportunity-valuable",
    title: "What makes an ADU opportunity valuable?",
    excerpt: "Lot, zoning, access, utilities, and exit. The five filters we run before an ADU project is worth designing, let alone building.",
    content: `# What makes an ADU opportunity valuable?\n\nNot every lot is a real ADU opportunity. Pegasus runs five filters before we'll spend design dollars on one.\n\n## The five filters\n1. **Lot.** Size, shape, setbacks, slope.\n2. **Zoning.** What the jurisdiction actually allows, including ministerial paths.\n3. **Access.** Pedestrian and emergency access without re-plumbing the main house.\n4. **Utilities.** Sewer capacity, panel capacity, water service.\n5. **Exit.** Rental comps, sale comps if separable, refinance basis.\n\nAn ADU that fails any one of these isn't a project, it's a lesson.\n\n*Educational only. Not permit or design advice.*`,
    category: "Property Strategy",
    author: "Pegasus Dreamscapes",
    published: true,
    publishedAt: new Date("2025-01-20"),
    featuredInLibrary: true,
    libraryCategoryKey: "property",
    libraryOrder: 10,
  },
  {
    slug: "what-is-a-strategy-snapshot",
    title: "What is a Strategy Snapshot?",
    excerpt: "The free, written read every reviewed property gets. What goes in it, what doesn't, and how it leads to a routed lane or privately scoped written review.",
    content: `# What is a Strategy Snapshot?\n\nA Strategy Snapshot is the free, written read Pegasus produces on every reviewed property. It's educational, not an offer.\n\n## What's in it\n- Read on the property and the seller's situation\n- The two or three structures that could fit\n- Likely lane: development, wholesale, listing, capital, or pass\n- What we'd need to go deeper\n\n## What's not in it\n- A binding offer\n- A guaranteed purchase price\n- Securities or investment advice\n\nFrom a Snapshot, sellers can route to the lane that fits, submit for Pegasus review, or ask the team to privately scope a deeper written operator memo.\n\n*Educational only. Not legal, tax, or securities advice.*`,
    category: "Pegasus Standard",
    author: "Pegasus Dreamscapes",
    published: true,
    publishedAt: new Date("2025-01-22"),
    featuredInLibrary: true,
    libraryCategoryKey: "pegasus-standard",
    libraryOrder: 10,
  },
];

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
    name: "Design & Aesthetics",
    slug: "design",
    description: "Share renovation inspiration, interior design ideas, staging tips, and curb appeal strategies",
    icon: "Palette",
    color: "rose",
    order: 4
  },
  {
    name: "Education & Learning",
    slug: "education",
    description: "Share resources, ask questions, and help others learn about real estate investing",
    icon: "BookOpen",
    color: "purple",
    order: 5
  },
  {
    name: "General Discussion",
    slug: "general",
    description: "Network, introduce yourself, and discuss topics that don't fit elsewhere",
    icon: "MessageSquare",
    color: "gray",
    order: 6
  }
];

const dealflowCapitalProjects = [
  {
    createdBy: "system",
    title: "Luxury Flip - Pacific Heights Victorian",
    description: "Premium Victorian restoration in one of San Francisco's most prestigious neighborhoods. This 4BR/3BA property features original architectural details, high ceilings, and stunning bay views. Our design team will preserve historic charm while adding modern luxury finishes including a chef's kitchen, spa bathrooms, and smart home integration.",
    location: "Pacific Heights, San Francisco, CA",
    scopeOfWork: "Full interior renovation, kitchen and bath upgrades, landscaping, smart home integration, structural repairs",
    fundingGoal: 850000,
    amountRaised: 425000,
    minInvestment: 50000,
    maxInvestmentPerInvestor: 200000,
    structure: "EQUITY",
    projectedReturn: "22-28%",
    holdPeriod: "8-12 months",
    askingEquityPercent: 25,
    askingProfitSplit: "75/25",
    askingPreferredReturn: "8% pref",
    status: "OPEN_FOR_INVESTMENT",
    purchasePrice: 1850000,
    rehabBudget: 650000,
    softCosts: 125000,
    operatorEquity: 275000,
    contingency: 75000,
    projectedARV: 3200000,
    projectedProfit: 425000,
    projectedProfitLow: 285000,
    projectedProfitHigh: 550000,
    seniorLoan: 1300000,
    startDate: new Date("2024-12-01"),
    constructionStart: new Date("2025-01-15"),
    constructionEnd: new Date("2025-07-15"),
    exitDate: new Date("2025-09-30"),
    images: [
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800",
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800"
    ],
    riskLevel: "medium",
    designAppeal: 5,
    roiPotential: 5,
    marketDemand: 5,
    neighborhoodGrade: "A",
    strategy: "fix-flip",
    propertyType: "single-family",
    investorCount: 4,
    isFeatured: true,
    isHot: true,
  },
  {
    createdBy: "system",
    title: "Boutique Short-Term Rental - Wine Country",
    description: "Convert this charming Sonoma cottage into a premium vacation rental. Prime location near top wineries with strong year-round demand. Projected 85%+ occupancy rate based on comparable properties. Design-forward renovation will maximize nightly rates.",
    location: "Sonoma, CA",
    scopeOfWork: "Full renovation, outdoor entertainment space, hot tub installation, luxury furnishing package",
    fundingGoal: 425000,
    amountRaised: 318750,
    minInvestment: 25000,
    maxInvestmentPerInvestor: 100000,
    structure: "HYBRID",
    projectedReturn: "15-20% annual",
    holdPeriod: "3-5 years",
    askingDebtPortion: 40,
    askingEquityPortion: 60,
    askingInterestRate: "10% annual",
    askingLoanDuration: "36 months",
    askingEquityPercent: 20,
    askingProfitSplit: "70/30",
    status: "OPEN_FOR_INVESTMENT",
    purchasePrice: 595000,
    rehabBudget: 180000,
    softCosts: 45000,
    operatorEquity: 95000,
    contingency: 30000,
    projectedARV: 950000,
    projectedProfit: 195000,
    projectedProfitLow: 125000,
    projectedProfitHigh: 265000,
    seniorLoan: 420000,
    startDate: new Date("2024-11-01"),
    constructionStart: new Date("2024-12-15"),
    constructionEnd: new Date("2025-04-30"),
    stabilizationDate: new Date("2025-06-01"),
    exitDate: new Date("2027-12-01"),
    images: [
      "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800",
      "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800"
    ],
    riskLevel: "low",
    designAppeal: 5,
    roiPotential: 4,
    marketDemand: 5,
    neighborhoodGrade: "A",
    strategy: "buy-hold",
    propertyType: "single-family",
    investorCount: 7,
    isFeatured: true,
    isHot: false,
  },
  {
    createdBy: "system",
    title: "Mixed-Use Reposition - Downtown Oakland",
    description: "Value-add opportunity in thriving downtown Oakland corridor. Ground floor retail with 6 residential units above. Currently 50% occupied at below-market rents. Strategic renovations and professional management will significantly increase NOI.",
    location: "Downtown Oakland, CA",
    scopeOfWork: "Unit renovations, common area upgrades, retail facade improvement, mechanical systems",
    fundingGoal: 1200000,
    amountRaised: 480000,
    minInvestment: 75000,
    maxInvestmentPerInvestor: 300000,
    structure: "EQUITY",
    projectedReturn: "18-24%",
    holdPeriod: "3-5 years",
    askingEquityPercent: 30,
    askingProfitSplit: "70/30",
    askingPreferredReturn: "10% pref",
    status: "OPEN_FOR_INVESTMENT",
    purchasePrice: 2800000,
    rehabBudget: 950000,
    softCosts: 180000,
    operatorEquity: 400000,
    contingency: 120000,
    projectedARV: 5200000,
    projectedProfit: 520000,
    projectedProfitLow: 380000,
    projectedProfitHigh: 720000,
    seniorLoan: 1900000,
    images: [
      "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800"
    ],
    riskLevel: "medium",
    designAppeal: 3,
    roiPotential: 5,
    marketDemand: 4,
    neighborhoodGrade: "B",
    strategy: "value-add",
    propertyType: "multi-family",
    investorCount: 3,
    isFeatured: false,
    isHot: true,
  },
  {
    createdBy: "system",
    title: "Elegant Craftsman Restoration - Berkeley Hills",
    description: "Restore this 1920s Craftsman to its original glory while adding modern conveniences. Features original woodwork, built-ins, and a stunning hillside lot with bay views. Perfect for buyers seeking character and location.",
    location: "Berkeley Hills, CA",
    scopeOfWork: "Kitchen renovation, bathroom updates, foundation work, deck expansion, landscaping",
    fundingGoal: 550000,
    amountRaised: 550000,
    minInvestment: 50000,
    maxInvestmentPerInvestor: 150000,
    structure: "EQUITY",
    projectedReturn: "20-25%",
    holdPeriod: "6-10 months",
    askingEquityPercent: 20,
    askingProfitSplit: "70/30",
    status: "FUNDED",
    purchasePrice: 1250000,
    rehabBudget: 380000,
    softCosts: 75000,
    operatorEquity: 180000,
    contingency: 45000,
    projectedARV: 2100000,
    projectedProfit: 295000,
    projectedProfitLow: 195000,
    projectedProfitHigh: 385000,
    seniorLoan: 875000,
    images: [
      "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=800"
    ],
    riskLevel: "low",
    designAppeal: 5,
    roiPotential: 4,
    marketDemand: 5,
    neighborhoodGrade: "A",
    strategy: "fix-flip",
    propertyType: "single-family",
    investorCount: 6,
    isFeatured: false,
    isHot: false,
  },
  {
    createdBy: "system",
    title: "Suburban Renovation Portfolio - Contra Costa",
    description: "Portfolio of 3 single-family homes in family-friendly Contra Costa County. All properties acquired 15-20% below market. Light renovations will yield quick returns in this strong rental/resale market.",
    location: "Walnut Creek & Concord, CA",
    scopeOfWork: "Cosmetic updates, kitchen/bath refresh, flooring, paint, landscaping",
    fundingGoal: 320000,
    amountRaised: 160000,
    minInvestment: 20000,
    maxInvestmentPerInvestor: 80000,
    structure: "EQUITY",
    projectedReturn: "16-20%",
    holdPeriod: "4-6 months",
    askingEquityPercent: 15,
    askingProfitSplit: "80/20",
    status: "OPEN_FOR_INVESTMENT",
    purchasePrice: 1450000,
    rehabBudget: 240000,
    softCosts: 65000,
    operatorEquity: 200000,
    contingency: 35000,
    projectedARV: 1980000,
    projectedProfit: 245000,
    projectedProfitLow: 165000,
    projectedProfitHigh: 315000,
    seniorLoan: 1015000,
    images: [
      "https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6?w=800"
    ],
    riskLevel: "low",
    designAppeal: 3,
    roiPotential: 4,
    marketDemand: 4,
    neighborhoodGrade: "B",
    strategy: "fix-flip",
    propertyType: "single-family",
    investorCount: 5,
    isFeatured: false,
    isHot: false,
  },
  {
    createdBy: "system",
    title: "ADU Development - East Bay Package",
    description: "Develop accessory dwelling units on 4 qualifying properties. California's ADU-friendly regulations create opportunity for 15-20% value increase per property. Turnkey execution with experienced builders.",
    location: "Oakland & Berkeley, CA",
    scopeOfWork: "ADU construction (4 units), permit processing, utility connections, landscaping",
    fundingGoal: 680000,
    amountRaised: 204000,
    minInvestment: 35000,
    maxInvestmentPerInvestor: 150000,
    structure: "DEBT",
    projectedReturn: "12% annual + profit share",
    holdPeriod: "12-18 months",
    askingInterestRate: "12% annual",
    askingLoanDuration: "18 months",
    askingPoints: "2 points",
    status: "OPEN_FOR_INVESTMENT",
    purchasePrice: 0,
    rehabBudget: 540000,
    softCosts: 85000,
    operatorEquity: 120000,
    contingency: 55000,
    projectedARV: 0,
    projectedProfit: 280000,
    projectedProfitLow: 195000,
    projectedProfitHigh: 365000,
    seniorLoan: 400000,
    startDate: new Date("2024-10-15"),
    constructionStart: new Date("2024-11-01"),
    constructionEnd: new Date("2026-02-28"),
    exitDate: new Date("2026-04-30"),
    images: [
      "https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800"
    ],
    riskLevel: "medium",
    designAppeal: 4,
    roiPotential: 4,
    marketDemand: 5,
    neighborhoodGrade: "B",
    strategy: "development",
    propertyType: "multi-family",
    investorCount: 4,
    isFeatured: true,
    isHot: false,
  }
];

const dealflowWholesaleDeals = [
  {
    propertyAddress: "2847 Grand Avenue",
    city: "Oakland",
    state: "CA",
    zipCode: "94610",
    propertyType: "single-family",
    bedrooms: 4,
    bathrooms: "2.5",
    sqft: 2100,
    yearBuilt: 1948,
    lotSize: "5,500 sq ft",
    contractPrice: 485000,
    assignmentFee: 18000,
    arv: 725000,
    estimatedRepairs: 115000,
    strategy: "fix-flip",
    status: "available",
    description: "Motivated seller estate sale. Original hardwood floors under carpet, good bones. Large backyard with ADU potential. High-demand Lake Merritt adjacent location.",
    highlights: [
      "Estate sale - motivated seller",
      "ADU potential in backyard",
      "Walk to Lake Merritt",
      "Strong school district"
    ],
    images: [
      "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800"
    ],
    riskLevel: "medium",
    profitPotential: 5,
    marketDemand: 5,
    neighborhoodGrade: "B",
    matchScore: 94,
    isFeatured: true,
    isHot: true,
    viewCount: 156,
  },
  {
    propertyAddress: "1523 Fruitvale Ave",
    city: "Oakland",
    state: "CA",
    zipCode: "94601",
    propertyType: "duplex",
    bedrooms: 4,
    bathrooms: "2",
    sqft: 1800,
    yearBuilt: 1925,
    lotSize: "4,200 sq ft",
    contractPrice: 365000,
    assignmentFee: 12000,
    arv: 565000,
    estimatedRepairs: 95000,
    strategy: "fix-flip",
    status: "available",
    description: "Up/down duplex with separate meters. Owner-occupied unit in good condition. Tenant unit needs cosmetic updates. Strong rental history in area.",
    highlights: [
      "Duplex - two income streams",
      "Separate utilities",
      "Below market acquisition",
      "Rent control exempt (small landlord)"
    ],
    images: [
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800"
    ],
    riskLevel: "medium",
    profitPotential: 4,
    marketDemand: 4,
    neighborhoodGrade: "C",
    matchScore: 87,
    isFeatured: false,
    isHot: true,
    viewCount: 89,
  },
  {
    propertyAddress: "4892 Telegraph Ave",
    city: "Oakland",
    state: "CA",
    zipCode: "94609",
    propertyType: "single-family",
    bedrooms: 3,
    bathrooms: "1",
    sqft: 1350,
    yearBuilt: 1938,
    lotSize: "3,800 sq ft",
    contractPrice: 298000,
    assignmentFee: 10000,
    arv: 525000,
    estimatedRepairs: 110000,
    strategy: "fix-flip",
    status: "available",
    description: "Pre-foreclosure acquisition. Property needs substantial work but has excellent layout and location near Temescal dining district.",
    highlights: [
      "Pre-foreclosure - deep discount",
      "Temescal location",
      "Great lot size",
      "Potential for expansion"
    ],
    images: [
      "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800"
    ],
    riskLevel: "high",
    profitPotential: 5,
    marketDemand: 5,
    neighborhoodGrade: "B",
    matchScore: 91,
    isFeatured: true,
    isHot: false,
    viewCount: 203,
  },
  {
    propertyAddress: "789 Castro Street",
    city: "Richmond",
    state: "CA",
    zipCode: "94801",
    propertyType: "single-family",
    bedrooms: 3,
    bathrooms: "2",
    sqft: 1450,
    yearBuilt: 1955,
    lotSize: "6,000 sq ft",
    contractPrice: 245000,
    assignmentFee: 8000,
    arv: 485000,
    estimatedRepairs: 125000,
    strategy: "fix-flip",
    status: "available",
    description: "Inherited property, heirs live out of state. House vacant for 2 years, needs full renovation. Excellent BRRRR candidate in appreciating Richmond Point area.",
    highlights: [
      "Absentee heir sale",
      "Large lot - expansion possible",
      "Near ferry terminal",
      "Rising neighborhood values"
    ],
    images: [
      "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800"
    ],
    riskLevel: "medium",
    profitPotential: 5,
    marketDemand: 4,
    neighborhoodGrade: "C",
    matchScore: 88,
    isFeatured: false,
    isHot: false,
    viewCount: 67,
  },
  {
    propertyAddress: "3156 Broadway",
    city: "Oakland",
    state: "CA",
    zipCode: "94611",
    propertyType: "single-family",
    bedrooms: 5,
    bathrooms: "3",
    sqft: 2800,
    yearBuilt: 1912,
    lotSize: "7,200 sq ft",
    contractPrice: 625000,
    assignmentFee: 25000,
    arv: 1050000,
    estimatedRepairs: 225000,
    strategy: "fix-flip",
    status: "available",
    description: "Historic craftsman in prime Piedmont-adjacent location. Original details intact including stained glass, built-ins, and crown molding. Major systems need updating.",
    highlights: [
      "Historic craftsman charm",
      "Piedmont schools",
      "Original architectural details",
      "Premium location"
    ],
    images: [
      "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=800"
    ],
    riskLevel: "medium",
    profitPotential: 5,
    marketDemand: 5,
    neighborhoodGrade: "A",
    matchScore: 96,
    isFeatured: true,
    isHot: true,
    viewCount: 312,
  },
  {
    propertyAddress: "1842 23rd Street",
    city: "San Pablo",
    state: "CA",
    zipCode: "94806",
    propertyType: "single-family",
    bedrooms: 3,
    bathrooms: "1",
    sqft: 1150,
    yearBuilt: 1962,
    lotSize: "5,000 sq ft",
    contractPrice: 195000,
    assignmentFee: 7000,
    arv: 385000,
    estimatedRepairs: 85000,
    strategy: "fix-flip",
    status: "available",
    description: "Fire-damaged property, 60% rehab needed. Insurance proceeds available to buyer. Quick close possible. Excellent entry-level flip opportunity.",
    highlights: [
      "Insurance proceeds available",
      "Clear title",
      "Entry-level price point",
      "Strong buyer demand at ARV"
    ],
    images: [
      "https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6?w=800"
    ],
    riskLevel: "high",
    profitPotential: 4,
    marketDemand: 4,
    neighborhoodGrade: "C",
    matchScore: 78,
    isFeatured: false,
    isHot: false,
    viewCount: 45,
  }
];

const sampleUsers = [
  {
    id: "investor-marcus-chen",
    email: "marcus.chen@email.com",
    firstName: "Marcus",
    lastName: "Chen",
    profileImageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
    role: "user",
    portalType: "investor"
  },
  {
    id: "investor-sarah-williams",
    email: "sarah.williams@email.com",
    firstName: "Sarah",
    lastName: "Williams",
    profileImageUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150",
    role: "user",
    portalType: "investor"
  },
  {
    id: "investor-james-rodriguez",
    email: "james.rodriguez@email.com",
    firstName: "James",
    lastName: "Rodriguez",
    profileImageUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150",
    role: "user",
    portalType: "investor"
  },
  {
    id: "investor-emily-park",
    email: "emily.park@email.com",
    firstName: "Emily",
    lastName: "Park",
    profileImageUrl: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150",
    role: "user",
    portalType: "investor"
  },
  {
    id: "wholesaler-david-kim",
    email: "david.kim@email.com",
    firstName: "David",
    lastName: "Kim",
    profileImageUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150",
    role: "user",
    portalType: "wholesaler"
  },
  {
    id: "staff-alex-dreamscaper",
    email: "alex@pegasusdreamscapes.com",
    firstName: "Alex",
    lastName: "Thompson",
    profileImageUrl: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150",
    role: "admin",
    portalType: "staff"
  }
];

const sampleInvestorProfiles = [
  {
    userId: "investor-marcus-chen",
    company: "Chen Capital Partners",
    phone: "(415) 555-1234",
    cityState: "San Francisco, CA",
    capitalRange: "$250k-$500k",
    investmentPreference: "fix-flip",
    experienceLevel: "advanced",
    accreditedInvestor: true,
    isApproved: true,
    preferredRiskLevel: "medium",
    preferredStrategies: ["fix-flip", "value-add"],
    preferredPropertyTypes: ["single-family", "multi-family"],
    preferredLocations: ["San Francisco", "Oakland", "Berkeley"],
    minInvestment: 50000,
    maxInvestment: 200000,
    targetReturnMin: 18,
    targetReturnMax: 28,
    preferredHoldPeriod: "6-12 months",
    dealsSaved: 12,
    dealsPassed: 8
  },
  {
    userId: "investor-sarah-williams",
    company: "Williams Investments LLC",
    phone: "(510) 555-2345",
    cityState: "Oakland, CA",
    capitalRange: "$100k-$250k",
    investmentPreference: "buy-hold",
    experienceLevel: "intermediate",
    accreditedInvestor: true,
    isApproved: true,
    preferredRiskLevel: "low",
    preferredStrategies: ["buy-hold", "value-add"],
    preferredPropertyTypes: ["single-family", "duplex"],
    preferredLocations: ["Oakland", "Berkeley", "Richmond"],
    minInvestment: 25000,
    maxInvestment: 100000,
    targetReturnMin: 12,
    targetReturnMax: 20,
    preferredHoldPeriod: "3-5 years",
    dealsSaved: 8,
    dealsPassed: 15
  },
  {
    userId: "investor-james-rodriguez",
    company: null,
    phone: "(925) 555-3456",
    cityState: "Walnut Creek, CA",
    capitalRange: "$500k-$1M",
    investmentPreference: "development",
    experienceLevel: "advanced",
    accreditedInvestor: true,
    isApproved: true,
    preferredRiskLevel: "high",
    preferredStrategies: ["fix-flip", "development"],
    preferredPropertyTypes: ["single-family", "multi-family", "commercial"],
    preferredLocations: ["San Francisco", "Oakland", "Contra Costa"],
    minInvestment: 100000,
    maxInvestment: 500000,
    targetReturnMin: 20,
    targetReturnMax: 35,
    preferredHoldPeriod: "6-12 months",
    dealsSaved: 18,
    dealsPassed: 5
  },
  {
    userId: "investor-emily-park",
    company: "Park Family Office",
    phone: "(650) 555-4567",
    cityState: "Palo Alto, CA",
    capitalRange: "$1M+",
    investmentPreference: "value-add",
    experienceLevel: "advanced",
    accreditedInvestor: true,
    isApproved: true,
    preferredRiskLevel: "medium",
    preferredStrategies: ["value-add", "buy-hold"],
    preferredPropertyTypes: ["multi-family", "commercial"],
    preferredLocations: ["San Francisco", "Peninsula", "South Bay"],
    minInvestment: 150000,
    maxInvestment: 750000,
    targetReturnMin: 15,
    targetReturnMax: 25,
    preferredHoldPeriod: "1-3 years",
    dealsSaved: 6,
    dealsPassed: 22
  }
];

export async function seedProjects() {
  console.log("Seeding projects...");
  for (const project of initialProjects) {
    const existing = await db.select().from(projects).where(eq(projects.slug, project.slug));
    if (existing.length === 0) {
      await db.insert(projects).values(project);
    }
  }
  console.log("Projects seeded.");
}

export async function seedArticles() {
  console.log("Seeding articles...");
  for (const article of initialArticles) {
    const existing = await db.select().from(articles).where(eq(articles.slug, article.slug));
    if (existing.length === 0) {
      await db.insert(articles).values(article);
    }
  }
  console.log("Articles seeded.");
}

const initialBeginnerSteps = [
  {
    step: "01",
    title: "Start with the doctrine",
    description:
      "Read 'What is creative finance?' and 'What is a Strategy Snapshot?' to understand how Pegasus reads a property before talking numbers.",
    sortOrder: 1,
  },
  {
    step: "02",
    title: "Learn the structures",
    description:
      "Move into seller financing, subject-to, and JV structures. These are the levers behind almost every Pegasus deal.",
    sortOrder: 2,
  },
  {
    step: "03",
    title: "Apply it to a property",
    description:
      "Take what you've learned and run a real situation through Strategy Review. That's where education becomes a path.",
    sortOrder: 3,
  },
];

const initialGlossaryTerms = [
  { term: "ARV", definition: "After-Repair Value. Estimated market value of a property once renovation is complete.", sortOrder: 1 },
  { term: "BRRRR", definition: "Buy, Rehab, Rent, Refinance, Repeat. A long-term portfolio strategy built on cash recycling.", sortOrder: 2 },
  { term: "DSCR Loan", definition: "Debt Service Coverage Ratio loan. A rental loan qualified by the property's cash flow, not the borrower's W-2.", sortOrder: 3 },
  { term: "JV", definition: "Joint Venture. A defined partnership between operator and capital with explicit splits and roles.", sortOrder: 4 },
  { term: "Seller Financing", definition: "The seller acts as the lender, carrying back a note instead of receiving full cash at closing.", sortOrder: 5 },
  { term: "Subject-To", definition: "Buyer takes title subject to the existing mortgage, which stays in the seller's name.", sortOrder: 6 },
  { term: "Strategy Snapshot", definition: "Pegasus's free written read on a reviewed property. Educational only, not an offer.", sortOrder: 7 },
  { term: "Written Operator Review", definition: "Privately scoped human memo for a complex property after Pegasus has enough context to review the situation.", sortOrder: 8 },
];

// Seed sentinels live in site_content so the defaults are only ever inserted
// once. If Apollo intentionally empties either list from HQ, a server restart
// must NOT silently repopulate the defaults.
async function hasSeeded(key: string): Promise<boolean> {
  const [row] = await db.select().from(siteContent).where(eq(siteContent.key, key));
  return !!row;
}

async function markSeeded(key: string) {
  await db
    .insert(siteContent)
    .values({ key, value: new Date().toISOString(), type: "text", updatedBy: "seed" })
    .onConflictDoNothing({ target: siteContent.key });
}

export async function seedLibraryBeginnerPath() {
  if (await hasSeeded("seed.library.beginner_path.v1")) return;
  const existing = await db.select().from(libraryBeginnerSteps).limit(1);
  if (existing.length === 0) {
    console.log("Seeding library beginner path...");
    await db.insert(libraryBeginnerSteps).values(initialBeginnerSteps);
  }
  await markSeeded("seed.library.beginner_path.v1");
}

export async function seedLibraryGlossary() {
  if (await hasSeeded("seed.library.glossary.v1")) return;
  const existing = await db.select().from(libraryGlossaryTerms).limit(1);
  if (existing.length === 0) {
    console.log("Seeding library glossary...");
    await db.insert(libraryGlossaryTerms).values(initialGlossaryTerms);
  }
  await markSeeded("seed.library.glossary.v1");
}

export async function seedCommunityCategories() {
  console.log("Seeding community categories...");
  for (const category of initialCommunityCategories) {
    const existing = await db.select().from(communityCategories).where(eq(communityCategories.slug, category.slug));
    if (existing.length === 0) {
      await db.insert(communityCategories).values(category);
    }
  }
  console.log("Community categories seeded.");
}

export async function seedDealflowData() {
  console.log("Seeding dealflow sample data...");
  
  // Seed sample users
  for (const user of sampleUsers) {
    const existing = await db.select().from(users).where(eq(users.id, user.id));
    if (existing.length === 0) {
      await db.insert(users).values(user);
    }
  }
  console.log("Sample users seeded.");
  
  // Seed investor profiles
  for (const profile of sampleInvestorProfiles) {
    const existing = await db.select().from(investorProfiles).where(eq(investorProfiles.userId, profile.userId));
    if (existing.length === 0) {
      await db.insert(investorProfiles).values(profile);
    }
  }
  console.log("Investor profiles seeded.");
  
  // Seed capital projects
  for (const project of dealflowCapitalProjects) {
    const existing = await db.select().from(capitalProjects).where(eq(capitalProjects.title, project.title));
    if (existing.length === 0) {
      await db.insert(capitalProjects).values(project);
    }
  }
  console.log("Capital projects seeded.");
  
  // Seed wholesale deals
  for (const deal of dealflowWholesaleDeals) {
    const existing = await db.select().from(wholesaleDeals).where(eq(wholesaleDeals.propertyAddress, deal.propertyAddress));
    if (existing.length === 0) {
      await db.insert(wholesaleDeals).values(deal);
    }
  }
  console.log("Wholesale deals seeded.");
  
  // Get category IDs for community posts
  const categories = await db.select().from(communityCategories);
  const designCategory = categories.find(c => c.slug === "design");
  const dealsCategory = categories.find(c => c.slug === "deals");
  const constructionCategory = categories.find(c => c.slug === "construction");
  const generalCategory = categories.find(c => c.slug === "general");
  
  if (designCategory && dealsCategory && constructionCategory && generalCategory) {
    const communityPostsData = [
      {
        categoryId: designCategory.id,
        userId: "investor-sarah-williams",
        title: "Best Paint Colors for Maximizing Flip ROI?",
        content: "I'm working on a flip in Oakland and want to choose paint colors that appeal to the widest buyer pool. Any recommendations for trendy yet timeless colors? I've heard Sherwin-Williams Agreeable Gray is popular. What has worked for you?",
        isPinned: true,
        viewCount: 234,
        replyCount: 12
      },
      {
        categoryId: designCategory.id,
        userId: "investor-marcus-chen",
        title: "Kitchen Design Trends That Actually Add Value",
        content: "Just finished analyzing our last 5 flips and noticed some interesting patterns. White shaker cabinets still performing well, but we're seeing buyers respond more to warmer tones. Waterfall islands are a hit in the $800k+ price point. What kitchen upgrades are you prioritizing?",
        isPinned: false,
        viewCount: 189,
        replyCount: 8
      },
      {
        categoryId: designCategory.id,
        userId: "staff-alex-dreamscaper",
        title: "Curb Appeal Upgrades: Cost vs Value Analysis",
        content: "We've compiled data from our recent projects on curb appeal investments. Top performers: 1) Fresh landscaping (3x ROI), 2) New front door (2.5x), 3) Exterior paint (2x), 4) New mailbox & house numbers (5x on small investment). What's your experience?",
        isPinned: true,
        viewCount: 412,
        replyCount: 18
      },
      {
        categoryId: dealsCategory.id,
        userId: "investor-james-rodriguez",
        title: "Oakland Market Heating Up - Anyone Else Seeing This?",
        content: "I've been tracking the Oakland market closely and seeing significant buyer activity in the Temescal area. Multiple offers on recent listings, even fixers. Anyone else noticing this trend? Might be time to accelerate acquisitions.",
        isPinned: false,
        viewCount: 156,
        replyCount: 6
      },
      {
        categoryId: dealsCategory.id,
        userId: "investor-emily-park",
        title: "Multi-Family Cap Rates in East Bay",
        content: "Looking at a 6-unit in Oakland. Seller asking for 5.5% cap rate which seems aggressive. What cap rates are you seeing for value-add multi-family in the East Bay currently?",
        isPinned: false,
        viewCount: 98,
        replyCount: 4
      },
      {
        categoryId: constructionCategory.id,
        userId: "wholesaler-david-kim",
        title: "Contractor Recommendation for Foundation Work?",
        content: "Have a deal that needs foundation repair in Richmond. Looking for reliable foundation contractors who work with investors and understand timelines. Any recommendations?",
        isPinned: false,
        viewCount: 67,
        replyCount: 5
      },
      {
        categoryId: generalCategory.id,
        userId: "staff-alex-dreamscaper",
        title: "Welcome New Dealflow Members!",
        content: "Welcome to all our new community members! This is your space to connect with fellow investors, share insights, and discover opportunities. Feel free to introduce yourself and let us know your investment focus. We're here to help you succeed!",
        isPinned: true,
        viewCount: 523,
        replyCount: 24
      },
      {
        categoryId: designCategory.id,
        userId: "investor-emily-park",
        title: "Staging vs Selling Empty - Data from My Last 10 Flips",
        content: "I've tracked staging costs vs sale price premium on my last 10 flips. Average staging cost: $3,500. Average premium over unstaged comps: $18,000. That's a 5x return! Key was using modern, neutral staging that photographed well. Happy to share specific vendor recommendations.",
        isPinned: false,
        viewCount: 287,
        replyCount: 15
      }
    ];
    
    for (const post of communityPostsData) {
      const existing = await db.select().from(communityPosts).where(eq(communityPosts.title, post.title));
      if (existing.length === 0) {
        await db.insert(communityPosts).values(post);
      }
    }
    console.log("Community posts seeded.");
  }
  
  // Seed some replies to posts
  const posts = await db.select().from(communityPosts);
  const paintPost = posts.find(p => p.title?.includes("Paint Colors"));
  
  if (paintPost) {
    const replies = [
      {
        postId: paintPost.id,
        userId: "investor-marcus-chen",
        content: "Agreeable Gray is solid but I've been having great results with Benjamin Moore Revere Pewter. It's a greige that works with both warm and cool tones. Highly recommend for flips targeting the $600k-$800k buyer."
      },
      {
        postId: paintPost.id,
        userId: "investor-emily-park",
        content: "Don't sleep on accent walls! We've been doing dark navy or forest green accent walls in primary bedrooms and they photograph incredibly well. Just make sure the rest of the room is light and neutral."
      },
      {
        postId: paintPost.id,
        userId: "staff-alex-dreamscaper",
        content: "Great discussion! We've compiled a color guide based on our project data. Key insight: warm whites (like BM Simply White) are outperforming cool whites in the current market. Buyers seem to want that cozy feel post-pandemic."
      }
    ];
    
    for (const reply of replies) {
      const existing = await db.select().from(communityReplies).where(eq(communityReplies.content, reply.content));
      if (existing.length === 0) {
        await db.insert(communityReplies).values(reply);
      }
    }
    console.log("Community replies seeded.");
  }
  
  // Seed sample messages
  const sampleMessages = [
    {
      senderId: "staff-alex-dreamscaper",
      receiverId: "investor-marcus-chen",
      subject: "New Deal Alert: Pacific Heights Victorian",
      content: "Hi Marcus,\n\nI wanted to reach out personally about a new opportunity that matches your investment criteria perfectly. The Pacific Heights Victorian we just listed has a projected 22-28% return, which aligns with your target range.\n\nGiven your experience with high-end flips, I think you'd be an ideal partner for this project. The property has incredible bones and our design team has put together a stunning renovation plan.\n\nWould you be interested in scheduling a call to discuss?\n\nBest,\nAlex"
    },
    {
      senderId: "investor-marcus-chen",
      receiverId: "staff-alex-dreamscaper",
      subject: "RE: New Deal Alert: Pacific Heights Victorian",
      content: "Alex,\n\nThanks for thinking of me on this one. Pacific Heights is definitely my wheelhouse. I reviewed the materials and I'm very interested.\n\nI'd like to schedule a call and also visit the property if possible. My available times this week are Tuesday afternoon or Thursday morning.\n\nLooking forward to discussing!\n\nMarcus"
    },
    {
      senderId: "investor-sarah-williams",
      receiverId: "investor-emily-park",
      subject: "Multi-family investment question",
      content: "Hi Emily,\n\nI saw your post about the 6-unit in Oakland and wanted to connect. I'm looking to transition from single-family flips to multi-family and would love to learn from your experience.\n\nWould you be open to a quick coffee chat sometime?\n\nBest,\nSarah"
    },
    {
      senderId: "staff-alex-dreamscaper",
      receiverId: "investor-james-rodriguez",
      subject: "Exclusive: Broadway Craftsman",
      content: "James,\n\nBig news - we just locked up the Broadway Craftsman I mentioned last week. This is the Piedmont-adjacent historic property with the stunning original details.\n\nAt $625k contract price with $1.05M ARV, this is exactly the kind of high-margin deal you've been looking for. Estimated 25% return if renovation stays on budget.\n\nI'm only reaching out to a few select investors on this one. Let me know if you want first look.\n\nAlex"
    }
  ];
  
  for (const message of sampleMessages) {
    const existing = await db.select().from(directMessages).where(eq(directMessages.subject, message.subject || ""));
    if (existing.length === 0) {
      await db.insert(directMessages).values(message);
    }
  }
  console.log("Direct messages seeded.");
  
  // Seed sample notifications
  const sampleNotifications = [
    {
      userId: "investor-marcus-chen",
      type: "new_deal",
      title: "New Match: 96% Compatible",
      message: "A new deal in Pacific Heights matches your investment criteria. Projected 22-28% return.",
      link: "/dealflow/deals",
      isRead: false
    },
    {
      userId: "investor-marcus-chen",
      type: "message",
      title: "New Message from Alex Thompson",
      message: "Alex sent you a message about a new investment opportunity.",
      link: "/dealflow/messages",
      isRead: false
    },
    {
      userId: "investor-sarah-williams",
      type: "community",
      title: "Reply to Your Post",
      message: "Marcus Chen replied to your discussion about paint colors.",
      link: "/dealflow/community",
      isRead: true
    },
    {
      userId: "investor-james-rodriguez",
      type: "new_deal",
      title: "Hot Deal Alert",
      message: "The Broadway Craftsman you viewed is getting high interest. 5 investors viewing.",
      link: "/dealflow/deals",
      isRead: false
    },
    {
      userId: "investor-emily-park",
      type: "investment",
      title: "Investment Update",
      message: "The Berkeley Hills Craftsman project has reached 100% funding. Construction begins next week.",
      link: "/dealflow/office",
      isRead: true
    }
  ];
  
  for (const notification of sampleNotifications) {
    const existing = await db.select().from(notifications).where(eq(notifications.title, notification.title));
    if (existing.length === 0) {
      await db.insert(notifications).values(notification);
    }
  }
  console.log("Notifications seeded.");
  
  // Seed investor activity
  const sampleActivity = [
    {
      userId: "investor-marcus-chen",
      activityType: "new_match",
      title: "New High Match Deal",
      description: "Pacific Heights Victorian matched your profile at 96%",
      relatedType: "capital_project",
      link: "/dealflow/deals"
    },
    {
      userId: "investor-marcus-chen",
      activityType: "community_post",
      title: "Posted in Design & Aesthetics",
      description: "Kitchen Design Trends That Actually Add Value",
      relatedType: "post",
      link: "/dealflow/community"
    },
    {
      userId: "investor-sarah-williams",
      activityType: "message",
      title: "Received Message",
      description: "Emily Park sent you a message",
      relatedType: "message",
      link: "/dealflow/messages"
    },
    {
      userId: "investor-james-rodriguez",
      activityType: "investment",
      title: "Investment Submitted",
      description: "$150,000 investment offer on Mixed-Use Reposition",
      relatedType: "capital_project",
      link: "/dealflow/office"
    }
  ];
  
  for (const activity of sampleActivity) {
    const existing = await db.select().from(investorActivity).where(eq(investorActivity.title, activity.title));
    if (existing.length === 0) {
      await db.insert(investorActivity).values(activity);
    }
  }
  console.log("Investor activity seeded.");
  
  // Seed Listings (LISTING dealType)
  const { listings } = await import("@shared/schema");
  const sampleListings = [
    {
      propertyAddress: "4521 Maple Grove Lane",
      city: "San Francisco",
      state: "CA",
      zipCode: "94116",
      propertyType: "single_family",
      bedrooms: 4,
      bathrooms: "2.5",
      sqft: 2450,
      yearBuilt: 1985,
      listingType: "on_market",
      listPrice: 1295000,
      pricePerSqft: 529,
      condition: "move_in_ready",
      description: "Beautifully updated home in prime Sunset District location with panoramic city views. Modern kitchen, hardwood floors throughout.",
      highlights: ["Updated Kitchen", "City Views", "Large Backyard", "2-Car Garage"],
      daysOnMarket: 12,
      isFeatured: true,
      agentName: "Sarah Chen",
      agentPhone: "(415) 555-1234",
      agentEmail: "sarah.chen@realestate.com",
    },
    {
      propertyAddress: "892 Piedmont Avenue",
      city: "Oakland",
      state: "CA",
      zipCode: "94611",
      propertyType: "townhouse",
      bedrooms: 3,
      bathrooms: "2",
      sqft: 1650,
      yearBuilt: 2018,
      listingType: "on_market",
      listPrice: 785000,
      pricePerSqft: 476,
      condition: "move_in_ready",
      description: "Modern townhome in desirable Piedmont Avenue neighborhood. Open concept living with high ceilings and natural light.",
      highlights: ["Built 2018", "Rooftop Deck", "Central A/C", "In-Unit Laundry"],
      daysOnMarket: 5,
      isFeatured: true,
      agentName: "Mike Rodriguez",
      agentPhone: "(510) 555-4567",
      agentEmail: "mike.r@oaklandrealty.com",
    },
    {
      propertyAddress: "2105 Telegraph Hill Road",
      city: "San Francisco",
      state: "CA",
      zipCode: "94133",
      propertyType: "condo",
      bedrooms: 2,
      bathrooms: "1",
      sqft: 950,
      yearBuilt: 1960,
      listingType: "on_market",
      listPrice: 675000,
      pricePerSqft: 711,
      condition: "needs_minor_updates",
      description: "Classic North Beach condo with stunning bay views. Great bones but could use cosmetic updates. Amazing location.",
      highlights: ["Bay Views", "Walk to Restaurants", "Parking Included"],
      daysOnMarket: 28,
      isFeatured: false,
      agentName: "Lisa Park",
      agentPhone: "(415) 555-7890",
      agentEmail: "lisa@sfhomes.com",
    },
    {
      propertyAddress: "7834 Lakeview Drive",
      city: "Oakland",
      state: "CA",
      zipCode: "94619",
      propertyType: "single_family",
      bedrooms: 5,
      bathrooms: "3",
      sqft: 3200,
      yearBuilt: 1975,
      listingType: "off_market",
      listPrice: 925000,
      pricePerSqft: 289,
      condition: "needs_renovation",
      description: "Off-market opportunity! Large family home near Lake Chabot with significant renovation potential. Sold as-is.",
      highlights: ["Large Lot", "Near Lake Chabot", "Investment Opportunity"],
      daysOnMarket: 0,
      isFeatured: false,
      agentName: "Tony Vasquez",
      agentPhone: "(510) 555-2345",
      agentEmail: "tony@eastbaydeals.com",
    },
    {
      propertyAddress: "156 Marina Boulevard",
      city: "San Francisco",
      state: "CA",
      zipCode: "94123",
      propertyType: "multi_family",
      bedrooms: 6,
      bathrooms: "4",
      sqft: 4500,
      yearBuilt: 1925,
      listingType: "on_market",
      listPrice: 2850000,
      pricePerSqft: 633,
      condition: "move_in_ready",
      description: "Stunning Marina duplex with classic San Francisco charm. Both units recently renovated with premium finishes.",
      highlights: ["Duplex", "Renovated 2023", "Marina District", "Garden"],
      daysOnMarket: 45,
      isFeatured: true,
      agentName: "Jennifer Wu",
      agentPhone: "(415) 555-3456",
      agentEmail: "jen.wu@sfproperties.com",
    }
  ];

  for (const listing of sampleListings) {
    const existing = await db.select().from(listings).where(eq(listings.propertyAddress, listing.propertyAddress));
    if (existing.length === 0) {
      await db.insert(listings).values(listing);
    }
  }
  console.log("Listings seeded.");
  
  console.log("Dealflow data seeding complete!");
}
