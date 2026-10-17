"use client";

import { createContext, useContext } from "react";

export type EditorContextValue = {
  takeSnapshot: (key?: string) => void;
  openIconPicker: (nodeId: string) => void;
  editingEdgeId: string | null;
  setEditingEdgeId: (id: string | null) => void;
  /** True when the canvas background is dark; nodes use it to keep dark icons visible. */
  canvasDark: boolean;
};

export const EditorContext = createContext<EditorContextValue | null>(null);

export function useEditor() {
  const ctx = useContext(EditorContext);
  if (!ctx) throw new Error("useEditor must be used inside EditorContext");
  return ctx;
}
