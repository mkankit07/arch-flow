import { MarkerType, type XYPosition } from "@xyflow/react";
import { getIcon } from "./icons";
import { DEFAULT_EDGE_WIDTH } from "./style";
import type {
  AppEdge,
  AppNode,
  ArrowMode,
  DragPayload,
  LabeledEdgeData,
  ShapeKind,
} from "./types";

export const uid = (prefix = "n") =>
  `${prefix}_${Math.random().toString(36).slice(2, 9)}${Date.now().toString(36).slice(-3)}`;

const SHAPE_DEFAULTS: Record<
  ShapeKind,
  { label: string; width: number; height: number; fill: string; stroke: string }
> = {
  rectangle: { label: "Rectangle", width: 160, height: 80, fill: "#ffffff", stroke: "#334155" },
  rounded: { label: "Service", width: 160, height: 80, fill: "#ffffff", stroke: "#334155" },
  ellipse: { label: "Ellipse", width: 140, height: 90, fill: "#ffffff", stroke: "#334155" },
  diamond: { label: "Decision", width: 140, height: 110, fill: "#ffffff", stroke: "#334155" },
  cylinder: { label: "Database", width: 120, height: 110, fill: "#dbeafe", stroke: "#2563eb" },
  hexagon: { label: "Hexagon", width: 150, height: 100, fill: "#ffffff", stroke: "#334155" },
  triangle: { label: "Triangle", width: 130, height: 110, fill: "#ffffff", stroke: "#334155" },
  parallelogram: { label: "Input / Output", width: 170, height: 80, fill: "#ffffff", stroke: "#334155" },
  note: { label: "Note", width: 180, height: 110, fill: "#fef9c3", stroke: "#eab308" },
};

/** Approximate rendered size, used to center new nodes on the drop point. */
export function payloadSize(p: DragPayload): { width: number; height: number } {
  switch (p.kind) {
    case "icon":
      return { width: 112, height: 96 };
    case "shape":
      return SHAPE_DEFAULTS[p.shape];
    case "frame":
      return { width: 420, height: 280 };
    case "text":
      return { width: 140, height: 32 };
  }
}

export function createNode(p: DragPayload, center: XYPosition): AppNode {
  const size = payloadSize(p);
  const position = { x: center.x - size.width / 2, y: center.y - size.height / 2 };
  const id = uid(p.kind);
  switch (p.kind) {
    case "icon":
      return { id, type: "icon", position, data: { label: getIcon(p.iconId).label, iconId: p.iconId } };
    case "shape": {
      const d = SHAPE_DEFAULTS[p.shape];
      return {
        id,
        type: "shape",
        position,
        width: d.width,
        height: d.height,
        data: { label: d.label, shape: p.shape, fill: d.fill, stroke: d.stroke, textColor: "#0f172a" },
      };
    }
    case "frame":
      return {
        id,
        type: "frame",
        position,
        width: size.width,
        height: size.height,
        data: { label: "Group", color: "#6366f1", strokeStyle: "dashed", fillStyle: "semi" },
      };
    case "text":
      return { id, type: "text", position, data: { label: "Text", fontSize: 18 } };
  }
}

export function markersFor(arrows: ArrowMode, color: string, strokeWidth = DEFAULT_EDGE_WIDTH) {
  // React Flow sizes markers in stroke-width units; keep arrowheads a constant on-screen size.
  const size = Math.round((18 * DEFAULT_EDGE_WIDTH) / strokeWidth);
  const marker = { type: MarkerType.ArrowClosed, color, width: size, height: size };
  return {
    markerEnd: arrows === "end" || arrows === "both" ? marker : undefined,
    markerStart: arrows === "start" || arrows === "both" ? marker : undefined,
  };
}

export const DEFAULT_EDGE_DATA: LabeledEdgeData = {
  pathType: "smoothstep",
  color: "#64748b",
  arrows: "end",
};

export function createEdge(
  conn: { source: string; target: string; sourceHandle?: string | null; targetHandle?: string | null },
  data: Partial<LabeledEdgeData> = {},
  extra: Partial<AppEdge> = {},
): AppEdge {
  const d = { ...DEFAULT_EDGE_DATA, ...data };
  return {
    id: uid("e"),
    type: "labeled",
    source: conn.source,
    target: conn.target,
    sourceHandle: conn.sourceHandle ?? undefined,
    targetHandle: conn.targetHandle ?? undefined,
    data: d,
    ...markersFor(d.arrows, d.color, d.strokeWidth),
    ...extra,
  };
}

/** React Flow requires parent nodes to appear before their children. */
export function sortParentsFirst(nodes: AppNode[]): AppNode[] {
  const frames = nodes.filter((n) => n.type === "frame");
  const rest = nodes.filter((n) => n.type !== "frame");
  return [...frames, ...rest];
}
