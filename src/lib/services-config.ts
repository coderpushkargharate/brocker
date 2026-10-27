// Constants for Business Services & Labour. Safe to import in client components.

export const EXPERIENCE_OPTIONS = [
  { label: "Fresher", years: 0 },
  { label: "1 - 3 Years", years: 1 },
  { label: "3 - 5 Years", years: 3 },
  { label: "5 - 10 Years", years: 5 },
  { label: "10+ Years", years: 10 },
];

/** Which experience bucket a number of years falls into. */
export function expBucket(years: number) {
  return [...EXPERIENCE_OPTIONS].reverse().find((o) => years >= o.years)!.label;
}

export const BUSINESS_TYPES = ["Proprietorship", "Partnership", "Private Limited", "LLP", "Individual / Freelancer"];
export const EMPLOYEE_OPTIONS = ["1 - 10", "11 - 50", "51 - 200", "200+"];
export const PAYMENT_MODES = ["Cash", "Bank Transfer", "UPI", "Cheque", "Card"];
export const BUSINESS_HIGHLIGHTS = ["Site Delivery Available", "Best Market Rates", "Free Site Visit", "On-Time Delivery", "10+ Years Experience", "24x7 Service", "With Operator", "GST Billing"];
export const WORK_RADIUS = ["Within 5 km", "Within 10 km", "Within 15 km", "Within 20 km", "20 - 30 km", "Anywhere in district"];
export const ID_PROOF_TYPES = ["Aadhaar Card", "PAN Card", "Voter ID", "Driving Licence", "E-Shram Card"];
export const WAGE_MIN = 200;
export const WAGE_MAX = 1500;

/** Picture for a service name, so new listings look good without uploads. */
const SERVICE_IMAGES: [RegExp, string][] = [
  [/cement/i, "/images/svc/p-cement.jpg"],
  [/steel|tmt/i, "/images/svc/p-steel.jpg"],
  [/sand/i, "/images/svc/p-sand.jpg"],
  [/brick|aac|block/i, "/images/svc/p-bricks.jpg"],
  [/tile|granite|marble/i, "/images/svc/p-tiles.jpg"],
  [/plumb|pipe/i, "/images/svc/p-plumbing.jpg"],
  [/electric/i, "/images/svc/p-electrical.jpg"],
  [/paint|chemical/i, "/images/svc/p-paints.jpg"],
  [/plywood|laminate/i, "/images/svc/p-plywood.jpg"],
  [/door|window/i, "/images/svc/p-doors.jpg"],
  [/jcb|excavat|poclain|machin|dumper|hayva|crane|tractor|roller/i, "/images/svc/cat-jcb.jpg"],
  [/borewell|pump|water|rainwater/i, "/images/svc/cat-borewell.jpg"],
  [/garden|lawn|landscap|nursery|plant|irrigation/i, "/images/svc/cat-garden.jpg"],
  [/contract|architect|engineer|design|bungalow|row house|turnkey|civil/i, "/images/svc/cat-contractor.jpg"],
  [/ac |ac$|clean|pest|furniture|carpenter/i, "/images/svc/cat-home.jpg"],
];

export function imageForService(name: string, fallback = "/images/svc/cat-building.jpg") {
  return SERVICE_IMAGES.find(([re]) => re.test(name))?.[1] ?? fallback;
}

export const FALLBACK_BUSINESS_IMAGE = "/images/svc/cat-building.jpg";
export const FALLBACK_WORKER_IMAGE = "/images/svc/lab-construction.jpg";

export function waLink(phone: string, text?: string) {
  let d = phone.replace(/\D/g, "");
  if (d.length === 10) d = "91" + d;
  return `https://wa.me/${d}${text ? `?text=${encodeURIComponent(text)}` : ""}`;
}

export function telLink(phone: string) {
  const d = phone.replace(/[^\d+]/g, "");
  return `tel:${d.startsWith("+") || d.length !== 10 ? d : "+91" + d}`;
}

export function wageLabel(w: { wageMin: number; wageMax?: number; wageUnit: string }) {
  const f = (n: number) => "₹" + n.toLocaleString("en-IN");
  return `${f(w.wageMin)}${w.wageMax && w.wageMax > w.wageMin ? ` - ${f(w.wageMax)}` : ""} / ${w.wageUnit}`;
}
