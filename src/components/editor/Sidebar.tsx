"use client";

import { useMemo, useState, type DragEvent, type ReactNode } from "react";
import { LuChevronDown, LuCircle, LuDatabase, LuDiamond, LuHexagon, LuRectangleHorizontal, LuSearch, LuSquare, LuSquareDashed, LuStickyNote, LuTriangle, LuType } from "react-icons/lu";
import { ICON_CATEGORIES, IconGlyph, searchIcons } from "@/lib/icons";
import { DRAG_MIME, type DragPayload } from "@/lib/types";

function onDragStart(e: DragEvent, payload: DragPayload) {
  e.dataTransfer.setData(DRAG_MIME, JSON.stringify(payload));
  e.dataTransfer.effectAllowed = "move";
}

const SHAPES: { payload: DragPayload; label: string; icon: ReactNode }[] = [
  { payload: { kind: "shape", shape: "rectangle" }, label: "Rectangle", icon: <LuSquare size={18} /> },
  { payload: { kind: "shape", shape: "rounded" }, label: "Rounded", icon: <LuRectangleHorizontal size={18} /> },
  { payload: { kind: "shape", shape: "ellipse" }, label: "Ellipse", icon: <LuCircle size={18} /> },
  { payload: { kind: "shape", shape: "diamond" }, label: "Diamond", icon: <LuDiamond size={18} /> },
  { payload: { kind: "shape", shape: "hexagon" }, label: "Hexagon", icon: <LuHexagon size={18} /> },
  { payload: { kind: "shape", shape: "triangle" }, label: "Triangle", icon: <LuTriangle size={18} /> },
  { payload: { kind: "shape", shape: "parallelogram" }, label: "Slanted", icon: <LuSquare size={18} className="-skew-x-12" /> },
  { payload: { kind: "shape", shape: "cylinder" }, label: "Cylinder", icon: <LuDatabase size={18} /> },
  { payload: { kind: "shape", shape: "note" }, label: "Note", icon: <LuStickyNote size={18} /> },
  { payload: { kind: "text" }, label: "Text", icon: <LuType size={18} /> },
  { payload: { kind: "frame" }, label: "Group", icon: <LuSquareDashed size={18} /> },
];

export function Sidebar({ onAdd }: { onAdd: (p: DragPayload) => void }) {
  const [query, setQuery] = useState("");
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const results = useMemo(() => searchIcons(query), [query]);

  return (
    <aside className="flex w-64 shrink-0 flex-col border-r border-slate-200 bg-white">
      <div className="border-b border-slate-200 p-3">
        <div className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">Shapes</div>
        <div className="grid grid-cols-4 gap-1.5">
          {SHAPES.map((s) => (
            <button
              key={s.label}
              type="button"
              draggable
              onDragStart={(e) => onDragStart(e, s.payload)}
              onClick={() => onAdd(s.payload)}
              title={`${s.label} — click or drag`}
              className="flex aspect-square flex-col items-center justify-center gap-1 rounded-lg border border-slate-200 text-slate-600 transition hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-600"
            >
              {s.icon}
              <span className="text-[9px]">{s.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="p-3 pb-2">
        <div className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">Icons</div>
        <label className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 focus-within:border-indigo-400 focus-within:bg-white">
          <LuSearch className="text-slate-400" size={14} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search icons (db, queue, aws…)"
            className="w-full bg-transparent text-[13px] outline-none placeholder:text-slate-400"
          />
        </label>
      </div>

      <div className="flex-1 overflow-y-auto px-3 pb-4">
        {results.length === 0 && <div className="py-8 text-center text-xs text-slate-400">No icons match “{query}”</div>}
        {ICON_CATEGORIES.map((cat) => {
          const items = results.filter((i) => i.category === cat);
          if (items.length === 0) return null;
          const isCollapsed = !query && collapsed[cat];
          return (
            <section key={cat} className="mb-2">
              <button
                type="button"
                onClick={() => setCollapsed((c) => ({ ...c, [cat]: !c[cat] }))}
                className="flex w-full items-center justify-between py-1.5 text-[12px] font-semibold text-slate-600 hover:text-slate-900"
              >
                {cat}
                <span className="flex items-center gap-1 text-[10px] font-normal text-slate-400">
                  {items.length}
                  <LuChevronDown className={`transition ${isCollapsed ? "-rotate-90" : ""}`} />
                </span>
              </button>
              {!isCollapsed && (
                <div className="grid grid-cols-3 gap-1.5">
                  {items.map((icon) => (
                    <button
                      key={icon.id}
                      type="button"
                      draggable
                      onDragStart={(e) => onDragStart(e, { kind: "icon", iconId: icon.id })}
                      onClick={() => onAdd({ kind: "icon", iconId: icon.id })}
                      title={`${icon.label} — click or drag`}
                      className="flex flex-col items-center gap-1 rounded-lg border border-transparent px-1 py-2 transition hover:border-slate-200 hover:bg-slate-50"
                    >
                      <IconGlyph iconId={icon.id} size={22} />
                      <span className="line-clamp-1 text-[10px] text-slate-600">{icon.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </section>
          );
        })}
      </div>
    </aside>
  );
}
