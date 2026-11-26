import { useEffect, useRef, useState } from "react";
import { ArrowDown, ArrowRight, ArrowUpRight, FileCheck2, LockKeyhole, ShieldCheck } from "lucide-react";

const scenes = [
  { eyebrow: "THE ARRIVAL · TEXAS", title: "A meaningful move\ndeserves a better journey.", copy: "A home is more than an address. The transaction behind it deserves the same care, clarity, and attention.", image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=2400&q=88", position: "center 52%" },
  { eyebrow: "THE APPROACH · SHARED CONTEXT", title: "Every detail,\nbrought into view.", copy: "Property details, agreed terms, people, and documents come together in one coordinated transaction record.", image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=2400&q=88", position: "center 55%" },
  { eyebrow: "THE REVIEW · DOCUMENTATION", title: "Confidence is built\none considered step at a time.", copy: "Buyers review transaction information and documents, confirm milestones, and keep questions connected to the record.", image: "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=2400&q=88", position: "center 48%" },
  { eyebrow: "THE HANDOFF · ACCOUNTABLE OVERSIGHT", title: "A clear path\nto the final decision.", copy: "Release requests, administrator authorization, and disbursement recording remain distinct, accountable steps.", image: "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=2400&q=88", position: "center 50%" },
];

export function CinematicJourney({ onRealtorAccess, onBuyerAccess }: { onRealtorAccess: () => void; onBuyerAccess: () => void }) {
  const journeyRef = useRef<HTMLElement>(null);
  const [progress, setProgress] = useState(0);
  const active = Math.min(3, Math.floor(progress * 4));
  useEffect(() => {
    const element = journeyRef.current;
    if (!element) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;
    let frame = 0;
    const update = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const rect = element.getBoundingClientRect();
        const travel = element.offsetHeight - window.innerHeight;
        const next = travel > 0 ? Math.min(0.999, Math.max(0, -rect.top / travel)) : 0;
        setProgress(next);
      });
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  return (
    <section ref={journeyRef} className="cinematic-journey" aria-label="A guided cinematic journey through the Liberty Crest transaction process">
      <div className="cinematic-sticky">
        <div className="cinematic-camera" style={{ transform: `scale(${1.04 + progress * 0.2}) translate3d(0, ${progress * -2.5}%, 0)` }}>
          {scenes.map((scene, index) => (
            <div key={scene.eyebrow} className="cinematic-scene" style={{ backgroundImage: `url("${scene.image}")`, backgroundPosition: scene.position, opacity: Math.max(0, 1 - Math.abs(progress * 4 - index - 0.5) * 1.55) }} />
          ))}
          <div className="cinematic-vignette" />
          <div className="cinematic-grain" />
        </div>
        <div className="cinematic-topline"><span>LIBERTY CREST <i> / </i> ESCROW SERVICES</span><span>AN INTENTIONAL WAY FORWARD <b>·</b> TEXAS</span></div>
        <div className="cinematic-content" key={active}>
          <p className="cinematic-eyebrow"><span />{scenes[active].eyebrow}</p>
          <h1>{scenes[active].title.split("\n").map((line, index) => <span key={line}>{index > 0 && <br />}{line}</span>)}</h1>
          <p className="cinematic-copy">{scenes[active].copy}</p>
          {active === 0 ? <div className="cinematic-actions"><button onClick={onRealtorAccess}>Realtor registration <ArrowUpRight size={15} /></button><a href="#how-it-works">Explore the process <ArrowRight size={15} /></a></div> : <a className="cinematic-inline-link" href="#how-it-works">Discover this stage <ArrowRight size={14} /></a>}
        </div>
        <div className="cinematic-bottom">
          <div className="cinematic-assurances"><span><ShieldCheck size={14}/> Role-based access</span><span><FileCheck2 size={14}/> Document-led workflow</span><span><LockKeyhole size={14}/> Authorized releases</span></div>
          <div className="cinematic-progress"><span>0{active + 1}</span><div>{scenes.map((scene, index) => <i key={scene.eyebrow} className={index <= active ? "is-active" : ""} />)}</div><span>04</span></div>
        </div>
        <div className="cinematic-scroll-cue"><ArrowDown size={13}/><span>SCROLL TO MOVE THROUGH THE JOURNEY</span></div>
        <button className="cinematic-buyer-link" onClick={onBuyerAccess}>Buyer transaction <ArrowUpRight size={13}/></button>
      </div>
    </section>
  );
}
