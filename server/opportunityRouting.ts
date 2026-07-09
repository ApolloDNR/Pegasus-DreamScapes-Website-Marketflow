// Pure deal-routing logic (ROUTING_FORMS_AND_DATA_SCHEMA.md §3) — no I/O,
// unit-testable without a database connection.

type Routed = { recommendedLane: string; assignedDepartment: string };

export function routeOpportunity(o: {
  visitorType: string;
  situation?: string | null;
  goal?: string | null;
}): Routed {
  const situation = (o.situation ?? "").toLowerCase();
  const goal = (o.goal ?? "").toLowerCase();

  // Goal-level overrides that outrank the visitor-type default.
  if (goal.includes("list through") || goal.includes("keller williams")) {
    return {
      recommendedLane: "Strategy Review → Work With Apollo / Keller Williams",
      assignedDepartment: "Work With Apollo / KW",
    };
  }
  if (goal.includes("hold") || goal.includes("rent")) {
    return {
      recommendedLane: "Acquisitions → Development → Asset Management",
      assignedDepartment: "Acquisitions",
    };
  }
  if (goal.includes("find buyer")) {
    return {
      recommendedLane: "Acquisitions → Dispositions / MarketFlow",
      assignedDepartment: "Acquisitions",
    };
  }

  switch (o.visitorType) {
    case "owner":
    case "owner_representative":
      if (situation.includes("just exploring") || goal.includes("not sure")) {
        return {
          recommendedLane: "Strategy Review first, then routed",
          assignedDepartment: "Strategy Review",
        };
      }
      return {
        recommendedLane: "Acquisitions → (Development) → Dispositions",
        assignedDepartment: "Acquisitions",
      };
    case "deal_finder":
      return {
        recommendedLane: "Acquisitions → Dispositions / MarketFlow",
        assignedDepartment: "Acquisitions",
      };
    case "buyer":
      return {
        recommendedLane: "Work With Apollo / MarketFlow buyer network",
        assignedDepartment: "Work With Apollo / KW",
      };
    case "capital_partner":
      return {
        recommendedLane: "Private project-by-project review",
        assignedDepartment: "Private Capital Review",
      };
    case "vendor_operator":
      return {
        recommendedLane: "Development vendor bench",
        assignedDepartment: "Vendor Bench",
      };
    case "referral_partner":
      return {
        recommendedLane: "Referral intake → appropriate lane",
        assignedDepartment: "Acquisitions",
      };
    case "strategy_only":
      return {
        recommendedLane: "Strategy Review first, then routed",
        assignedDepartment: "Strategy Review",
      };
    default:
      return {
        recommendedLane: "Needs manual review",
        assignedDepartment: "Acquisitions",
      };
  }
}

