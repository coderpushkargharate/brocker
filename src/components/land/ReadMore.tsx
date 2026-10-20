"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

export function ReadMore({ text, lines = 4 }: { text: string; lines?: number }) {
  const [open, setOpen] = useState(false);
  const paras = text.split(/\n+/).filter(Boolean);
  const long = text.length > 260 || paras.length > 1;
  return (
    <div>
      <div className="space-y-2 text-[15px] leading-relaxed text-body" style={!open && long ? { display: "-webkit-box", WebkitLineClamp: lines, WebkitBoxOrient: "vertical", overflow: "hidden" } : undefined}>
        {paras.length ? paras.map((p, i) => <p key={i}>{p}</p>) : <p className="text-muted">No description added yet.</p>}
      </div>
      {long && (
        <button onClick={() => setOpen((o) => !o)} className="mt-3 flex items-center gap-1 text-[13px] font-semibold text-brand">
          {open ? "Read Less" : "Read More"} <ChevronDown className={`h-4 w-4 transition ${open ? "rotate-180" : ""}`} />
        </button>
      )}
    </div>
  );
}
