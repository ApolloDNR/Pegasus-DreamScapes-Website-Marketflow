/** A schematic, not a drawing or assessment of the visitor's property. */
export function PropertySketch({ focus = 'scope' }: { focus?: 'scope' | 'access' | 'site' }) {
  return <svg className="property-sketch" viewBox="0 0 240 152" fill="none" role="img" aria-label={`Illustrative property diagram: ${focus === 'scope' ? 'building and improvement scope' : focus === 'access' ? 'entry and property access' : 'site and boundary questions'}`}>
    <g stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" strokeLinecap="round">
      <path className={focus === 'site' ? 'is-emphasized' : ''} d="M12 100 97 54 228 107 140 150Z" strokeDasharray="4 5" />
      <path d="m40 81 78 36 75-40-78-33Z" className="property-sketch-ground" />
      <path d="M49 76v29l70 33V99M119 138l66-36V65" />
      <path className={focus === 'scope' ? 'is-emphasized' : ''} d="m37 72 36-48 83 32 41 23-37-49-87-6M73 24l46 75 78-20M37 72l82 27" />
      <path d="M61 83v18l18 8V91ZM90 96v18l17 8v-18ZM155 89v18l18-10V79Z" />
      <path className={focus === 'access' ? 'is-emphasized' : ''} d="m130 132 15-8v-27l-15 8ZM136 129l14 6 14-8-13-6M150 135l12 6 15-9-13-5" />
      <path d="m206 63 9-5m-13 13 16-9M19 122l10 4m-6-13 11 5" opacity=".4" />
      <circle className="property-sketch-marker" cx={focus === 'scope' ? 118 : focus === 'access' ? 146 : 210} cy={focus === 'scope' ? 54 : focus === 'access' ? 123 : 117} r="5" />
    </g>
  </svg>;
}
