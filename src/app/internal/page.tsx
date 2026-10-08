import Link from "next/link";
import { ArrowRight, Database, LockKeyhole, ShieldCheck } from "lucide-react";
import { requireAdmin } from "@/lib/auth/server";
import { Button } from "@/components/ui/button";
export default async function Internal() {
  await requireAdmin();
  return (
    <>
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
            <strong>Administrator access verified.</strong>
            <p>
              Only authorized administrators can open this workspace. Data
              uploads and publishing remain planned features.
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
            <h2>Your private admin workspace</h2>
            <p>
              Access is currently limited to administrators. Analyst and editor
              permissions will be added in a later phase.
            </p>
            <span className="small-badge">Planned for Phase 2</span>
          </section>
        </div>
      </main>
    </>
  );
}
