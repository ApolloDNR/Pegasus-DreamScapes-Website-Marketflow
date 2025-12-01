import { Card, CardContent } from "@/components/ui/card";
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
  Wrench
} from "lucide-react";

export default function About() {
  return (
    <div className="min-h-screen pt-20">
      <HeroSection />
      <OurStorySection />
      <MissionValuesSection />
      <ApproachSection />
      <TeamSection />
    </div>
  );
}

function HeroSection() {
  return (
    <section className="py-20 lg:py-32 relative">
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-primary/5" />
      <div className="relative max-w-7xl mx-auto px-6 text-center">
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6" data-testid="text-about-hero">
          About Pegasus Dreamscapes
        </h1>
        <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
          Building trust through transparency, transforming properties with vision, and creating partnerships that last.
        </p>
      </div>
    </section>
  );
}

function OurStorySection() {
  return (
    <section className="py-20 lg:py-32 border-t border-border">
      <div className="max-w-3xl mx-auto px-6">
        <span className="text-primary font-medium text-sm uppercase tracking-wide">Our Story</span>
        <h2 className="text-3xl sm:text-4xl font-semibold mt-2 mb-8" data-testid="text-story-title">
          From First Flip to Pegasus Empire
        </h2>
        <div className="prose prose-lg prose-invert max-w-none">
          <p className="text-muted-foreground leading-relaxed text-lg" data-testid="text-story-content">
            Pegasus Dreamscapes was founded by Paolo Duran, a real estate entrepreneur and project manager with a background in construction and design-driven renovations. After managing projects for a general contractor and successfully completing his own flip, Paolo saw a gap: properties that needed more than paint and staging—they needed vision, systems, and a team that cared about both profit and the people involved.
          </p>
          <p className="text-muted-foreground leading-relaxed text-lg mt-6">
            What started as a passion for transforming neglected properties has grown into a full-service real estate operation. Today, Pegasus Dreamscapes combines construction expertise with design sensibility to create spaces that not only look beautiful but perform as solid investments.
          </p>
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
      description: "We share the data, the comps, and the projections. No hidden surprises.",
    },
    {
      icon: Palette,
      title: "Design with Purpose",
      description: "Every design choice is intentional—balancing aesthetics with ROI.",
    },
    {
      icon: Handshake,
      title: "Long-Term Relationships",
      description: "We build partnerships, not just properties.",
    },
    {
      icon: CheckCircle,
      title: "Execution & Accountability",
      description: "We deliver on promises and hold ourselves to high standards.",
    },
  ];

  return (
    <section className="py-20 lg:py-32 bg-card/50 border-y border-border">
      <div className="max-w-7xl mx-auto px-6">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <span className="text-primary font-medium text-sm uppercase tracking-wide">Our Mission</span>
          <h2 className="text-3xl sm:text-4xl font-semibold mt-2 mb-6" data-testid="text-mission-title">
            Elevating Properties, Neighborhoods, and People
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            To elevate properties, neighborhoods, and people by designing and executing real estate projects that are beautiful, profitable, and responsible.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {values.map((value, index) => (
            <Card key={index} className="hover-elevate transition-all duration-300" data-testid={`card-value-${index}`}>
              <CardContent className="p-8">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <value.icon className="w-6 h-6 text-primary" />
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
      title: "Execute the Plan & Exit",
      description: "We manage the renovation, handle the details, and execute a clean exit strategy.",
    },
  ];

  return (
    <section className="py-20 lg:py-32">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <span className="text-primary font-medium text-sm uppercase tracking-wide">The Pegasus Approach</span>
          <h2 className="text-3xl sm:text-4xl font-semibold mt-2" data-testid="text-approach-title">
            How We Transform Properties
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="relative" data-testid={`step-${index}`}>
              <div className="text-7xl font-bold text-primary/10 absolute -top-4 left-0">{step.step}</div>
              <div className="pt-12">
                <div className="w-14 h-14 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <step.icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{step.description}</p>
              </div>
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-1/2 -right-4 w-8 h-0.5 bg-border" />
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
      icon: User,
      name: "Paolo Duran",
      role: "Founder / Project Lead",
      description: "Real estate entrepreneur with background in construction and project management.",
    },
    {
      icon: Wrench,
      name: "GC Partner",
      role: "Construction Partner",
      description: "Experienced general contractor handling all renovation execution.",
    },
    {
      icon: Palette,
      name: "Design Partner",
      role: "Interior & Styling",
      description: "Creative vision behind our design-forward approach to renovations.",
    },
  ];

  return (
    <section className="py-20 lg:py-32 bg-card/50 border-t border-border">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <span className="text-primary font-medium text-sm uppercase tracking-wide">Our Team</span>
          <h2 className="text-3xl sm:text-4xl font-semibold mt-2" data-testid="text-team-title">
            The People Behind Pegasus
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {team.map((member, index) => (
            <Card key={index} className="text-center hover-elevate transition-all duration-300" data-testid={`card-team-${index}`}>
              <CardContent className="p-8">
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <member.icon className="w-10 h-10 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-1">{member.name}</h3>
                <p className="text-primary text-sm font-medium mb-3">{member.role}</p>
                <p className="text-muted-foreground text-sm leading-relaxed">{member.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <p className="text-center text-muted-foreground mt-12 text-sm" data-testid="text-network">
          We also work with a trusted network of trades, agents, and lenders.
        </p>
      </div>
    </section>
  );
}
