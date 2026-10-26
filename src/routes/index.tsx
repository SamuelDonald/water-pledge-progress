import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowRight, Menu, X, Home as HomeIcon, MapPin, ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/")({ component: Home });

const markets = [
  { name: "Dallas", slug: "dallas", subtitle: "Dallas–Fort Worth", image: "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?auto=format&fit=crop&w=1800&q=85", copy: "A metropolitan mix of established neighborhoods, modern homes, and room to make your next chapter your own." },
  { name: "Houston", slug: "houston", subtitle: "Greater Houston", image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1800&q=85", copy: "A city of distinct communities, leafy residential streets, and many ways to define home." },
  { name: "Rio Grande Valley", slug: "rio-grande-valley", subtitle: "South Texas", image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1800&q=85", copy: "A warm South Texas setting with close-knit communities, relaxed living, and homes for different stages of life." },
];

function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <main className="min-h-screen bg-[#f5f3ee] text-[#171716]">
      <header className="absolute inset-x-0 top-0 z-30 flex items-center justify-between px-6 py-6 text-white lg:px-10">
        <Link to="/" className="font-serif text-2xl sm:text-3xl">Liberty Crest Realty</Link>
        <nav className="hidden items-center gap-8 text-xs uppercase tracking-[.16em] md:flex">
          <a href="#markets">Our markets</a><a href="#process">How it works</a><Link to="/submit-property">Submit a property</Link>
          <Link to="/find-a-home" className="border border-white/70 px-5 py-3 transition hover:bg-white hover:text-black">Find my home <ArrowRight className="ml-2 inline size-4" /></Link>
        </nav>
        <button type="button" className="md:hidden" aria-label={menuOpen ? "Close navigation" : "Open navigation"} onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X /> : <Menu />}</button>
      </header>
      {menuOpen ? <nav className="absolute inset-x-0 top-[76px] z-40 space-y-5 bg-[#171716] px-6 py-6 text-sm text-white md:hidden"><a className="block" href="#markets" onClick={() => setMenuOpen(false)}>Our markets</a><a className="block" href="#process" onClick={() => setMenuOpen(false)}>How it works</a><Link className="block" to="/submit-property" onClick={() => setMenuOpen(false)}>Submit a property</Link><Link className="block border border-white/30 p-3" to="/find-a-home" onClick={() => setMenuOpen(false)}>Find my home <ArrowRight className="ml-2 inline size-4" /></Link></nav> : null}

      <section className="relative flex min-h-[88vh] items-end overflow-hidden bg-[#171716] text-white">
        <img src="https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1800&q=85" alt="Residential architecture representing Liberty Crest Realty's Texas markets" className="absolute inset-0 h-full w-full object-cover" fetchPriority="high" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/35 to-black/15" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />
        <div className="relative mx-auto w-full max-w-7xl px-6 pb-16 pt-36 lg:px-10 lg:pb-24">
          <p className="eyebrow text-white/65">Dallas · Houston · Rio Grande Valley</p>
          <div className="mt-6 grid gap-8 lg:grid-cols-[1.25fr_.75fr] lg:items-end">
            <h1 className="max-w-4xl font-serif text-[clamp(3.7rem,9vw,8.4rem)] leading-[.86] tracking-[-.045em]">Your next home<br /><i>starts here.</i></h1>
            <div className="max-w-md pb-1"><p className="text-sm leading-7 text-white/75">Tell us what home means to you. We’ll learn your preferences, understand your timeline, and help you explore opportunities across the Texas markets we serve.</p><Link to="/find-a-home" className="mt-7 inline-flex items-center bg-white px-7 py-4 text-xs uppercase tracking-[.16em] text-black transition hover:bg-[#e9e6de]">Start your home request <ArrowRight className="ml-3 size-4" /></Link><p className="mt-4 text-xs text-white/50">A few guided steps. No account required.</p></div>
          </div>
        </div>
      </section>

      <section className="border-b border-black/10 bg-[#e9e6de] px-6 py-7 lg:px-10"><div className="mx-auto grid max-w-7xl gap-6 sm:grid-cols-3"><div className="flex gap-3"><HomeIcon className="mt-1 size-5 shrink-0" /><div><p className="font-serif text-xl">Tell us what you need</p><p className="mt-2 text-sm leading-6 text-black/55">Property type, budget, timing, and preferences.</p></div></div><div className="flex gap-3"><MapPin className="mt-1 size-5 shrink-0" /><div><p className="font-serif text-xl">Choose your market</p><p className="mt-2 text-sm leading-6 text-black/55">Narrow your search to the communities that fit.</p></div></div><div className="flex gap-3"><ShieldCheck className="mt-1 size-5 shrink-0" /><div><p className="font-serif text-xl">Get a personal follow-up</p><p className="mt-2 text-sm leading-6 text-black/55">Our team reviews your request and contacts you about next steps.</p></div></div></div></section>

      <section id="markets" className="mx-auto max-w-7xl px-6 py-20 lg:px-10 lg:py-28">
        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><p className="eyebrow">Where we work</p><h2 className="section-title mt-3">Three markets.<br /><i>One clear next step.</i></h2></div><p className="max-w-md text-sm leading-7 text-black/55">Start with the area that feels right. You can share a city, neighborhood, or ZIP code in your request — and you can tell us if you’re open to more than one market.</p></div>
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {markets.map((market) => <Link key={market.name} to="/markets/$market" params={{ market: market.slug }} aria-label={"Explore " + market.name} className="group relative block min-h-[440px] overflow-hidden bg-black outline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-black"><img src={market.image} alt={"Residential architecture and neighborhoods in " + market.name} className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105" loading="lazy" /><div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/15 to-black/5 transition group-hover:from-black/90" /><div className="absolute inset-x-0 bottom-0 p-6 text-white sm:p-7"><p className="text-xs uppercase tracking-[.16em] text-white/65">{market.subtitle}</p><h3 className="mt-2 font-serif text-4xl">{market.name}</h3><p className="mt-3 max-w-sm text-sm leading-6 text-white/75">{market.copy}</p><span className="mt-5 inline-flex items-center border-b border-white/60 pb-2 text-xs uppercase tracking-[.14em]">Discover the area <ArrowRight className="ml-2 size-4 transition-transform group-hover:translate-x-1" /></span></div></Link>)}
        </div>
      </section>

      <section id="process" className="bg-[#171716] px-6 py-20 text-white lg:px-10 lg:py-24"><div className="mx-auto max-w-7xl"><p className="eyebrow text-white/45">A guided process</p><h2 className="section-title mt-3 text-white">Clear from the<br /><i>very beginning.</i></h2><div className="mt-12 grid gap-8 md:grid-cols-3"><div className="border-t border-white/20 pt-5"><p className="eyebrow text-white/45">01 / Share</p><h3 className="mt-3 font-serif text-2xl">Describe your goals</h3><p className="mt-3 text-sm leading-6 text-white/60">Answer a few guided questions about the home, budget, timeline, and area you have in mind.</p></div><div className="border-t border-white/20 pt-5"><p className="eyebrow text-white/45">02 / Review</p><h3 className="mt-3 font-serif text-2xl">We review your request</h3><p className="mt-3 text-sm leading-6 text-white/60">Our team uses your preferences to understand what opportunities may fit and what questions need a follow-up.</p></div><div className="border-t border-white/20 pt-5"><p className="eyebrow text-white/45">03 / Connect</p><h3 className="mt-3 font-serif text-2xl">An agent follows up</h3><p className="mt-3 text-sm leading-6 text-white/60">We contact you about possible next steps. Submitting a request does not guarantee a property, financing, or a purchase.</p></div></div><Link to="/find-a-home" className="mt-10 inline-flex items-center bg-white px-7 py-4 text-xs uppercase tracking-[.16em] text-black">Tell us what you're looking for <ArrowRight className="ml-3 size-4" /></Link></div></section>

      <section className="bg-[#e9e6de] px-6 py-20 lg:px-10"><div className="mx-auto flex max-w-7xl flex-col justify-between gap-8 md:flex-row md:items-end"><div><p className="eyebrow">For owners and contract holders</p><h2 className="section-title mt-3">Have an opportunity<br /><i>to share?</i></h2><p className="mt-4 max-w-xl text-sm leading-7 text-black/60">Property owners and authorized contract holders can still submit opportunities privately for review. Seller submissions remain a separate process.</p></div><Link to="/submit-property" className="inline-flex w-fit items-center border border-black/20 px-7 py-4 text-xs uppercase tracking-[.16em]">Submit a property <ArrowRight className="ml-3 size-4" /></Link></div></section>

      <footer className="flex flex-col gap-4 bg-[#171716] px-6 py-8 text-[10px] uppercase tracking-[.15em] text-white/45 sm:flex-row sm:items-center sm:justify-between lg:px-10"><span>© 2026 Liberty Crest Realty · Dallas · Houston · Rio Grande Valley</span></footer>
    </main>
  );
}
