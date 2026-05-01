import logoImage from "@assets/image_1765405939117.png";

interface PegasusMarkProps {
  className?: string;
  size?: number;
}

/** Primary Pegasus brand mark — uses the locked logo asset. */
export function PegasusMark({ className = "", size = 48 }: PegasusMarkProps) {
  return (
    <img
      src={logoImage}
      alt="Pegasus Dreamscapes"
      className={className}
      style={{ height: size, width: "auto" }}
      draggable={false}
    />
  );
}

/** Abstract wing/crest watermark — an SVG used for decorative
 *  background lockups so we never duplicate or alter the real logo. */
export function PegasusWatermark({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 600 360"
      className={className}
      aria-hidden="true"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="pw-stroke" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="hsl(28 49% 48%)" stopOpacity="0.55" />
          <stop offset="100%" stopColor="hsl(28 49% 48%)" stopOpacity="0" />
        </linearGradient>
      </defs>
      {/* Stylized wing arcs */}
      <g stroke="url(#pw-stroke)" strokeWidth="1.25" strokeLinecap="round">
        <path d="M40 240 C 140 180, 220 180, 300 230" />
        <path d="M60 270 C 160 210, 240 210, 320 260" />
        <path d="M80 300 C 180 240, 260 240, 340 290" />
        <path d="M100 330 C 200 270, 280 270, 360 320" />
      </g>
      {/* Roof apex */}
      <path
        d="M260 230 L320 170 L380 230"
        stroke="hsl(28 49% 48%)"
        strokeOpacity="0.45"
        strokeWidth="1.25"
        strokeLinejoin="round"
      />
      {/* Diamond pip */}
      <rect
        x="316"
        y="200"
        width="8"
        height="8"
        transform="rotate(45 320 204)"
        fill="hsl(28 49% 48%)"
        fillOpacity="0.6"
      />
    </svg>
  );
}
