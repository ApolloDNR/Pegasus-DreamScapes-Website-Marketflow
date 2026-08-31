import { MarketplaceLayout } from "@/components/marketplace-layout";
import { Card, CardContent } from "@/components/ui/card";
import { 
  BookOpen, 
  Calculator,
  Lightbulb,
  MessageCircle,
  FolderOpen,
} from "lucide-react";
import { Link } from "wouter";

export default function MarketplaceResources() {
  return (
    <MarketplaceLayout>
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-primary" />
            </div>
            <h1 className="text-2xl font-serif font-bold" data-testid="text-marketplace-resources">
              Resources & Learning
            </h1>
          </div>
          <p className="text-muted-foreground">
            User-controlled educational tools for exploring public Pegasus paths. Nothing here is individualized investment, legal, tax, or accounting advice.
          </p>
        </div>

        <Card className="mb-10">
          <CardContent className="p-5 text-sm leading-relaxed text-muted-foreground">
            Use the live public tools below. No separate article library is published in MarketFlow.
          </CardContent>
        </Card>
        <QuickTools />
      </div>
    </MarketplaceLayout>
  );
}

function QuickTools() {
  const tools = [
    {
      icon: Calculator,
      title: "Deal Calculators",
      description: "Run illustrative calculators with inputs and assumptions you control.",
      href: "/strategy-lab?tool=calculators",
    },
    {
      icon: FolderOpen,
      title: "Property Workspace",
      description: "Resume browser-saved Strategy Lab drafts and saved conversations.",
      href: "/saved",
    },
    {
      icon: Lightbulb,
      title: "Explore Strategies",
      description: "Compare possible lanes using the property inputs you provide.",
      href: "/strategy-lab",
    },
    {
      icon: MessageCircle,
      title: "Ask Peggy",
      description: "Explore educational questions and find the appropriate next route.",
      href: "/peggy",
    },
  ];

  return (
    <section className="mb-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold mb-1">Quick Tools</h2>
          <p className="text-sm text-muted-foreground">Helpful resources at your fingertips</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {tools.map((tool, index) => (
          <Link key={index} href={tool.href}>
            <Card className="h-full hover-elevate cursor-pointer" data-testid={`tool-card-${index}`}>
              <CardContent className="p-5 text-center">
                <div className="w-12 h-12 rounded-md bg-primary/10 flex items-center justify-center mx-auto mb-3">
                  <tool.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-1">{tool.title}</h3>
                <p className="text-xs text-muted-foreground line-clamp-2">{tool.description}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  );
}
