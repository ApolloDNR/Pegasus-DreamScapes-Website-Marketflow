import { Link } from "wouter";
import { Mail, Phone, MapPin } from "lucide-react";

const quickLinks = [
  { href: "/", label: "Home" },
  { href: "/sell", label: "Sell Your Property" },
  { href: "/invest", label: "Invest With Pegasus" },
  { href: "/projects", label: "Projects" },
  { href: "/contact", label: "Contact" },
  { href: "/login", label: "Login to Pegasus HQ" },
];

const services = [
  { href: "/services", label: "Fix & Flip Acquisitions" },
  { href: "/services", label: "Buy & Hold Rentals" },
  { href: "/services", label: "Design & Renovation" },
  { href: "/dreamspace", label: "Dreamspace Studio" },
];

export function Footer() {
  return (
    <footer className="bg-card border-t border-border">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <PegasusLogo />
              <span className="font-semibold text-lg">Pegasus Dreamscapes</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              We design and flip dream spaces that perform like investments. Transforming distressed properties into beautiful, high-performing assets.
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-4 text-sm uppercase tracking-wide text-muted-foreground">Quick Links</h3>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.href + link.label}>
                  <Link href={link.href}>
                    <span className="text-sm text-muted-foreground hover:text-foreground transition-colors" data-testid={`link-footer-${link.label.toLowerCase().replace(/\s+/g, '-')}`}>
                      {link.label}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4 text-sm uppercase tracking-wide text-muted-foreground">Services</h3>
            <ul className="space-y-2">
              {services.map((link) => (
                <li key={link.label}>
                  <Link href={link.href}>
                    <span className="text-sm text-muted-foreground hover:text-foreground transition-colors" data-testid={`link-footer-service-${link.label.toLowerCase().replace(/\s+/g, '-')}`}>
                      {link.label}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4 text-sm uppercase tracking-wide text-muted-foreground">Contact</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <Mail className="w-4 h-4 mt-0.5 text-primary flex-shrink-0" />
                <a href="mailto:info@pegasusdreamscapes.com" className="text-sm text-muted-foreground hover:text-foreground transition-colors" data-testid="link-footer-email">
                  info@pegasusdreamscapes.com
                </a>
              </li>
              <li className="flex items-start gap-3">
                <Phone className="w-4 h-4 mt-0.5 text-primary flex-shrink-0" />
                <a href="tel:+15551234567" className="text-sm text-muted-foreground hover:text-foreground transition-colors" data-testid="link-footer-phone">
                  (555) 123-4567
                </a>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="w-4 h-4 mt-0.5 text-primary flex-shrink-0" />
                <span className="text-sm text-muted-foreground" data-testid="text-footer-location">
                  California, USA
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-border">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground" data-testid="text-copyright">
              &copy; {new Date().getFullYear()} Pegasus Dreamscapes Corp. All rights reserved.
            </p>
            <p className="text-xs text-muted-foreground text-center md:text-right" data-testid="text-disclosure">
              Pegasus Dreamscapes Corp · Real Estate & Design Company based in California.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

function PegasusLogo() {
  return (
    <svg
      width="28"
      height="28"
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="text-primary"
    >
      <path
        d="M16 2L4 8v8c0 7.732 5.268 12 12 14 6.732-2 12-6.268 12-14V8L16 2z"
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
      />
      <path
        d="M12 12c0-2 1.5-4 4-4s4 2 4 4c0 3-2 4-4 6-2-2-4-3-4-6z"
        fill="currentColor"
      />
      <path
        d="M8 18c2-1 3 0 4 2s2 4 4 4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M24 18c-2-1-3 0-4 2s-2 4-4 4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}
