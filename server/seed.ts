import { db } from "./db";
import { projects } from "@shared/schema";
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
