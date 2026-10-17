"use client";

import type { ReactNode } from "react";
import { LuCopy, LuTrash2 } from "react-icons/lu";
import { getIcon, IconGlyph } from "@/lib/icons";
import type { AppEdge, AppNode, ArrowMode, EdgePathType, LabeledEdgeData } from "@/lib/types";

const ACCENTS = ["#334155", "#2563eb", "#0ea5e9", "#0d9488", "#16a34a", "#ca8a04", "#f97316", "#dc2626", "#db2777", "#8b5cf6"];
const FILLS = ["#ffffff", "#f1f5f9", "#dbeafe", "#e0f2fe", "#dcfce7", "#fef9c3", "#ffedd5", "#fee2e2", "#fce7f3", "#ede9fe"];

export type BackgroundKind = "dots" | "lines" | "none";

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="border-b border-slate-100 px-4 py-3.5">
      <h3 className="mb-2.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400">{title}</h3>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-[12px] font-medium text-slate-600">{label}</span>
      {children}
    </label>
  );
}

const inputCls =
  "w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-[13px] text-slate-800 outline-none focus:border-indigo-400";

function Swatches({ value, options, onChange }: { value: string; options: string[]; onChange: (c: string) => void }) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {options.map((c) => (
        <button
          key={c}
          type="button"
          onClick={() => onChange(c)}
          aria-label={c}
          className={`h-6 w-6 rounded-md border transition ${value.toLowerCase() === c ? "ring-2 ring-indigo-500 ring-offset-1" : "border-slate-300"}`}
          style={{ backgroundColor: c }}
        />
      ))}
      <input
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-6 w-6 cursor-pointer rounded-md border border-slate-300 bg-transparent p-0"
        title="Custom color"
      />
    </div>
  );
}

function Segmented<T extends string>({ value, options, onChange }: { value: T; options: { value: T; label: string }[]; onChange: (v: T) => void }) {
  return (
    <div className="flex rounded-lg bg-slate-100 p-0.5">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          className={`flex-1 rounded-md px-1.5 py-1 text-[11px] font-medium transition ${
            value === o.value ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <label className="flex cursor-pointer items-center justify-between text-[12px] font-medium text-slate-600">
      {label}
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="h-4 w-4 accent-indigo-600" />
    </label>
  );
}

function Actions({ onDuplicate, onDelete }: { onDuplicate: () => void; onDelete: () => void }) {
  return (
    <div className="flex gap-2 px-4 py-3.5">
      <button type="button" onClick={onDuplicate} className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-slate-200 py-1.5 text-[12px] font-medium text-slate-700 hover:bg-slate-50">
        <LuCopy size={14} /> Duplicate
      </button>
      <button type="button" onClick={onDelete} className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-red-200 py-1.5 text-[12px] font-medium text-red-600 hover:bg-red-50">
        <LuTrash2 size={14} /> Delete
      </button>
    </div>
  );
}

function NodeProperties({
  node,
  onChange,
  onPickIcon,
}: {
  node: AppNode;
  onChange: (patch: Record<string, unknown>, key: string) => void;
  onPickIcon: () => void;
}) {
  const labelField = (
    <Field label="Label">
      <textarea rows={2} className={inputCls} value={node.data.label} onChange={(e) => onChange({ label: e.target.value }, "label")} />
    </Field>
  );

  switch (node.type) {
    case "icon": {
      const def = getIcon(node.data.iconId);
      const color = node.data.color ?? def.color;
      return (
        <Section title="Icon node">
          <Field label="Icon">
            <button type="button" onClick={onPickIcon} className="flex w-full items-center gap-3 rounded-lg border border-slate-200 px-2.5 py-2 text-left hover:border-indigo-300 hover:bg-indigo-50">
              <IconGlyph iconId={node.data.iconId} size={22} color={color} />
              <span className="flex-1 text-[13px] text-slate-700">{def.label}</span>
              <span className="text-[11px] font-medium text-indigo-600">Change</span>
            </button>
          </Field>
          {labelField}
          <Field label="Subtitle">
            <input className={inputCls} value={node.data.sublabel ?? ""} placeholder="e.g. t3.medium × 3" onChange={(e) => onChange({ sublabel: e.target.value }, "sublabel")} />
          </Field>
          <Field label="Icon color">
            <Swatches value={color} options={[def.color, ...ACCENTS.filter((c) => c !== def.color)]} onChange={(c) => onChange({ color: c }, "color")} />
          </Field>
        </Section>
      );
    }
    case "shape":
      return (
        <Section title="Shape">
          {labelField}
          <Field label="Shape">
            <select className={inputCls} value={node.data.shape} onChange={(e) => onChange({ shape: e.target.value }, "shape")}>
              <option value="rectangle">Rectangle</option>
              <option value="rounded">Rounded rectangle</option>
              <option value="ellipse">Ellipse</option>
              <option value="diamond">Diamond</option>
              <option value="cylinder">Cylinder</option>
              <option value="note">Sticky note</option>
            </select>
          </Field>
          <Field label="Icon">
            <div className="flex gap-2">
              <button type="button" onClick={onPickIcon} className="flex flex-1 items-center gap-2 rounded-lg border border-slate-200 px-2.5 py-1.5 text-[13px] text-slate-700 hover:border-indigo-300">
                {node.data.iconId ? <IconGlyph iconId={node.data.iconId} size={18} /> : null}
                {node.data.iconId ? getIcon(node.data.iconId).label : "Add icon…"}
              </button>
              {node.data.iconId && (
                <button type="button" onClick={() => onChange({ iconId: undefined }, "icon")} className="rounded-lg border border-slate-200 px-2.5 text-[12px] text-slate-500 hover:bg-slate-50">
                  Remove
                </button>
              )}
            </div>
          </Field>
          <Field label="Fill">
            <Swatches value={node.data.fill} options={FILLS} onChange={(c) => onChange({ fill: c }, "fill")} />
          </Field>
          <Field label="Border">
            <Swatches value={node.data.stroke} options={ACCENTS} onChange={(c) => onChange({ stroke: c }, "stroke")} />
          </Field>
          <Field label="Text">
            <Swatches value={node.data.textColor} options={["#0f172a", "#ffffff", ...ACCENTS.slice(1)]} onChange={(c) => onChange({ textColor: c }, "textColor")} />
          </Field>
        </Section>
      );
    case "frame":
      return (
        <Section title="Group">
          <Field label="Title">
            <input className={inputCls} value={node.data.label} onChange={(e) => onChange({ label: e.target.value }, "label")} />
          </Field>
          <Field label="Color">
            <Swatches value={node.data.color} options={ACCENTS} onChange={(c) => onChange({ color: c }, "color")} />
          </Field>
          <Toggle label="Dashed border" checked={!!node.data.dashed} onChange={(v) => onChange({ dashed: v }, "dashed")} />
          <p className="text-[11px] leading-relaxed text-slate-400">Drag nodes into the group to nest them — they move together.</p>
        </Section>
      );
    case "text":
      return (
        <Section title="Text">
          {labelField}
          <Field label={`Size — ${node.data.fontSize}px`}>
            <input type="range" min={10} max={64} value={node.data.fontSize} onChange={(e) => onChange({ fontSize: Number(e.target.value) }, "fontSize")} className="w-full accent-indigo-600" />
          </Field>
          <Field label="Color">
            <Swatches value={node.data.color} options={["#0f172a", ...ACCENTS.slice(1)]} onChange={(c) => onChange({ color: c }, "color")} />
          </Field>
        </Section>
      );
  }
}

function EdgeProperties({ edge, onChange }: { edge: AppEdge; onChange: (patch: Partial<LabeledEdgeData> & { animated?: boolean }, key: string) => void }) {
  const d = edge.data!;
  return (
    <Section title="Connection">
      <Field label="Label">
        <input className={inputCls} value={d.label ?? ""} placeholder="e.g. HTTPS, gRPC, events" onChange={(e) => onChange({ label: e.target.value }, "label")} />
      </Field>
      <Field label="Line style">
        <Segmented<EdgePathType>
          value={d.pathType}
          onChange={(v) => onChange({ pathType: v }, "pathType")}
          options={[
            { value: "smoothstep", label: "Elbow" },
            { value: "step", label: "Step" },
            { value: "bezier", label: "Curve" },
            { value: "straight", label: "Straight" },
          ]}
        />
      </Field>
      <Field label="Arrows">
        <Segmented<ArrowMode>
          value={d.arrows}
          onChange={(v) => onChange({ arrows: v }, "arrows")}
          options={[
            { value: "end", label: "→" },
            { value: "start", label: "←" },
            { value: "both", label: "↔" },
            { value: "none", label: "—" },
          ]}
        />
      </Field>
      <Field label="Color">
        <Swatches value={d.color} options={["#64748b", ...ACCENTS.slice(1)]} onChange={(c) => onChange({ color: c }, "color")} />
      </Field>
      <Toggle label="Dashed" checked={!!d.dashed} onChange={(v) => onChange({ dashed: v }, "dashed")} />
      <Toggle label="Animated flow" checked={!!edge.animated} onChange={(v) => onChange({ animated: v }, "animated")} />
    </Section>
  );
}

export function PropertiesPanel(props: {
  selectedNodes: AppNode[];
  selectedEdges: AppEdge[];
  onNodeChange: (id: string, patch: Record<string, unknown>, key: string) => void;
  onEdgeChange: (id: string, patch: Partial<LabeledEdgeData> & { animated?: boolean }, key: string) => void;
  onPickIcon: (nodeId: string) => void;
  onDuplicate: () => void;
  onDelete: () => void;
  background: BackgroundKind;
  onBackgroundChange: (b: BackgroundKind) => void;
}) {
  const { selectedNodes, selectedEdges } = props;
  const total = selectedNodes.length + selectedEdges.length;

  let body: ReactNode;
  if (total === 0) {
    body = (
      <>
        <Section title="Canvas">
          <Field label="Background">
            <Segmented<BackgroundKind>
              value={props.background}
              onChange={props.onBackgroundChange}
              options={[
                { value: "dots", label: "Dots" },
                { value: "lines", label: "Grid" },
                { value: "none", label: "None" },
              ]}
            />
          </Field>
        </Section>
        <Section title="Shortcuts">
          <ul className="space-y-1.5 text-[12px] text-slate-600">
            {[
              ["Connect nodes", "Drag from a dot"],
              ["Edit label", "Double-click"],
              ["Change icon", "Double-click icon"],
              ["Box select", "Drag on canvas"],
              ["Pan", "Space + drag / scroll"],
              ["Duplicate", "⌘D"],
              ["Copy / Paste", "⌘C / ⌘V"],
              ["Delete", "⌫"],
              ["Undo / Redo", "⌘Z / ⌘⇧Z"],
            ].map(([a, b]) => (
              <li key={a} className="flex justify-between gap-2">
                <span>{a}</span>
                <span className="text-slate-400">{b}</span>
              </li>
            ))}
          </ul>
        </Section>
      </>
    );
  } else if (total === 1 && selectedNodes.length === 1) {
    const node = selectedNodes[0];
    body = (
      <>
        <NodeProperties node={node} onChange={(p, k) => props.onNodeChange(node.id, p, k)} onPickIcon={() => props.onPickIcon(node.id)} />
        <Actions onDuplicate={props.onDuplicate} onDelete={props.onDelete} />
      </>
    );
  } else if (total === 1 && selectedEdges.length === 1) {
    const edge = selectedEdges[0];
    body = (
      <>
        <EdgeProperties edge={edge} onChange={(p, k) => props.onEdgeChange(edge.id, p, k)} />
        <Actions onDuplicate={props.onDuplicate} onDelete={props.onDelete} />
      </>
    );
  } else {
    body = (
      <>
        <Section title="Selection">
          <p className="text-[13px] text-slate-600">
            {selectedNodes.length} node{selectedNodes.length === 1 ? "" : "s"}, {selectedEdges.length} connection{selectedEdges.length === 1 ? "" : "s"}
          </p>
        </Section>
        <Actions onDuplicate={props.onDuplicate} onDelete={props.onDelete} />
      </>
    );
  }

  return <aside className="w-72 shrink-0 overflow-y-auto border-l border-slate-200 bg-white">{body}</aside>;
}
