"use client";

import type { ReactNode } from "react";
import { LuCopy, LuTrash2 } from "react-icons/lu";
import { getIcon, IconGlyph } from "@/lib/icons";
import { CANVAS_PRESETS, DEFAULT_EDGE_WIDTH, DEFAULT_STROKE_WIDTH, edgeStrokeStyle, frameStrokeStyle } from "@/lib/style";
import type {
  AppEdge,
  AppNode,
  ArrowMode,
  BackgroundKind,
  CanvasSettings,
  EdgePathType,
  FillStyle,
  IconTile,
  LabeledEdgeData,
  StrokeStyle,
} from "@/lib/types";

const ACCENTS = ["#334155", "#2563eb", "#0ea5e9", "#0d9488", "#16a34a", "#ca8a04", "#f97316", "#dc2626", "#db2777", "#8b5cf6"];
const FILLS = ["#ffffff", "#f1f5f9", "#dbeafe", "#e0f2fe", "#dcfce7", "#fef9c3", "#ffedd5", "#fee2e2", "#fce7f3", "#ede9fe"];

export type EdgePatch = Partial<LabeledEdgeData> & { animated?: boolean };
export type BulkStyle = { strokeStyle?: StrokeStyle; opacity?: number };

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
    <div>
      <span className="mb-1 block text-[12px] font-medium text-slate-600">{label}</span>
      {children}
    </div>
  );
}

const inputCls =
  "w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-[13px] text-slate-800 outline-none focus:border-indigo-400";

function Swatches({
  value,
  options,
  onChange,
  allowAuto,
}: {
  value: string | undefined;
  options: string[];
  onChange: (c: string | undefined) => void;
  allowAuto?: boolean;
}) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {allowAuto && (
        <button
          type="button"
          onClick={() => onChange(undefined)}
          title="Auto — follows the canvas"
          aria-label="Auto color"
          className={`h-6 w-6 rounded-md border border-slate-300 transition ${value === undefined ? "ring-2 ring-indigo-500 ring-offset-1" : ""}`}
          style={{ background: "linear-gradient(135deg, #0f172a 50%, #ffffff 50%)" }}
        />
      )}
      {options.map((c) => (
        <button
          key={c}
          type="button"
          onClick={() => onChange(c)}
          aria-label={c}
          className={`h-6 w-6 rounded-md border transition ${value?.toLowerCase() === c ? "ring-2 ring-indigo-500 ring-offset-1" : "border-slate-300"}`}
          style={{ backgroundColor: c }}
        />
      ))}
      <input
        type="color"
        value={value ?? "#0f172a"}
        onChange={(e) => onChange(e.target.value)}
        className="h-6 w-6 cursor-pointer rounded-md border border-slate-300 bg-transparent p-0"
        title="Custom color"
      />
    </div>
  );
}

function Segmented<T extends string | number>({
  value,
  options,
  onChange,
}: {
  value: T | undefined;
  options: { value: T; label: ReactNode; title?: string }[];
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex rounded-lg bg-slate-100 p-0.5">
      {options.map((o) => (
        <button
          key={String(o.value)}
          type="button"
          title={o.title}
          onClick={() => onChange(o.value)}
          className={`flex flex-1 items-center justify-center rounded-md px-1.5 py-1 text-[11px] font-medium transition ${
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

/** Tiny line previews so the stroke options read visually, like Eraser's style bar. */
function LinePreview({ style, width = 2 }: { style: StrokeStyle; width?: number }) {
  const dash = style === "dashed" ? "5 3.5" : style === "dotted" ? `0 ${width + 2.5}` : undefined;
  return (
    <svg width="28" height="10" aria-hidden>
      <line x1={width} y1="5" x2={28 - width} y2="5" stroke="currentColor" strokeWidth={width} strokeDasharray={dash} strokeLinecap={style === "dotted" ? "round" : "butt"} />
    </svg>
  );
}

function StrokeStyleField({ value, onChange }: { value: StrokeStyle; onChange: (v: StrokeStyle) => void }) {
  return (
    <Field label="Stroke style">
      <Segmented<StrokeStyle>
        value={value}
        onChange={onChange}
        options={[
          { value: "solid", label: <LinePreview style="solid" />, title: "Solid" },
          { value: "dashed", label: <LinePreview style="dashed" />, title: "Dashed" },
          { value: "dotted", label: <LinePreview style="dotted" />, title: "Dotted" },
        ]}
      />
    </Field>
  );
}

function StrokeWidthField({ value, onChange, widths }: { value: number; onChange: (v: number) => void; widths: number[] }) {
  return (
    <Field label="Stroke width">
      <Segmented<number>
        value={value}
        onChange={onChange}
        options={widths.map((w) => ({ value: w, label: <LinePreview style="solid" width={w} />, title: `${w}px` }))}
      />
    </Field>
  );
}

function FillStyleField({ value, onChange }: { value: FillStyle; onChange: (v: FillStyle) => void }) {
  const swatch = (bg: string, extra = "") => <span className={`h-3 w-5 rounded-sm border border-slate-500 ${extra}`} style={{ background: bg }} />;
  return (
    <Field label="Fill style">
      <Segmented<FillStyle>
        value={value}
        onChange={onChange}
        options={[
          { value: "solid", label: <span className="flex items-center gap-1">{swatch("#94a3b8")}Solid</span> },
          { value: "semi", label: <span className="flex items-center gap-1">{swatch("rgba(148,163,184,.4)")}Semi</span> },
          { value: "none", label: <span className="flex items-center gap-1">{swatch("transparent", "border-dashed")}None</span> },
        ]}
      />
    </Field>
  );
}

function OpacityField({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <Field label={`Opacity — ${Math.round(value * 100)}%`}>
      <input type="range" min={10} max={100} step={5} value={Math.round(value * 100)} onChange={(e) => onChange(Number(e.target.value) / 100)} className="w-full accent-indigo-600" />
    </Field>
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

type NodeChange = (patch: Record<string, unknown>, key: string) => void;

function NodeProperties({ node, onChange, onPickIcon }: { node: AppNode; onChange: NodeChange; onPickIcon: () => void }) {
  const labelField = (
    <Field label="Label">
      <textarea rows={2} className={inputCls} value={node.data.label} onChange={(e) => onChange({ label: e.target.value }, "label")} />
    </Field>
  );
  const opacity = <OpacityField value={node.data.opacity ?? 1} onChange={(v) => onChange({ opacity: v }, "opacity")} />;

  switch (node.type) {
    case "icon": {
      const def = getIcon(node.data.iconId);
      const color = node.data.color ?? def.color;
      return (
        <>
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
          </Section>
          <Section title="Style">
            <Field label="Tile">
              <Segmented<IconTile>
                value={node.data.tile ?? "filled"}
                onChange={(v) => onChange({ tile: v }, "tile")}
                options={[
                  { value: "filled", label: "Filled" },
                  { value: "outline", label: "Outline" },
                  { value: "plain", label: "Plain" },
                ]}
              />
            </Field>
            <Field label="Icon color">
              <Swatches value={color} options={[def.color, ...ACCENTS.filter((c) => c !== def.color)]} onChange={(c) => onChange({ color: c }, "color")} />
            </Field>
            {opacity}
          </Section>
        </>
      );
    }
    case "shape":
      return (
        <>
          <Section title="Shape">
            {labelField}
            <Field label="Shape">
              <select className={inputCls} value={node.data.shape} onChange={(e) => onChange({ shape: e.target.value }, "shape")}>
                <option value="rectangle">Rectangle</option>
                <option value="rounded">Rounded rectangle</option>
                <option value="ellipse">Ellipse</option>
                <option value="diamond">Diamond</option>
                <option value="hexagon">Hexagon</option>
                <option value="triangle">Triangle</option>
                <option value="parallelogram">Parallelogram</option>
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
          </Section>
          <Section title="Style">
            <StrokeStyleField value={node.data.strokeStyle ?? "solid"} onChange={(v) => onChange({ strokeStyle: v }, "strokeStyle")} />
            <StrokeWidthField value={node.data.strokeWidth ?? DEFAULT_STROKE_WIDTH} widths={[1, 1.5, 2.5, 4]} onChange={(v) => onChange({ strokeWidth: v }, "strokeWidth")} />
            <Field label="Stroke color">
              <Swatches value={node.data.stroke} options={ACCENTS} onChange={(c) => c && onChange({ stroke: c }, "stroke")} />
            </Field>
            <FillStyleField value={node.data.fillStyle ?? "solid"} onChange={(v) => onChange({ fillStyle: v }, "fillStyle")} />
            {(node.data.fillStyle ?? "solid") !== "none" && (
              <Field label="Fill color">
                <Swatches value={node.data.fill} options={FILLS} onChange={(c) => c && onChange({ fill: c }, "fill")} />
              </Field>
            )}
            <Field label="Text color">
              <Swatches value={node.data.textColor} options={["#0f172a", "#ffffff", ...ACCENTS.slice(1)]} onChange={(c) => c && onChange({ textColor: c }, "textColor")} />
            </Field>
            <Field label={`Font size — ${node.data.fontSize ?? 13}px`}>
              <input type="range" min={10} max={40} value={node.data.fontSize ?? 13} onChange={(e) => onChange({ fontSize: Number(e.target.value) }, "fontSize")} className="w-full accent-indigo-600" />
            </Field>
            {opacity}
          </Section>
        </>
      );
    case "frame":
      return (
        <>
          <Section title="Group">
            <Field label="Title">
              <input className={inputCls} value={node.data.label} onChange={(e) => onChange({ label: e.target.value }, "label")} />
            </Field>
            <p className="text-[11px] leading-relaxed text-slate-400">Drag nodes into the group to nest them — they move together.</p>
          </Section>
          <Section title="Style">
            <StrokeStyleField value={frameStrokeStyle(node.data)} onChange={(v) => onChange({ strokeStyle: v, dashed: undefined }, "strokeStyle")} />
            <StrokeWidthField value={node.data.strokeWidth ?? 2} widths={[1, 2, 3, 4]} onChange={(v) => onChange({ strokeWidth: v }, "strokeWidth")} />
            <Field label="Color">
              <Swatches value={node.data.color} options={ACCENTS} onChange={(c) => c && onChange({ color: c }, "color")} />
            </Field>
            <FillStyleField value={node.data.fillStyle ?? "semi"} onChange={(v) => onChange({ fillStyle: v }, "fillStyle")} />
            {opacity}
          </Section>
        </>
      );
    case "text":
      return (
        <Section title="Text">
          {labelField}
          <Field label={`Size — ${node.data.fontSize}px`}>
            <input type="range" min={10} max={64} value={node.data.fontSize} onChange={(e) => onChange({ fontSize: Number(e.target.value) }, "fontSize")} className="w-full accent-indigo-600" />
          </Field>
          <Field label="Color">
            <Swatches allowAuto value={node.data.color} options={ACCENTS.slice(1)} onChange={(c) => onChange({ color: c }, "color")} />
          </Field>
          {opacity}
        </Section>
      );
  }
}

function EdgeProperties({ edge, onChange }: { edge: AppEdge; onChange: (patch: EdgePatch, key: string) => void }) {
  const d = edge.data!;
  return (
    <>
      <Section title="Connection">
        <Field label="Label">
          <input className={inputCls} value={d.label ?? ""} placeholder="e.g. HTTPS, gRPC, events" onChange={(e) => onChange({ label: e.target.value }, "label")} />
        </Field>
        <Field label="Routing">
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
      </Section>
      <Section title="Style">
        <StrokeStyleField value={edgeStrokeStyle(d)} onChange={(v) => onChange({ strokeStyle: v, dashed: undefined }, "strokeStyle")} />
        <StrokeWidthField value={d.strokeWidth ?? DEFAULT_EDGE_WIDTH} widths={[1, 1.75, 2.5, 4]} onChange={(v) => onChange({ strokeWidth: v }, "strokeWidth")} />
        <Field label="Color">
          <Swatches value={d.color} options={["#64748b", ...ACCENTS.slice(1)]} onChange={(c) => c && onChange({ color: c }, "color")} />
        </Field>
        <Toggle label="Animated flow" checked={!!edge.animated} onChange={(v) => onChange({ animated: v }, "animated")} />
      </Section>
    </>
  );
}

function CanvasProperties({ canvas, onChange }: { canvas: CanvasSettings; onChange: (patch: Partial<CanvasSettings>) => void }) {
  return (
    <Section title="Canvas">
      <Field label="Background">
        <div className="grid grid-cols-4 gap-1.5">
          {CANVAS_PRESETS.map((p) => (
            <button
              key={p.color}
              type="button"
              title={p.name}
              onClick={() => onChange({ color: p.color })}
              className={`flex flex-col items-center gap-1 rounded-lg p-1 text-[10px] text-slate-500 transition hover:bg-slate-50 ${
                canvas.color.toLowerCase() === p.color ? "ring-2 ring-indigo-500" : ""
              }`}
            >
              <span className="h-7 w-full rounded-md border border-slate-300" style={{ backgroundColor: p.color }} />
              {p.name}
            </button>
          ))}
        </div>
        <label className="mt-2 flex items-center gap-2 text-[12px] text-slate-500">
          <input type="color" value={canvas.color} onChange={(e) => onChange({ color: e.target.value })} className="h-6 w-6 cursor-pointer rounded-md border border-slate-300 bg-transparent p-0" />
          Custom color
        </label>
      </Field>
      <Field label="Pattern">
        <Segmented<BackgroundKind>
          value={canvas.pattern}
          onChange={(v) => onChange({ pattern: v })}
          options={[
            { value: "dots", label: "Dots" },
            { value: "lines", label: "Grid" },
            { value: "cross", label: "Cross" },
            { value: "none", label: "None" },
          ]}
        />
      </Field>
      <Toggle label="Transparent PNG / SVG export" checked={canvas.transparentExport} onChange={(v) => onChange({ transparentExport: v })} />
    </Section>
  );
}

function BulkProperties({ nodes, edges, onBulk }: { nodes: AppNode[]; edges: AppEdge[]; onBulk: (s: BulkStyle) => void }) {
  return (
    <Section title="Selection">
      <p className="text-[13px] text-slate-600">
        {nodes.length} node{nodes.length === 1 ? "" : "s"}, {edges.length} connection{edges.length === 1 ? "" : "s"}
      </p>
      <Field label="Stroke style (shapes, groups, lines)">
        <Segmented<StrokeStyle>
          value={undefined}
          onChange={(v) => onBulk({ strokeStyle: v })}
          options={[
            { value: "solid", label: <LinePreview style="solid" />, title: "Solid" },
            { value: "dashed", label: <LinePreview style="dashed" />, title: "Dashed" },
            { value: "dotted", label: <LinePreview style="dotted" />, title: "Dotted" },
          ]}
        />
      </Field>
      {nodes.length > 0 && <OpacityField value={nodes[0].data.opacity ?? 1} onChange={(v) => onBulk({ opacity: v })} />}
    </Section>
  );
}

const SHORTCUTS = [
  ["Connect nodes", "Drag from a dot"],
  ["Edit label", "Double-click"],
  ["Change icon", "Double-click icon"],
  ["Box select", "Drag on canvas"],
  ["Pan", "Space + drag / scroll"],
  ["Duplicate", "⌘D"],
  ["Copy / Paste", "⌘C / ⌘V"],
  ["Delete", "⌫"],
  ["Undo / Redo", "⌘Z / ⌘⇧Z"],
];

export function PropertiesPanel(props: {
  selectedNodes: AppNode[];
  selectedEdges: AppEdge[];
  onNodeChange: (id: string, patch: Record<string, unknown>, key: string) => void;
  onEdgeChange: (id: string, patch: EdgePatch, key: string) => void;
  onBulkStyle: (s: BulkStyle) => void;
  onPickIcon: (nodeId: string) => void;
  onDuplicate: () => void;
  onDelete: () => void;
  canvas: CanvasSettings;
  onCanvasChange: (patch: Partial<CanvasSettings>) => void;
}) {
  const { selectedNodes, selectedEdges } = props;
  const total = selectedNodes.length + selectedEdges.length;

  let body: ReactNode;
  if (total === 0) {
    body = (
      <>
        <CanvasProperties canvas={props.canvas} onChange={props.onCanvasChange} />
        <Section title="Shortcuts">
          <ul className="space-y-1.5 text-[12px] text-slate-600">
            {SHORTCUTS.map(([a, b]) => (
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
        <BulkProperties nodes={selectedNodes} edges={selectedEdges} onBulk={props.onBulkStyle} />
        <Actions onDuplicate={props.onDuplicate} onDelete={props.onDelete} />
      </>
    );
  }

  return <aside className="w-72 shrink-0 overflow-y-auto border-l border-slate-200 bg-white">{body}</aside>;
}
