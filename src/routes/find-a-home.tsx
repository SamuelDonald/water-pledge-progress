import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, ArrowRight, CheckCircle2, ChevronLeft, MapPin } from "lucide-react";
import { submitBuyerRequest } from "@/lib/buyer-requests.functions";

export const Route = createFileRoute("/find-a-home")({ validateSearch: (search: Record<string, unknown>) => ({ market: typeof search.market === "string" ? search.market : undefined }), component: FindAHome });

const markets = ["Dallas", "Houston", "Rio Grande Valley"] as const;
const marketCities: Record<string, string[]> = {
  Dallas: ["Dallas", "Fort Worth", "Arlington", "Plano", "Irving", "Frisco", "Garland", "Grand Prairie", "Mesquite", "Other / not sure"],
  Houston: ["Houston", "Katy", "Pearland", "Sugar Land", "Pasadena", "Cypress", "Spring", "The Woodlands", "Humble", "Other / not sure"],
  "Rio Grande Valley": ["McAllen", "Edinburg", "Mission", "Brownsville", "Harlingen", "Pharr", "Weslaco", "San Benito", "Other / not sure"],
};
const options = {
  homeType: ["Single-family home", "Townhouse or duplex", "Condo", "Multi-family property", "Land or other", "Not sure yet"],
  priceRange: ["Under $100,000", "$100,000–$149,999", "$150,000–$199,999", "$200,000–$300,000", "$300,001–$400,000", "$400,001–$500,000", "Over $500,000", "Flexible / not sure"],
  use: ["Primary residence", "Second home", "Rental or investment property", "Other / undecided"],
  military: ["No", "Active duty", "Reserve or National Guard", "Veteran", "Prefer not to say"],
  branch: ["Army", "Navy", "Air Force", "Marine Corps", "Space Force", "Coast Guard", "Other", "Prefer not to say"],
  downPayment: ["0% / no down payment planned", "1–4%", "5–10%", "11–20%", "More than 20%", "Not sure yet"],
  journey: ["Looking around", "Getting serious", "Ready to buy"],
  credit: ["Below 580", "580–619", "620–639", "640–699", "700–749", "750 or higher", "Not sure", "Prefer not to say"],
  employment: ["Employed full-time", "Employed part-time", "Self-employed / business owner", "Contractor / freelance", "Retired", "Not currently employed", "Other / prefer not to say"],
  income: ["Under $25,000", "$25,000–$49,999", "$50,000–$74,999", "$75,000–$99,999", "$100,000–$149,999", "$150,000 or more", "Not sure / prefer not to say"],
  timeline: ["As soon as possible", "Within 1 month", "1–3 months", "3–6 months", "6–12 months", "More than 12 months", "No specific timeline"],
  path: ["Traditional home purchase", "Explore contractual rights to a property", "Open to both", "Need more information"],
} as const;

type Answers = {
  homeType: string; priceRange: string; use: string; military: string; branch: string; downPayment: string;
  journey: string; credit: string; employment: string; income: string; timeline: string; path: string;
  markets: string[]; city: string; otherCity: string; area: string; notes: string; name: string; email: string; phone: string; contactConsent: boolean;
};
const initial: Answers = { homeType: "", priceRange: "", use: "", military: "", branch: "", downPayment: "", journey: "", credit: "", employment: "", income: "", timeline: "", path: "", markets: [], city: "", otherCity: "", area: "", notes: "", name: "", email: "", phone: "", contactConsent: false };

function FindAHome() {
  const search = Route.useSearch();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>(() => ({ ...initial, markets: search.market && markets.includes(search.market as typeof markets[number]) ? [search.market] : [] }));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const update = (key: keyof Answers, value: string | boolean | string[]) => setAnswers((old) => ({ ...old, [key]: value }));
  const pages = [
    { title: "What kind of home are you looking for?", description: "Start with the type of property that fits your plans.", key: "homeType" as const, choices: options.homeType },
    { title: "What price range feels right?", description: "Choose a target range. You can share more context with our team later.", key: "priceRange" as const, choices: options.priceRange },
    { title: "How will you use the property?", description: "This helps us understand which opportunities may fit.", key: "use" as const, choices: options.use },
    { title: "Tell us a little about your situation", description: "These optional details help us understand the type of next steps you may need.", key: "military" as const, choices: options.military },
    { title: "What down payment are you considering?", description: "This is a preference, not a financing assessment. Choose Not sure if you are still exploring.", key: "downPayment" as const, choices: options.downPayment },
    { title: "Where are you in the buying journey?", description: "There is no wrong answer — this simply helps us understand your readiness.", key: "journey" as const, choices: options.journey },
    { title: "A few optional planning details", description: "Ranges are enough. You can skip these questions if you prefer.", key: "credit" as const, choices: options.credit },
    { title: "When are you hoping to move?", description: "Choose the closest match or let us know you are flexible.", key: "timeline" as const, choices: options.timeline },
    { title: "How should we help you move forward?", description: "Choose the path that best describes your interest.", key: "path" as const, choices: options.path },
    { title: "Which area should we focus on?", description: "Select one or more markets, then narrow your search.", key: "markets" as const, choices: markets as unknown as readonly string[] },
    { title: "How can we contact you?", description: "Your contact details are used to respond to this request.", key: "contact" as const, choices: [] as readonly string[] },
  ];
  const current = pages[step];
  const selected = current.key === "markets" ? answers.markets.length > 0 : current.key === "contact" ? answers.name.trim().length >= 2 && /^\\S+@\\S+\\.\\S+$/.test(answers.email) && answers.phone.trim().length >= 7 && answers.contactConsent : Boolean(answers[current.key as keyof Answers]);
  const canContinue = step === 4 || step === 6 ? true : step === 3 ? Boolean(answers.military) && (!["Active duty", "Reserve or National Guard", "Veteran"].includes(answers.military) || Boolean(answers.branch)) : selected;

  async function submit() {
    setBusy(true); setError("");
    try {
      await submitBuyerRequest({ data: answers });
      setSuccess(true);
    } catch {
      setError("We couldn't submit your request just now. Your answers are still here — please try again.");
    } finally { setBusy(false); }
  }

  return <main className="min-h-screen bg-[#f5f3ee] text-[#171716]">
    <header className="border-b border-black/10 px-6 py-5"><div className="mx-auto flex max-w-7xl items-center justify-between"><Link to="/" className="font-serif text-2xl sm:text-3xl">Liberty Crest Realty</Link><Link to="/" className="text-xs uppercase tracking-[.14em]"><ArrowLeft className="mr-2 inline size-4" />Back to home</Link></div></header>
    <div className="mx-auto grid max-w-7xl gap-10 px-6 py-10 lg:grid-cols-[.75fr_1.25fr] lg:gap-16 lg:py-16">
      <aside className="lg:sticky lg:top-8 lg:self-start"><p className="eyebrow">Your home search</p><h1 className="mt-4 font-serif text-5xl leading-[.98] sm:text-6xl">Let’s find the<br /><i>right opportunity.</i></h1><p className="mt-5 max-w-md text-sm leading-7 text-black/60">Answer a few questions at your own pace. You can go back to change answers before you submit.</p><div className="mt-8 space-y-4 border-t border-black/10 pt-6 text-sm text-black/60"><p className="flex gap-3"><CheckCircle2 className="size-5 shrink-0" />No account needed</p><p className="flex gap-3"><CheckCircle2 className="size-5 shrink-0" />Ranges are fine; optional questions can be skipped</p><p className="flex gap-3"><CheckCircle2 className="size-5 shrink-0" />A team member will review your request</p></div></aside>
      <section className="min-w-0 bg-white p-5 shadow-sm sm:p-8 lg:p-10">
        {success ? <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-4" role="dialog" aria-modal="true" aria-labelledby="request-confirmation-title"><div className="w-full max-w-lg bg-[#f5f3ee] p-7 text-center shadow-2xl sm:p-10"><div className="mx-auto flex size-16 items-center justify-center rounded-full bg-[#e8eee7]"><CheckCircle2 className="size-8 text-[#42684c]" /></div><p className="eyebrow mt-7">Request received</p><h2 id="request-confirmation-title" className="mt-3 font-serif text-4xl sm:text-5xl">Thank you.</h2><p className="mx-auto mt-4 max-w-md text-sm leading-7 text-black/60">Your home request has been submitted. A Liberty Crest Realty agent will review your preferences and contact you soon about possible next steps.</p><p className="mx-auto mt-5 max-w-md text-xs leading-5 text-black/45">This request does not guarantee property availability, financing, or a purchase. Contractual rights, if relevant, require separate review and documentation.</p><button onClick={() => void navigate({ to: "/" })} className="mt-8 bg-black px-7 py-4 text-xs uppercase tracking-[.15em] text-white">Return to home</button></div></div> : null}
        <div aria-hidden={success ? "true" : undefined}>
          <div className="flex items-center justify-between gap-3"><p className="eyebrow">Step {step + 1} of {pages.length}</p><p className="text-xs text-black/45">{Math.round(((step + 1) / pages.length) * 100)}% complete</p></div><div className="mt-3 h-1.5 overflow-hidden bg-black/10"><div className="h-full bg-[#171716] transition-all" style={{ width: (((step + 1) / pages.length) * 100) + "%" }} /></div>
          <div className="mt-8"><h2 className="font-serif text-3xl leading-tight sm:text-4xl">{current.title}</h2><p className="mt-3 text-sm leading-6 text-black/55">{current.description}</p></div>
          <div className="mt-7 space-y-3">
            {current.key === "markets" ? <div className="space-y-3">{markets.map((market) => <label key={market} className={"flex cursor-pointer items-center gap-3 border p-4 transition " + (answers.markets.includes(market) ? "border-black bg-[#f5f3ee]" : "border-black/10 hover:border-black/35")}><input type="checkbox" checked={answers.markets.includes(market)} onChange={(e) => update("markets", e.target.checked ? [...answers.markets, market] : answers.markets.filter((x) => x !== market))} /><span className="flex-1">{market}</span><MapPin className="size-4 text-black/45" /></label>)}
                <label className="field mt-5">Preferred city or community<select value={answers.city} onChange={(e) => update("city", e.target.value)}><option value="">Choose a city (optional)</option>{[...new Set(answers.markets.flatMap((market) => marketCities[market] ?? []))].map((city) => <option key={city}>{city}</option>)}</select></label>{answers.city === "Other / not sure" ? <label className="field">Tell us the city or community<input value={answers.otherCity} onChange={(e) => update("otherCity", e.target.value)} placeholder="Enter your preferred city" maxLength={160} /></label> : null}<label className="field">Neighborhood or ZIP code (optional)<input value={answers.area} onChange={(e) => update("area", e.target.value)} placeholder="Enter a neighborhood or ZIP code" maxLength={160} /></label></div>
              : current.key === "contact" ? <div className="space-y-5"><label className="field">Full name<input value={answers.name} onChange={(e) => update("name", e.target.value)} required autoComplete="name" maxLength={120} /></label><label className="field">Email address<input value={answers.email} onChange={(e) => update("email", e.target.value)} required type="email" autoComplete="email" maxLength={254} /></label><label className="field">Phone number<input value={answers.phone} onChange={(e) => update("phone", e.target.value)} required type="tel" autoComplete="tel" maxLength={40} /></label><label className="flex items-start gap-3 text-sm leading-6"><input type="checkbox" checked={answers.contactConsent} onChange={(e) => update("contactConsent", e.target.checked)} className="mt-1" /><span>I agree that Liberty Crest Realty may contact me about this request by phone or email. This is not consent to unrelated marketing or automated text messages.</span></label></div>
              : current.key === "military" ? <div className="space-y-3">{options.military.map((choice) => <Choice key={choice} label={choice} selected={answers.military === choice} onClick={() => update("military", choice)} />)}{["Active duty", "Reserve or National Guard", "Veteran"].includes(answers.military) ? <div className="mt-5"><p className="mb-3 text-sm font-medium">Branch of service</p><div className="space-y-2">{options.branch.map((choice) => <Choice key={choice} label={choice} selected={answers.branch === choice} onClick={() => update("branch", choice)} />)}</div></div> : null}</div>
              : current.key === "credit" ? <div className="space-y-6"><div><p className="mb-3 text-sm font-medium">Estimated credit score (optional)</p><div className="space-y-2">{options.credit.map((choice) => <Choice key={choice} label={choice} selected={answers.credit === choice} onClick={() => update("credit", choice)} />)}</div></div><div><p className="mb-3 text-sm font-medium">Employment situation (optional)</p><div className="space-y-2">{options.employment.map((choice) => <Choice key={choice} label={choice} selected={answers.employment === choice} onClick={() => update("employment", choice)} />)}</div></div><div><p className="mb-3 text-sm font-medium">Annual household income (optional)</p><div className="space-y-2">{options.income.map((choice) => <Choice key={choice} label={choice} selected={answers.income === choice} onClick={() => update("income", choice)} />)}</div></div></div>
              : current.key === "path" ? <div className="space-y-3">{options.path.map((choice) => <Choice key={choice} label={choice} selected={answers.path === choice} onClick={() => update("path", choice)} />)}{["Explore contractual rights to a property", "Open to both", "Need more information"].includes(answers.path) ? <p className="mt-3 border-l-2 border-black/20 pl-4 text-xs leading-5 text-black/55">Contractual rights and assignments involve separate legal and financial considerations. Selecting this option requests a conversation; it does not create or guarantee any rights.</p> : null}</div>
              : <div className="space-y-3">{current.choices.map((choice) => <Choice key={choice} label={choice} selected={answers[current.key as keyof Answers] === choice} onClick={() => update(current.key as keyof Answers, choice)} />)}</div>}
          </div>
          {error ? <p role="alert" className="mt-5 bg-red-50 p-4 text-sm text-red-800">{error}</p> : null}
          <div className="mt-9 flex items-center justify-between gap-3 border-t border-black/10 pt-5"><button type="button" disabled={step === 0 || busy} onClick={() => { setStep((n) => Math.max(0, n - 1)); setError(""); }} className="inline-flex items-center gap-2 px-3 py-3 text-xs uppercase tracking-[.12em] text-black/60 disabled:opacity-30"><ChevronLeft className="size-4" />Back</button><button type="button" disabled={busy || !canContinue} onClick={() => { if (step < pages.length - 1) { setStep((n) => n + 1); setError(""); } else void submit(); }} className="inline-flex items-center bg-black px-6 py-4 text-xs uppercase tracking-[.14em] text-white disabled:opacity-40">{step === pages.length - 1 ? (busy ? "Submitting…" : "Submit request") : "Continue"} <ArrowRight className="ml-3 size-4" /></button></div>
          <p className="mt-5 text-center text-[11px] leading-5 text-black/40">Your information is used to respond to this request. Please do not include sensitive financial account numbers or government identification.</p>
        </div>
      </section>
    </div>
  </main>;
}

function Choice({ label, selected, onClick }: { label: string; selected: boolean; onClick: () => void }) {
  return <button type="button" onClick={onClick} aria-pressed={selected} className={"flex w-full items-center justify-between border p-4 text-left text-sm transition " + (selected ? "border-black bg-[#f5f3ee]" : "border-black/10 hover:border-black/35")}><span>{label}</span><span className={"ml-3 flex size-4 shrink-0 items-center justify-center rounded-full border " + (selected ? "border-black bg-black" : "border-black/25")}>{selected ? <span className="size-1.5 rounded-full bg-white" /> : null}</span></button>;
}
