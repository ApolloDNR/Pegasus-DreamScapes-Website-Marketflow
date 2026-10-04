import type { ReactNode } from 'react';
import { Link } from 'wouter';
import { ArrowRight } from 'lucide-react';
import { SUBMISSION_NOTICE } from './public-content';
import { BeforeYouBegin, GuideInvite, ExplainWithPeggy } from './journey';
import { CinematicScene } from './cinematic-scene';
import './experience-page.css';
import './page-compositions.css';

export function PageAction({ href, children, secondary = false }: { href: string; children: ReactNode; secondary?: boolean }) {
  const className = secondary ? 'experience-link' : 'experience-button';
  const content = <>{children}<ArrowRight size={17} aria-hidden="true" /></>;
  // Same-page anchors need the browser's native scroll and history behavior.
  if (href.startsWith('#') || /^[a-z][a-z\d+.-]*:/i.test(href)) {
    return <a href={href} className={className}>{content}</a>;
  }
  return <Link href={href} className={className}>{content}</Link>;
}

export function PageOpening({ title, children, action, secondaryAction, image, composition }: {
  title: string; children: ReactNode; action?: { label: string; href: string };
  secondaryAction?: { label: string; href: string };
  composition?: 'chapter' | 'landscape' | 'portrait' | 'reading';
  image?: { src: string; alt: string; width: number; height: number; caption?: string; portrait?: boolean };
}) {
  const layout = composition ?? (image ? (image.portrait ? 'portrait' : 'landscape') : 'chapter');
  const scene = layout === 'landscape' && image;
  return <header className={`ep-opening ep-opening-${layout}${image ? ' ep-opening-with-image' : ''}`}>
    {scene && <CinematicScene {...image} priority />}
    <div className="experience-wrap ep-opening-grid">
      <div className="ep-opening-copy"><h1>{title}</h1><div className="ep-opening-body"><div className="ep-intro">{children}</div>
        {action && <div className="experience-actions"><PageAction href={action.href}>{action.label}</PageAction>{secondaryAction && <PageAction href={secondaryAction.href} secondary>{secondaryAction.label}</PageAction>}</div>}
        <GuideInvite compact />
      </div>
      </div>
      {image && !scene && <figure className={image.portrait ? 'ep-opening-image ep-portrait' : 'ep-opening-image'}>
        <img src={image.src} alt={image.alt} width={image.width} height={image.height} loading="eager" decoding="async" />
        {image.caption && <figcaption>{image.caption}</figcaption>}
      </figure>}
    </div>
    {scene && image.caption && <p className="experience-wrap ep-scene-caption">{image.caption}</p>}
  </header>;
}

export function PageClosing({ title = 'Start with what you have.', children, href = '/bring-an-opportunity', label = 'Start a conversation', secondaryAction }: {
  title?: string; children?: ReactNode; href?: string; label?: string; secondaryAction?: { label: string; href: string };
}) {
  return <section className="ep-section ep-dark ep-closing"><div className="experience-wrap ep-split">
    <h2>{title}</h2><div>{children}{secondaryAction ? <div className="experience-actions"><PageAction href={href}>{label}</PageAction><PageAction href={secondaryAction.href} secondary>{secondaryAction.label}</PageAction></div> : <PageAction href={href}>{label}</PageAction>}{href.startsWith('/bring-an-opportunity') && <><BeforeYouBegin /><p className="ep-notice">{SUBMISSION_NOTICE}</p></>}</div>
  </div></section>;
}

export function ProjectEvidence({ title = 'Examine the Nelson Drive transformation.' }: { title?: string }) {
  return <section className="ep-section ep-evidence"><div className="experience-wrap ep-split">
    <figure><img src="/images/nelson/kitchen-after.webp" alt="Completed Nelson Drive kitchen with navy cabinetry and a quartz island" width={1600} height={996} loading="lazy" decoding="async" /><figcaption>Nelson Drive · Completed East Bay residential transformation</figcaption></figure>
    <div><h2 data-peggy-summary="See the original photographs and available records from Nelson Drive. Open the case study to understand the work in detail.">{title}</h2><p>Compare the original condition, visible renovation, and recorded sale.</p><p className="ep-notice">The available record does not verify Pegasus’s or Apollo’s project role.</p><PageAction href="/projects/nelson-dr" secondary>Explore the case study</PageAction><div><ExplainWithPeggy /></div></div>
  </div></section>;
}
