import type { Edge, Node } from "@xyflow/react";

export type StrokeStyle = "solid" | "dashed" | "dotted";
export type FillStyle = "solid" | "semi" | "none";
export type IconTile = "filled" | "outline" | "plain";

/** Styling shared by every node kind. All optional so older saved diagrams still load. */
export type NodeStyle = {
  opacity?: number;
};

export type IconNodeData = NodeStyle & {
  label: string;
  iconId: string;
  color?: string;
  sublabel?: string;
  tile?: IconTile;
};

export type ShapeKind =
  | "rectangle"
  | "rounded"
  | "ellipse"
  | "diamond"
  | "cylinder"
  | "hexagon"
  | "triangle"
  | "parallelogram"
  | "note";

export type ShapeNodeData = NodeStyle & {
  label: string;
  shape: ShapeKind;
  fill: string;
  stroke: string;
  textColor: string;
  iconId?: string;
  strokeStyle?: StrokeStyle;
  strokeWidth?: number;
  fillStyle?: FillStyle;
  fontSize?: number;
};

export type FrameNodeData = NodeStyle & {
  label: string;
  color: string;
  /** @deprecated use strokeStyle; kept for diagrams saved before it existed */
  dashed?: boolean;
  strokeStyle?: StrokeStyle;
  strokeWidth?: number;
  fillStyle?: FillStyle;
};

export type TextNodeData = NodeStyle & {
  label: string;
  fontSize: number;
  /** Undefined means "auto": follows the canvas ink color (dark on light canvases, light on dark). */
  color?: string;
};

export type IconNodeType = Node<IconNodeData, "icon">;
export type ShapeNodeType = Node<ShapeNodeData, "shape">;
export type FrameNodeType = Node<FrameNodeData, "frame">;
export type TextNodeType = Node<TextNodeData, "text">;

export type AppNode = IconNodeType | ShapeNodeType | FrameNodeType | TextNodeType;

export type EdgePathType = "smoothstep" | "bezier" | "straight" | "step";
export type ArrowMode = "end" | "start" | "both" | "none";

export type LabeledEdgeData = {
  label?: string;
  pathType: EdgePathType;
  color: string;
  /** @deprecated use strokeStyle */
  dashed?: boolean;
  strokeStyle?: StrokeStyle;
  strokeWidth?: number;
  arrows: ArrowMode;
};

export type AppEdge = Edge<LabeledEdgeData, "labeled">;

export type BackgroundKind = "dots" | "lines" | "cross" | "none";

export type CanvasSettings = {
  color: string;
  pattern: BackgroundKind;
  /** PNG/SVG exports get no background fill. */
  transparentExport: boolean;
};

export type DiagramDoc = {
  version: 1;
  title: string;
  nodes: AppNode[];
  edges: AppEdge[];
  canvas?: CanvasSettings;
};

export type DragPayload =
  | { kind: "icon"; iconId: string }
  | { kind: "shape"; shape: ShapeKind }
  | { kind: "frame" }
  | { kind: "text" };

export const DRAG_MIME = "application/x-archflow";
