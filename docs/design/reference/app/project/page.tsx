import CodeBlock from "../../components/CodeBlock";
import DemoRunner from "../../components/DemoRunner";
import Footer from "../../components/Footer";
import MediaGallery from "../../components/MediaGallery";
import Nav from "../../components/Nav";
import ProjectLayout from "../../components/ProjectLayout";

export const metadata = {
  title: "HawkinsOps | AutoSOC",
  description: "AutoSOC project page reference with proof-first layout, architecture snapshot, and local demo guidance."
};

const demoItems = [
  {
    src: "/assets/pp_soc_integration/autosoc-system-map.svg",
    alt: "AutoSOC system map",
    caption: "Architecture map for the end-to-end workflow."
  },
  {
    src: "/assets/pp_soc_integration/autosoc-pipe-diagram.svg",
    alt: "AutoSOC pipeline diagram",
    caption: "Poll, triage, redact, pack, and pull request creation flow."
  },
  {
    src: "/assets/pp_soc_integration/t3-workflow.png",
    alt: "AutoSOC workflow screenshot",
    caption: "Operational snapshot of the workflow in action."
  }
];

// WHY: The project example keeps outcome, evidence, and runnable context in one place,
// which is the core hiring-manager use case for HawkinsOperations.
export default function ProjectPage() {
  return (
    <>
      <Nav />
      <ProjectLayout
        title="AutoSOC: alert ingestion to escalation artifacts"
        summary="A proof-first project layout that shows why the work matters before diving into workflow, screenshots, and local demo paths."
        aside={
          <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-soft dark:border-neutral-800 dark:bg-neutral-800">
            <h2 className="text-lg font-semibold">Evidence rail</h2>
            <ul className="mt-4 space-y-3 text-sm text-neutral-600 dark:text-neutral-300">
              <li>Proof page link</li>
              <li>Repo link</li>
              <li>Runbook link</li>
              <li>Verified counts note</li>
            </ul>
          </div>
        }
      >
        <section className="space-y-6">
          <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-soft dark:border-neutral-800 dark:bg-neutral-800">
            <h2 className="text-2xl font-semibold">Command example</h2>
            <p className="mt-3 text-sm leading-6 text-neutral-600 dark:text-neutral-300">
              Keep demo commands visible and easy to copy so the page supports both recruiters and technical reviewers.
            </p>
            <div className="mt-4">
              <CodeBlock
                language="powershell"
                code={"pwsh -NoProfile -File .\\scripts\\verify\\verify-counts.ps1\npython .\\scripts\\drift_scan.py"}
              />
            </div>
          </div>
          <DemoRunner />
          <MediaGallery items={demoItems} />
        </section>
      </ProjectLayout>
      <Footer />
    </>
  );
}
