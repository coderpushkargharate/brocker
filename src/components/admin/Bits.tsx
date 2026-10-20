import type { LandStatus } from "@/lib/types";

export const STATUS_CHIP: Record<LandStatus, string> = {
  active: "bg-[#dcfce7] text-[#166534]",
  pending: "bg-[#fef3c7] text-[#92400e]",
  draft: "bg-[#f3f4f6] text-[#374151]",
  rejected: "bg-[#fee2e2] text-[#991b1b]",
  sold: "bg-[#dbeafe] text-[#1e40af]",
};

export function PageTitle({ title, sub, children }: { title: string; sub?: string; children?: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-[26px] font-bold tracking-[-0.01em] text-ink">{title}</h1>
        {sub && <p className="text-[14.5px] text-muted">{sub}</p>}
      </div>
      {children}
    </div>
  );
}

export function Box({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <section className={`rounded-2xl border border-line bg-white p-5 shadow-card ${className}`}>{children}</section>;
}
