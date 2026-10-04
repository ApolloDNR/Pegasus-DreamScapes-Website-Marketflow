import { Link, useLocation, useSearch } from 'wouter';
import { ArrowRight, Check, ChevronDown } from 'lucide-react';
import { NELSON_PAIRS } from './nelson-gallery-data';
import { NELSON_STORY, nelsonStory, nelsonStoryHref } from './nelson-story';
import './home-project.css';

/** Original photographs, chosen by the visitor. No timer, generated evidence, or inferred execution credit. */
export function HomeProject() {
  const search = useSearch();
  const [, setLocation] = useLocation();
  const chapter = nelsonStory(new URLSearchParams(search).get('story'));
  const pair = NELSON_PAIRS[chapter.pairIndex];
  const selectChapter = (id: string) => {
    const params = new URLSearchParams(search);
    params.set('story', id);
    // Local exploration replaces the current entry, so Back never walks through a carousel.
    setLocation(`/?${params.toString()}#home-proof-title`, { replace: true });
  };

  return <section className="experience-evidence experience-section home-project" data-hv="proof" aria-labelledby="home-proof-title">
    <div className="experience-wrap">
      <div className="home-project-heading">
        <h2 id="home-proof-title" data-peggy-summary="Choose a room to compare its original photographs and consider the questions behind a renovation. Continue to that room in the Nelson Drive case study.">Nelson Drive,<br /> before and after.</h2>
        <p>Three spaces. Three ways to look at a renovation. Follow the visible changes, then take a closer look at the room that interests you.</p>
      </div>
      <div className="home-project-note-controls" role="group" aria-label="Choose a renovation chapter">
        {NELSON_STORY.map((item, index) => <button key={item.id} type="button" aria-pressed={chapter.id === item.id} aria-controls="home-project-story" onClick={() => selectChapter(item.id)}>
          <span className="home-project-note-number" aria-hidden="true">0{index + 1}</span><span>{item.label}</span>
          {chapter.id === item.id ? <Check size={16} aria-hidden="true" /> : <ChevronDown size={16} aria-hidden="true" />}
        </button>)}
      </div>
      <div id="home-project-story">
        <div className="home-project-photographs">
          <figure className="home-project-before"><div className="home-project-photo-frame">
            <img src={pair.before} alt={pair.beforeAlt} width={1600} height={chapter.beforeHeight} loading="lazy" decoding="async" />
          </div><figcaption>{chapter.beforeCaption}</figcaption></figure>
          <figure className="home-project-after"><div className="home-project-photo-frame">
            <img src={pair.after} alt={pair.afterAlt} width={1600} height={chapter.afterHeight} loading="lazy" decoding="async" />
          </div><figcaption>{chapter.afterCaption}</figcaption></figure>
        </div>
        <div className="home-project-story-notes" role="status" aria-live="polite" aria-atomic="true">
          <div><p className="home-project-story-label">What changed</p><p>{chapter.changed}</p></div>
          <div><p className="home-project-story-label">What to consider</p><p>{chapter.consider}</p></div>
        </div>
      </div>
      <div className="experience-proof-note home-project-onward">
        <p>Original photographs, from different viewpoints. Explore the full case study for the available project and financial record. The available record does not verify Pegasus’s or Apollo’s project role.</p>
        <Link href={nelsonStoryHref(chapter.id)} className="experience-link">{chapter.linkLabel}<ArrowRight aria-hidden="true" size={17} /></Link>
      </div>
    </div>
  </section>;
}
