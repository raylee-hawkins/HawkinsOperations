import Link from "next/link";

const footerLinks = [
  { href: "/proof", label: "Proof" },
  { href: "/resume", label: "Resume" },
  { href: "/projects", label: "Projects" }
];

// WHY: The footer acts as the final trust cue, so it stays compact and proof-focused
// instead of becoming a visually noisy marketing footer.
export default function Footer() {
  return (
    <footer className="border-t border-neutral-200 bg-neutral-100 dark:border-neutral-800 dark:bg-neutral-950">
      <div className="mx-auto grid max-w-6xl gap-6 px-6 py-10 md:grid-cols-12">
        <div className="md:col-span-7">
          <p className="text-lg font-semibold text-neutral-900 dark:text-neutral-50">
            HawkinsOps
          </p>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-neutral-600 dark:text-neutral-300">
            Evidence-first SOC portfolio with AutoSOC, detection engineering, lab documentation,
            and reproducible proof paths designed for technical review.
          </p>
        </div>
        <div className="md:col-span-5">
          <ul className="space-y-2 text-sm">
            {footerLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-neutral-600 transition hover:text-primary-700 dark:text-neutral-300"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
          <p className="mt-4 font-mono text-xs uppercase tracking-[0.18em] text-neutral-500 dark:text-neutral-400">
            Eligible to obtain clearance; willing to pursue sponsorship.
          </p>
        </div>
      </div>
    </footer>
  );
}
