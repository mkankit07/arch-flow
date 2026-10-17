import type { CanvasSettings, FillStyle, FrameNodeData, LabeledEdgeData, StrokeStyle } from "./types";

export const DEFAULT_CANVAS: CanvasSettings = { color: "#f8fafc", pattern: "dots", transparentExport: false };

export const CANVAS_PRESETS: { name: string; color: string }[] = [
  { name: "Slate", color: "#f8fafc" },
  { name: "White", color: "#ffffff" },
  { name: "Paper", color: "#faf6ee" },
  { name: "Mint", color: "#f0fdf4" },
  { name: "Sky", color: "#eff6ff" },
  { name: "Blueprint", color: "#0c2a4d" },
  { name: "Dark", color: "#0f172a" },
  { name: "Black", color: "#09090b" },
];

export const DEFAULT_STROKE_WIDTH = 1.5;
export const DEFAULT_EDGE_WIDTH = 1.75;

function luminance(hex: string) {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  if (!m) return 1;
  const n = parseInt(m[1], 16);
  const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export const isDarkColor = (hex: string) => luminance(hex) < 0.2;

/** Default text color for labels drawn directly on the canvas. */
export const canvasInk = (bg: string) => (isDarkColor(bg) ? "#e2e8f0" : "#0f172a");
export const canvasMutedInk = (bg: string) => (isDarkColor(bg) ? "#94a3b8" : "#64748b");

export function patternColor(bg: string, pattern: CanvasSettings["pattern"]) {
  if (isDarkColor(bg)) return pattern === "dots" ? "#475569" : "#1e3a5f";
  return pattern === "dots" ? "#cbd5e1" : "#e2e8f0";
}

/** SVG dash pattern for a stroke style, scaled to the stroke width. Dotted needs round line caps. */
export function dashArray(style: StrokeStyle | undefined, width: number): string | undefined {
  if (style === "dashed") return `${width * 4} ${width * 3}`;
  if (style === "dotted") return `0 ${width * 2.5 + 1}`;
  return undefined;
}

export function strokeProps(style: StrokeStyle | undefined, width: number) {
  return {
    strokeWidth: width,
    strokeDasharray: dashArray(style, width),
    strokeLinecap: style === "dotted" ? ("round" as const) : undefined,
  };
}

export function fillProps(fill: string, style: FillStyle | undefined) {
  if (style === "none") return { fill: "transparent" };
  if (style === "semi") return { fill, fillOpacity: 0.45 };
  return { fill };
}

export const frameStrokeStyle = (d: FrameNodeData): StrokeStyle => d.strokeStyle ?? (d.dashed ? "dashed" : "solid");
export const edgeStrokeStyle = (d: LabeledEdgeData | undefined): StrokeStyle =>
  d?.strokeStyle ?? (d?.dashed ? "dashed" : "solid");

/** 6-digit hex + alpha (0–1) → 8-digit hex. */
export function withAlpha(hex: string, alpha: number) {
  const a = Math.round(Math.max(0, Math.min(1, alpha)) * 255)
    .toString(16)
    .padStart(2, "0");
  return `${hex.slice(0, 7)}${a}`;
}
