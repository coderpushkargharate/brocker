export function slugify(s: string) {
  return s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-");
}

/** ₹25,00,000 (Indian digit grouping) */
export function inr(n: number) {
  return "₹" + Math.round(n).toLocaleString("en-IN");
}

/** ₹25L / ₹1.2Cr */
export function inrShort(n: number) {
  if (n >= 10_000_000) return `₹${+(n / 10_000_000).toFixed(2)}Cr`;
  if (n >= 100_000) return `₹${+(n / 100_000).toFixed(1)}L`;
  return inr(n);
}

export function perAcre(price: number, area: number) {
  return area > 0 ? price / area : 0;
}

export function areaLabel(area: number, unit = "Acres") {
  return `${area.toFixed(2)} ${unit}`;
}

export function areaShort(area: number, unit = "Acres") {
  return `${+area.toFixed(2)} ${unit}`;
}

export function timeAgo(iso: string) {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
  if (diff < 86400) {
    const h = Math.floor(diff / 3600);
    return `${h} hour${h > 1 ? "s" : ""} ago`;
  }
  const d = Math.floor(diff / 86400);
  if (d === 1) {
    return `Yesterday, ${new Date(iso).toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit", hour12: true }).toUpperCase()}`;
  }
  if (d < 30) return `${d} days ago`;
  return formatDate(iso);
}

export function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export function budgetLabel(min?: number, max?: number) {
  if (!min && !max) return "Any budget";
  return `${inrShort(min || 0)} – ${inrShort(max || 0)}`;
}

export function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}
