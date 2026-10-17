"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  LuChevronDown,
  LuDownload,
  LuFileCode,
  LuFileImage,
  LuFilePlus,
  LuFileText,
  LuFolderOpen,
  LuHand,
  LuLayoutTemplate,
  LuMousePointer2,
  LuRedo2,
  LuSave,
  LuUndo2,
  LuWorkflow,
} from "react-icons/lu";
import type { ExportFormat } from "@/lib/export";

export type Tool = "select" | "hand";

function IconButton({
  onClick,
  disabled,
  active,
  title,
  children,
}: {
  onClick: () => void;
  disabled?: boolean;
  active?: boolean;
  title: string;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      aria-label={title}
      className={`rounded-lg p-2 transition disabled:cursor-not-allowed disabled:opacity-35 ${
        active ? "bg-indigo-100 text-indigo-700" : "text-slate-600 hover:bg-slate-100"
      }`}
    >
      {children}
    </button>
  );
}

function Menu({ label, icon, children, primary }: { label: string; icon: ReactNode; children: (close: () => void) => ReactNode; primary?: boolean }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    window.addEventListener("mousedown", onDown);
    return () => window.removeEventListener("mousedown", onDown);
  }, [open]);
  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[13px] font-medium transition ${
          primary ? "bg-indigo-600 text-white hover:bg-indigo-700" : "text-slate-700 hover:bg-slate-100"
        }`}
      >
        {icon}
        {label}
        <LuChevronDown size={14} />
      </button>
      {open && (
        <div className="absolute right-0 top-full z-50 mt-1.5 w-56 rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl">
          {children(() => setOpen(false))}
        </div>
      )}
    </div>
  );
}

function MenuItem({ onClick, icon, label, hint }: { onClick: () => void; icon: ReactNode; label: string; hint?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-[13px] text-slate-700 hover:bg-slate-100"
    >
      <span className="text-slate-500">{icon}</span>
      <span className="flex-1">{label}</span>
      {hint && <span className="text-[11px] text-slate-400">{hint}</span>}
    </button>
  );
}

export function Toolbar(props: {
  title: string;
  onTitleChange: (t: string) => void;
  tool: Tool;
  onToolChange: (t: Tool) => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onExport: (f: ExportFormat) => void;
  onSaveJson: () => void;
  onOpenJson: () => void;
  onNew: () => void;
  onLoadSample: () => void;
  exporting: boolean;
}) {
  return (
    <header className="flex h-14 shrink-0 items-center gap-3 border-b border-slate-200 bg-white px-3">
      <div className="flex items-center gap-2 pr-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white">
          <LuWorkflow size={18} />
        </div>
        <span className="hidden text-[15px] font-bold tracking-tight text-slate-900 sm:block">ArchFlow</span>
      </div>
      <div className="h-6 w-px bg-slate-200" />
      <input
        value={props.title}
        onChange={(e) => props.onTitleChange(e.target.value)}
        className="w-56 rounded-md border border-transparent px-2 py-1 text-[14px] font-medium text-slate-800 outline-none hover:border-slate-200 focus:border-indigo-400"
        aria-label="Diagram title"
      />

      <div className="mx-auto flex items-center gap-0.5 rounded-xl border border-slate-200 bg-white p-0.5 shadow-sm">
        <IconButton title="Select (V)" active={props.tool === "select"} onClick={() => props.onToolChange("select")}>
          <LuMousePointer2 size={17} />
        </IconButton>
        <IconButton title="Pan (H)" active={props.tool === "hand"} onClick={() => props.onToolChange("hand")}>
          <LuHand size={17} />
        </IconButton>
        <div className="mx-1 h-5 w-px bg-slate-200" />
        <IconButton title="Undo (⌘Z)" disabled={!props.canUndo} onClick={props.onUndo}>
          <LuUndo2 size={17} />
        </IconButton>
        <IconButton title="Redo (⌘⇧Z)" disabled={!props.canRedo} onClick={props.onRedo}>
          <LuRedo2 size={17} />
        </IconButton>
      </div>

      <Menu label="File" icon={<LuFileText size={15} />}>
        {(close) => (
          <>
            <MenuItem icon={<LuFilePlus size={16} />} label="New blank diagram" onClick={() => (close(), props.onNew())} />
            <MenuItem icon={<LuLayoutTemplate size={16} />} label="Load sample diagram" onClick={() => (close(), props.onLoadSample())} />
            <div className="my-1 h-px bg-slate-100" />
            <MenuItem icon={<LuFolderOpen size={16} />} label="Open .json…" onClick={() => (close(), props.onOpenJson())} />
            <MenuItem icon={<LuSave size={16} />} label="Save as .json" hint="⌘S" onClick={() => (close(), props.onSaveJson())} />
          </>
        )}
      </Menu>
      <Menu label={props.exporting ? "Exporting…" : "Export"} icon={<LuDownload size={15} />} primary>
        {(close) => (
          <>
            <MenuItem icon={<LuFileImage size={16} />} label="JPEG image" hint=".jpg" onClick={() => (close(), props.onExport("jpeg"))} />
            <MenuItem icon={<LuFileText size={16} />} label="PDF document" hint=".pdf" onClick={() => (close(), props.onExport("pdf"))} />
            <MenuItem icon={<LuFileImage size={16} />} label="PNG image" hint=".png" onClick={() => (close(), props.onExport("png"))} />
            <MenuItem icon={<LuFileCode size={16} />} label="SVG vector" hint=".svg" onClick={() => (close(), props.onExport("svg"))} />
          </>
        )}
      </Menu>
    </header>
  );
}
