import Link from "next/link";

const links = [
  { href: "/", label: "Home" },
  { href: "/projects", label: "Projects" },
  { href: "/case-study-autosoc", label: "AutoSOC" },
  { href: "/detections", label: "Detections" },
  { href: "/lab", label: "Lab" },
  { href: "/resume", label: "Resume" },
  { href: "/proof", label: "Proof" }
];

// WHY: Navigation should stay familiar to current site visitors, so the IA remains
// stable while spacing, contrast, and CTA treatment become more modern.
export default function Nav() {
  return (
    <header className="sticky top-0 z-50 border-b border-neutral-200 bg-white/90 backdrop-blur dark:border-neutral-800 dark:bg-neutral-900/90">
      <nav className="mx-auto flex max-w-6xl items-center gap-6 px-6 py-4">
        <Link href="/" className="mr-auto text-lg font-semibold text-neutral-900 dark:text-neutral-50">
          HawkinsOps
        </Link>
        <ul className="hidden items-center gap-5 md:flex">
          {links.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="text-sm text-neutral-600 transition hover:text-primary-700 dark:text-neutral-300"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
        <Link
          href="/case-study-autosoc"
          className="rounded-md bg-primary-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-primary-800"
        >
          Read AutoSOC
        </Link>
      </nav>
    </header>
  );
}
