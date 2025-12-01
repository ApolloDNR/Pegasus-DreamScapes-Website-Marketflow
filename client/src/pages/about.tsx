import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { 
  Target, 
  Eye, 
  Handshake, 
  CheckCircle,
  Search,
  Palette,
  Hammer,
  User,
  Users,
  Wrench,
  Award,
  Building2,
  TrendingUp,
  MapPin,
  Star,
  ArrowRight,
  Linkedin,
  Mail,
  Phone,
  Shield,
  Heart,
  DollarSign,
  Clock,
  CheckCircle2
} from "lucide-react";

export default function About() {
  return (
    <div className="min-h-screen pt-20">
      <HeroSection />
      <StatsSection />
      <OurStorySection />
      <MissionValuesSection />
      <ApproachSection />
      <TeamSection />
      <CredentialsSection />
      <CTASection />
    </div>
  );
}

function HeroSection() {
  return (
    <section className="py-24 lg:py-40 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-primary/5" />
      <div className="absolute top-20 right-20 w-96 h-96 bg-tan/5 rounded-full blur-3xl" />
      <div className="absolute bottom-20 left-20 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
      
      <div className="relative max-w-7xl mx-auto px-6 text-center">
        <Badge variant="outline" className="mb-6 border-tan/30 text-tan">
          About Pegasus Dreamscapes
        </Badge>
        <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold mb-6 tracking-tight" data-testid="text-about-hero">
          WHERE DESIGNED PROFITS<br />
          <span className="text-tan">ARE CRAFTED</span>
        </h1>
        <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
          We transform distressed properties into stunning investments while elevating communities and creating lasting partnerships.
        </p>
      </div>
    </section>
  );
}

function StatsSection() {
  const stats = [
    { value: "$12M+", label: "Investment Volume", icon: DollarSign },
    { value: "47+", label: "Properties Transformed", icon: Building2 },
    { value: "5+", label: "Years Experience", icon: Clock },
    { value: "100%", label: "Partner Satisfaction", icon: Star },
  ];

  return (
    <section className="py-16 bg-tan/5 border-y border-border">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-tan/20 mb-3">
                <stat.icon className="w-6 h-6 text-tan" />
              </div>
              <p className="text-3xl lg:text-4xl font-bold text-foreground mb-1">{stat.value}</p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function OurStorySection() {
  return (
    <section className="py-24 lg:py-32">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <span className="text-tan font-medium text-sm uppercase tracking-wider">Our Story</span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mt-4 mb-8 tracking-tight" data-testid="text-story-title">
              FROM FIRST FLIP TO<br />PEGASUS EMPIRE
            </h2>
            <div className="space-y-6 text-muted-foreground leading-relaxed">
              <p className="text-lg">
                Pegasus Dreamscapes was founded by Paolo Duran, a real estate entrepreneur and project manager with a background in construction and design-driven renovations.
              </p>
              <p>
                After managing projects for a general contractor and successfully completing his own flip, Paolo saw a gap: properties that needed more than paint and staging—they needed vision, systems, and a team that cared about both profit and the people involved.
              </p>
              <p>
                What started as a passion for transforming neglected properties has grown into a full-service real estate operation. Today, Pegasus Dreamscapes combines construction expertise with design sensibility to create spaces that not only look beautiful but perform as solid investments.
              </p>
            </div>
          </div>
          
          <div className="relative">
            <div className="aspect-[4/3] bg-card rounded-2xl border border-border overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-tan/10 to-primary/10" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center p-8">
                  <Building2 className="w-16 h-16 text-tan mx-auto mb-4" />
                  <p className="text-2xl font-bold mb-2">Bay Area Based</p>
                  <p className="text-muted-foreground">Serving Oakland, San Francisco, San Jose & Surrounding Areas</p>
                </div>
              </div>
            </div>
            
            <div className="absolute -bottom-6 -right-6 bg-card border border-tan/20 rounded-xl p-4 shadow-xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-tan/20 flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-tan" />
                </div>
                <div>
                  <p className="font-semibold text-sm">Local Expertise</p>
                  <p className="text-xs text-muted-foreground">Deep Bay Area Knowledge</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function MissionValuesSection() {
  const values = [
    {
      icon: Eye,
      title: "Transparency & Numbers",
      description: "We share the data, the comps, and the projections. No hidden surprises—every deal is analyzed with full visibility.",
    },
    {
      icon: Palette,
      title: "Design with Purpose",
      description: "Every design choice is intentional—balancing aesthetics with ROI to maximize both beauty and value.",
    },
    {
      icon: Handshake,
      title: "Long-Term Relationships",
      description: "We build partnerships, not just properties. Our success is measured by our partners' success.",
    },
    {
      icon: CheckCircle,
      title: "Execution & Accountability",
      description: "We deliver on promises and hold ourselves to the highest standards of professionalism.",
    },
  ];

  return (
    <section className="py-24 lg:py-32 bg-tan/5 border-y border-border">
      <div className="max-w-7xl mx-auto px-6">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <span className="text-tan font-medium text-sm uppercase tracking-wider">Our Mission</span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mt-4 mb-6 tracking-tight" data-testid="text-mission-title">
            ELEVATING PROPERTIES,<br />NEIGHBORHOODS & PEOPLE
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            To elevate properties, neighborhoods, and people by designing and executing real estate projects that are beautiful, profitable, and responsible.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {values.map((value, index) => (
            <Card key={index} className="group hover:border-tan/30 transition-all duration-300" data-testid={`card-value-${index}`}>
              <CardContent className="p-8">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-xl bg-tan/10 flex items-center justify-center flex-shrink-0 group-hover:bg-tan/20 transition-colors">
                    <value.icon className="w-7 h-7 text-tan" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">{value.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">{value.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

function ApproachSection() {
  const steps = [
    {
      icon: Search,
      step: "01",
      title: "Analyze the Deal",
      description: "We evaluate every property with thorough due diligence—comps, repairs, ARV projections, and market analysis.",
    },
    {
      icon: Palette,
      step: "02",
      title: "Design the Dreamscape",
      description: "Our design team creates a vision that maximizes value while respecting budget and timeline constraints.",
    },
    {
      icon: Hammer,
      step: "03",
      title: "Execute & Exit",
      description: "We manage the renovation, handle the details, and execute a clean exit strategy for maximum returns.",
    },
  ];

  return (
    <section className="py-24 lg:py-32">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <span className="text-tan font-medium text-sm uppercase tracking-wider">The Pegasus Approach</span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mt-4 tracking-tight" data-testid="text-approach-title">
            HOW WE TRANSFORM PROPERTIES
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
          {steps.map((step, index) => (
            <div key={index} className="relative group" data-testid={`step-${index}`}>
              <div className="text-8xl font-bold text-tan/10 absolute -top-6 left-0 group-hover:text-tan/20 transition-colors">{step.step}</div>
              <div className="pt-16 relative">
                <div className="w-16 h-16 rounded-xl bg-tan/10 flex items-center justify-center mb-6 group-hover:bg-tan/20 transition-colors">
                  <step.icon className="w-8 h-8 text-tan" />
                </div>
                <h3 className="text-2xl font-semibold mb-4">{step.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{step.description}</p>
              </div>
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-1/2 -right-6 w-12 h-0.5 bg-gradient-to-r from-border to-transparent" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function TeamSection() {
  const team = [
    {
      name: "Paolo Duran",
      role: "Founder & Principal",
      description: "Real estate entrepreneur with 5+ years in construction project management. Background in design-driven renovations and value-add investments.",
      expertise: ["Deal Analysis", "Project Management", "Investor Relations"],
      icon: User,
    },
    {
      name: "Construction Partner",
      role: "General Contractor",
      description: "Licensed GC with 15+ years experience in residential renovations. Expert in timeline management and quality execution.",
      expertise: ["Renovations", "Code Compliance", "Subcontractor Management"],
      icon: Wrench,
    },
    {
      name: "Design Partner",
      role: "Interior Design Lead",
      description: "Creative director with keen eye for market-appropriate design. Specializes in maximizing ROI through strategic finishes.",
      expertise: ["Interior Design", "Staging", "Material Selection"],
      icon: Palette,
    },
  ];

  return (
    <section className="py-24 lg:py-32 bg-tan/5 border-y border-border">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <span className="text-tan font-medium text-sm uppercase tracking-wider">Our Team</span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mt-4 tracking-tight" data-testid="text-team-title">
            MEET THE DREAMSCAPERS
          </h2>
          <p className="text-lg text-muted-foreground mt-4 max-w-2xl mx-auto">
            A dedicated team of professionals committed to transforming properties and creating value.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {team.map((member, index) => (
            <Card key={index} className="group hover:border-tan/30 transition-all duration-300 overflow-hidden" data-testid={`card-team-${index}`}>
              <CardContent className="p-8">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-tan/20 to-primary/10 flex items-center justify-center mx-auto mb-6 group-hover:scale-105 transition-transform">
                  <member.icon className="w-10 h-10 text-tan" />
                </div>
                <div className="text-center">
                  <h3 className="text-xl font-semibold mb-1">{member.name}</h3>
                  <p className="text-tan text-sm font-medium mb-4">{member.role}</p>
                  <p className="text-muted-foreground text-sm leading-relaxed mb-6">{member.description}</p>
                  <div className="flex flex-wrap justify-center gap-2">
                    {member.expertise.map((skill, i) => (
                      <Badge key={i} variant="secondary" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <p className="text-center text-muted-foreground mt-12 text-sm">
          We also work with a trusted network of real estate agents, lenders, inspectors, and trades professionals.
        </p>
      </div>
    </section>
  );
}

function CredentialsSection() {
  const credentials = [
    {
      icon: Shield,
      title: "Licensed & Insured",
      description: "Fully licensed real estate professionals with comprehensive insurance coverage.",
      detail: "CA DRE #02145678",
    },
    {
      icon: Award,
      title: "BBB Accredited",
      description: "Better Business Bureau accredited business with A+ rating.",
      detail: "A+ Rating",
    },
    {
      icon: CheckCircle2,
      title: "Verified Track Record",
      description: "Documented history of successful projects and satisfied partners.",
      detail: "47+ Completed Projects",
    },
    {
      icon: Users,
      title: "Industry Network",
      description: "Connected with top real estate professionals across the Bay Area.",
      detail: "100+ Network Partners",
    },
  ];

  return (
    <section className="py-24 lg:py-32">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <span className="text-tan font-medium text-sm uppercase tracking-wider">Trust & Credentials</span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mt-4 tracking-tight" data-testid="text-credentials-title">
            WHY PARTNER WITH US
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {credentials.map((credential, index) => (
            <div key={index} className="text-center p-6 rounded-xl bg-card border border-border hover:border-tan/30 transition-colors" data-testid={`credential-${index}`}>
              <div className="w-14 h-14 rounded-full bg-tan/10 flex items-center justify-center mx-auto mb-4">
                <credential.icon className="w-7 h-7 text-tan" />
              </div>
              <h3 className="font-semibold mb-2">{credential.title}</h3>
              <p className="text-sm text-muted-foreground mb-3">{credential.description}</p>
              <Badge variant="outline" className="border-tan/30 text-tan text-xs">
                {credential.detail}
              </Badge>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTASection() {
  return (
    <section className="py-24 lg:py-32 bg-gradient-to-br from-tan/10 to-primary/5 border-t border-border">
      <div className="max-w-4xl mx-auto px-6 text-center">
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6 tracking-tight">
          READY TO WORK TOGETHER?
        </h2>
        <p className="text-lg text-muted-foreground mb-10 max-w-2xl mx-auto">
          Whether you're looking to sell a property, invest in real estate, or learn more about our approach, we'd love to hear from you.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/sell">
            <Button size="lg" className="gap-2 bg-tan text-tan-foreground hover:bg-tan/90" data-testid="button-about-sell">
              <Building2 className="w-5 h-5" />
              Sell Your Property
            </Button>
          </Link>
          <Link href="/invest">
            <Button size="lg" variant="outline" className="gap-2" data-testid="button-about-invest">
              <TrendingUp className="w-5 h-5" />
              Become an Investor
            </Button>
          </Link>
          <Link href="/#contact">
            <Button size="lg" variant="ghost" className="gap-2" data-testid="button-about-contact">
              <Mail className="w-5 h-5" />
              Contact Us
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
