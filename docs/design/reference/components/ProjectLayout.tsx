import type { ReactNode } from "react";

type ProjectLayoutProps = {
  title: string;
  summary: string;
  aside: ReactNode;
  children: ReactNode;
};

// WHY: Project pages need a consistent outcome-first frame so reviewers understand
// value before dropping into architecture, metrics, proof links, and demo details.
export default function ProjectLayout({
  title,
  summary,
  aside,
  children
}: ProjectLayoutProps) {
  return (
    <main className="bg-neutral-50 text-neutral-900 dark:bg-neutral-900 dark:text-neutral-50">
      <div className="mx-auto max-w-6xl px-6 py-12 md:py-16">
        <header className="grid gap-8 md:grid-cols-12">
          <div className="md:col-span-8">
            <p className="font-mono text-sm uppercase tracking-[0.24em] text-primary-700">
              Featured project
            </p>
            <h1 className="mt-4 text-4xl font-semibold leading-tight">{title}</h1>
            <p className="mt-4 max-w-3xl text-lg leading-7 text-neutral-600 dark:text-neutral-300">
              {summary}
            </p>
          </div>
          <aside className="md:col-span-4">{aside}</aside>
        </header>
        <div className="mt-10 grid gap-8 md:grid-cols-12">
          <div className="md:col-span-8">{children}</div>
          <div className="md:col-span-4">
            <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-soft dark:border-neutral-800 dark:bg-neutral-800">
              <h2 className="text-lg font-semibold">Reviewer lane</h2>
              <ul className="mt-4 space-y-3 text-sm leading-6 text-neutral-600 dark:text-neutral-300">
                <li>Outcome first, then workflow.</li>
                <li>Keep proof links visible in the right rail.</li>
                <li>Avoid burying repo and lab evidence under screenshots.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
