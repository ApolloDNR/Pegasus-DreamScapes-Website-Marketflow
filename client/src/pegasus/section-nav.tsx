export function SectionNav({ items }: { items: ReadonlyArray<readonly [string, string]> }) {
  return <nav className="pg-section-nav" aria-label="On this page"><div className="hv-wrap">
    <span>On this page</span>
    {items.map(([id, label], index) => <a key={id} href={`#${id}`}><small aria-hidden="true">0{index + 1}</small>{label}</a>)}
  </div></nav>;
}
