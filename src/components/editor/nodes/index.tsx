"use client";

import type { NodeProps, NodeTypes } from "@xyflow/react";
import { getIcon, IconGlyph } from "@/lib/icons";
import { DEFAULT_STROKE_WIDTH, fillProps, isNearBlack, frameStrokeStyle, strokeProps, withAlpha } from "@/lib/style";
import type { FillStyle, FrameNodeType, IconNodeType, ShapeKind, ShapeNodeType, StrokeStyle, TextNodeType } from "@/lib/types";
import { useEditor } from "../EditorContext";
import { EditableLabel, NodeHandles, Resizer } from "./common";

const SELECTED = "#6366f1";

function IconNode({ id, data, selected }: NodeProps<IconNodeType>) {
  const { openIconPicker, canvasDark } = useEditor();
  const baseColor = data.color ?? getIcon(data.iconId).color;
  // Near-black brand marks (Kafka, GitHub, Vercel…) would vanish on a dark canvas.
  const color = canvasDark && isNearBlack(baseColor) ? "#e2e8f0" : baseColor;
  const tile = data.tile ?? "filled";
  const tileStyle =
    tile === "filled"
      ? { borderColor: withAlpha(color, 0.25), backgroundColor: withAlpha(color, 0.07) }
      : tile === "outline"
        ? { borderColor: color, borderWidth: 1.5, backgroundColor: "transparent" }
        : { borderColor: "transparent", backgroundColor: "transparent", boxShadow: "none" };

  return (
    <div
      className={`arch-node group flex w-[112px] flex-col items-center gap-1.5 rounded-xl px-1.5 py-2 ${selected ? "is-selected" : ""}`}
      style={{ opacity: data.opacity ?? 1 }}
    >
      {/* Handles live on the icon tile so edges attach to the icon, not the label area. */}
      <div className="relative">
        <NodeHandles />
        <button
          type="button"
          title="Double-click to change icon"
          onDoubleClick={(e) => {
            e.stopPropagation();
            openIconPicker(id);
          }}
          className={`flex h-14 w-14 items-center justify-center rounded-2xl border ${tile === "filled" ? "bg-white shadow-sm" : ""}`}
          style={tileStyle}
        >
          <IconGlyph iconId={data.iconId} size={tile === "plain" ? 40 : 30} color={color} />
        </button>
      </div>
      <EditableLabel
        nodeId={id}
        value={data.label}
        className="w-full text-center text-[12px] font-semibold leading-tight"
        style={{ color: "var(--canvas-ink)" }}
      />
      {data.sublabel && (
        <div className="-mt-1 text-center text-[10px] leading-tight" style={{ color: "var(--canvas-muted)" }}>
          {data.sublabel}
        </div>
      )}
    </div>
  );
}

function ShapeOutline({
  shape,
  w,
  h,
  fill,
  stroke,
  strokeStyle,
  strokeWidth,
  fillStyle,
}: {
  shape: ShapeKind;
  w: number;
  h: number;
  fill: string;
  stroke: string;
  strokeStyle?: StrokeStyle;
  strokeWidth: number;
  fillStyle?: FillStyle;
}) {
  const s = strokeWidth / 2 + 0.5;
  const common = { ...fillProps(fill, fillStyle), stroke, ...strokeProps(strokeStyle, strokeWidth), strokeLinejoin: "round" as const };

  switch (shape) {
    case "ellipse":
      return <ellipse cx={w / 2} cy={h / 2} rx={w / 2 - s} ry={h / 2 - s} {...common} />;
    case "diamond":
      return <polygon points={`${w / 2},${s} ${w - s},${h / 2} ${w / 2},${h - s} ${s},${h / 2}`} {...common} />;
    case "hexagon": {
      const i = Math.min(w * 0.22, h * 0.5);
      return <polygon points={`${i},${s} ${w - i},${s} ${w - s},${h / 2} ${w - i},${h - s} ${i},${h - s} ${s},${h / 2}`} {...common} />;
    }
    case "triangle":
      return <polygon points={`${w / 2},${s} ${w - s},${h - s} ${s},${h - s}`} {...common} />;
    case "parallelogram": {
      const k = Math.min(w * 0.18, 28);
      return <polygon points={`${k},${s} ${w - s},${s} ${w - k},${h - s} ${s},${h - s}`} {...common} />;
    }
    case "cylinder": {
      const ry = Math.min(14, h * 0.15);
      const rx = w / 2 - s;
      return (
        <>
          <path d={`M${s},${ry + s} A${rx},${ry} 0 0 0 ${w - s},${ry + s} V${h - ry - s} A${rx},${ry} 0 0 1 ${s},${h - ry - s} Z`} {...common} />
          <ellipse cx={w / 2} cy={ry + s} rx={rx} ry={ry} {...common} />
        </>
      );
    }
    default: {
      const r = shape === "rounded" ? 14 : shape === "note" ? 6 : 2;
      return <rect x={s} y={s} width={w - 2 * s} height={h - 2 * s} rx={r} {...common} />;
    }
  }
}

function ShapeNode({ id, data, selected, width, height }: NodeProps<ShapeNodeType>) {
  const w = width ?? 160;
  const h = height ?? 80;
  // Push the label into the visual body of shapes whose top is narrow or capped.
  const topPad = data.shape === "cylinder" ? Math.min(14, h * 0.15) * 2 : data.shape === "triangle" ? h * 0.35 : 0;
  const isNote = data.shape === "note";
  return (
    <div
      className={`arch-node relative h-full w-full ${isNote && (data.fillStyle ?? "solid") === "solid" ? "drop-shadow-md" : ""}`}
      style={{ opacity: data.opacity ?? 1 }}
    >
      <Resizer selected={selected} />
      <NodeHandles />
      <svg aria-hidden className="absolute inset-0 overflow-visible" width={w} height={h}>
        <ShapeOutline
          shape={data.shape}
          w={w}
          h={h}
          fill={data.fill}
          stroke={selected ? SELECTED : data.stroke}
          strokeStyle={data.strokeStyle}
          strokeWidth={data.strokeWidth ?? DEFAULT_STROKE_WIDTH}
          fillStyle={data.fillStyle}
        />
      </svg>
      <div
        className={`absolute inset-0 flex items-center gap-2 px-4 ${isNote ? "justify-start text-left" : "justify-center text-center"}`}
        style={{ paddingTop: topPad, color: data.textColor }}
      >
        {data.iconId && <IconGlyph iconId={data.iconId} size={22} />}
        <EditableLabel
          nodeId={id}
          value={data.label}
          multiline
          className="max-w-full font-medium leading-snug"
          style={{ color: data.textColor, fontSize: data.fontSize ?? 13 }}
        />
      </div>
    </div>
  );
}

function FrameNode({ id, data, selected, width, height }: NodeProps<FrameNodeType>) {
  const w = width ?? 420;
  const h = height ?? 280;
  const sw = data.strokeWidth ?? 2;
  const s = sw / 2;
  const fillStyle = data.fillStyle ?? "semi";
  const fill = fillStyle === "none" ? "transparent" : withAlpha(data.color, fillStyle === "solid" ? 0.14 : 0.05);
  return (
    <div className="arch-node relative h-full w-full" style={{ opacity: data.opacity ?? 1 }}>
      <Resizer selected={selected} minWidth={160} minHeight={100} />
      <NodeHandles />
      <svg aria-hidden className="absolute inset-0 overflow-visible" width={w} height={h}>
        <rect
          x={s}
          y={s}
          width={Math.max(0, w - sw)}
          height={Math.max(0, h - sw)}
          rx={16}
          fill={fill}
          stroke={selected ? SELECTED : data.color}
          {...strokeProps(frameStrokeStyle(data), sw)}
        />
      </svg>
      <div className="absolute -top-3.5 left-4 max-w-[80%] rounded-md px-2.5 py-0.5 shadow-sm" style={{ backgroundColor: data.color }}>
        <EditableLabel nodeId={id} value={data.label} className="text-[12px] font-semibold text-white" />
      </div>
    </div>
  );
}

function TextNode({ id, data, selected }: NodeProps<TextNodeType>) {
  return (
    <div className={`arch-node rounded-md px-2 py-1 ${selected ? "is-selected" : ""}`} style={{ opacity: data.opacity ?? 1 }}>
      <EditableLabel
        nodeId={id}
        value={data.label}
        placeholder="Text"
        multiline
        className="min-w-[40px] font-semibold leading-tight"
        style={{ fontSize: data.fontSize, color: data.color ?? "var(--canvas-ink)" }}
      />
    </div>
  );
}

export const nodeTypes: NodeTypes = {
  icon: IconNode,
  shape: ShapeNode,
  frame: FrameNode,
  text: TextNode,
};
