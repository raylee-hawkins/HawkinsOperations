import Link from "next/link";

// WHY: The hero is the primary LCP region and strongest recruiter-scan surface,
// so the markup stays semantic, concise, and easy to optimize with static media.
export default function Hero() {
  return (
    <section
      aria-labelledby="hero-title"
      className="bg-neutral-50 text-neutral-900 dark:bg-neutral-900 dark:text-neutral-50"
    >
      <div className="mx-auto grid max-w-6xl gap-10 px-6 py-16 md:grid-cols-12 md:py-24">
        <div className="md:col-span-7">
          <p className="font-mono text-sm uppercase tracking-[0.24em] text-primary-700">
            Evidence-first SOC engineering
          </p>
          <h1
            id="hero-title"
            className="mt-4 max-w-3xl text-4xl font-semibold leading-tight md:text-5xl"
          >
            HawkinsOps turns AutoSOC, detections, and lab evidence into recruiter-readable proof.
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-7 text-neutral-600 dark:text-neutral-300">
            The site should feel modern without losing the operational tone. This hero keeps the
            value proposition plain, fast to scan, and easy to render efficiently.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              href="/case-study-autosoc"
              className="inline-flex items-center rounded-md bg-primary-700 px-5 py-3 text-sm font-medium text-white shadow-soft transition hover:bg-primary-800"
            >
              View AutoSOC
            </Link>
            <Link
              href="/proof"
              className="inline-flex items-center rounded-md border border-neutral-300 px-5 py-3 text-sm font-medium text-neutral-900 transition hover:border-primary-700 hover:text-primary-700 dark:border-neutral-700 dark:text-neutral-50"
            >
              Review Proof
            </Link>
          </div>
          <p className="mt-6 font-mono text-sm text-neutral-500 dark:text-neutral-400">
            Eligible to obtain clearance; willing to pursue sponsorship.
          </p>
        </div>
        <div className="md:col-span-5">
          <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-deep dark:border-neutral-800 dark:bg-neutral-800">
            <div className="border-b border-neutral-200 px-4 py-3 font-mono text-sm text-neutral-500 dark:border-neutral-700 dark:text-neutral-300">
              AutoSOC workflow snapshot
            </div>
            <div className="p-4">
              <img
                src="/assets/pp_soc_integration/autosoc-pipe-diagram.svg"
                alt="AutoSOC workflow diagram showing poll, triage, redact, pack, and PR creation"
                className="h-auto w-full rounded-md"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
