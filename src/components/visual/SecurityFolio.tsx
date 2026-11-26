import { useState } from "react";
import { FileLock2, Fingerprint, ShieldCheck, ClipboardList, ChevronRight } from "lucide-react";

const safeguards = [
  { title: "Role-based access", detail: "Private transaction information is shown according to the viewer's authorized role. A signed-in session alone does not grant access to every record.", icon: Fingerprint, tag: "IDENTITY & ROLE" },
  { title: "Document handling", detail: "Transaction documents are stored and accessed through scoped permissions. The interface should never expose private files through public links.", icon: FileLock2, tag: "PRIVATE RECORDS" },
  { title: "Release authorization", detail: "A release request, administrator approval, and recorded disbursement are separate steps. One must not be presented as proof of another.", icon: ShieldCheck, tag: "CONTROLLED ACTIONS" },
  { title: "Audit visibility", detail: "Important transaction events are retained as part of the record so authorized participants can follow changes and review decisions.", icon: ClipboardList, tag: "ACCOUNTABILITY" },
];

export function SecurityFolio() {
  const [active, setActive] = useState(0);
  const item = safeguards[active];
  const Icon = item.icon;
  return (
    <section className="security-experience">
      <div className="security-visual">
        <div className="security-visual-grid" />
        <div className="security-folio-back" />
        <div className="security-folio">
          <span className="security-folio-emblem">LC</span>
          <span className="security-folio-rule" />
          <span className="security-folio-title">PRIVATE<br />BY DESIGN.</span>
          <span className="security-folio-small">TRANSACTION INTEGRITY / TEXAS</span>
          <div className="security-seal"><ShieldCheck size={30} strokeWidth={1.1} /></div>
        </div>
        <div className="security-orbit orbit-one" />
        <div className="security-orbit orbit-two" />
        <div className="security-visual-note">THE PRINCIPLE / 04</div>
      </div>
      <div className="security-detail">
        <p className="eyebrow">The safeguards behind the process</p>
        <h2>Trust is built<br /><i>into the record.</i></h2>
        <p className="security-intro">A clear workflow depends on careful access, accurate records, and explicit decisions. Explore the principles that guide the platform.</p>
        <div className="security-list">
          {safeguards.map((safeguard, index) => {
            const ItemIcon = safeguard.icon;
            return <button type="button" key={safeguard.title} onClick={() => setActive(index)} className={active === index ? "active" : ""} aria-expanded={active === index}>
              <span className="security-list-icon"><ItemIcon size={17} /></span><span className="security-list-copy"><small>{safeguard.tag}</small><b>{safeguard.title}</b>{active === index && <em>{safeguard.detail}</em>}</span><ChevronRight size={16} className="security-chevron" />
            </button>;
          })}
        </div>
        <div className="security-active-note"><Icon size={15} /><span>Selected principle / {item.tag}</span></div>
        <p className="security-disclaimer">These are product and implementation principles, not a claim of third-party certification, insurance, regulatory approval, or a guarantee against unauthorized activity.</p>
      </div>
    </section>
  );
}
