import { T, FONT_LINK, STRATEGIES_14 } from "./_tokens";
import { BrandBar, Kicker } from "./_chrome";

export default function Loading() {
  return (
    <div style={{ backgroundColor: T.midnight, color: T.cream, fontFamily: T.sans, minHeight: "100vh" }}>
      {FONT_LINK}
      <BrandBar dark />

      <div className="px-10 pt-24 pb-16 flex flex-col items-center text-center">
        <Kicker dark>Strategy Lab · Running</Kicker>

        {/* Pulse ring */}
        <div className="relative mt-10 mb-10" style={{ width: 180, height: 180 }}>
          <div
            className="absolute inset-0 rounded-full"
            style={{ border: `1px solid ${T.copper}`, opacity: 0.35 }}
          />
          <div
            className="absolute"
            style={{
              inset: 18,
              borderRadius: "9999px",
              border: `1px solid ${T.copper}`,
              opacity: 0.6,
            }}
          />
          <div
            className="absolute"
            style={{
              inset: 40,
              borderRadius: "9999px",
              border: `2px solid ${T.copper}`,
            }}
          />
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{ fontFamily: T.serif, fontSize: 48, fontWeight: 600, color: T.copper }}
          >
            14
          </div>
        </div>

        <h1
          className="text-[40px] leading-tight max-w-3xl"
          style={{ fontFamily: T.serif, fontWeight: 500, letterSpacing: "-0.015em" }}
        >
          Pegasus is running this through fourteen strategic paths…
        </h1>
        <p className="mt-5 max-w-xl text-[15px] leading-relaxed" style={{ color: T.mutedDark }}>
          Pulling public records, scoring each path on fit, stressing the numbers, and surfacing the
          two or three risks that could flip the verdict.
        </p>

        {/* Stage progress */}
        <div className="mt-10 w-full max-w-3xl">
          <div
            className="h-px w-full"
            style={{ backgroundColor: "rgba(212,207,196,0.18)" }}
          >
            <div
              className="h-px"
              style={{ backgroundColor: T.copper, width: "62%" }}
            />
          </div>
          <div className="mt-3 flex items-center justify-between text-[10px] uppercase tracking-[0.22em] font-semibold" style={{ color: T.mutedDark }}>
            <span>Pulling parcel + permit data</span>
            <span style={{ color: T.copper }}>Scoring strategies · 9 of 14</span>
            <span>Risk pass</span>
          </div>
        </div>

        {/* Ticker of strategies */}
        <div className="mt-12 w-full max-w-4xl">
          <Kicker dark>Paths being scored</Kicker>
          <div className="mt-4 grid grid-cols-2 gap-x-10 gap-y-2">
            {STRATEGIES_14.map((s, i) => {
              const done = i < 9;
              const active = i === 9;
              return (
                <div
                  key={s.name}
                  className="flex items-center justify-between py-1.5 border-b text-[12px]"
                  style={{
                    borderColor: "rgba(212,207,196,0.1)",
                    color: done ? T.cream : active ? T.copper : T.mutedDark,
                    fontWeight: active ? 600 : done ? 500 : 400,
                  }}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className="inline-block w-1.5 h-1.5 rounded-full"
                      style={{
                        backgroundColor: done ? T.copper : active ? T.copper : "rgba(212,207,196,0.25)",
                        boxShadow: active ? `0 0 10px ${T.copper}` : undefined,
                      }}
                    />
                    {s.name}
                  </div>
                  <span className="text-[10px] uppercase tracking-[0.22em] font-semibold">
                    {done ? "Scored" : active ? "Scoring…" : "Queued"}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-10 text-[11px]" style={{ color: T.mutedDark }}>
          Most analyses finish in 12–18 seconds. Hang tight.
        </div>
      </div>
    </div>
  );
}
