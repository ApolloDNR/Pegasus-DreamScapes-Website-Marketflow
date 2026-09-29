import { useState } from 'react';
import { Link } from 'wouter';
import { ArrowRight } from 'lucide-react';
import { HOME_PATHS } from './public-content';
import { GuideInvite } from './journey';
import { ThresholdPaths } from './wayfinding-art';
import './pathways.css';

export function HomePathways() {
  const [active, setActive] = useState(0);
  return <div className="experience-wrap home-pathways" data-preview={active}>
    <div className="home-pathways-intro">
      <h2 id="home-paths-title" data-peggy-summary="Choose the path that fits your situation. Each opens a different way to begin.">What brings you here?</h2>
      <ThresholdPaths active={active} />
      <GuideInvite compact choose />
    </div>
    <div className="experience-paths">{HOME_PATHS.map((path, index) => <Link key={path.href} href={path.href} className="experience-path" onPointerEnter={() => setActive(index)} onFocus={() => setActive(index)}>
      <span className="home-path-number" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
      <span className="home-path-copy"><strong>{path.label}</strong><span>{path.note}</span></span>
      <ArrowRight aria-hidden="true" size={22} />
    </Link>)}</div>
  </div>;
}
