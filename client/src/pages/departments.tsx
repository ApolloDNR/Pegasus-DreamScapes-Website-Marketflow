import { PageOpening, PageClosing } from "@/pegasus/experience-page";

/**
 * Public Website v1 (issue #22) — Departments.
 * Public explanation of the four operating functions Pegasus may use.
 * These are accountability lanes, not a claim that four separately
 * staffed departments are available on every engagement.
 */

const DEPARTMENTS: {
  name: string;
  role: string;
  handles: string[];
  example: string;
}[] = [
  {
    name: "Acquisitions",
    role: "The acquisitions lane covers initial review and possible transaction structure.",
    handles: [
      "Property intake",
      "Seller motivation",
      "Deal source",
      "Initial underwriting",
      "Creative terms",
      "Partnership structure",
      "Purchase, assignment, or JV possibility",
    ],
    example: "Direct sale: Acquisitions → Dispositions",
  },
  {
    name: "Development",
    role: "The development lane frames a possible improvement scope when a property needs work.",
    handles: [
      "Scope planning",
      "Renovation strategy",
      "ADU potential",
      "Construction coordination",
      "Design standards",
      "Budget control",
      "Repositioning",
    ],
    example: "Value-add flip: Acquisitions → Development → Dispositions",
  },
  {
    name: "Dispositions",
    role: "The dispositions lane considers possible sale, assignment, or partner paths.",
    handles: [
      "Property marketing",
      "Buyer network",
      "Deal packaging",
      "Assignment",
      "Sale strategy",
      "Listing/referral lane when appropriate",
      "MarketFlow",
    ],
    example: "Deal finder needs buyer: Acquisitions → Dispositions / MarketFlow",
  },
  {
    name: "Asset Management",
    role: "The asset-management lane frames responsibilities for a possible long-term hold.",
    handles: [
      "Rental strategy",
      "Portfolio operations",
      "Vendor systems",
      "Tenant coordination",
      "Maintenance planning",
      "Long-term performance",
      "Future communities",
    ],
    example: "Rental hold: Acquisitions → Development → Asset Management",
  },
];

export default function DepartmentsPage() {
  return <article className="experience-page">
    <PageOpening title="Four functions. One operating model." action={{ href:'#operating-functions', label:'Explore the functions' }}>
      <p>These labels describe work that may be required; they do not represent a promise of separate staffing or service on every submission. Any review, project work, or licensed representation depends on fit, diligence, capacity, and a separate written agreement.</p>
    </PageOpening>
    <div id="operating-functions">{DEPARTMENTS.map((department, index) => <section key={department.name} className={`ep-section${index % 2 ? ' ep-warm' : ''}`}>
      <div className="experience-wrap ep-split">
        <div><h2>{department.name}</h2><p>{department.role}</p><p className="ep-notice ep-rule"><strong>Example route: </strong>{department.example}</p></div>
        <div><h3>Responsibilities to define</h3><ul className="ep-rows">{department.handles.map(item => <li key={item}>{item}</li>)}</ul></div>
      </div>
    </section>)}</div>
    <PageClosing title="Have a property, deal, or situation worth reviewing?" label="Submit a Property">
      <p>Share the property and situation for possible review. If Pegasus has a responsible next step, the applicable lane and terms can be discussed directly.</p>
    </PageClosing>
  </article>;
}
