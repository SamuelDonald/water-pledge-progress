import { useState } from "react";
import { ArrowRight, FileText, Users, ClipboardCheck, ShieldCheck } from "lucide-react";

const phases = [
  { number: "01", title: "Open the record", label: "INITIATION", description: "An approved realtor creates the transaction record, enters the agreed terms, and sends a private invitation to the buyer.", detail: "A single source of context", icon: FileText },
  { number: "02", title: "Review together", label: "COLLABORATION", description: "The buyer enters through their invitation, reviews the transaction details and documents, and records confirmations.", detail: "Clear responsibilities for each party", icon: Users },
  { number: "03", title: "Reconcile activity", label: "VERIFICATION", description: "Payment activity is tracked only when the relevant provider and escrow arrangements are configured. Pending activity is never presented as settled.", detail: "Evidence before status", icon: ClipboardCheck },
  { number: "04", title: "Authorize release", label: "OVERSIGHT", description: "A release request is reviewed separately. An administrator must explicitly authorize it before an escrow officer records a disbursement.", detail: "A deliberate, auditable handoff", icon: ShieldCheck },
];

export function ProcessJourney() {
  const [active, setActive] = useState(0);
  const phase = phases[active];
  const Icon = phase.icon;
  return (
    <section className="process-experience">
      <div className="process-model-wrap">
        <div className="process-model-grid" />
        <div className="process-model-orbit orbit-a" />
        <div className="process-model-orbit orbit-b" />
        <div className="process-model-stack">
          <div className="process-stack-sheet sheet-back" />
          <div className="process-stack-sheet sheet-mid" />
          <div className="process-stack-sheet sheet-front">
            <span className="folio-mark">LC</span>
            <span className="folio-rule" />
            <span className="folio-title">TRANSACTION<br />RECORD</span>
            <span className="folio-meta">LIBERTY CREST / TEXAS</span>
            <span className="folio-stamp">PRIVATE<br />RECORD</span>
          </div>
          <div className="process-model-ring" />
        </div>
        <div className="process-model-caption"><span>LC / PROCESS MODEL</span><span>01 — 04</span></div>
      </div>
      <div className="process-detail">
        <p className="eyebrow">A considered sequence</p>
        <div className="process-index">{phase.number} <span>/ 04</span></div>
        <p className="process-label">{phase.label}</p>
        <h2>{phase.title}</h2>
        <p className="process-description">{phase.description}</p>
        <div className="process-detail-note"><Icon size={17} /><span>{phase.detail}</span></div>
        <div className="process-step-controls" role="tablist" aria-label="Transaction stages">
          {phases.map((item, index) => (
            <button key={item.number} type="button" role="tab" aria-selected={active === index} onClick={() => setActive(index)} className={active === index ? "active" : ""}>
              <span>{item.number}</span><i />
            </button>
          ))}
        </div>
        <div className="process-control-footer"><span>SELECT A STAGE TO EXPLORE</span><span>{phase.number} / {phase.title.toUpperCase()}</span></div>
      </div>
    </section>
  );
}
