import { Link } from 'wouter';
import type { Nav } from './theme';
import { BrandMark } from './primitives';
import { REAL_ESTATE_LINKS, PUBLIC_CONTACT } from './public-content';
import './experience.css';

const groups = [
  { label: 'Real Estate', links: REAL_ESTATE_LINKS },
  { label: 'Tools & Network', links: [
    { label: 'Tools', href: '/tools' }, { label: 'Strategy Lab', href: '/strategy-lab' },
    { label: 'Saved work', href: '/saved' }, { label: 'Property Review', href: '/deal-blueprint' },
    { label: 'MarketFlow · Private pilot', href: '/marketflow' }, { label: 'Vendor network', href: '/vendor-network' },
  ] },
  { label: 'Company', links: [
    { label: 'About Pegasus', href: '/about' }, { label: 'Our Work', href: '/our-work' },
    { label: 'Contact', href: '/contact' }, { label: 'Connect', href: '/connect' },
    { label: 'Peggy', href: '/peggy' }, { label: 'FAQ', href: '/faq' },
  ] },
];
export function Footer(_props: { go: Nav }) {
  return <footer className="site-footer"><div className="experience-wrap">
    <div className="site-footer-top"><div className="site-footer-identity">
      <Link href="/" aria-label="Pegasus Dreamscapes home" className="site-footer-brand"><BrandMark boxClassName="w-16 h-16" onDark /><span>Pegasus<span>Dreamscapes</span></span></Link>
      <p>Development · Investments · Systems</p><p>Dream it. Build it. Live it.</p>
      <div className="site-footer-contact"><a href={`mailto:${PUBLIC_CONTACT.email}`}>{PUBLIC_CONTACT.email}</a><a href={PUBLIC_CONTACT.telephone}>{PUBLIC_CONTACT.phone}</a><span>East Bay · CA</span></div>
    </div>
    {groups.map(group => <section key={group.label}><h2>{group.label}</h2><ul>{group.links.map(item => <li key={item.href}><Link href={item.href}>{item.label}</Link></li>)}</ul></section>)}
    </div>
    <div className="site-footer-bottom"><div className="site-footer-policies"><Link href="/privacy">Privacy Policy</Link><Link href="/terms">Terms</Link><Link href="/disclosures">Disclosures</Link></div>
      <p data-testid="text-footer-identity">Pegasus Dreamscapes Corp. is a real estate investment, development, and strategy company, not a real estate brokerage. This site uses Paolo &ldquo;Apollo&rdquo; Duran as a public-facing name. For license verification, CA DRE #02333658 is listed under Duran Ramirez, Paolo Ariel. The responsible broker listed in DRE records is BMP Realty Inc DBA Keller Williams Realty-East Bay. Verify current status before engagement. Licensed representation may be available only through a separate written brokerage agreement. Strategy tools and intake materials are preliminary and are not legal, tax, lending, appraisal, financial, or investment advice. Equal Housing Opportunity.</p>
      <div className="site-footer-copyright">© {new Date().getFullYear()} Pegasus Dreamscapes Corp. All rights reserved.</div>
    </div>
  </div></footer>;
}
