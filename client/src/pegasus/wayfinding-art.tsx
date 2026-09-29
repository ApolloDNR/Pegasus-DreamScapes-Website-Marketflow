/** A directional UI emblem, shared by the guide and onward navigation. */
export function JourneyCompass({ size = 64 }: { size?: number }) {
  return <svg className="journey-compass" width={size} height={size} viewBox="0 0 80 80" fill="none" aria-hidden="true" focusable="false">
    <circle cx="40" cy="40" r="27" stroke="currentColor" strokeWidth=".8" />
    <circle cx="40" cy="40" r="22" stroke="currentColor" strokeWidth=".5" opacity=".45" />
    <path d="M40 4v10m0 52v10M4 40h10m52 0h10M18 18l6 6m32 32 6 6M18 62l6-6m32-32 6-6" stroke="currentColor" strokeWidth="1" />
    <path d="m40 11 6 23 23 6-23 6-6 23-6-23-23-6 23-6 6-23Z" stroke="currentColor" strokeWidth="1" />
    <path d="m40 11 6 23-6 6V11Zm29 29-23 6-6-6h29ZM40 69l-6-23 6-6v29ZM11 40l23-6 6 6H11Z" fill="currentColor" opacity=".7" />
    <circle cx="40" cy="40" r="3" fill="currentColor" />
  </svg>;
}

/** Local path preview only. The actual links remain the accessible navigation. */
export function ThresholdPaths({ active }: { active: number }) {
  return <div className="threshold-atlas" aria-hidden="true">
    <div className="threshold-numbers">{[0, 1, 2].map(index => <span key={index} data-active={active === index}>{String(index + 1).padStart(2, '0')}</span>)}</div>
    <img src="/images/journey/three-thresholds.webp" width={1200} height={400} alt="" loading="lazy" decoding="async" />
    <svg viewBox="0 0 360 108" fill="none" focusable="false">
      {['M64 4C64 54 180 42 180 96', 'M180 4V96', 'M296 4C296 54 180 42 180 96'].map((d, index) => <g key={index} data-active={active === index}>
        <path d={d} pathLength="1" /><circle cx={[64, 180, 296][index]} cy="4" r="3" />
      </g>)}
      <circle className="threshold-origin" cx="180" cy="96" r="6" />
    </svg>
  </div>;
}
