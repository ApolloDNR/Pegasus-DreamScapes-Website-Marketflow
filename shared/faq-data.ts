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
        a: "You may submit context about residential, land, or selected commercial situations. Property-type and geographic fit are considered case by case; submission does not promise review.",
      },
      {
        q: "Is there a fee to submit?",
        a: "No fee is charged to submit. Submission does not promise review, analysis, a response, an offer, or any later service.",
      },
      {
        q: "How long does a review take?",
        a: "There is no public review or response-time commitment. Pegasus may request more information if it elects to consider the submission.",
      },
      {
        q: "Do you guarantee an offer?",
        a: "No. A submission may receive no offer, review, path, referral, or response. Any later transaction or service requires its own diligence and written terms.",
      },
    ],
  },
  {
    eyebrow: "Working with Pegasus",
    items: [
      {
        q: "What makes Pegasus different from a regular real estate investor?",
        a: "The public site starts with a structured intake and educational frameworks for possible lanes. Actual availability, review, recommendations, services, and transactions are conditional.",
      },
      {
        q: "Is Apollo licensed?",
        a: "For license verification, CA DRE #02333658 is listed under Duran Ramirez, Paolo Ariel. The responsible broker listed in DRE records is BMP Realty Inc DBA Keller Williams Realty-East Bay. This site uses Paolo “Apollo” Duran as a public-facing name; verify current status before engagement. Representation may be available only under a separate written brokerage agreement.",
      },
      {
        q: "Can you help if I just want to list my property?",
        a: "You may ask about licensed-representation availability. No listing, referral, or agency relationship exists without current license verification, fit, capacity, and a separate written agreement.",
      },
      {
        q: "What is the Strategy Lab?",
        a: "A free tool you run yourself. Enter a property's basics and it sorts the main investment lanes — fix and flip, BRRRR, rental hold, ADU and development, wholesale, and more — showing where each lands as a range, where the risks are, and a suggested next step. It's a starting point, not a final answer.",
      },
      {
        q: "What's the difference between a Strategy Snapshot and a Deal Blueprint?",
        a: "The Strategy Snapshot is a preliminary educational output based on user inputs. A Deal Blueprint is a possible separately scoped analysis. A request is not an order; availability, author, contents, fee, timing, and limits require written agreement.",
      },
    ],
  },
  {
    eyebrow: "MarketFlow & Network",
    items: [
      {
        q: "What is MarketFlow?",
        a: "MarketFlow is a private controlled-pilot workspace. It is not a public marketplace. Access, inventory, participants, review, matching, introductions, and transaction availability are not guaranteed.",
      },
      {
        q: "How do I get access to MarketFlow?",
        a: "Request access at /marketflow/access and provide introduction context and role. Requests are discretionary and do not promise verification, approval, an invite, or inventory.",
      },
      {
        q: "I don't have an introduction. Can I still get in?",
        a: "You may use the contact form, but no access path, response, introduction, or exception is promised.",
      },
    ],
  },
  {
    eyebrow: "Buyboxes",
    items: [
      {
        q: "What are the Pegasus Buyboxes?",
        a: "The public Buybox page describes orientation criteria for controlled-pilot interest only. It does not publish public buyer profiles, offer public signup, or publish live inventory. No reviewed live inventory is published, and submitting interest does not promise review, access, matching, notification, or a transaction.",
      },
      {
        q: "Does submitting Buybox interest commit me to buy?",
        a: "No. It records controlled-pilot interest only and creates no purchase obligation, public profile, account, access, notification, match, or transaction right.",
      },
    ],
  },
];
