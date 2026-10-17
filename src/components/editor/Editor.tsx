"use client";

import {
  Background,
  BackgroundVariant,
  ConnectionLineType,
  ConnectionMode,
  Controls,
  MiniMap,
  ReactFlow,
  ReactFlowProvider,
  SelectionMode,
  useEdgesState,
  useNodesState,
  useReactFlow,
  type Connection,
  type Node,
  type XYPosition,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties, type DragEvent } from "react";
import { exportDiagram, exportJson, parseDoc, type ExportFormat } from "@/lib/export";
import { createEdge, createNode, DEFAULT_EDGE_DATA, markersFor, sortParentsFirst, uid } from "@/lib/factory";
import { useHistory } from "@/lib/history";
import { blankDoc, sampleDoc } from "@/lib/sample";
import { canvasInk, canvasMutedInk, DEFAULT_CANVAS, isDarkColor, patternColor } from "@/lib/style";
import { DRAG_MIME, type AppEdge, type AppNode, type CanvasSettings, type DiagramDoc, type DragPayload } from "@/lib/types";
import { edgeTypes } from "./edges";
import { EditorContext, type EditorContextValue } from "./EditorContext";
import { IconPicker } from "./IconPicker";
import { nodeTypes } from "./nodes";
import { PropertiesPanel, type BulkStyle, type EdgePatch } from "./PropertiesPanel";
import { Sidebar } from "./Sidebar";
import { Toolbar, type Tool } from "./Toolbar";

const STORAGE_KEY = "archflow:diagram:v1";

function loadInitial(): DiagramDoc {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return parseDoc(raw);
  } catch {
    // fall through to the sample
  }
  return sampleDoc();
}

function isTypingTarget(t: EventTarget | null) {
  const el = t as HTMLElement | null;
  return !!el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.tagName === "SELECT" || el.isContentEditable);
}

export default function Editor() {
  return (
    <ReactFlowProvider>
      <EditorInner />
    </ReactFlowProvider>
  );
}

function EditorInner() {
  const [initial] = useState(loadInitial);
  const [nodes, setNodes, onNodesChange] = useNodesState<AppNode>(initial.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState<AppEdge>(initial.edges);
  const [title, setTitle] = useState(initial.title);
  const [tool, setTool] = useState<Tool>("select");
  const [canvas, setCanvas] = useState<CanvasSettings>({ ...DEFAULT_CANVAS, ...initial.canvas });
  const [iconPickerFor, setIconPickerFor] = useState<string | null>(null);
  const [editingEdgeId, setEditingEdgeId] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const clipboard = useRef<{ nodes: AppNode[]; edges: AppEdge[] } | null>(null);
  const rf = useReactFlow<AppNode, AppEdge>();
  const { takeSnapshot, undo, redo, canUndo, canRedo } = useHistory(nodes, edges, setNodes, setEdges);

  const selectedNodes = useMemo(() => nodes.filter((n) => n.selected), [nodes]);
  const selectedEdges = useMemo(() => edges.filter((e) => e.selected), [edges]);

  const notify = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2200);
  }, []);

  // Autosave to the browser.
  useEffect(() => {
    const t = setTimeout(() => {
      try {
        const doc: DiagramDoc = { version: 1, title, nodes, edges, canvas };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(doc));
      } catch {
        // storage full or unavailable — ignore
      }
    }, 400);
    return () => clearTimeout(t);
  }, [nodes, edges, title, canvas]);

  // ---------- Adding nodes ----------

  const insertNode = useCallback(
    (payload: DragPayload, center: XYPosition) => {
      takeSnapshot();
      const node = { ...createNode(payload, center), selected: true } as AppNode;
      setNodes((ns) => {
        const cleared = ns.map((n) => (n.selected ? { ...n, selected: false } : n));
        // Frames go first so they render beneath everything else.
        return node.type === "frame" ? [node, ...cleared] : [...cleared, node];
      });
      setEdges((es) => es.map((e) => (e.selected ? { ...e, selected: false } : e)));
    },
    [setNodes, setEdges, takeSnapshot],
  );

  const addAtCenter = useCallback(
    (payload: DragPayload) => {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;
      const jitter = () => (Math.random() - 0.5) * 60;
      const center = rf.screenToFlowPosition({ x: rect.left + rect.width / 2 + jitter(), y: rect.top + rect.height / 2 + jitter() });
      insertNode(payload, center);
    },
    [rf, insertNode],
  );

  const onDragOver = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback(
    (e: DragEvent) => {
      e.preventDefault();
      const raw = e.dataTransfer.getData(DRAG_MIME);
      if (!raw) return;
      const payload = JSON.parse(raw) as DragPayload;
      insertNode(payload, rf.screenToFlowPosition({ x: e.clientX, y: e.clientY }));
    },
    [rf, insertNode],
  );

  // ---------- Connections ----------

  const onConnect = useCallback(
    (c: Connection) => {
      if (c.source === c.target) return;
      takeSnapshot();
      setEdges((es) => [...es, createEdge(c)]);
    },
    [setEdges, takeSnapshot],
  );

  // ---------- Grouping: drop nodes into / out of frames ----------

  const onNodeDragStop = useCallback(
    (_: unknown, __: Node, dragged: Node[]) => {
      const frames = rf.getNodes().filter((n) => n.type === "frame");
      if (frames.length === 0) return;
      const updates = new Map<string, { parentId?: string; position: XYPosition }>();

      for (const node of dragged) {
        if (node.type === "frame") continue;
        const internal = rf.getInternalNode(node.id);
        if (!internal) continue;
        const abs = internal.internals.positionAbsolute;
        const w = internal.measured.width ?? 0;
        const h = internal.measured.height ?? 0;
        const center = { x: abs.x + w / 2, y: abs.y + h / 2 };
        const hit = rf
          .getIntersectingNodes({ x: center.x, y: center.y, width: 1, height: 1 })
          .filter((n) => n.type === "frame" && n.id !== node.id)
          .at(-1);

        if (hit && hit.id !== node.parentId) {
          const frameAbs = rf.getInternalNode(hit.id)!.internals.positionAbsolute;
          updates.set(node.id, { parentId: hit.id, position: { x: abs.x - frameAbs.x, y: abs.y - frameAbs.y } });
        } else if (!hit && node.parentId) {
          updates.set(node.id, { parentId: undefined, position: { ...abs } });
        }
      }

      if (updates.size === 0) return;
      setNodes((ns) =>
        sortParentsFirst(
          ns.map((n) => {
            const u = updates.get(n.id);
            return u ? ({ ...n, parentId: u.parentId, position: u.position, extent: undefined } as AppNode) : n;
          }),
        ),
      );
    },
    [rf, setNodes],
  );

  // ---------- Editing ----------

  const onNodeChange = useCallback(
    (id: string, patch: Record<string, unknown>, key: string) => {
      takeSnapshot(`node:${id}:${key}`);
      rf.updateNodeData(id, patch);
    },
    [rf, takeSnapshot],
  );

  const onEdgeChange = useCallback(
    (id: string, patch: EdgePatch, key: string) => {
      takeSnapshot(`edge:${id}:${key}`);
      const { animated, ...dataPatch } = patch;
      setEdges((es) =>
        es.map((e) => {
          if (e.id !== id) return e;
          const data = { ...DEFAULT_EDGE_DATA, ...e.data, ...dataPatch };
          return { ...e, data, animated: animated ?? e.animated, ...markersFor(data.arrows, data.color, data.strokeWidth) };
        }),
      );
    },
    [setEdges, takeSnapshot],
  );

  const onBulkStyle = useCallback(
    ({ strokeStyle, opacity }: BulkStyle) => {
      takeSnapshot(`bulk:${strokeStyle ? "stroke" : "opacity"}`);
      setNodes((ns) =>
        ns.map((n) => {
          if (!n.selected) return n;
          const data: Record<string, unknown> = { ...n.data };
          if (opacity !== undefined) data.opacity = opacity;
          if (strokeStyle && (n.type === "shape" || n.type === "frame")) {
            data.strokeStyle = strokeStyle;
            delete data.dashed;
          }
          return { ...n, data } as AppNode;
        }),
      );
      if (strokeStyle) {
        setEdges((es) =>
          es.map((e) => (e.selected && e.data ? { ...e, data: { ...e.data, strokeStyle, dashed: undefined } } : e)),
        );
      }
    },
    [setNodes, setEdges, takeSnapshot],
  );

  const onPickIcon = useCallback(
    (iconId: string) => {
      if (!iconPickerFor) return;
      takeSnapshot();
      rf.updateNodeData(iconPickerFor, { iconId });
      setIconPickerFor(null);
    },
    [iconPickerFor, rf, takeSnapshot],
  );

  // ---------- Clipboard ----------

  const copySelection = useCallback(() => {
    const all = rf.getNodes();
    const sel = all.filter((n) => n.selected);
    // Include children of copied frames.
    const ids = new Set(sel.map((n) => n.id));
    for (const n of all) if (n.parentId && ids.has(n.parentId)) ids.add(n.id);
    const picked = all
      .filter((n) => ids.has(n.id))
      .map((n) => {
        if (n.parentId && !ids.has(n.parentId)) {
          const abs = rf.getInternalNode(n.id)?.internals.positionAbsolute ?? n.position;
          return { ...n, parentId: undefined, position: { ...abs } } as AppNode;
        }
        return n;
      });
    const pickedEdges = rf.getEdges().filter((e) => ids.has(e.source) && ids.has(e.target));
    clipboard.current = { nodes: picked, edges: pickedEdges };
    return picked.length > 0;
  }, [rf]);

  const paste = useCallback(() => {
    const clip = clipboard.current;
    if (!clip || clip.nodes.length === 0) return;
    takeSnapshot();
    const idMap = new Map(clip.nodes.map((n) => [n.id, uid(n.type)]));
    const newNodes = clip.nodes.map(
      (n) =>
        ({
          ...n,
          id: idMap.get(n.id)!,
          parentId: n.parentId ? idMap.get(n.parentId) : undefined,
          position: n.parentId ? n.position : { x: n.position.x + 32, y: n.position.y + 32 },
          selected: !n.parentId,
        }) as AppNode,
    );
    const newEdges = clip.edges.map((e) => ({
      ...e,
      id: uid("e"),
      source: idMap.get(e.source)!,
      target: idMap.get(e.target)!,
      selected: false,
    }));
    setNodes((ns) => sortParentsFirst([...ns.map((n) => ({ ...n, selected: false }) as AppNode), ...newNodes]));
    setEdges((es) => [...es.map((e) => ({ ...e, selected: false })), ...newEdges]);
    // Next paste cascades further.
    clipboard.current = { nodes: newNodes.map((n) => ({ ...n, selected: false })), edges: newEdges };
  }, [setNodes, setEdges, takeSnapshot]);

  const duplicate = useCallback(() => {
    if (copySelection()) paste();
  }, [copySelection, paste]);

  const deleteSelection = useCallback(() => {
    const ns = rf.getNodes().filter((n) => n.selected);
    const es = rf.getEdges().filter((e) => e.selected);
    if (ns.length + es.length === 0) return;
    // onBeforeDelete records the undo snapshot.
    void rf.deleteElements({ nodes: ns, edges: es });
  }, [rf]);

  // ---------- File / export ----------

  const loadDoc = useCallback(
    (doc: DiagramDoc) => {
      takeSnapshot();
      setNodes(sortParentsFirst(doc.nodes));
      setEdges(doc.edges);
      setTitle(doc.title);
      setCanvas({ ...DEFAULT_CANVAS, ...doc.canvas });
      requestAnimationFrame(() => rf.fitView({ padding: 0.2, duration: 300 }));
    },
    [rf, setNodes, setEdges, takeSnapshot],
  );

  const handleExport = useCallback(
    async (format: ExportFormat) => {
      const all = rf.getNodes();
      if (all.length === 0) {
        notify("Nothing to export yet — add some nodes first.");
        return;
      }
      setExporting(true);
      setEditingEdgeId(null);
      setNodes((ns) => ns.map((n) => (n.selected ? { ...n, selected: false } : n)));
      setEdges((es) => es.map((e) => (e.selected ? { ...e, selected: false } : e)));
      // Let the deselection paint so outlines don't end up in the image.
      await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
      try {
        await exportDiagram(format, rf.getNodesBounds(all), {
          title,
          background: canvas.color,
          transparent: canvas.transparentExport,
        });
        notify(`Exported as ${format.toUpperCase()}`);
      } catch (err) {
        console.error(err);
        notify("Export failed — see console for details.");
      } finally {
        setExporting(false);
      }
    },
    [rf, title, canvas, setNodes, setEdges, notify],
  );

  const saveJson = useCallback(() => {
    exportJson({ version: 1, title, nodes: rf.getNodes(), edges: rf.getEdges(), canvas });
  }, [rf, title, canvas]);

  const onFileChosen = useCallback(
    async (file: File | undefined) => {
      if (!file) return;
      try {
        loadDoc(parseDoc(await file.text()));
        notify(`Opened ${file.name}`);
      } catch {
        notify("Could not read that file.");
      }
    },
    [loadDoc, notify],
  );

  // ---------- Keyboard shortcuts ----------

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (isTypingTarget(e.target) || iconPickerFor) return;
      const mod = e.metaKey || e.ctrlKey;
      const k = e.key.toLowerCase();
      if (mod && k === "z") {
        e.preventDefault();
        if (e.shiftKey) redo();
        else undo();
      } else if (mod && k === "y") {
        e.preventDefault();
        redo();
      } else if (mod && k === "c") {
        copySelection();
      } else if (mod && k === "v") {
        e.preventDefault();
        paste();
      } else if (mod && k === "d") {
        e.preventDefault();
        duplicate();
      } else if (mod && k === "s") {
        e.preventDefault();
        saveJson();
      } else if (mod && k === "a") {
        e.preventDefault();
        setNodes((ns) => ns.map((n) => ({ ...n, selected: true })));
      } else if (!mod && k === "v") {
        setTool("select");
      } else if (!mod && k === "h") {
        setTool("hand");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [undo, redo, copySelection, paste, duplicate, saveJson, setNodes, iconPickerFor]);

  const ctx = useMemo<EditorContextValue>(
    () => ({ takeSnapshot, openIconPicker: setIconPickerFor, editingEdgeId, setEditingEdgeId, canvasDark: isDarkColor(canvas.color) }),
    [takeSnapshot, editingEdgeId, canvas.color],
  );

  const pickerNode = iconPickerFor ? nodes.find((n) => n.id === iconPickerFor) : undefined;
  const pickerCurrent = pickerNode && (pickerNode.type === "icon" || pickerNode.type === "shape") ? pickerNode.data.iconId : undefined;

  return (
    <EditorContext.Provider value={ctx}>
      <div className="flex h-screen w-screen flex-col overflow-hidden bg-slate-50 text-slate-900">
        <Toolbar
          title={title}
          onTitleChange={setTitle}
          tool={tool}
          onToolChange={setTool}
          canUndo={canUndo}
          canRedo={canRedo}
          onUndo={undo}
          onRedo={redo}
          onExport={handleExport}
          onSaveJson={saveJson}
          onOpenJson={() => fileRef.current?.click()}
          onNew={() => loadDoc(blankDoc())}
          onLoadSample={() => loadDoc(sampleDoc())}
          exporting={exporting}
        />
        <div className="flex min-h-0 flex-1">
          <Sidebar onAdd={addAtCenter} />
          <div
            ref={canvasRef}
            className="relative min-w-0 flex-1"
            style={{ "--canvas-ink": canvasInk(canvas.color), "--canvas-muted": canvasMutedInk(canvas.color) } as CSSProperties}
            onDragOver={onDragOver}
            onDrop={onDrop}
          >
            <ReactFlow<AppNode, AppEdge>
              nodes={nodes}
              edges={edges}
              nodeTypes={nodeTypes}
              edgeTypes={edgeTypes}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onNodeDragStart={() => takeSnapshot()}
              onNodeDragStop={onNodeDragStop}
              onBeforeDelete={async () => {
                takeSnapshot();
                return true;
              }}
              onEdgeDoubleClick={(_, edge) => setEditingEdgeId(edge.id)}
              connectionMode={ConnectionMode.Loose}
              connectionLineType={ConnectionLineType.SmoothStep}
              connectionLineStyle={{ stroke: "#6366f1", strokeWidth: 2 }}
              selectionOnDrag={tool === "select"}
              selectionMode={SelectionMode.Partial}
              panOnDrag={tool === "hand" ? true : [1, 2]}
              panOnScroll
              zoomOnDoubleClick={false}
              deleteKeyCode={["Backspace", "Delete"]}
              multiSelectionKeyCode={["Meta", "Shift", "Control"]}
              snapToGrid
              snapGrid={[8, 8]}
              minZoom={0.1}
              maxZoom={3}
              fitView
              fitViewOptions={{ padding: 0.2 }}
              proOptions={{ hideAttribution: true }}
              className={tool === "hand" ? "cursor-grab" : ""}
              colorMode={isDarkColor(canvas.color) ? "dark" : "light"}
              style={{ backgroundColor: canvas.color }}
            >
              {canvas.pattern !== "none" && (
                <Background
                  bgColor={canvas.color}
                  variant={
                    canvas.pattern === "dots" ? BackgroundVariant.Dots : canvas.pattern === "cross" ? BackgroundVariant.Cross : BackgroundVariant.Lines
                  }
                  gap={canvas.pattern === "dots" ? 20 : canvas.pattern === "cross" ? 28 : 32}
                  size={canvas.pattern === "dots" ? 1.4 : canvas.pattern === "cross" ? 5 : 1}
                  color={patternColor(canvas.color, canvas.pattern)}
                />
              )}
              <Controls position="bottom-left" showInteractive={false} />
              <MiniMap position="bottom-right" pannable zoomable nodeColor="#c7d2fe" maskColor={isDarkColor(canvas.color) ? "rgba(2,6,23,0.6)" : "rgba(241,245,249,0.7)"} className="!rounded-lg !border !border-slate-200" />
            </ReactFlow>
            {nodes.length === 0 && (
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <div className="rounded-2xl border border-dashed border-slate-300 bg-white/70 px-8 py-6 text-center">
                  <div className="text-[15px] font-semibold text-slate-700">Start your architecture</div>
                  <div className="mt-1 text-[13px] text-slate-500">Drag icons or shapes from the left panel onto the canvas</div>
                </div>
              </div>
            )}
            {toast && (
              <div className="pointer-events-none absolute left-1/2 top-4 z-40 -translate-x-1/2 rounded-lg bg-slate-900 px-3.5 py-2 text-[13px] text-white shadow-lg">
                {toast}
              </div>
            )}
          </div>
          <PropertiesPanel
            selectedNodes={selectedNodes}
            selectedEdges={selectedEdges}
            onNodeChange={onNodeChange}
            onEdgeChange={onEdgeChange}
            onPickIcon={setIconPickerFor}
            onDuplicate={duplicate}
            onDelete={deleteSelection}
            onBulkStyle={onBulkStyle}
            canvas={canvas}
            onCanvasChange={(patch) => setCanvas((c) => ({ ...c, ...patch }))}
          />
        </div>
      </div>
      <input
        ref={fileRef}
        type="file"
        accept="application/json,.json"
        className="hidden"
        onChange={(e) => {
          void onFileChosen(e.target.files?.[0]);
          e.target.value = "";
        }}
      />
      {iconPickerFor && <IconPicker current={pickerCurrent} onSelect={onPickIcon} onClose={() => setIconPickerFor(null)} />}
    </EditorContext.Provider>
  );
}
