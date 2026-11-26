import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import { PublicSiteFrame } from "@/components/escrow/PublicSiteFrame";
import { SecurityFolio } from "@/components/visual/SecurityFolio";

export const Route = createFileRoute("/security")({
  head: () => ({ meta: [
    { title: "Security & FAQs | Liberty Crest Escrow" },
    { name: "description", content: "Explore the principles behind access, document handling, transaction review, and release authorization." },
  ] }),
  component: Page,
});

function Page() {
  return (
    <PublicSiteFrame>
      <main className="public-page">
        <section className="public-page-hero security-page-hero">
          <div className="public-page-hero-inner">
            <p className="eyebrow">SECURITY / CONTROL / ACCOUNTABILITY</p>
            <h1>Trust is built<br /><i>into the record.</i></h1>
            <p>Private transaction workflows need more than a polished interface. They need carefully scoped access, explicit approvals, and clear records of what happened.</p>
          </div>
          <div className="public-hero-index"><span>03</span><span>PRINCIPLES / TRUST</span></div>
        </section>
        <section className="public-section public-section-dark">
          <SecurityFolio />
        </section>
        <section className="public-section faq-section">
          <div className="public-section-heading"><p className="eyebrow">Common questions</p><h2>Clear answers<br /><i>before you begin.</i></h2></div>
          <div className="faq-grid">
            <article><h3>Are payment methods active?</h3><p>No. Wire and cryptocurrency are planned payment methods. Provider, custody, and settlement integrations are not currently active through this interface.</p></article>
            <article><h3>Does a payment status mean funds have settled?</h3><p>Not by itself. Submitted, pending verification, verified, and reconciled are distinct states. A status must reflect confirmed backend evidence.</p></article>
            <article><h3>Who can authorize a release?</h3><p>Release requests and authorization are separate. An administrator must explicitly authorize a release before an escrow officer records a disbursement.</p></article>
            <article><h3>Does this page certify the service?</h3><p>No. This page describes product principles and workflow controls. It does not claim third-party certification, insurance, regulatory approval, or a guarantee against unauthorized activity.</p></article>
          </div>
        </section>
        <section className="public-cta-band"><div><p className="eyebrow">PRIVATE WORKSPACE ACCESS</p><h2>Enter with the<br /><i>right credentials.</i></h2></div><Link to="/auth" className="visual-outline-link">Sign in securely <ArrowUpRight size={15} /></Link></section>
      </main>
    </PublicSiteFrame>
  );
}
