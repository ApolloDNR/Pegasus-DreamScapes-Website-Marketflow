interface HeroPictureProps {
  alt: string;
  className?: string;
  priority?: boolean;
}

const LQIP =
  "data:image/webp;base64,UklGRmAAAABXRUJQVlA4IFQAAADQAwCdASoYAA0APu1oqk6ppiQiMAgBMB2JZgCdACHRwtmYIks8VwAA/TKBGYJ8J4/uyKxs6JbOrOxveFFTSvViAB32w+buWsvR2zpPRId6UBYAAAA=";

export function HeroPicture({ alt, className = "", priority = false }: HeroPictureProps) {
  const base = "/images/hero/luxury-home";
  return (
    <picture>
      <source
        type="image/avif"
        srcSet={`${base}-768.avif 768w, ${base}-1280.avif 1280w, ${base}-1920.avif 1920w`}
        sizes="100vw"
      />
      <source
        type="image/webp"
        srcSet={`${base}-768.webp 768w, ${base}-1280.webp 1280w, ${base}-1920.webp 1920w`}
        sizes="100vw"
      />
      <img
        src={`${base}-1280.jpg`}
        srcSet={`${base}-768.jpg 768w, ${base}-1280.jpg 1280w, ${base}-1920.jpg 1920w`}
        sizes="100vw"
        alt={alt}
        width={1920}
        height={1047}
        loading={priority ? "eager" : "lazy"}
        decoding={priority ? "sync" : "async"}
        {...({ fetchpriority: priority ? "high" : "auto" } as Record<string, string>)}
        style={{
          backgroundImage: `url(${LQIP})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
        className={className}
      />
    </picture>
  );
}
