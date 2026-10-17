"use client";

import dynamic from "next/dynamic";

// The editor reads localStorage on first render, so it only renders in the browser.
const Editor = dynamic(() => import("./Editor"), {
  ssr: false,
  loading: () => (
    <div className="flex h-screen items-center justify-center bg-slate-50 text-sm text-slate-500">Loading editor…</div>
  ),
});

export function EditorLoader() {
  return <Editor />;
}
