# ArchFlow — System Architecture Designer

An Eraser.io-style diagram editor for system architecture, built with Next.js, React Flow, and Tailwind.

## Run

```bash
npm install
npm run dev      # http://localhost:3000
```

## Features

- **Icon library** — 100+ icons (clients, compute, data, networking, messaging, security, DevOps, and brand icons like AWS, Kubernetes, Postgres, Kafka, Redis). Search, click to add, or drag onto the canvas. Double-click an icon node (or use the right panel) to swap its icon.
- **Shapes** — rectangle, rounded, ellipse, diamond, cylinder, sticky note, text, and resizable **groups** (drag nodes into a group to nest them).
- **Connections** — drag from any side dot; elbow / step / curve / straight lines, arrowheads, colors, dashed, animated, and editable labels (double-click).
- **Export** — JPEG, PDF, PNG, SVG (the whole diagram, not just the visible area), plus save/open `.json`.
- **Editing** — undo/redo, copy/paste/duplicate, box select, snap to grid, autosave to the browser.

## Code map

- `src/components/editor/Editor.tsx` — canvas, state, shortcuts, grouping, export wiring
- `src/components/editor/nodes/` — icon, shape, group, and text nodes
- `src/components/editor/edges.tsx` — labeled edge
- `src/lib/icons.tsx` — icon registry (add new icons here)
- `src/lib/export.ts` — JPEG/PNG/SVG/PDF/JSON export
