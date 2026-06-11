// shared/faq-data.ts
// Single source of truth for the /faq Q&A content. Consumed by the client FAQ
// page (client/src/pages/faq.tsx, which maps an icon onto each section) and by
// the server-side FAQPage JSON-LD builder (shared/structured-data.ts) so the
// structured data never drifts from what the page actually shows.

export interface FaqItem {
  q: string;
  a: string;
}

export interface FaqSection {
  eyebrow: string;
  items: FaqItem[];
}

export const FAQ_SECTIONS: FaqSection[] = [
  {
    eyebrow: "Submitting a Property",
    items: [
      {
        q: "What kinds of properties do you review?",
        a: "Any situation where the path forward isn't obvious: deferred maintenance, distressed title, contested ownership, development potential, or creative structure. SFR through small multifamily in the East Bay and surrounding areas.",
      },
      {
        q: "Is there a fee to submit?",
        a: "No. Submissions are free. Apollo reviews every serious intake personally.",
      },
      {
        q: "How long does a review take?",
        a: "Most Strategy Snapshots are reviewed within 5 business days. If we need more information, we reach out directly. No auto-emails.",
      },
      {
        q: "Do you guarantee an offer?",
        a: "No. Every property gets a path, but not every property gets an offer. If Pegasus isn't the right fit, you'll get an honest read and, where appropriate, a referral to someone who is.",
      },
    ],
  },
  {
    eyebrow: "Working with Pegasus",
    items: [
      {
        q: "What makes Pegasus different from a regular real estate investor?",
        a: "Strategy first. We review the structural situation before we decide on a lane: acquisition, JV, creative finance, referral, or something else entirely. We don't chase properties. We design paths.",
      },
      {
        q: "Is Apollo licensed?",
        a: "Yes. Apollo Duran, DRE #02333658, operates under Keller Williams East Bay. Every transaction is under fiduciary standard.",
      },
      {
        q: "Can you help if I just want to list my property?",
        a: "Yes. If a traditional sale is the right path, we'll route you there through our KW East Bay relationship or an appropriate referral.",
      },
      {
        q: "What is the Strategy Lab?",
        a: "A free property analysis tool that runs your inputs against 14 real estate strategies (Fix & Flip, BRRRR, ADU, Wholesale, etc.) and produces a preliminary verdict. It's a starting point, not a final answer. Apollo reviews the situation before any decisions are made.",
      },
      {
        q: "What's the difference between a Strategy Snapshot and a Deal Blueprint?",
        a: "Two depths of the same Strategy Lab tool. The Strategy Snapshot is preliminary and informational: a free preliminary read with no account required (lane fit, verdict, headline math), or a fuller saved snapshot with a Pegasus account (scenarios, risk register, sensitivity, sharable). The Deal Blueprint is a human-prepared memo for a specific property, commissioned by engagement after a review: underwriting, structure, risk register, and outreach scripts, written by the Pegasus team. Most submissions don't need a Blueprint. We tell you which fits before you commit.",
      },
    ],
  },
  {
    eyebrow: "MarketFlow & Network",
    items: [
      {
        q: "What is MarketFlow?",
        a: "The private deal network where reviewed opportunities, trusted operators, buyers, and capital relationships connect. It's not a public marketplace. Access is by introduction.",
      },
      {
        q: "How do I get access to MarketFlow?",
        a: "Request access at /marketflow/access. Tell us who introduced you and what role you'd fill. We verify every introduction before sending an invite.",
      },
      {
        q: "I don't have an introduction. Can I still get in?",
        a: "Reach out through the contact form. If there's a fit and the timing is right, we'll figure it out.",
      },
    ],
  },
  {
    eyebrow: "Buyboxes",
    items: [
      {
        q: "What are the Pegasus Buyboxes?",
        a: "A free interest list. You tell us the kind of deal you want to see (ADU upside, value-add, repositioning) and we contact you only when a reviewed property matches that profile. No fee. No subscription. No public marketplace. Every match is reviewed by Pegasus before anyone is contacted.",
      },
      {
        q: "If I sign up for a Buybox, am I committing to buy?",
        a: "No. Subscribing to a Buybox profile means you'll be notified when we have a reviewed property that matches. There is no obligation to buy, no auto-send, and you can unsubscribe at any time.",
      },
    ],
  },
];
