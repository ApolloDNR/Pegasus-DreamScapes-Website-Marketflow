import { Link } from 'wouter';
import { ArrowRight } from 'lucide-react';
import type { Category, Nav } from './theme';
import { urlFor } from './routes';
import { FAQBlock } from './blocks';
import { LeadSection } from './forms';
import { PageAction, PageOpening, ProjectEvidence } from './experience-page';

export function CategoryPage({ cat, go: _go, openPeggy: _openPeggy }: { cat: Category; go: Nav; openPeggy: () => void }) {
  const buyer = cat.form?.intent === 'buyer';
  const referral = cat.form?.intent === 'referral';
  const title = buyer ? 'Find a property with a plan.' : referral ? 'Share an introduction. Set boundaries first.' : 'Define the standard before the scope.';
  const action = buyer ? { label: 'Choose your buyer path', href: '#audience-options' } : referral ? { label: 'Share an introduction', href: '#category-inquiry' } : cat.heroAction;
  return <article className="experience-page ep-category">
    <PageOpening title={title} action={action}><p>{cat.lead}</p></PageOpening>
    {cat.splits && <section id="audience-options" className="ep-section"><div className="experience-wrap ep-split"><div><h2>{cat.splits.heading}</h2><p>{cat.splits.copy}</p></div><div className="ep-link-list">{cat.splits.paths.map(path => <Link key={path.name} href={'href' in path ? path.href : urlFor(path.route)}><span><strong>{path.name}</strong><small>{path.desc}</small><span className="ep-path-cta">{path.cta}</span></span><ArrowRight aria-hidden="true" /></Link>)}</div></div></section>}
    <section className="ep-section ep-warm"><div className="experience-wrap ep-split"><h2>{buyer ? 'A considered buying decision.' : referral ? 'Permission, context, and written terms.' : 'The terms belong in the project documents.'}</h2><ol className="ep-rows ep-numbered">{cat.points.map(point => <li key={point.t}><div><h3>{point.t}</h3><p>{point.d}</p></div></li>)}</ol></div></section>
    <section className="ep-section"><div className="experience-wrap ep-split"><div><h2>When this path fits.</h2><ul className="ep-rows">{cat.forYou.map(item => <li key={item}>{item}</li>)}</ul></div><div><h3>Consider another path if</h3><ul className="ep-rows">{cat.notFit.map(item => <li key={item}>{item}</li>)}</ul></div></div></section>
    {buyer && <ProjectEvidence />}
    {cat.faq && <div className="ep-category-faq"><FAQBlock items={cat.faq} eyebrow="Questions" title="A few useful details." allHref={cat.faqAnchor ? `/faq#${cat.faqAnchor}` : '/faq'} /></div>}
    {cat.form ? <div id="category-inquiry" className="ep-form-section"><LeadSection cfg={cat.form} eyebrow={buyer ? 'Investor-interest request' : 'Referral request'} tone="page" headingLevel={2} showDecorativeContour={false} /></div> : <section className="ep-section ep-dark"><div className="experience-wrap ep-split"><div><h2>Apply through Vendor Network.</h2><p>{cat.terminal.copy}</p></div><PageAction href={cat.terminal.href}>{cat.terminal.label}</PageAction></div></section>}
  </article>;
}
