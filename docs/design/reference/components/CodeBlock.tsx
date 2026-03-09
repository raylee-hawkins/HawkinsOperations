"use client";

import { useState } from "react";

type CodeBlockProps = {
  code: string;
  language?: string;
};

// WHY: Demo and project pages need copyable commands that stay readable
// without relying on a heavy syntax-highlighting dependency.
export default function CodeBlock({
  code,
  language = "text"
}: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1200);
  }

  return (
    <div className="overflow-hidden rounded-xl border border-neutral-200 bg-neutral-950 shadow-soft dark:border-neutral-700">
      <div className="flex items-center justify-between border-b border-neutral-800 px-4 py-3 font-mono text-xs uppercase tracking-[0.18em] text-neutral-400">
        <span>{language}</span>
        <button
          type="button"
          onClick={handleCopy}
          className="rounded-md border border-neutral-700 px-3 py-1 text-neutral-200 transition hover:border-primary-500 hover:text-white"
        >
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre className="overflow-x-auto p-4 text-sm leading-6 text-neutral-100">
        <code>{code}</code>
      </pre>
    </div>
  );
}
