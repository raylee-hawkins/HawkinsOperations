import Card from "../../components/Card";
import CTA from "../../components/CTA";
import Footer from "../../components/Footer";
import Hero from "../../components/Hero";
import Nav from "../../components/Nav";

export const metadata = {
  title: "HawkinsOps | Home",
  description: "Evidence-first SOC portfolio with AutoSOC, detections, and proof-first reviewer paths."
};

// WHY: This page demonstrates how the recommended MODERNIZE mode maps current
// static content into a component-friendly layout without changing the site IA.
export default function HomePage() {
  return (
    <>
      <Nav />
      <Hero />
      <main className="bg-neutral-50 dark:bg-neutral-900">
        <section className="mx-auto max-w-6xl px-6 py-12">
          <div className="grid gap-6 md:grid-cols-3">
            <Card
              title="AutoSOC case study"
              excerpt="Pipeline outcome, triage logic, architecture, and proof links in one recruiter-friendly path."
              href="/case-study-autosoc"
              eyebrow="Start here"
              metrics={[
                { label: "Pipeline", value: "Live" },
                { label: "Proof", value: "Public" }
              ]}
            />
            <Card
              title="Proof pack"
              excerpt="Verified counts, reproducible artifacts, and evidence trails that support portfolio claims."
              href="/proof"
              eyebrow="Receipts"
              metrics={[
                { label: "Counts", value: "Verified" },
                { label: "Artifacts", value: "Curated" }
              ]}
            />
            <Card
              title="Resume and role fit"
              excerpt="A concise recruiter lane for SOC T1/T2 fit, lab depth, and technical positioning."
              href="/resume"
              eyebrow="Role fit"
              metrics={[
                { label: "Focus", value: "SOC" },
                { label: "Tone", value: "Practical" }
              ]}
            />
          </div>
          <div className="mt-10 flex flex-wrap gap-4">
            <CTA href="/projects">Browse projects</CTA>
            <CTA href="/detections" tone="secondary">
              Review detections
            </CTA>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
