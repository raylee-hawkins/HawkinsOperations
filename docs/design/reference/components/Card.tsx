import Link from "next/link";

type CardProps = {
  title: string;
  excerpt: string;
  href: string;
  eyebrow?: string;
  metrics?: Array<{ label: string; value: string }>;
};

// WHY: Cards are the fastest recruiter-scanning unit on the site,
// so each card carries one idea, one CTA, and one short proof cluster.
export default function Card({
  title,
  excerpt,
  href,
  eyebrow,
  metrics = []
}: CardProps) {
  return (
    <article className="flex h-full flex-col rounded-xl border border-neutral-200 bg-white p-5 shadow-soft transition hover:-translate-y-0.5 hover:border-primary-700 dark:border-neutral-800 dark:bg-neutral-800">
      {eyebrow ? (
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-primary-700">
          {eyebrow}
        </p>
      ) : null}
      <h3 className="mt-3 text-xl font-semibold text-neutral-900 dark:text-neutral-50">
        {title}
      </h3>
      <p className="mt-3 flex-1 text-sm leading-6 text-neutral-600 dark:text-neutral-300">
        {excerpt}
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        {metrics.map((metric) => (
          <span
            key={`${metric.label}-${metric.value}`}
            className="rounded-full bg-neutral-100 px-3 py-1 font-mono text-xs text-neutral-600 dark:bg-neutral-700 dark:text-neutral-200"
          >
            {metric.label}: {metric.value}
          </span>
        ))}
      </div>
      <Link
        href={href}
        className="mt-5 inline-flex items-center text-sm font-medium text-primary-700 transition hover:text-primary-800"
      >
        Open project
      </Link>
    </article>
  );
}
