import { useRef, useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { ArrowLeft, ArrowRight, Expand, X } from 'lucide-react';
import './project-gallery.css';

type Pair = { title: string; before: string; after: string; beforeAlt: string; afterAlt: string; note: string; tag?: string };

export function ProjectGallery({ pairs, finishes }: { pairs: Pair[]; finishes: Array<[string, string]> }) {
  const [active, setActive] = useState<number | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const photos = [
    ...pairs.flatMap((pair) => [
      { src: pair.before, alt: pair.beforeAlt, title: `${pair.title} · Before`, note: pair.tag ?? 'Documented before condition' },
      { src: pair.after, alt: pair.afterAlt, title: `${pair.title} · After`, note: pair.note },
    ]),
    ...finishes.map(([src, alt]) => ({ src, alt, title: 'The finishing details', note: alt })),
  ];
  const photo = active === null ? null : photos[active];
  const move = (direction: number) => setActive((current) => ((current ?? 0) + direction + photos.length) % photos.length);
  const open = (event: React.MouseEvent<HTMLButtonElement>, index: number) => {
    triggerRef.current = event.currentTarget;
    setActive(index);
  };

  return <Dialog.Root open={active !== null} onOpenChange={(isOpen) => { if (!isOpen) setActive(null); }}>
    <p className="ow-gallery-hint"><Expand aria-hidden="true" />Select a photograph to view it in full.</p>
    <div className="ow-pairs">
      {pairs.map((pair, index) => <figure key={pair.title} className="ow-pair">
        <div className="ow-pair-heading"><span>0{index + 1}</span><h3 className="font-serif-display">{pair.title}</h3></div>
        <div className="ow-pair-media">
          <button type="button" className="ow-shot" onClick={(event) => open(event, index * 2)} aria-label={`Enlarge ${pair.title.toLowerCase()}, before`}>
            <img src={pair.before} alt={pair.beforeAlt} loading="lazy" />
            <i>Before{pair.tag ? ` · ${pair.tag}` : ''}</i><Expand className="ow-expand" aria-hidden="true" />
          </button>
          <button type="button" className="ow-shot ow-shot-after" onClick={(event) => open(event, index * 2 + 1)} aria-label={`Enlarge ${pair.title.toLowerCase()}, after`}>
            <img src={pair.after} alt={pair.afterAlt} loading="lazy" />
            <i>After</i><Expand className="ow-expand" aria-hidden="true" />
          </button>
        </div>
        <figcaption><span>{pair.note}</span></figcaption>
      </figure>)}
    </div>
    <div className="ow-strip">
      {finishes.map(([src, alt], index) => <button type="button" key={src} onClick={(event) => open(event, pairs.length * 2 + index)} aria-label={`Enlarge: ${alt}`}><img src={src} alt={alt} loading="lazy" /><Expand className="ow-expand" aria-hidden="true" /></button>)}
    </div>
    <Dialog.Portal>
      <Dialog.Overlay className="ow-gallery-overlay" />
      <Dialog.Content className="ow-gallery-viewer" onCloseAutoFocus={(event) => { event.preventDefault(); triggerRef.current?.focus(); }}
        onKeyDown={(event) => { if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') { event.preventDefault(); move(event.key === 'ArrowRight' ? 1 : -1); } }}>
        <div className="ow-viewer-header">
          <div><span>Nelson Drive · Project photographs</span><Dialog.Title>{photo?.title}</Dialog.Title></div>
          <Dialog.Close aria-label="Close photo viewer"><X aria-hidden="true" /></Dialog.Close>
        </div>
        {photo && <img className="ow-viewer-image" src={photo.src} alt={photo.alt} />}
        <div className="ow-viewer-footer">
          <Dialog.Description>{photo?.note}</Dialog.Description>
          <div className="ow-viewer-controls">
            <button type="button" onClick={() => move(-1)} aria-label="Previous photograph"><ArrowLeft aria-hidden="true" /></button>
            <span aria-live="polite">{(active ?? 0) + 1} / {photos.length}</span>
            <button type="button" onClick={() => move(1)} aria-label="Next photograph"><ArrowRight aria-hidden="true" /></button>
          </div>
        </div>
      </Dialog.Content>
    </Dialog.Portal>
  </Dialog.Root>;
}
