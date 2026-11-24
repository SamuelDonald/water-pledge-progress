import { useState, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowUpRight, Landmark, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const links = [
  { to: "/how-it-works", label: "How it works" },
  { to: "/texas-coverage", label: "Texas coverage" },
  { to: "/security", label: "Security & FAQs" },
] as const;

export function PublicSiteFrame({ children }: { children: ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="relative z-30 border-b border-border bg-background">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-5 px-5 py-4 md:px-8">
          <Link to="/" className="flex shrink-0 items-center gap-3" aria-label="Liberty Crest Escrow Services home">
            <span className="flex size-10 items-center justify-center border border-accent/60 text-accent"><Landmark size={19} strokeWidth={1.5} /></span>
            <span className="leading-tight"><span className="block font-serif text-lg">LIBERTY CREST</span><span className="mt-1 block text-[9px] uppercase tracking-[0.22em] text-muted-foreground">Escrow Services</span></span>
          </Link>
          <nav className="hidden items-center gap-7 lg:flex" aria-label="Main navigation">
            {links.map((link) => <Link key={link.to} to={link.to} className="text-xs text-muted-foreground transition-colors hover:text-foreground">{link.label}</Link>)}
            <Button variant="outline" asChild><Link to="/auth">Sign in <ArrowUpRight /></Link></Button>
            <Button asChild><Link to="/realtor">Realtor access</Link></Button>
          </nav>
          <Button className="lg:hidden" variant="outline" size="icon" aria-label={menuOpen ? "Close navigation" : "Open navigation"} onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X /> : <Menu />}</Button>
        </div>
        {menuOpen && <nav className="grid gap-4 border-t border-border bg-background px-5 py-5 lg:hidden" aria-label="Mobile navigation">
          {links.map((link) => <Link key={link.to} to={link.to} onClick={() => setMenuOpen(false)} className="py-1 text-sm text-muted-foreground">{link.label}</Link>)}
          <Link to="/auth" onClick={() => setMenuOpen(false)} className="py-1 text-sm">Sign in</Link>
          <Button asChild><Link to="/realtor" onClick={() => setMenuOpen(false)}>Realtor access</Link></Button>
        </nav>}
      </header>
      {children}
      <footer className="border-t border-border bg-ink text-ink-foreground">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-5 px-5 py-7 text-xs md:flex-row md:items-center md:px-8">
          <div><p className="font-serif text-lg">Liberty Crest Escrow Services</p><p className="mt-1 text-ink-foreground/60">Texas residential transaction coordination</p></div>
          <p className="max-w-xl leading-6 text-ink-foreground/60">Payment methods are not active. No deposit, custody, or disbursement is processed through this website.</p>
        </div>
      </footer>
    </div>
  );
}