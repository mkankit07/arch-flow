import { useCallback, useEffect, useRef, useState } from "react";
import type { AppEdge, AppNode } from "./types";

type Snapshot = { nodes: AppNode[]; edges: AppEdge[] };

const MAX_HISTORY = 100;
const COALESCE_MS = 1000;

/**
 * Snapshot-based undo/redo. Call `takeSnapshot()` right before a change.
 * Passing a `key` merges rapid repeated snapshots (e.g. typing in a field) into one step.
 */
export function useHistory(
  nodes: AppNode[],
  edges: AppEdge[],
  setNodes: (nodes: AppNode[]) => void,
  setEdges: (edges: AppEdge[]) => void,
) {
  const past = useRef<Snapshot[]>([]);
  const future = useRef<Snapshot[]>([]);
  const current = useRef<Snapshot>({ nodes, edges });
  const lastKey = useRef<{ key?: string; t: number }>({ t: 0 });
  const [counts, setCounts] = useState({ past: 0, future: 0 });

  useEffect(() => {
    current.current = { nodes, edges };
  }, [nodes, edges]);

  const sync = useCallback(
    () => setCounts({ past: past.current.length, future: future.current.length }),
    [],
  );

  const takeSnapshot = useCallback(
    (key?: string) => {
      const now = Date.now();
      if (key && lastKey.current.key === key && now - lastKey.current.t < COALESCE_MS) {
        lastKey.current.t = now;
        return;
      }
      lastKey.current = { key, t: now };
      past.current.push(current.current);
      if (past.current.length > MAX_HISTORY) past.current.shift();
      future.current = [];
      sync();
    },
    [sync],
  );

  const undo = useCallback(() => {
    const prev = past.current.pop();
    if (!prev) return;
    future.current.push(current.current);
    lastKey.current = { t: 0 };
    setNodes(prev.nodes);
    setEdges(prev.edges);
    sync();
  }, [setNodes, setEdges, sync]);

  const redo = useCallback(() => {
    const next = future.current.pop();
    if (!next) return;
    past.current.push(current.current);
    lastKey.current = { t: 0 };
    setNodes(next.nodes);
    setEdges(next.edges);
    sync();
  }, [setNodes, setEdges, sync]);

  return { takeSnapshot, undo, redo, canUndo: counts.past > 0, canRedo: counts.future > 0 };
}
