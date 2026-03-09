import Link from "next/link";
import type { ReactNode } from "react";

type CTAProps = {
  href: string;
  children: ReactNode;
  tone?: "primary" | "secondary";
};

// WHY: The site only needs two CTA tones, which keeps action hierarchy obvious
// and prevents decorative button styles from competing with proof content.
export default function CTA({
  href,
  children,
  tone = "primary"
}: CTAProps) {
  const className =
    tone === "primary"
      ? "inline-flex items-center rounded-md bg-accent-500 px-5 py-3 text-sm font-medium text-neutral-900 shadow-soft transition hover:bg-accent-700 hover:text-white"
      : "inline-flex items-center rounded-md border border-neutral-300 px-5 py-3 text-sm font-medium text-neutral-900 transition hover:border-primary-700 hover:text-primary-700 dark:border-neutral-700 dark:text-neutral-50";

  return (
    <Link href={href} className={className}>
      {children}
    </Link>
  );
}
