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
        a: "No. Submissions are free. Every serious intake gets reviewed — not an auto-reply.",
      },
      {
        q: "How long does a review take?",
        a: "A free property review comes back within 48 hours. If we need more to give you a straight answer, we reach out directly.",
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
        a: "Yes. Apollo Duran, California DRE #02333658, provides licensed real estate services through Keller Williams Realty East Bay — each office independently owned and operated. Licensed work is held to a fiduciary standard.",
      },
      {
        q: "Can you help if I just want to list my property?",
        a: "Yes. If a traditional sale is the right path, we'll route you there through our KW East Bay relationship or an appropriate referral.",
      },
      {
        q: "What is the Strategy Lab?",
        a: "A free tool you run yourself. Enter a property's basics and it sorts the main investment lanes — fix and flip, BRRRR, rental hold, ADU and development, wholesale, and more — showing where each lands as a range, where the risks are, and a suggested next step. It's a starting point, not a final answer.",
      },
      {
        q: "What's the difference between a Strategy Snapshot and a Deal Blueprint?",
        a: "Two depths of the same Strategy Lab work. The Strategy Snapshot is preliminary and informational: a free read with no account required (lane fit, ranges, headline math), or a fuller saved snapshot with a Pegasus account (scenarios, risk register, sensitivity, shareable). The Deal Blueprint is a deeper, human-prepared memo for one specific property — underwriting, structure, risk register, and outreach scripts, written by the Pegasus team. It's available by request after a review; most submissions don't need one, and we tell you which fits before you commit.",
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
