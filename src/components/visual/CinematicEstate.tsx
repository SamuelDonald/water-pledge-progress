import { useState } from "react";
import { ArrowDownRight, Compass, Sun, Layers3 } from "lucide-react";

export function CinematicEstate() {
  const [view, setView] = useState<"estate" | "blueprint">("estate");
  return (
    <div className={`estate-visual ${view === "blueprint" ? "estate-blueprint" : ""}`} aria-label="Interactive architectural visualization of a Texas residence">
      <div className="estate-visual-top">
        <span className="estate-kicker"><span className="estate-live-dot" /> TEXAS RESIDENTIAL / 01</span>
        <span className="estate-coordinate">30°16' N · 97°44' W</span>
      </div>
      <div className="estate-stage">
        <div className="estate-sky-glow" />
        <div className="estate-sun" />
        <div className="estate-horizon" />
        <div className="estate-ground" />
        <div className="estate-driveway" />
        <div className="estate-pool" />
        <div className="estate-garden garden-left"><i /><i /><i /><i /></div>
        <div className="estate-garden garden-right"><i /><i /><i /><i /></div>
        <div className="estate-house">
          <div className="estate-house-side" />
          <div className="estate-house-front">
            <div className="estate-roof" />
            <div className="estate-roof-side" />
            <div className="estate-upper-window window-one" />
            <div className="estate-upper-window window-two" />
            <div className="estate-entry">
              <span className="entry-light" />
              <span className="entry-door" />
            </div>
            <div className="estate-window lower-window-one" />
            <div className="estate-window lower-window-two" />
            <div className="estate-column column-one" />
            <div className="estate-column column-two" />
            <div className="estate-balcony" />
            <div className="estate-steps" />
          </div>
          <div className="estate-roof-ridge" />
        </div>
        <div className="estate-tree tree-one"><i /><b /></div>
        <div className="estate-tree tree-two"><i /><b /></div>
        <div className="estate-tree tree-three"><i /><b /></div>
        <div className="estate-plan-lines" />
        <div className="estate-callout callout-one"><span>01</span><b>ARCHITECTURE</b><i /></div>
        <div className="estate-callout callout-two"><span>02</span><b>TRANSACTION</b><i /></div>
      </div>
      <div className="estate-visual-bottom">
        <div><span className="estate-bottom-label">THE LIBERTY CREST STANDARD</span><p>Grounded in place. Built around clarity.</p></div>
        <div className="estate-view-controls" aria-label="Visualization view">
          <button type="button" onClick={() => setView("estate")} aria-pressed={view === "estate"}><Sun size={13} /> Estate</button>
          <button type="button" onClick={() => setView("blueprint")} aria-pressed={view === "blueprint"}><Layers3 size={13} /> Plan</button>
        </div>
      </div>
      <div className="estate-side-note"><Compass size={12} /> AN ARCHITECTURAL POINT OF VIEW <ArrowDownRight size={12} /></div>
    </div>
  );
}
