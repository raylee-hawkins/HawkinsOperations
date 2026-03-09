"use client";

import { useState } from "react";

type DemoRunnerProps = {
  command?: string;
};

// WHY: The demo runner should show intent and local execution steps without pretending
// to run production infrastructure or embedding anything sensitive in the UI.
export default function DemoRunner({
  command = "pwsh -File .\\scripts\\run-demo.ps1 -Mode dry-run"
}: DemoRunnerProps) {
  const [output, setOutput] = useState<string[]>([]);

  function handleRun() {
    setOutput([
      "Demo is local-only by design.",
      "Copy the command below and run it in your own environment.",
      command
    ]);
  }

  return (
    <section className="rounded-xl border border-neutral-200 bg-white p-5 shadow-soft dark:border-neutral-800 dark:bg-neutral-800">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-50">
            Demo runner
          </h2>
          <p className="mt-2 text-sm leading-6 text-neutral-600 dark:text-neutral-300">
            Keep the interaction honest: show users how to run the demo locally instead of
            simulating hidden backend work from the browser.
          </p>
        </div>
        <button
          type="button"
          onClick={handleRun}
          className="rounded-md bg-primary-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-primary-800"
        >
          Show local command
        </button>
      </div>
      <div className="mt-5 rounded-lg bg-neutral-950 p-4 font-mono text-sm text-neutral-100">
        {output.length === 0 ? "No command shown yet." : output.map((line) => <p key={line}>{line}</p>)}
      </div>
    </section>
  );
}
