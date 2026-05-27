import React from 'react';
import { ArrowRight, ArrowUpRight } from 'lucide-react';

export function Editorial() {
  const THEME = {
    cream: '#F6EFE4',
    navy: '#0D1B2D',
    copper: '#C77A3A',
    charcoal: '#1E2328'
  };

  const FONTS = {
    cinzel: '"Cinzel", serif',
    cormorant: '"Cormorant Garamond", "Cormorant", serif',
    montserrat: '"Montserrat", sans-serif',
    inter: '"Inter", sans-serif'
  };

  return (
    <div style={{ backgroundColor: THEME.cream, color: THEME.navy, fontFamily: FONTS.cormorant }} className="min-h-[100dvh] antialiased font-light overflow-x-hidden selection:bg-[#0D1B2D] selection:text-[#F6EFE4]">
      
      {/* TOP HEADER */}
      <header className="px-8 py-6 flex justify-between items-end border-b" style={{ borderColor: `${THEME.navy}20` }}>
        <div style={{ fontFamily: FONTS.cinzel }} className="text-xl tracking-widest uppercase font-semibold">
          Pegasus DreamScapes
        </div>
        <div style={{ fontFamily: FONTS.montserrat }} className="text-xs uppercase tracking-[0.2em] font-medium">
          The Deal Architect
        </div>
      </header>

      {/* 1. HERO */}
      <section className="px-8 pt-32 pb-24 max-w-[1600px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-end">
          <div className="lg:col-span-8">
            <h1 className="text-[12vw] lg:text-[110px] leading-[0.9] tracking-tight mb-12">
              <span className="block">Complex property.</span>
              <span className="block italic text-opacity-90" style={{ color: THEME.copper }}>Structured opportunity.</span>
            </h1>
            <div className="flex gap-8 items-center mt-16">
              <a href="/submit" className="group flex items-center gap-4 border-b pb-2 transition-all" style={{ borderColor: THEME.copper }}>
                <span style={{ fontFamily: FONTS.montserrat }} className="text-xs font-semibold uppercase tracking-widest">Submit a Property</span>
                <ArrowRight size={14} style={{ color: THEME.copper }} className="group-hover:translate-x-1 transition-transform" />
              </a>
              <a href="/strategy-lab" className="group flex items-center gap-4 border-b pb-2 transition-all border-transparent hover:border-black/20">
                <span style={{ fontFamily: FONTS.montserrat }} className="text-xs uppercase tracking-widest text-black/60">See How It Works</span>
              </a>
            </div>
          </div>
          <div className="lg:col-span-4 pb-4">
            <p className="text-2xl leading-relaxed opacity-80 border-l px-6" style={{ borderColor: `${THEME.copper}50` }}>
              "Built on strategy. Governed by virtue. Executed with discipline."
            </p>
          </div>
        </div>

        <div className="mt-32 w-full aspect-[21/9] bg-[#EAE2D3] p-6 lg:p-12 overflow-hidden">
          {/* Placeholder for Hero Image - Magazine Cover Style */}
          <div className="w-full h-full relative group overflow-hidden">
            <img 
              src="/images/hero/luxury-home-1280.jpg" 
              alt="Editorial Cover" 
              className="w-full h-full object-cover object-center transition-transform duration-1000 group-hover:scale-105" 
            />
          </div>
        </div>
      </section>

      {/* 2. TRUST STRIP */}
      <section className="border-y py-4 px-8" style={{ borderColor: `${THEME.navy}20` }}>
        <p style={{ fontFamily: FONTS.montserrat }} className="text-[10px] sm:text-[11px] uppercase tracking-[0.25em] text-center opacity-70 flex flex-wrap justify-center gap-x-4 gap-y-2">
          <span>DRE #02333658</span>
          <span className="hidden sm:inline">·</span>
          <span>Keller Williams Realty East Bay</span>
          <span className="hidden sm:inline">·</span>
          <span>CA Two-Party Consent</span>
          <span className="hidden sm:inline">·</span>
          <span>NAR NRDS #159537628</span>
        </p>
      </section>

      {/* 3. AUDIENCE SORT (DEPARTMENTS) */}
      <section className="px-8 py-32 max-w-[1400px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-x-16 gap-y-16">
          <div className="col-span-1 lg:col-span-4 border-b pb-6 mb-8" style={{ borderColor: THEME.copper }}>
            <span style={{ fontFamily: FONTS.montserrat, color: THEME.copper }} className="text-xs uppercase tracking-[0.25em] font-semibold">
              Departments / 01
            </span>
            <h2 className="text-6xl mt-4 italic">Paths of Entry</h2>
          </div>
          
          {[
            { title: 'Sellers', desc: 'Complex, distressed, inherited, or complicated. Send it for a structural read.', link: '/submit' },
            { title: 'Buyers', desc: 'List or buy a home with Apollo through Keller Williams East Bay.', link: '/work-with-apollo' },
            { title: 'Capital Partners', desc: 'JV, co-GP, or capital conversations. Written agreement on every deal.', link: '/capital' },
            { title: 'Vendors', desc: 'GCs, subs, suppliers, and aligned operators. Join the vendor network.', link: '/vendor-network' },
          ].map((dept, i) => (
            <a href={dept.link} key={i} className="group block border-t pt-6" style={{ borderColor: `${THEME.navy}10` }}>
              <h3 style={{ fontFamily: FONTS.montserrat }} className="text-sm font-semibold uppercase tracking-widest mb-4 group-hover:text-[#C77A3A] transition-colors flex justify-between">
                {dept.title}
                <ArrowUpRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
              </h3>
              <p className="text-xl leading-relaxed opacity-80">{dept.desc}</p>
            </a>
          ))}
        </div>
      </section>

      {/* 4. NELSON DR PROOF */}
      <section className="px-8 py-32 bg-[#EAE2D3]">
        <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          <div className="lg:col-span-7">
            <div className="p-4 bg-[#F6EFE4] inline-block shadow-sm">
              <img src="/nelson/nelson-01.jpg" alt="Nelson Dr Project" className="w-full h-auto aspect-square object-cover" />
            </div>
          </div>
          <div className="lg:col-span-5">
            <span style={{ fontFamily: FONTS.montserrat, color: THEME.copper }} className="text-xs uppercase tracking-[0.25em] font-semibold mb-6 block">
              Feature / 02
            </span>
            <h2 className="text-6xl lg:text-8xl italic leading-none mb-8">Nelson Dr.</h2>
            <p className="text-2xl leading-relaxed mb-12 opacity-80">
              A flagship project demonstrating the execution of discipline. Every property gets a path. This one became a masterpiece.
            </p>
            <a href="/projects/nelson-dr" className="inline-flex items-center gap-3 border-b pb-1" style={{ borderColor: THEME.navy }}>
              <span style={{ fontFamily: FONTS.montserrat }} className="text-xs font-semibold uppercase tracking-widest">Read the Study</span>
              <ArrowRight size={14} />
            </a>
          </div>
        </div>
      </section>

      {/* 5. STRATEGY LAB TEASER & 6. WHAT WE DO (INDEX) */}
      <section className="px-8 py-32 max-w-[1400px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-24">
          <div className="lg:col-span-5 relative">
            {/* Hanging caption / drop cap area */}
            <span style={{ fontFamily: FONTS.montserrat, color: THEME.copper }} className="text-xs uppercase tracking-[0.25em] font-semibold mb-8 block">
              Toolkit / 03
            </span>
            <h2 className="text-6xl italic leading-tight mb-8">Strategy Lab</h2>
            <p className="text-3xl leading-relaxed mb-12">
              <span className="float-left text-7xl leading-none mr-4 mt-2" style={{ color: THEME.copper }}>M</span>
              ost Strategy Snapshots are reviewed within 5 business days. Bring us the situation, we'll design the route forward.
            </p>
            <a href="/strategy-lab" className="inline-flex items-center gap-3 border-b pb-1" style={{ borderColor: THEME.copper }}>
              <span style={{ fontFamily: FONTS.montserrat, color: THEME.copper }} className="text-xs font-semibold uppercase tracking-widest">Free Calculator</span>
              <ArrowRight size={14} style={{ color: THEME.copper }} />
            </a>
          </div>
          
          <div className="lg:col-span-7">
            <span style={{ fontFamily: FONTS.montserrat, color: THEME.copper }} className="text-xs uppercase tracking-[0.25em] font-semibold mb-8 block">
              Index / 04
            </span>
            <h2 className="text-6xl leading-tight mb-12">What We Do</h2>
            <ul className="flex flex-col">
              {[
                { title: 'Deal Architecture', href: '/deal-architecture' },
                { title: 'Development', href: '/development' },
                { title: 'Strategy Lab', href: '/strategy-lab' },
                { title: 'Work With Apollo', href: '/work-with-apollo' },
                { title: 'MarketFlow', href: '/marketflow', badge: 'Private beta · invite only' }
              ].map((item, i) => (
                <li key={i}>
                  <a href={item.href} className="group py-8 border-b flex items-center justify-between" style={{ borderColor: `${THEME.navy}20` }}>
                    <div className="flex items-baseline gap-6">
                      <span style={{ fontFamily: FONTS.montserrat }} className="text-xs text-black/40 w-6">0{i + 1}</span>
                      <span className="text-4xl group-hover:italic transition-all">{item.title}</span>
                      {item.badge && (
                        <span style={{ backgroundColor: THEME.navy, fontFamily: FONTS.montserrat }} className="px-3 py-1 text-[9px] uppercase tracking-widest text-[#F6EFE4] rounded-sm ml-4 align-middle">
                          {item.badge}
                        </span>
                      )}
                    </div>
                    <ArrowRight size={20} className="opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: THEME.copper }} />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* 7. OPERATOR BIO & 8. MANIFESTO */}
      <section className="px-8 py-32 border-t" style={{ borderColor: `${THEME.navy}20` }}>
        <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
          <div className="lg:col-span-4">
            <div className="p-4 bg-white shadow-sm rotate-1">
              <img src="/images/founder/apollo-768.jpg" alt="Apollo Duran" className="w-full h-auto grayscale contrast-125" />
            </div>
          </div>
          <div className="lg:col-span-8 lg:pl-16">
            <span style={{ fontFamily: FONTS.montserrat, color: THEME.copper }} className="text-xs uppercase tracking-[0.25em] font-semibold mb-8 block">
              Contributor / 05
            </span>
            <h2 className="text-6xl lg:text-8xl italic mb-12 leading-none tracking-tight">Apollo Duran</h2>
            <div className="text-3xl leading-relaxed opacity-90 max-w-2xl border-l-2 pl-8" style={{ borderColor: THEME.copper }}>
              "Built on strategy. Governed by virtue. Executed with discipline."
            </div>
            
            <div className="mt-24 max-w-xl">
              <span style={{ fontFamily: FONTS.montserrat, color: THEME.copper }} className="text-xs uppercase tracking-[0.25em] font-semibold mb-8 block">
                Manifesto / 06
              </span>
              <h3 className="text-4xl mb-6">The Dreamscaper Standard.</h3>
              <p className="text-2xl leading-relaxed mb-6 opacity-80">
                This is not a traditional brokerage. It is a highly analytical approach to real estate. We value precision over pressure.
              </p>
              <p style={{ fontFamily: FONTS.montserrat }} className="text-xs font-semibold uppercase tracking-[0.3em] mt-8 opacity-60">
                Dream it. Build it. Live it.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 9. FINAL CTA */}
      <section className="px-8 py-40 text-center" style={{ backgroundColor: THEME.navy, color: THEME.cream }}>
        <div className="max-w-4xl mx-auto">
          <h2 className="text-6xl lg:text-8xl italic leading-[1.1] tracking-tight mb-16">
            Bring us the property.<br />We'll help find the path.
          </h2>
          <a href="/submit" className="inline-flex items-center gap-4 bg-[#C77A3A] text-[#F6EFE4] px-10 py-5 transition-transform hover:-translate-y-1">
            <span style={{ fontFamily: FONTS.montserrat }} className="text-xs font-semibold uppercase tracking-[0.25em]">Submit a Property</span>
            <ArrowRight size={16} />
          </a>
        </div>
      </section>
      
    </div>
  );
}
