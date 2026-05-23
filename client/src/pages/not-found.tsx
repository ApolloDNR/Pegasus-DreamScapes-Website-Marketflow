import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Compass } from "lucide-react";
import { useSEO } from "@/hooks/use-seo";

export default function NotFound() {
  useSEO({
    title: "Page Not Found",
    description: "The path you're looking for doesn't exist on the Pegasus DreamScapes site. Return to the homepage or start a Strategy Review.",
  });

  return (
    <div className="min-h-screen bg-navy text-cream relative overflow-hidden flex items-center">
      {/* Ambient brass glow */}
      <div aria-hidden="true" className="absolute top-1/3 left-1/4 w-[480px] h-[480px] bg-primary/15 rounded-full blur-3xl" />
      <div aria-hidden="true" className="absolute bottom-1/4 right-1/4 w-[360px] h-[360px] bg-primary/10 rounded-full blur-3xl" />
      {/* Subtle grid texture */}
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(246,239,228,1) 1px, transparent 1px), linear-gradient(90deg, rgba(246,239,228,1) 1px, transparent 1px)",
          backgroundSize: "80px 80px",
        }}
      />

      <div className="relative max-w-3xl mx-auto px-6 py-24 lg:py-32 text-center w-full">
        {/* Brass numeral */}
        <div className="relative inline-block mb-10">
          <span aria-hidden="true" className="absolute inset-0 -m-6 rounded-full bg-primary/20 blur-2xl" />
          <p className="relative font-serif text-[120px] sm:text-[160px] lg:text-[200px] leading-none font-semibold tracking-[-0.04em] bg-gradient-to-br from-[#E8DBC5] via-[#D4B483] to-[#8E4F22] bg-clip-text text-transparent select-none">
            404
          </p>
        </div>

        {/* Kicker */}
        <div className="inline-flex items-center gap-3 mb-6">
          <span className="h-px w-10 bg-primary/60" />
          <p className="text-[10px] uppercase tracking-[0.3em] text-primary font-supporting font-semibold">
            Off the map
          </p>
          <span className="h-px w-10 bg-primary/60" />
        </div>

        {/* Editorial headline */}
        <h1
          className="font-serif text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-[-0.02em] leading-[1.05] mb-6 text-cream"
          data-testid="text-404-title"
        >
          The path ends here.
          <br />
          <span className="italic font-medium bg-gradient-to-r from-[#E8DBC5] via-[#D4B483] to-[#C17A4A] bg-clip-text text-transparent">
            Let's design a new one.
          </span>
        </h1>

        <p className="text-base sm:text-lg text-cream/75 leading-relaxed max-w-xl mx-auto mb-10">
          The page you were looking for doesn't exist or has been moved. Every property gets a path. Every visitor does too.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/">
            <Button
              size="lg"
              className="min-h-[48px] px-8 bg-primary hover:bg-primary/90 text-primary-foreground text-sm uppercase tracking-[0.15em] font-semibold shadow-md shadow-black/30 transition-all duration-300 hover:-translate-y-0.5"
              data-testid="button-404-home"
            >
              <Compass className="mr-2 w-4 h-4" />
              Back to home
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </Link>
          <Button
            size="lg"
            variant="outline"
            onClick={() => window.history.back()}
            className="min-h-[48px] px-8 border-cream/30 text-cream hover:bg-white/10 hover:text-cream backdrop-blur-md text-sm uppercase tracking-[0.15em] font-semibold transition-all duration-300 hover:-translate-y-0.5"
            data-testid="button-404-back"
          >
            <ArrowLeft className="mr-2 w-4 h-4" />
            Go back
          </Button>
        </div>

        {/* Quick paths */}
        <div className="mt-14 pt-10 border-t border-cream/15 max-w-xl mx-auto">
          <p className="text-[10px] uppercase tracking-[0.3em] text-cream/50 font-supporting font-semibold mb-4">
            Or pick a starting point
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {[
              { href: "/sell", label: "Start a Strategy Review" },
              { href: "/projects", label: "Projects" },
              { href: "/invest", label: "Capital" },
              { href: "/marketflow", label: "MarketFlow" },
            ].map((link) => (
              <Link key={link.href} href={link.href}>
                <span
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-cream/20 hover:border-primary/60 bg-white/[0.03] hover:bg-white/[0.06] text-xs uppercase tracking-[0.15em] text-cream/80 hover:text-cream font-supporting font-semibold transition-all duration-200 cursor-pointer"
                  data-testid={`link-404-${link.href.replace("/", "")}`}
                >
                  {link.label}
                  <ArrowRight className="w-3 h-3 text-primary" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
