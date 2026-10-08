import Link from "next/link";
import { ArrowRight, Database, LockKeyhole, ShieldCheck } from "lucide-react";
import { Shell } from "@/components/shell";
import { Button } from "@/components/ui/button";
export default function Internal() {
  return (
    <Shell>
      <main className="placeholder-page">
        <span className="eyebrow">PROPWISE WORKSPACE · PHASE 1 PREVIEW</span>
        <h1>The intelligence workspace.</h1>
        <p>
          A home for your team’s research, reviews, and monthly market
          publications.
        </p>
        <div className="internal-notice">
          <LockKeyhole size={20} />
          <div>
            <strong>Authentication is planned for Phase 2.</strong>
            <p>
              This page is a public interface placeholder. No private data or
              protected functionality is available.
            </p>
          </div>
        </div>
        <div className="placeholder-grid">
          <section className="panel placeholder-card">
            <Database size={28} />
            <h2>Market Data Manager</h2>
            <p>
              Explore the planned monthly upload, review, and publishing
              workflow.
            </p>
            <Button asChild>
              <Link href="/internal/market-data">
                Explore the workflow <ArrowRight size={16} />
              </Link>
            </Button>
          </section>
          <section className="panel placeholder-card">
            <ShieldCheck size={28} />
            <h2>A workspace for every role</h2>
            <p>
              Analysts prepare data. Editors review insights. Administrators
              manage access and publication.
            </p>
            <span className="small-badge">Planned for Phase 2</span>
          </section>
        </div>
      </main>
    </Shell>
  );
}
