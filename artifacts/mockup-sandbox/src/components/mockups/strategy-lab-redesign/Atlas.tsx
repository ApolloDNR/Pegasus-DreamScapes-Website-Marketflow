import React, { useState } from 'react';
import { Pencil, ChevronRight, AlertTriangle, Info, MapPin } from 'lucide-react';
import './_group.css';

const property = {
  address: "1247 Aberdeen Way, Sacramento CA 95820",
  stats: "3 bed / 2.5 bath / 1,850 sqft",
  built: 1982,
  condition: "moderate rehab",
  occupancy: "vacant",
  asking: "$425,000",
  rehab: "$65,000",
  arv: "$610,000",
  rent: "$2,850",
};

const lanes = [
  { id: 'jv', name: 'JV Partnership', score: 78, angle: -45, distance: 200, active: true },
  { id: 'direct', name: 'Direct Acquisition', score: 64, angle: 15, distance: 240 },
  { id: 'creative', name: 'Creative Finance', score: 58, angle: 75, distance: 210 },
  { id: 'operator', name: 'Operator Referral', score: 55, angle: 135, distance: 250 },
  { id: 'wholesale', name: 'Wholesale Assignment', score: 42, angle: 195, distance: 190 },
  { id: 'mls', name: 'MLS Listing Referral', score: 30, angle: 245, distance: 260 },
  { id: 'capital', name: 'Capital Partner Match', score: 28, angle: -105, distance: 220 },
  { id: 'education', name: 'Strategy Education', score: 18, angle: -160, distance: 280 },
];

const risks = [
  { name: "ARV comp thinness", severity: "medium" },
  { name: "1982 systems", severity: "medium" },
  { name: "occupancy vacant ok", severity: "low" },
  { name: "financing speed if HML", severity: "medium" },
  { name: "exit liquidity Sacramento", severity: "low" }
];

export function Atlas() {
  const [activeLaneId, setActiveLaneId] = useState('jv');

  const activeLane = lanes.find(l => l.id === activeLaneId);

  return (
    <div className="min-h-[100dvh] flex flex-col relative overflow-hidden" style={{ backgroundColor: 'var(--pd-navy)', color: 'var(--pd-cream)' }}>
      {/* Top Input Strip */}
      <header className="absolute top-0 w-full z-20 px-6 py-3 flex items-center justify-between border-b border-white/10" style={{ backgroundColor: 'rgba(13, 27, 45, 0.85)', backdropFilter: 'blur(12px)' }}>
        <div className="flex items-center gap-4 text-sm" style={{ fontFamily: 'var(--pd-font-sans)' }}>
          <span className="opacity-60 uppercase tracking-widest text-[10px]" style={{ fontFamily: 'var(--pd-font-supporting)', color: 'var(--pd-copper-soft)' }}>Subject</span>
          <span className="font-medium">{property.address}</span>
          <span className="opacity-40">·</span>
          <span className="opacity-80">3bd/2.5ba/1,850sqft</span>
          <span className="opacity-40">·</span>
          <span className="opacity-80">$425k/$65k/$610k</span>
          <span className="opacity-40">·</span>
          <span className="opacity-80">vacant</span>
        </div>
        <button className="flex items-center gap-2 text-xs uppercase tracking-wider opacity-70 hover:opacity-100 transition-opacity" style={{ fontFamily: 'var(--pd-font-supporting)' }}>
          <Pencil size={14} /> Edit Inputs
        </button>
      </header>

      {/* Main Canvas - Constellation */}
      <main className="flex-1 relative flex items-center justify-center pt-16 pb-48">
        {/* SVG Lines */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          <defs>
            <radialGradient id="centerGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="var(--pd-copper)" stopOpacity="0.15" />
              <stop offset="100%" stopColor="var(--pd-navy)" stopOpacity="0" />
            </radialGradient>
          </defs>
          <circle cx="50%" cy="50%" r="300" fill="url(#centerGlow)" />
          
          <g transform="translate(50%, 50%)" style={{ transformOrigin: 'center' }}>
            {lanes.map(lane => {
              const rad = (lane.angle * Math.PI) / 180;
              const x = Math.cos(rad) * lane.distance;
              const y = Math.sin(rad) * lane.distance;
              const isStrong = lane.score > 50;
              const isActive = lane.id === activeLaneId;
              
              return (
                <line 
                  key={`line-${lane.id}`}
                  x1="0" y1="0" x2={x} y2={y}
                  stroke={isStrong ? 'var(--pd-copper)' : 'rgba(255,255,255,0.1)'}
                  strokeWidth={isActive ? 2 : (lane.score / 100) * 3}
                  strokeOpacity={isActive ? 0.8 : (isStrong ? 0.4 : 0.2)}
                  strokeDasharray={isActive ? "none" : "4 4"}
                />
              );
            })}
          </g>
        </svg>

        {/* Center Property Card */}
        <div className="absolute z-10 w-48 h-48 rounded-full border border-opacity-30 flex flex-col items-center justify-center p-6 text-center shadow-2xl backdrop-blur-md" 
             style={{ 
               borderColor: 'var(--pd-copper)', 
               backgroundColor: 'var(--pd-charcoal)',
               boxShadow: '0 0 60px rgba(199, 122, 58, 0.1)'
             }}>
          <div className="w-12 h-12 rounded-full mb-3 flex items-center justify-center border border-white/10" style={{ backgroundColor: 'var(--pd-navy)' }}>
            <MapPin size={20} style={{ color: 'var(--pd-copper)' }} />
          </div>
          <h2 className="text-xl leading-tight mb-1" style={{ fontFamily: 'var(--pd-font-serif)' }}>Sacramento</h2>
          <div className="text-[10px] uppercase tracking-widest opacity-60" style={{ fontFamily: 'var(--pd-font-supporting)' }}>Target Asset</div>
        </div>

        {/* Nodes */}
        <div className="absolute inset-0 w-full h-full pointer-events-none">
          <div className="absolute top-1/2 left-1/2 w-0 h-0">
            {lanes.map(lane => {
              const rad = (lane.angle * Math.PI) / 180;
              const x = Math.cos(rad) * lane.distance;
              const y = Math.sin(rad) * lane.distance;
              const size = 12 + (lane.score / 100) * 32;
              const isActive = lane.id === activeLaneId;
              const isStrong = lane.score > 50;

              return (
                <div 
                  key={`node-${lane.id}`}
                  className="absolute pointer-events-auto cursor-pointer transition-all duration-500 ease-out flex flex-col items-center"
                  style={{ 
                    transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`,
                    zIndex: isActive ? 30 : 10
                  }}
                  onClick={() => setActiveLaneId(lane.id)}
                >
                  <div 
                    className="rounded-full flex items-center justify-center transition-all duration-300"
                    style={{ 
                      width: size, 
                      height: size,
                      backgroundColor: isActive ? 'var(--pd-copper)' : (isStrong ? 'var(--pd-charcoal)' : 'var(--pd-navy)'),
                      border: `1px solid ${isActive ? 'transparent' : (isStrong ? 'var(--pd-copper-soft)' : 'rgba(255,255,255,0.2)')}`,
                      boxShadow: isActive ? '0 0 30px rgba(199, 122, 58, 0.4)' : 'none'
                    }}
                  >
                    <span className="text-[10px] font-mono opacity-80" style={{ color: isActive ? 'var(--pd-navy)' : 'var(--pd-cream)' }}>
                      {lane.score}
                    </span>
                  </div>
                  
                  <div className={`mt-3 whitespace-nowrap text-center transition-opacity duration-300 ${isActive ? 'opacity-100' : 'opacity-60'}`}>
                    <div className="text-[10px] uppercase tracking-widest" style={{ fontFamily: 'var(--pd-font-supporting)', color: isActive ? 'var(--pd-copper-light)' : 'inherit' }}>
                      {lane.name}
                    </div>
                  </div>

                  {/* Active Pop-out Card */}
                  {isActive && lane.id === 'jv' && (
                    <div className="absolute top-1/2 left-full ml-12 -translate-y-1/2 w-80 rounded-sm border border-white/10 p-6 backdrop-blur-xl pointer-events-auto"
                         style={{ backgroundColor: 'rgba(30, 35, 40, 0.95)', borderLeft: '3px solid var(--pd-copper)' }}>
                      
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <div className="text-[10px] uppercase tracking-widest opacity-60 mb-1" style={{ fontFamily: 'var(--pd-font-supporting)' }}>Recommended Path</div>
                          <h3 className="text-xl" style={{ fontFamily: 'var(--pd-font-serif)', color: 'var(--pd-copper-light)' }}>{lane.name}</h3>
                        </div>
                        <div className="text-2xl font-light" style={{ fontFamily: 'var(--pd-font-serif)', color: 'var(--pd-copper)' }}>
                          {lane.score}%
                        </div>
                      </div>

                      <div className="text-lg leading-tight mb-4" style={{ fontFamily: 'var(--pd-font-serif)' }}>
                        ARV gap supports equity split. Operator capacity needed.
                      </div>

                      <div className="bg-black/30 border border-white/5 rounded px-4 py-3 mb-6">
                        <div className="text-[10px] uppercase tracking-widest opacity-60 mb-1" style={{ fontFamily: 'var(--pd-font-supporting)' }}>Primary Outcome</div>
                        <div className="font-mono text-sm" style={{ color: 'var(--pd-copper-soft)' }}>~ $48k profit / 22% IRR</div>
                      </div>

                      <div className="space-y-4 mb-6">
                        <div className="text-[10px] uppercase tracking-widest opacity-60 border-b border-white/10 pb-1" style={{ fontFamily: 'var(--pd-font-supporting)' }}>Risk Register</div>
                        <ul className="space-y-2">
                          {risks.slice(0, 3).map((risk, i) => (
                            <li key={i} className="flex items-center justify-between text-xs" style={{ fontFamily: 'var(--pd-font-sans)' }}>
                              <span className="opacity-80">{risk.name}</span>
                              <span className="flex items-center gap-1">
                                <span className={`w-1.5 h-1.5 rounded-full ${risk.severity === 'medium' ? 'bg-yellow-500' : 'bg-green-500'}`}></span>
                                <span className="text-[9px] uppercase tracking-wider opacity-50">{risk.severity}</span>
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="text-sm opacity-80 leading-relaxed border-t border-white/10 pt-4" style={{ fontFamily: 'var(--pd-font-sans)' }}>
                        ARV–acquisition spread is genuine but operator capacity is the bottleneck. Stress-tested at 10% ARV haircut the JV still clears.
                        <div className="mt-3 font-medium flex items-center gap-2" style={{ color: 'var(--pd-copper-light)' }}>
                          <ChevronRight size={14} /> Package for pre-vetted operators
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </main>

      {/* Bottom Horizontal Scroll */}
      <footer className="absolute bottom-0 w-full z-20 border-t border-white/10 bg-black/40 backdrop-blur-md">
        <div className="px-6 py-4">
          <div className="text-[10px] uppercase tracking-widest opacity-50 mb-3" style={{ fontFamily: 'var(--pd-font-supporting)' }}>Full Spectrum Analysis</div>
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x" style={{ scrollbarWidth: 'none' }}>
            {lanes.sort((a, b) => b.score - a.score).map(lane => (
              <div 
                key={`card-${lane.id}`}
                className={`flex-none w-64 p-4 rounded-sm border cursor-pointer transition-all snap-start ${lane.id === activeLaneId ? 'bg-white/5 border-opacity-50' : 'bg-transparent border-opacity-10 hover:bg-white/5'}`}
                style={{ borderColor: lane.id === activeLaneId ? 'var(--pd-copper)' : 'white' }}
                onClick={() => setActiveLaneId(lane.id)}
              >
                <div className="flex justify-between items-center mb-2">
                  <div className="text-[10px] uppercase tracking-widest" style={{ fontFamily: 'var(--pd-font-supporting)', color: lane.id === activeLaneId ? 'var(--pd-copper-light)' : 'inherit' }}>
                    {lane.name}
                  </div>
                  <div className="text-sm font-mono opacity-80">{lane.score}</div>
                </div>
                <div className="text-xs opacity-60 line-clamp-2" style={{ fontFamily: 'var(--pd-font-sans)' }}>
                  {lane.score > 70 ? "Strong structural fit based on current metrics." : 
                   lane.score > 50 ? "Viable alternative, moderate friction identified." : 
                   "Low probability path under current assumptions."}
                </div>
              </div>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Atlas;
