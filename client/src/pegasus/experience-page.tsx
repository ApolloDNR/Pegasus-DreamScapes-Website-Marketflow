import type { ReactNode } from 'react';
import { Link } from 'wouter';
import { ArrowRight } from 'lucide-react';
import { SUBMISSION_NOTICE } from './public-content';
import './experience-page.css';

export function PageAction({ href, children, secondary = false }: { href: string; children: ReactNode; secondary?: boolean }) {
  return <Link href={href} className={secondary ? 'experience-link' : 'experience-button'}>{children}<ArrowRight size={17} aria-hidden="true" /></Link>;
}

export function PageOpening({ title, children, action, image }: {
  title: string; children: ReactNode; action?: { label: string; href: string };
  image?: { src: string; alt: string; width: number; height: number; caption?: string; portrait?: boolean };
}) {
  return <header className={`ep-opening${image ? ' ep-opening-with-image' : ''}`}>
    <div className="experience-wrap ep-opening-grid">
      <div className="ep-opening-copy"><h1>{title}</h1><div className="ep-intro">{children}</div>
        {action && <div className="experience-actions"><PageAction href={action.href}>{action.label}</PageAction></div>}
      </div>
      {image && <figure className={image.portrait ? 'ep-opening-image ep-portrait' : 'ep-opening-image'}>
        <img src={image.src} alt={image.alt} width={image.width} height={image.height} loading="eager" decoding="async" />
        {image.caption && <figcaption>{image.caption}</figcaption>}
      </figure>}
    </div>
  </header>;
}

export function PageClosing({ title = 'Start with what you have.', children, href = '/bring-an-opportunity', label = 'Bring an Opportunity' }: {
  title?: string; children?: ReactNode; href?: string; label?: string;
}) {
  return <section className="ep-section ep-dark ep-closing"><div className="experience-wrap ep-split">
    <h2>{title}</h2><div>{children}<PageAction href={href}>{label}</PageAction><p className="ep-notice">{SUBMISSION_NOTICE}</p></div>
  </div></section>;
}

export function ProjectEvidence({ title = 'See the work on Nelson Drive.' }: { title?: string }) {
  return <section className="ep-section ep-evidence"><div className="experience-wrap ep-split">
    <figure><img src="/images/nelson/kitchen-after.webp" alt="Completed Nelson Drive kitchen with navy cabinetry and a quartz island" width={1600} height={996} loading="lazy" decoding="async" /><figcaption>Nelson Drive · Completed East Bay residential transformation</figcaption></figure>
    <div><h2>{title}</h2><p>Real project photographs, the recorded scope, and the available financial record.</p><PageAction href="/projects/nelson-dr" secondary>Explore the case study</PageAction></div>
  </div></section>;
}
