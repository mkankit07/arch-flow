"use client";

import {
  BaseEdge,
  EdgeLabelRenderer,
  getBezierPath,
  getSmoothStepPath,
  getStraightPath,
  useReactFlow,
  type EdgeProps,
  type EdgeTypes,
} from "@xyflow/react";
import { useState } from "react";
import type { AppEdge } from "@/lib/types";
import { useEditor } from "./EditorContext";

function EdgeLabelInput({ id, value, onDone }: { id: string; value: string; onDone: () => void }) {
  const { takeSnapshot } = useEditor();
  const { updateEdgeData } = useReactFlow();
  const [draft, setDraft] = useState(value);
  const commit = () => {
    if (draft !== value) {
      takeSnapshot();
      updateEdgeData(id, { label: draft });
    }
    onDone();
  };
  return (
    <input
      autoFocus
      className="nodrag nopan w-32 rounded-md border border-indigo-400 bg-white px-2 py-0.5 text-center text-[11px] text-slate-700 shadow outline-none"
      value={draft}
      placeholder="Label"
      onChange={(e) => setDraft(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => {
        e.stopPropagation();
        if (e.key === "Enter") commit();
        if (e.key === "Escape") onDone();
      }}
    />
  );
}

function LabeledEdge(props: EdgeProps<AppEdge>) {
  const { id, data, selected, markerEnd, markerStart, animated } = props;
  const { editingEdgeId, setEditingEdgeId } = useEditor();
  const pathType = data?.pathType ?? "smoothstep";

  const [path, labelX, labelY] =
    pathType === "bezier"
      ? getBezierPath(props)
      : pathType === "straight"
        ? getStraightPath(props)
        : getSmoothStepPath({ ...props, borderRadius: pathType === "step" ? 0 : 10, offset: 24 });

  const color = data?.color ?? "#64748b";
  const editing = editingEdgeId === id;
  const label = data?.label ?? "";

  return (
    <>
      <BaseEdge
        id={id}
        path={path}
        markerEnd={markerEnd}
        markerStart={markerStart}
        interactionWidth={24}
        style={{
          stroke: selected ? "#6366f1" : color,
          strokeWidth: selected ? 2.5 : 1.75,
          strokeDasharray: data?.dashed && !animated ? "6 5" : undefined,
        }}
      />
      {(label || editing) && (
        <EdgeLabelRenderer>
          <div
            className="nodrag nopan absolute"
            style={{ transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`, pointerEvents: "all" }}
          >
            {editing ? (
              <EdgeLabelInput id={id} value={label} onDone={() => setEditingEdgeId(null)} />
            ) : (
              <div
                onDoubleClick={() => setEditingEdgeId(id)}
                className={`cursor-text rounded-md border bg-white px-2 py-0.5 text-[11px] font-medium shadow-sm ${selected ? "border-indigo-400 text-indigo-600" : "border-slate-200 text-slate-600"}`}
              >
                {label}
              </div>
            )}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
}

export const edgeTypes: EdgeTypes = { labeled: LabeledEdge };
