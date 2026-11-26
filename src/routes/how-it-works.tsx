import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { PublicSiteFrame } from "@/components/escrow/PublicSiteFrame";
import { ProcessJourney } from "@/components/visual/ProcessJourney";

export const Route = createFileRoute("/how-it-works")({
  head: () => ({ meta: [
    { title: "How it works | Liberty Crest Escrow" },
    { name: "description", content: "Explore the considered transaction workflow at Liberty Crest Escrow Services." },
  ] }),
  component: Page,
});

function Page() {
  return (
    <PublicSiteFrame>
      <main className="public-page">
        <section className="public-page-hero process-page-hero">
          <div className="public-page-hero-inner">
            <p className="eyebrow">THE LIBERTY CREST PROCESS / 01—04</p>
            <h1>Clarity at every<br /><i>hand-off.</i></h1>
            <p>A transaction is a sequence of important decisions. Liberty Crest brings the people, records, and review points into one coordinated journey.</p>
            <a href="#journey" className="visual-text-link">Explore the transaction journey <ArrowRight size={15} /></a>
          </div>
          <div className="public-hero-index"><span>01</span><span>PROCESS / TEXAS</span></div>
        </section>
        <section id="journey" className="public-section public-section-dark">
          <div className="public-section-heading"><p className="eyebrow">A shared record, four stages</p><h2>From first entry<br /><i>to final review.</i></h2><p>Choose a stage to see what happens, who is involved, and why each handoff matters.</p></div>
          <ProcessJourney />
        </section>
        <section className="public-section process-principles">
          <div className="public-section-heading"><p className="eyebrow">The operating principles</p><h2>Designed around<br /><i>accountability.</i></h2></div>
          <div className="principle-grid">
            <article><span>01 / CONTEXT</span><h3>One transaction record</h3><p>Terms, documents, milestones, and activity remain connected to the transaction they belong to.</p></article>
            <article><span>02 / RESPONSIBILITY</span><h3>Distinct roles</h3><p>Buyers, realtors, administrators, and escrow officers have separate responsibilities and permissions.</p></article>
            <article><span>03 / EVIDENCE</span><h3>Clear status language</h3><p>Pending, submitted, verified, authorized, and recorded are not interchangeable states.</p></article>
            <article><span>04 / OVERSIGHT</span><h3>Explicit release review</h3><p>A release request is not approval. Administrator authorization remains a separate step.</p></article>
          </div>
        </section>
        <section className="public-cta-band"><div><p className="eyebrow">LIBERTY CREST ESCROW SERVICES</p><h2>Make the next step<br /><i>more considered.</i></h2></div><Link to="/auth" className="visual-outline-link">Enter your workspace <ArrowUpRight size={15} /></Link></section>
      </main>
    </PublicSiteFrame>
  );
}
