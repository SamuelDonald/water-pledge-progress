import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, Bath, BedDouble } from "lucide-react";
import { useEffect, useState } from "react";
import { getPropertyBySlug, type Property } from "@/lib/navalhomes";
import { submitInquiry } from "@/lib/navalhomes.functions";

export const Route = createFileRoute("/properties/$slug")({ component: PropertyPage });

const money = (n:number) => new Intl.NumberFormat("en-US",{style:"currency",currency:"USD",maximumFractionDigits:0}).format(n);

function Inquiry({ property }: { property: Property }) {
  const [sent,setSent]=useState(false);
  const [error,setError]=useState("");
  if(sent) return <div className="border border-black/10 p-8"><p className="eyebrow">Inquiry received</p><h3 className="mt-3 font-serif text-4xl">Thank you.</h3><p className="mt-3 text-black/55">Liberty Crest Realty will be in touch.</p></div>;
  return <form onSubmit={async e=>{e.preventDefault();setError("");const f=new FormData(e.currentTarget);try{await submitInquiry({data:{propertyId:property.id,name:f.get("name"),phone:f.get("phone"),email:f.get("email"),message:f.get("message"),allowPhone:f.get("phoneOk")==="on",allowSms:f.get("smsOk")==="on",allowWhatsapp:f.get("waOk")==="on"}});setSent(true)}catch{setError("We couldn't send your inquiry. Please try again.")}}} className="space-y-4">
    <input required name="name" placeholder="Name" className="field-input w-full"/>
    <input required name="phone" placeholder="Phone" className="field-input w-full"/>
    <input required name="email" type="email" placeholder="Email" className="field-input w-full"/>
    <textarea required name="message" rows={5} defaultValue={`I'm interested in ${property.title}`} className="field-input w-full resize-none"/>
    <div className="space-y-2 text-xs text-black/60">
      <label className="block"><input name="phoneOk" type="checkbox" className="mr-2"/>Permission to contact me by phone</label>
      <label className="block"><input name="smsOk" type="checkbox" className="mr-2"/>Permission to contact me by SMS</label>
      <label className="block"><input name="waOk" type="checkbox" className="mr-2"/>Permission to contact me on WhatsApp</label>
    </div>
    {error?<p className="text-xs text-red-700">{error}</p>:null}
    <button className="bg-black px-7 py-4 text-xs uppercase tracking-[.16em] text-white">Send inquiry <ArrowRight className="ml-2 inline size-4"/></button>
  </form>;
}

function PropertyPage(){
  const {slug}=Route.useParams();
  const [property,setProperty]=useState<Property|null>(null);
  useEffect(()=>{getPropertyBySlug(slug).then(setProperty)},[slug]);
  if(!property) return <div className="min-h-screen bg-[#f5f3ee] p-8"><Link to="/" className="text-sm">← Back to Liberty Crest Realty</Link><p className="mt-16 text-black/50">Residence not found.</p></div>;
  const media=property.media??[];
  const opportunityLabel = property.opportunity_type === "contract_assignment" ? "Contract assignment" : property.opportunity_type === "seller_introduction" ? "Seller opportunity" : "Direct purchase";
  const displayPrice = property.price;
  const priceLabel = property.opportunity_type === "contract_assignment" ? "Contract acquisition price" : "Asking price";
  return <div className="min-h-screen bg-[#f5f3ee]">
    <header className="flex items-center justify-between px-6 py-6 lg:px-10"><Link to="/" className="font-serif text-3xl">Liberty Crest Realty</Link><Link to="/" className="text-xs uppercase tracking-[.16em]"><ArrowLeft className="mr-2 inline size-4"/>Back</Link></header>
    <main className="mx-auto max-w-7xl px-6 pb-24 lg:px-10">
      <div className="grid gap-1 lg:grid-cols-2">
        {media.length?media.map(m=>m.media_type==="video"?<video key={m.id} src={m.url} controls playsInline className="aspect-[4/3] w-full object-cover"/>:<img key={m.id} src={m.url} alt={m.caption??property.title} className="aspect-[4/3] w-full object-cover"/>):<div className="aspect-[4/3] bg-black/10"/>}
      </div>
      <div className="mt-14 grid gap-14 lg:grid-cols-[1.3fr_.7fr]">
        <div><p className="eyebrow">{property.location} · {opportunityLabel}</p><h1 className="mt-3 font-serif text-[clamp(3.5rem,7vw,7rem)] leading-[.9]">{property.title}</h1><p className="mt-6 max-w-2xl text-lg leading-8 text-black/60">{property.description}</p>
          <div className="my-10 grid grid-cols-3 border-y border-black/10 py-6 text-sm"><span><BedDouble className="mr-2 inline size-4"/>{property.bedrooms} beds</span><span><Bath className="mr-2 inline size-4"/>{property.bathrooms} baths</span><span>{property.sqft.toLocaleString()} sqft</span></div>
          {property.neighborhood?<p className="text-sm text-black/55">{property.neighborhood} · {property.city}</p>:<p className="text-sm text-black/55">{property.city}</p>}
        </div>
        <aside><p className="font-serif text-4xl">{money(displayPrice)}</p><p className="mt-2 text-[10px] uppercase tracking-[.14em] text-black/45">{priceLabel}</p><p className="mt-2 text-xs text-black/45">{property.status}</p><div className="mt-8"><Inquiry property={property}/></div><p className="mt-5 text-xs leading-5 text-black/50">An inquiry is not an offer or binding agreement. The seller or authorized contract holder decides whether to proceed.</p></aside>
      </div>
      <section className="mt-16 border-t border-black/10 pt-8"><p className="eyebrow">Opportunity and disclosure</p><p className="mt-3 max-w-5xl text-xs leading-6 text-black/55">Liberty Crest Realty distinguishes direct property opportunities from contractual interests. A contract assignment listing is not a representation that the contract holder owns legal title to the property. Applicable written disclosures about the nature of the equitable interest must be provided to the potential buyer and property owner before entering into an assignment contract, as required by Texas Property Code § 5.0205 and Texas Occupations Code § 1101.0045. Independent legal and closing professionals should review transaction documents.</p></section>
    </main>
  </div>;
}
