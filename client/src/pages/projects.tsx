import { useMemo } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useSEO } from "@/hooks/use-seo";
import { ArrowRight, MapPin } from "lucide-react";
import type { Project } from "@shared/schema";
import { NELSON_FACTS, NELSON_PUBLIC_DESCRIPTION, NELSON_PUBLIC_HIGHLIGHTS, NELSON_COST_DISCLOSURE } from "@shared/nelson-facts";
import "@/pegasus/editorial-pages.css";

function isNelsonProject(project: Project): boolean {
  return project.slug === NELSON_FACTS.slug;
}

function toPublicNelsonProject(project: Project): Project {
  return {
    ...project,
    slug: NELSON_FACTS.slug,
    name: `${NELSON_FACTS.name} · ${NELSON_FACTS.areaLabel}`,
    address: NELSON_FACTS.address,
    city: NELSON_FACTS.areaLabel,
    state: NELSON_FACTS.state,
    strategy: "fix-flip",
    status: "completed",
    purchasePrice: NELSON_FACTS.acquired,
    rehabCost: NELSON_FACTS.improvementBudget,
    arv: null,
    salePrice: NELSON_FACTS.salePrice,
    profit: null,
    roi: null,
    holdTime: null,
    description: NELSON_PUBLIC_DESCRIPTION,
    beforeImages: ["/images/nelson/nelson-before-exterior-front-1280.jpg"],
    afterImages: ["/images/nelson/nelson-hero-1280.jpg"],
    highlights: [...NELSON_PUBLIC_HIGHLIGHTS],
  };
}

export default function Projects() {
  useSEO({
    title: "Projects",
    description: "One published East Bay residential case study with approximate acquisition, improvement-budget, and sale figures plus clear cost limits.",
    image: "/og/projects.png",
  });
  const { data: projects } = useQuery<Project[]>({ queryKey: ["/api/projects"] });
  // The documented case remains available while the optional project feed loads.
  const publicProjects = useMemo(
    () => (projects ?? []).filter(isNelsonProject).map(toPublicNelsonProject),
    [projects],
  );
  const nelson = publicProjects[0];

  return (
    <div className="pg-editorial projects-editorial min-h-screen">
      <section className="editorial-hero projects-hero">
        <img src="/images/nelson/nelson-hero-1280.jpg" alt="The completed Nelson Drive residence in Richmond, California" width="1280" height="853" fetchPriority="high" className="editorial-hero-image" />
        <div className="editorial-hero-shade" />
        <div className="editorial-wrap relative">
          <p className="editorial-kicker">Case Studies · Documented Work</p>
          <h1 data-testid="text-projects-hero">Published work,<br /><em>fact by fact.</em></h1>
          <p className="editorial-hero-lead">Nelson Drive is the one case study currently ready for public review. Additional work will appear only when its facts, permissions, and limitations are documented.</p>
          <a className="editorial-hero-link" href="#published-work">Explore the case study <ArrowRight size={17} aria-hidden="true" /></a>
        </div>
      </section>

      <section id="published-work" className="editorial-section">
        <div className="editorial-wrap">
          <div className="project-record-heading">
            <div><p className="editorial-kicker">The record</p><h2>1 documented case study</h2></div>
            <span className="project-status"><span>Completed</span> · {NELSON_FACTS.settled}</span>
          </div>
          <article className="project-feature" data-testid="card-project-0">
            <figure>
              <img src="/images/nelson/nelson-kitchen-1280.jpg" alt="Finished Nelson Drive kitchen, with navy cabinetry and a white island" width="1280" height="853" loading="lazy" />
              <figcaption>Nelson Drive · Finished interior</figcaption>
            </figure>
            <div className="project-feature-copy">
              <p className="editorial-kicker">Residential transformation · Fix &amp; Flip</p>
              <h3>Nelson Drive</h3>
              <p className="project-location"><MapPin size={16} aria-hidden="true" /> {NELSON_FACTS.areaLabel}, CA</p>
              <p>{nelson?.description ?? NELSON_PUBLIC_DESCRIPTION}</p>
              <dl className="project-facts">
                <div><dt>Acquisition</dt><dd>≈ $600K</dd></div>
                <div><dt>Improvement budget</dt><dd>≈ $105K</dd></div>
                <div><dt>Sale</dt><dd>≈ $840K</dd></div>
              </dl>
              <Link href="/projects/nelson-dr" className="editorial-button">View case study <ArrowRight size={16} aria-hidden="true" /></Link>
            </div>
          </article>
          <div className="project-record-note">
            <p>{NELSON_COST_DISCLOSURE}</p>
            <p><strong>Nelson Drive is available now.</strong> Additional projects will be added when their records are ready for public review.</p>
          </div>
        </div>
      </section>

      <section className="editorial-section editorial-next">
        <div className="editorial-wrap editorial-next-inner">
          <div><p className="editorial-kicker">A possible next chapter</p><h2>Have one to add<br className="hidden sm:block" /> to the record?</h2><p>Share the property and the situation for possible review.</p></div>
          <div className="editorial-actions">
            <Link href="/bring-an-opportunity" className="editorial-button" data-testid="link-projects-strategy-review">Start a Strategy Review <ArrowRight size={16} aria-hidden="true" /></Link>
            <Link href="/capital-partners" className="editorial-text-link">Explore capital partnerships <ArrowRight size={16} aria-hidden="true" /></Link>
          </div>
        </div>
      </section>
    </div>
  );
}
