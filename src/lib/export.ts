import type { Rect } from "@xyflow/react";
import { toJpeg, toPng, toSvg } from "html-to-image";
import type { DiagramDoc } from "./types";

export type ExportFormat = "jpeg" | "png" | "svg" | "pdf";

const PADDING = 48;
const MAX_CANVAS_DIM = 8000;

export function slugify(title: string) {
  return (
    title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "") || "diagram"
  );
}

function download(href: string, filename: string) {
  const a = document.createElement("a");
  a.href = href;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

/** Skip editor-only chrome (connection handles, resize grips) in exported images. */
function exportFilter(node: HTMLElement) {
  if (!(node instanceof HTMLElement)) return true;
  const cl = node.classList;
  return !(
    cl.contains("react-flow__handle") ||
    cl.contains("react-flow__resize-control") ||
    cl.contains("export-exclude")
  );
}

/**
 * Renders the whole diagram (not just the visible viewport) by re-transforming the
 * React Flow viewport element so the content bounds sit at the image origin.
 */
export async function exportDiagram(
  format: ExportFormat,
  bounds: Rect,
  opts: { title: string; background: string; transparent?: boolean },
) {
  const viewport = document.querySelector<HTMLElement>(".react-flow__viewport");
  if (!viewport) throw new Error("Canvas not found");

  const width = Math.ceil(bounds.width + PADDING * 2);
  const height = Math.ceil(bounds.height + PADDING * 2);
  const pixelRatio = Math.max(0.5, Math.min(2, MAX_CANVAS_DIM / Math.max(width, height)));

  const options = {
    // JPEG and PDF have no alpha channel, so they always get the canvas color.
    backgroundColor: opts.transparent && (format === "png" || format === "svg") ? undefined : opts.background,
    width,
    height,
    pixelRatio,
    filter: exportFilter,
    style: {
      width: `${width}px`,
      height: `${height}px`,
      transform: `translate(${PADDING - bounds.x}px, ${PADDING - bounds.y}px) scale(1)`,
    },
  };

  const name = slugify(opts.title);

  switch (format) {
    case "png":
      download(await toPng(viewport, options), `${name}.png`);
      return;
    case "svg":
      download(await toSvg(viewport, options), `${name}.svg`);
      return;
    case "jpeg":
      download(await toJpeg(viewport, { ...options, backgroundColor: opts.background, quality: 0.95 }), `${name}.jpg`);
      return;
    case "pdf": {
      const dataUrl = await toJpeg(viewport, { ...options, backgroundColor: opts.background, quality: 0.95 });
      const { jsPDF } = await import("jspdf");
      const pdf = new jsPDF({
        orientation: width >= height ? "landscape" : "portrait",
        unit: "px",
        format: [width, height],
        hotfixes: ["px_scaling"],
        compress: true,
      });
      pdf.setProperties({ title: opts.title, creator: "ArchFlow" });
      pdf.addImage(dataUrl, "JPEG", 0, 0, width, height);
      pdf.save(`${name}.pdf`);
      return;
    }
  }
}

export function exportJson(doc: DiagramDoc) {
  const blob = new Blob([JSON.stringify(doc, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  download(url, `${slugify(doc.title)}.json`);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function parseDoc(text: string): DiagramDoc {
  const raw = JSON.parse(text);
  if (!raw || !Array.isArray(raw.nodes) || !Array.isArray(raw.edges)) {
    throw new Error("Not a valid diagram file");
  }
  return {
    version: 1,
    title: typeof raw.title === "string" ? raw.title : "Imported diagram",
    nodes: raw.nodes,
    edges: raw.edges,
    canvas: raw.canvas && typeof raw.canvas === "object" ? raw.canvas : undefined,
  };
}
