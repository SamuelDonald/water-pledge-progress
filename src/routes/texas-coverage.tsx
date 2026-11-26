import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import { PublicSiteFrame } from "@/components/escrow/PublicSiteFrame";
import { TexasCoverageScene } from "@/components/visual/TexasCoverageScene";

export const Route = createFileRoute("/texas-coverage")({
  head: () => ({ meta: [
    { title: "Texas coverage | Liberty Crest Escrow" },
    { name: "description", content: "Explore the Texas regions included in the Liberty Crest coverage plan." },
  ] }),
  component: Page,
});

function Page() {
  return (
    <PublicSiteFrame>
      <main className="public-page">
        <section className="public-page-hero texas-page-hero">
          <div className="public-page-hero-inner">
            <p className="eyebrow">ROOTED IN TEXAS / BUILT FOR THE JOURNEY</p>
            <h1>Local knowledge.<br /><i>Statewide perspective.</i></h1>
            <p>Residential transactions are local by nature. Our coverage plan is designed around the communities and regions that shape the Texas market.</p>
            <span className="coverage-note">A regional overview — not a live service-availability checker.</span>
          </div>
          <div className="public-hero-index"><span>02</span><span>REGIONS / TEXAS</span></div>
        </section>
        <section className="public-section">
          <div className="public-section-heading"><p className="eyebrow">The service footprint</p><h2>Eight regions.<br /><i>One Texas focus.</i></h2><p>Select a marker or a region to explore the planned coverage areas.</p></div>
          <TexasCoverageScene />
        </section>
        <section className="coverage-note-band"><p>Coverage references are illustrative and do not confirm that Liberty Crest can accept, hold, insure, or settle funds for a particular transaction. Availability and service arrangements must be confirmed directly.</p><Link to="/auth">Contact the team <ArrowUpRight size={14} /></Link></section>
      </main>
    </PublicSiteFrame>
  );
}
