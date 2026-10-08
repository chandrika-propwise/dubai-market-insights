import {
  Check,
  Database,
  Files,
  ScanLine,
  Send,
  ShieldCheck,
} from "lucide-react";
import { requireAdmin } from "@/lib/auth/server";
const steps = [
  {
    icon: Files,
    title: "Upload source screenshots",
    description:
      "Choose a reporting month and category, then upload PNG or JPG screenshots.",
  },
  {
    icon: ScanLine,
    title: "Extract and review",
    description:
      "Review structured figures, resolve uncertainties, and correct missing values.",
  },
  {
    icon: ShieldCheck,
    title: "Approve the dataset",
    description:
      "Verify each metric against its original screenshot before approval.",
  },
  {
    icon: Send,
    title: "Publish the reporting month",
    description:
      "Refresh the public dashboard while preserving previous datasets and revisions.",
  },
];
export default async function MarketData() {
  await requireAdmin();
  return (
    <>
      <main className="placeholder-page">
        <span className="eyebrow">PROPWISE WORKSPACE · PLANNED WORKFLOW</span>
        <h1>
          Market Data Manager<span>.</span>
        </h1>
        <p>
          Your monthly data, from source screenshot to a trusted market story.
        </p>
        <div className="prototype-banner">
          <Database size={18} />
          <span>
            <strong>Interface placeholder only.</strong> Uploads, extraction,
            approval, and publishing are not enabled in Phase 1.
          </span>
        </div>
        <section className="panel workflow-panel">
          <div className="panel-heading">
            <div>
              <h2>One workflow. Every reporting month.</h2>
              <p>A preview of the data lifecycle coming in the next phases.</p>
            </div>
            <span className="small-badge">Coming soon</span>
          </div>
          <div className="workflow-steps">
            {steps.map(({ icon: Icon, title, description }, i) => (
              <div className="workflow-step" key={title}>
                <span className="step-number">0{i + 1}</span>
                <Icon size={23} />
                <h3>{title}</h3>
                <p>{description}</p>
              </div>
            ))}
          </div>
        </section>
        <section className="source-note">
          <Check size={20} />
          <div>
            <h2>Built around your actual source.</h2>
            <p>
              Extraction templates will be designed after you provide sample
              screenshots. No layouts or market figures have been assumed.
              Future extraction will use secure storage and server-side
              validation.
            </p>
          </div>
        </section>
      </main>
    </>
  );
}
