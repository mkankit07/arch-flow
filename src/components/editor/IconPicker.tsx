"use client";

import { useEffect, useMemo, useState } from "react";
import { LuSearch, LuX } from "react-icons/lu";
import { ICON_CATEGORIES, IconGlyph, searchIcons, type IconCategory } from "@/lib/icons";

export function IconPicker({
  current,
  onSelect,
  onClose,
}: {
  current?: string;
  onSelect: (iconId: string) => void;
  onClose: () => void;
}) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<IconCategory | "All">("All");
  const results = useMemo(() => searchIcons(query, category), [query, category]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-[2px]" onMouseDown={onClose}>
      <div
        className="flex max-h-[80vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 border-b border-slate-200 p-4">
          <label className="flex flex-1 items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 focus-within:border-indigo-400 focus-within:bg-white">
            <LuSearch className="text-slate-400" />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search icons…"
              className="w-full bg-transparent text-sm outline-none"
            />
          </label>
          <button type="button" onClick={onClose} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100" aria-label="Close">
            <LuX size={18} />
          </button>
        </div>
        <div className="flex gap-1.5 overflow-x-auto border-b border-slate-200 px-4 py-2.5">
          {(["All", ...ICON_CATEGORIES] as const).map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCategory(c)}
              className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium transition ${
                category === c ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-4 gap-2 overflow-y-auto p-4 sm:grid-cols-6">
          {results.map((icon) => (
            <button
              key={icon.id}
              type="button"
              onClick={() => onSelect(icon.id)}
              className={`flex flex-col items-center gap-1.5 rounded-xl border p-3 transition hover:border-indigo-300 hover:bg-indigo-50 ${
                current === icon.id ? "border-indigo-500 bg-indigo-50" : "border-slate-200"
              }`}
            >
              <IconGlyph iconId={icon.id} size={26} />
              <span className="line-clamp-1 text-[11px] text-slate-600">{icon.label}</span>
            </button>
          ))}
          {results.length === 0 && <div className="col-span-full py-10 text-center text-sm text-slate-400">No icons found</div>}
        </div>
      </div>
    </div>
  );
}
