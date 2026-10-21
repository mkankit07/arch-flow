"use client";

import { Handle, NodeResizer, Position, useReactFlow } from "@xyflow/react";
import { useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import { useEditor } from "../EditorContext";

const SIDES = [
  [Position.Top, "t"],
  [Position.Right, "r"],
  [Position.Bottom, "b"],
  [Position.Left, "l"],
] as const;

/** One handle per side; the canvas uses loose connection mode so any handle can start or end an edge. */
export function NodeHandles() {
  return (
    <>
      {SIDES.map(([position, id]) => (
        <Handle key={id} id={id} type="source" position={position} className="arch-handle" />
      ))}
    </>
  );
}

export function Resizer({ selected, minWidth = 60, minHeight = 40 }: { selected: boolean; minWidth?: number; minHeight?: number }) {
  const { takeSnapshot } = useEditor();
  return (
    <NodeResizer
      isVisible={selected}
      minWidth={minWidth}
      minHeight={minHeight}
      onResizeStart={() => takeSnapshot()}
      lineClassName="arch-resize-line"
      handleClassName="arch-resize-handle"
    />
  );
}

export function EditableLabel({
  nodeId,
  value,
  className,
  style,
  placeholder = "Label",
  multiline = false,
}: {
  nodeId: string;
  value: string;
  className?: string;
  style?: CSSProperties;
  placeholder?: string;
  /** Enter inserts a line break and Cmd/Ctrl+Enter commits; otherwise Enter commits and Shift+Enter breaks. */
  multiline?: boolean;
}) {
  const { takeSnapshot } = useEditor();
  const { updateNodeData } = useReactFlow();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Grow the textarea with its content, including soft-wrapped lines.
  useLayoutEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [editing, draft]);

  const commit = () => {
    setEditing(false);
    if (draft !== value) {
      takeSnapshot();
      updateNodeData(nodeId, { label: draft });
    }
  };

  if (editing) {
    return (
      <textarea
        ref={inputRef}
        autoFocus
        rows={1}
        className={`nodrag nopan nowheel arch-label-input ${className ?? ""}`}
        style={style}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onFocus={(e) => e.currentTarget.select()}
        onBlur={commit}
        onKeyDown={(e) => {
          e.stopPropagation();
          const mod = e.metaKey || e.ctrlKey;
          if (e.key === "Enter" && (multiline ? mod : !e.shiftKey)) {
            e.preventDefault();
            commit();
          } else if (e.key === "Escape") {
            setDraft(value);
            setEditing(false);
          }
        }}
      />
    );
  }

  return (
    <div
      className={`whitespace-pre-wrap break-words ${className ?? ""}`}
      style={style}
      onDoubleClick={(e) => {
        e.stopPropagation();
        setDraft(value);
        setEditing(true);
      }}
    >
      {value || <span className="opacity-40">{placeholder}</span>}
    </div>
  );
}
