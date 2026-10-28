export const site = {
  name: "AgriLand",
  tagline: "Agricultural Land Marketplace",
  description:
    "A trusted marketplace connecting agricultural landowners with genuine investors through secure, transparent, and profitable land deals across Maharashtra and India.",
  // your real domain; on Vercel it falls back to the project's production domain automatically
  url: (
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "") ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "") ||
    "http://localhost:3000"
  ).replace(/\/$/, ""),
  // Contact details come from env vars so the real numbers can be set per deployment.
  // The fallbacks are the values the site shipped with; replace them before running ads (see ADS_COMPLIANCE_CHECKLIST.md).
  supportPhone: env("NEXT_PUBLIC_SUPPORT_PHONE") || "1800-123-4567",
  supportPhoneHref: `tel:${(env("NEXT_PUBLIC_SUPPORT_PHONE") || "18001234567").replace(/[^d+]/g, "")}`,
  whatsapp: env("NEXT_PUBLIC_WHATSAPP_URL") || "https://wa.me/918001234567",
  email: env("NEXT_PUBLIC_SUPPORT_EMAIL") || "support@agriland.in",
  /** true only when the deployment has set its real phone number */
  contactConfigured: Boolean(env("NEXT_PUBLIC_SUPPORT_PHONE")),
  /** profile links; icons are hidden for networks that are not configured */
  social: Object.fromEntries(
    (["instagram", "facebook", "linkedin", "youtube"] as const).map((k) => [k, env(`NEXT_PUBLIC_SOCIAL_${k.toUpperCase()}`)]).filter(([, v]) => v),
  ) as Partial<Record<"instagram" | "facebook" | "linkedin" | "youtube", string>>,
  /** legal operator details shown on the legal pages; never invented, so they stay empty until configured */
  legal: {
    name: env("NEXT_PUBLIC_LEGAL_NAME"),
    address: env("NEXT_PUBLIC_BUSINESS_ADDRESS"),
    city: env("NEXT_PUBLIC_BUSINESS_CITY") || "Pune, Maharashtra",
    gstin: env("NEXT_PUBLIC_GSTIN"),
    reraAgentNo: env("NEXT_PUBLIC_RERA_AGENT_NO"),
    grievanceOfficer: env("NEXT_PUBLIC_GRIEVANCE_OFFICER"),
    lastUpdated: "27 October 2026",
  },
};

function env(k: string) {
  return (process.env[k] || "").trim();
}

export const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || "pushkargharate3011@gmail.com").toLowerCase();
/** Used only when a new, empty database is first created. Empty = the admin gets a random password (see seed). */
export const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "";

export const DISTRICTS = [
  "Pune",
  "Satara",
  "Nashik",
  "Kolhapur",
  "Ahmednagar",
  "Solapur",
  "Sangli",
  "Aurangabad",
  "Nagpur",
  "Mumbai",
];

export const SUB_DISTRICTS: Record<string, string[]> = {
  Pune: ["Haveli", "Shirur", "Mulshi", "Daund", "Baramati", "Indapur", "Maval", "Junnar", "Khed", "Purandar"],
  Satara: ["Satara", "Wai", "Karad", "Koregaon", "Phaltan"],
  Nashik: ["Nashik", "Niphad", "Dindori", "Sinnar", "Igatpuri"],
  Kolhapur: ["Karveer", "Hatkanangale", "Kagal", "Panhala", "Shirol"],
  Ahmednagar: ["Rahuri", "Sangamner", "Shrirampur", "Kopargaon", "Parner"],
  Solapur: ["Pandharpur", "Mohol", "Barshi", "Akkalkot"],
  Sangli: ["Miraj", "Walwa", "Tasgaon", "Jat"],
  Aurangabad: ["Paithan", "Vaijapur", "Gangapur", "Kannad"],
  Nagpur: ["Kamptee", "Hingna", "Katol", "Umred"],
  Mumbai: ["Mumbai"],
};

export const STATES = ["Maharashtra", "Karnataka", "Gujarat", "Madhya Pradesh", "Goa"];

export const PROPERTY_TYPES = ["Agriculture Land", "Plot", "Farmhouse"];

/** Map any land type (including old ones like "Orchard" or "NA Plot") to one of PROPERTY_TYPES. */
export function normalizeLandType(t?: string) {
  const s = (t || "").toLowerCase();
  if (s.includes("farmhouse")) return "Farmhouse";
  if (s.includes("plot")) return "Plot";
  return "Agriculture Land";
}

export const LAND_CATEGORIES = [
  { slug: "crop-land", name: "Crop Land", image: "/images/type-crop.jpg" },
  { slug: "orchard-fruit-farm", name: "Orchard / Fruit Farm", image: "/images/type-orchard.jpg" },
  { slug: "irrigated-land", name: "Irrigated Land", image: "/images/type-irrigated.jpg" },
  { slug: "organic-land", name: "Organic Land", image: "/images/type-organic.jpg" },
  { slug: "farmhouse-land", name: "Farmhouse Land", image: "/images/type-farmhouse.jpg" },
  { slug: "large-land-parcels", name: "Large Land Parcels", image: "/images/type-large.jpg" },
] as const;

export type LandCategorySlug = (typeof LAND_CATEGORIES)[number]["slug"];

export const BUDGETS = [
  { label: "Under ₹10L", min: 0, max: 1_000_000 },
  { label: "₹10L – ₹30L", min: 1_000_000, max: 3_000_000 },
  { label: "₹30L – ₹50L", min: 3_000_000, max: 5_000_000 },
  { label: "₹50L – ₹1Cr", min: 5_000_000, max: 10_000_000 },
  { label: "Above ₹1Cr", min: 10_000_000, max: 1_000_000_000 },
];

export const AREAS = [
  { label: "Under 2 Acres", min: 0, max: 2 },
  { label: "2 – 10 Acres", min: 2, max: 10 },
  { label: "10 – 25 Acres", min: 10, max: 25 },
  { label: "Above 25 Acres", min: 25, max: 100000 },
];

export const SOIL_TYPES = ["Black Soil", "Red Soil", "Alluvial Soil", "Laterite Soil", "Sandy Soil", "Loamy Soil"];
export const WATER_SOURCES = ["Well", "Borewell", "Canal", "River", "Farm Pond", "Well + Borewell"];
export const WATER_AVAILABILITY = ["Year-round", "Seasonal", "Monsoon only", "Limited"];
export const ROAD_ACCESS = ["Paved Road", "Kaccha Road", "Highway Facing", "No Direct Road"];
export const ELECTRICITY = ["Available", "Nearby", "Not Available"];
export const FENCING = ["Fully Fenced", "Partially Fenced", "Compound Wall", "Not Fenced"];
export const CROPS = ["Sugarcane", "Banana", "Vegetables", "Grapes", "Pomegranate", "Mango", "Wheat", "Soybean", "Cotton", "Onion", "Fallow / None"];
export const AREA_UNITS = ["Acres", "Guntha", "Hectare"];

export const HIGHLIGHT_OPTIONS = [
  "Fertile Soil",
  "Good Water Availability",
  "Road Connectivity",
  "Electricity Available",
  "Suitable for Multiple Crops",
  "Near Market",
  "Near Highway",
];

export const DOCUMENT_TYPES = [
  { key: "extract", label: "7/12 Extract", required: true, hint: "Required" },
  { key: "landMap", label: "Land Map", required: true, hint: "Required" },
  { key: "ownership", label: "Ownership Proof", required: true, hint: "Required" },
  { key: "soil", label: "Soil Report", required: false, hint: "Recommended" },
  { key: "water", label: "Water Source Proof", required: false, hint: "Optional" },
  { key: "other", label: "Other Documents", required: false, hint: "Optional" },
] as const;
