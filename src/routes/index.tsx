import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { CinematicJourney } from "@/components/visual/CinematicJourney";
import {
  ArrowRight, ArrowUpRight, BadgeCheck, Building2,
  CircleHelp, ClipboardCheck, FileCheck2, FileText, KeyRound, Landmark,
  LockKeyhole, Menu, ShieldCheck, WalletCards, X,
} from "lucide-react";

export const Route = createFileRoute("/")({ component: EscrowHome });

const markets = ["Dallas–Fort Worth", "Greater Houston", "Greater San Antonio", "Greater Austin", "Rio Grande Valley", "El Paso", "Corpus Christi", "Central & West Texas"];
const steps = [
  { n: "01", title: "Open a transaction", body: "An authorized realtor creates the transaction, records the agreed terms, and invites the buyer through a private link." },
  { n: "02", title: "Review together", body: "The buyer signs in securely, reviews the transaction details and documents, and confirms their understanding." },
  { n: "03", title: "Track payment", body: "Payment instructions become available only after the relevant payment provider and escrow arrangements are configured." },
  { n: "04", title: "Authorize release", body: "A realtor can request a release. An administrator must review and explicitly authorize it before an escrow officer records disbursement." },
];
const capabilities = [
  { icon: FileText, title: "Transaction records", body: "Keep property details, agreed terms, deadlines, and required documents together." },
  { icon: WalletCards, title: "Payment visibility", body: "Follow submitted, pending verification, and reconciled payment states without confusing them." },
  { icon: ClipboardCheck, title: "Buyer confirmations", body: "Give buyers a clear place to review documents, confirm milestones, or raise a concern." },
  { icon: ShieldCheck, title: "Controlled releases", body: "Separate release requests, administrator authorization, and disbursement recording." },
];

function EscrowHome() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [portal, setPortal] = useState<"buyer" | "realtor" | "officer" | "admin" | null>(null);
  const [reference, setReference] = useState("");
  const [notice, setNotice] = useState("");

  const openPortal = (role: "buyer" | "realtor" | "officer" | "admin") => {
    setPortal(role);
    setNotice("");
    document.getElementById("portal-access")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <main className="min-h-screen bg-[#f4f1e9] text-[#20231f]">
      <header className="relative z-30 border-b border-[#20231f]/10 bg-[#f4f1e9]">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between px-5 py-5 md:px-10">
          <a href="#" className="flex items-center gap-3" aria-label="Liberty Crest Escrow Services home">
            <span className="flex size-10 items-center justify-center border border-[#a88a58]/60 text-[#927346]"><Landmark size={19} strokeWidth={1.5}/></span>
            <span className="leading-tight"><span className="block font-serif text-[19px] tracking-[.02em]">LIBERTY CREST</span><span className="mt-1 block text-[8px] tracking-[.28em] text-[#8b744f]">ESCROW SERVICES</span></span>
          </a>
          <nav className="hidden items-center gap-8 text-[10px] uppercase tracking-[.18em] lg:flex">
            <a className="hover:text-[#927346]" href="/how-it-works">How it works</a>
            <a className="hover:text-[#927346]" href="#services">Our approach</a>
            <a className="hover:text-[#927346]" href="/security">Security</a>
            <a className="hover:text-[#927346]" href="/texas-coverage">Texas coverage</a>
            <button onClick={() => openPortal("realtor")} className="border border-[#20231f]/30 px-5 py-3 hover:border-[#927346] hover:text-[#927346]">Realtor access <ArrowUpRight className="ml-2 inline" size={13}/></button>
            <button onClick={() => openPortal("buyer")} className="bg-[#202b26] px-5 py-3 text-[#f4f1e9] hover:bg-[#34453c]">Buyer transaction <ArrowRight className="ml-2 inline" size={13}/></button>
          </nav>
          <button className="lg:hidden" aria-label="Toggle navigation" onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X/> : <Menu/>}</button>
        </div>
        {menuOpen && <nav className="grid gap-4 border-t border-black/10 bg-[#f4f1e9] px-6 py-6 text-xs uppercase tracking-widest lg:hidden"><a href="/how-it-works" onClick={() => setMenuOpen(false)}>How it works</a><a href="#services" onClick={() => setMenuOpen(false)}>Our approach</a><a href="/security" onClick={() => setMenuOpen(false)}>Security</a><a href="/texas-coverage" onClick={() => setMenuOpen(false)}>Texas coverage</a><button className="text-left" onClick={() => {setMenuOpen(false);openPortal("realtor");}}>Realtor access</button><button className="text-left" onClick={() => {setMenuOpen(false);openPortal("buyer");}}>Buyer transaction</button></nav>}
      </header>

      <CinematicJourney onRealtorAccess={() => openPortal("realtor")} onBuyerAccess={() => openPortal("buyer")} />

      <section className="border-b border-black/10 bg-[#e9e4d9]">
        <div className="mx-auto grid max-w-[1440px] gap-8 px-6 py-8 md:grid-cols-3 md:px-10">
          <div><p className="text-[9px] uppercase tracking-[.22em] text-[#8b744f]">01 / People</p><p className="mt-2 font-serif text-2xl">One coordinated workspace</p><p className="mt-2 text-xs leading-6 text-black/55">Realtors, buyers, administrators, and escrow officers have distinct responsibilities.</p></div>
          <div><p className="text-[9px] uppercase tracking-[.22em] text-[#8b744f]">02 / Process</p><p className="mt-2 font-serif text-2xl">A clear transaction journey</p><p className="mt-2 text-xs leading-6 text-black/55">Keep terms, documents, confirmations, and exceptions visible in context.</p></div>
          <div><p className="text-[9px] uppercase tracking-[.22em] text-[#8b744f]">03 / Oversight</p><p className="mt-2 font-serif text-2xl">Deliberate release controls</p><p className="mt-2 text-xs leading-6 text-black/55">Every release requires explicit administrator authorization before disbursement is recorded.</p></div>
        </div>
      </section>

      <section id="services" className="mx-auto max-w-[1440px] px-6 py-24 md:px-10 lg:py-32">
        <div className="grid gap-12 lg:grid-cols-[.8fr_1.2fr]">
          <div><p className="text-[9px] uppercase tracking-[.24em] text-[#8b744f]">The Liberty Crest approach</p><h2 className="mt-5 max-w-lg font-serif text-6xl leading-[.98] tracking-tight md:text-7xl">Structure for<br/><i>important</i><br/>decisions.</h2><p className="mt-7 max-w-sm text-sm leading-7 text-black/55">Real-estate transactions involve more than a payment. They require shared context, careful documentation, and accountable decisions at every milestone.</p></div>
          <div className="grid gap-0 sm:grid-cols-2">
            {capabilities.map(({icon:Icon,title,body},i)=><article key={title} className="border-t border-black/15 py-7 sm:px-7 sm:nth-[2n]:border-l sm:nth-[2n]:border-black/15"><span className="flex size-10 items-center justify-center border border-[#a88a58]/50 text-[#927346]"><Icon size={18}/></span><p className="mt-6 text-[9px] uppercase tracking-[.2em] text-[#8b744f]">0{i+1}</p><h3 className="mt-2 font-serif text-2xl">{title}</h3><p className="mt-3 max-w-sm text-xs leading-6 text-black/55">{body}</p></article>)}
          </div>
        </div>
      </section>

      <section id="how-it-works" className="bg-[#202b26] px-6 py-24 text-[#f4f1e9] md:px-10 lg:py-28">
        <div className="mx-auto max-w-[1440px]">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end"><div><p className="text-[9px] uppercase tracking-[.24em] text-[#c6ae83]">The transaction lifecycle</p><h2 className="mt-4 font-serif text-5xl leading-none md:text-7xl">A considered process.<br/><i className="font-normal text-[#d5c3a2]">At every step.</i></h2></div><p className="max-w-sm text-sm leading-7 text-white/55">The transaction record follows a defined sequence, with clear handoffs and review points.</p></div>
          <div className="mt-16 grid gap-8 md:grid-cols-2 xl:grid-cols-4">{steps.map(s=><article key={s.n} className="border-t border-white/20 pt-6"><span className="font-serif text-4xl text-[#c6ae83]">{s.n}</span><h3 className="mt-8 font-serif text-2xl">{s.title}</h3><p className="mt-4 text-xs leading-7 text-white/55">{s.body}</p></article>)}</div>
        </div>
      </section>

      <section id="texas" className="mx-auto grid max-w-[1440px] gap-12 px-6 py-24 md:px-10 lg:grid-cols-[.9fr_1.1fr] lg:py-28">
        <div><p className="text-[9px] uppercase tracking-[.24em] text-[#8b744f]">Rooted in Texas</p><h2 className="mt-5 font-serif text-6xl leading-[.98] tracking-tight md:text-7xl">Local knowledge.<br/><i>Statewide reach.</i></h2><p className="mt-7 max-w-md text-sm leading-7 text-black/55">Our planned coverage includes major metropolitan areas and communities across Texas. Featured locations are starting points, not limits on where a transaction can be considered.</p><a href="#portal-access" className="mt-8 inline-flex items-center border-b border-[#927346] pb-2 text-[10px] uppercase tracking-[.18em]">Speak with our team <ArrowRight className="ml-3" size={14}/></a></div>
        <div className="grid grid-cols-2 gap-x-8 gap-y-0 border-t border-black/15 pt-2 sm:grid-cols-2">{markets.map((m,i)=><div key={m} className="flex items-center gap-4 border-b border-black/10 py-5"><span className="font-serif text-sm text-[#a88a58]">0{i+1}</span><span className="text-xs tracking-wide">{m}</span></div>)}</div>
      </section>

      <section className="border-y border-black/10 bg-[#e9e4d9] px-6 py-20 md:px-10">
        <div className="mx-auto grid max-w-[1440px] gap-12 lg:grid-cols-[.8fr_1.2fr]">
          <div><p className="text-[9px] uppercase tracking-[.24em] text-[#8b744f]">Payment method availability</p><h2 className="mt-4 font-serif text-5xl leading-none md:text-6xl">Designed for<br/><i>clear accounting.</i></h2><p className="mt-6 max-w-sm text-xs leading-6 text-black/55">Wire transfer and cryptocurrency are planned payment methods. Their provider, custody, and settlement configurations are not yet active.</p></div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="border border-black/15 bg-[#f4f1e9] p-7"><Landmark className="text-[#927346]" size={22}/><h3 className="mt-6 font-serif text-2xl">Bank wire transfer</h3><p className="mt-3 text-xs leading-6 text-black/55">Dedicated escrow banking and payment instructions will be connected after the approved banking and reconciliation setup is complete.</p><span className="mt-6 inline-flex items-center gap-2 border-t border-black/10 pt-4 text-[9px] uppercase tracking-[.16em] text-[#8b744f]"><span className="size-1.5 rounded-full bg-[#b28e57]"/> Setup pending</span></div>
            <div className="border border-black/15 bg-[#f4f1e9] p-7"><WalletCards className="text-[#927346]" size={22}/><h3 className="mt-6 font-serif text-2xl">Cryptocurrency</h3><p className="mt-3 text-xs leading-6 text-black/55">Supported assets, networks, custody, conversion, and confirmation rules will be defined with the selected provider before activation.</p><span className="mt-6 inline-flex items-center gap-2 border-t border-black/10 pt-4 text-[9px] uppercase tracking-[.16em] text-[#8b744f]"><span className="size-1.5 rounded-full bg-[#b28e57]"/> Setup pending</span></div>
          </div>
        </div>
        <p className="mx-auto mt-8 max-w-[1440px] text-[10px] leading-5 text-black/45">Payment options shown for product planning only. No payment instructions, wallet addresses, deposits, custody, or disbursements are currently enabled through this interface.</p>
      </section>

      <section id="portal-access" className="mx-auto max-w-[1440px] px-6 py-24 md:px-10 lg:py-28">
        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><p className="text-[9px] uppercase tracking-[.24em] text-[#8b744f]">Secure workspace access</p><h2 className="mt-4 font-serif text-5xl leading-none md:text-6xl">The right access.<br/><i>The right role.</i></h2></div><p className="max-w-sm text-xs leading-6 text-black/55">Choose your role to see the correct entry point. Account authentication and live transaction services are being connected separately.</p></div>
        <div className="mt-12 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {([{key:"buyer",name:"Buyer",desc:"Open an invitation, review transaction documents, and follow your milestones.",icon:KeyRound},{key:"realtor",name:"Realtor",desc:"Register for verification or manage transactions after authorization.",icon:Building2},{key:"officer",name:"Escrow officer",desc:"Review assigned records and record authorized disbursement activity.",icon:FileCheck2},{key:"admin",name:"Administrator",desc:"Oversee access, transactions, payment review, and release authorization.",icon:BadgeCheck}] as const).map(({key,name,desc,icon:Icon})=><button key={key} onClick={()=>{setPortal(key);setNotice("");}} className={`group border p-6 text-left transition ${portal===key?"border-[#927346] bg-[#e9e4d9]":"border-black/15 hover:border-[#927346]"}`}><span className="flex items-center justify-between"><Icon size={20} className="text-[#927346]"/><ArrowUpRight size={15} className="text-black/35 transition group-hover:-translate-y-1 group-hover:translate-x-1"/></span><h3 className="mt-8 font-serif text-2xl">{name}</h3><p className="mt-3 min-h-[60px] text-xs leading-6 text-black/55">{desc}</p><span className="mt-6 block border-t border-black/10 pt-4 text-[9px] uppercase tracking-[.18em] text-[#8b744f]">Select role <ArrowRight className="ml-2 inline" size={12}/></span></button>)}
        </div>
        {portal && <div className="mt-6 border border-[#927346]/50 bg-[#f8f6f0] p-6 md:p-9">
          <div className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-[9px] uppercase tracking-[.2em] text-[#8b744f]">Selected workspace</p><h3 className="mt-2 font-serif text-3xl capitalize">{portal==="officer"?"Escrow officer":portal} access</h3></div><button onClick={()=>setPortal(null)} aria-label="Close selected workspace" className="border border-black/15 p-2"><X size={16}/></button></div>
          {portal==="buyer" ? <div className="mt-6 max-w-xl"><label htmlFor="transaction-reference" className="text-[9px] uppercase tracking-[.16em] text-black/55">Invitation reference</label><div className="mt-2 flex flex-col gap-2 sm:flex-row"><input id="transaction-reference" value={reference} onChange={e=>setReference(e.target.value)} placeholder="Enter the reference from your invitation" className="min-w-0 flex-1 border border-black/20 bg-white px-4 py-3 text-sm outline-none focus:border-[#927346]"/><button onClick={()=>setNotice(reference.trim()?"Invitation lookup will be enabled when buyer authentication and transaction services are connected. No transaction has been accessed.":"Enter the invitation reference to continue.")} className="bg-[#202b26] px-6 py-3 text-[9px] uppercase tracking-[.16em] text-white">Continue <ArrowRight className="ml-2 inline" size={13}/></button></div><p className="mt-3 text-[10px] text-black/45">Buyers enter using a private invitation sent by their authorized realtor.</p></div> : <div className="mt-6 max-w-xl"><p className="text-sm leading-7 text-black/60">{portal==="realtor"?"Realtor registration and verification will be available here. New applicants require administrator approval before they can create or manage transactions.":portal==="officer"?"Escrow officer sign-in will provide access to assigned transactions, reconciliation records, and administrator-authorized disbursement tasks.":"Administrator sign-in will provide controls for realtor verification, transaction oversight, payment review, release decisions, and the audit log."}</p><button onClick={()=>setNotice("Secure sign-in and role verification are not connected yet. This interface does not create an account or grant access.")} className="mt-5 border border-[#202b26] px-6 py-3 text-[9px] uppercase tracking-[.16em] hover:bg-[#202b26] hover:text-white">{portal==="realtor"?"Begin realtor registration":"Continue to secure sign in"} <ArrowRight className="ml-2 inline" size={13}/></button></div>}
          {notice && <p role="status" className="mt-4 border-l-2 border-[#a88a58] pl-3 text-xs leading-6 text-[#69583d]">{notice}</p>}
        </div>}
      </section>

      <section className="bg-[#202b26] px-6 py-20 text-[#f4f1e9] md:px-10">
        <div className="mx-auto flex max-w-[1440px] flex-col justify-between gap-8 md:flex-row md:items-end"><div><p className="text-[9px] uppercase tracking-[.24em] text-[#c6ae83]">Liberty Crest Escrow Services</p><h2 className="mt-4 max-w-3xl font-serif text-5xl leading-[.98] md:text-7xl">Bring clarity to<br/><i className="font-normal text-[#d5c3a2]">the next transaction.</i></h2></div><button onClick={()=>openPortal("realtor")} className="flex w-fit items-center gap-5 border border-[#d5c3a2]/60 px-7 py-5 text-[9px] uppercase tracking-[.18em] hover:bg-white/10">Access realtor workspace <ArrowUpRight size={16}/></button></div>
      </section>

      <footer className="bg-[#202b26] px-6 pb-8 text-white/45 md:px-10"><div className="mx-auto flex max-w-[1440px] flex-col justify-between gap-4 border-t border-white/15 pt-6 text-[9px] uppercase tracking-[.16em] sm:flex-row"><span>© 2026 Liberty Crest Escrow Services · Texas</span><span className="flex items-center gap-2"><CircleHelp size={13}/> Payment and custody integrations not yet active</span></div></footer>
    </main>
  );
}
