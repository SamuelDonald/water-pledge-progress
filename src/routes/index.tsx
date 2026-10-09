import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, Bath, BedDouble, LockKeyhole, Menu, Search } from "lucide-react";
import { getProperties, locationImages, type Property } from "@/lib/navalhomes";
import { supabase } from "@/integrations/supabase/client";
import { submitInquiry } from "@/lib/navalhomes.functions";

export const Route = createFileRoute("/")({ component: Home });

const money = (n: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);

type Location = Property["location"];

function Card({ p }: { p: Property }) {
  const opportunityLabel = p.opportunity_type === "contract_assignment" ? "Contract assignment" : p.opportunity_type === "seller_introduction" ? "Seller opportunity" : "Direct purchase";
  const displayPrice = p.price;
  const priceLabel = p.opportunity_type === "contract_assignment" ? "Contract acquisition price" : "Asking price";
  return (
    <Link to="/properties/$slug" params={{ slug: p.slug }} className="group block text-left">
      <div className="relative aspect-[4/3] overflow-hidden bg-black">
        <img
          src={p.media?.find((m) => m.media_type === "image")?.url ?? locationImages[p.location]}
          alt={p.title}
          className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute inset-x-0 top-0 flex justify-between p-4">
          <span className="glass-label">{opportunityLabel}</span>
          {p.is_featured ? <span className="glass-label">Featured</span> : null}
        </div>
      </div>
      <div className="pt-4">
        <div className="flex justify-between gap-4">
          <h3 className="font-serif text-2xl">{p.title}</h3>
          <span className="shrink-0 text-right"><strong className="block font-medium">{money(displayPrice)}</strong><small className="mt-1 block text-[9px] uppercase tracking-[.12em] text-black/45">{priceLabel}</small></span>
        </div>
        <p className="mt-1 text-sm text-black/50">{p.neighborhood ?? p.city} · {p.property_type} · {p.status}</p>
        {p.opportunity_summary ? <p className="mt-3 max-w-xl text-sm leading-6 text-black/60">{p.opportunity_summary}</p> : null}
        <div className="mt-3 flex gap-5 text-xs text-black/55">
          <span><BedDouble className="mr-1 inline size-3.5" />{p.bedrooms} beds</span>
          <span><Bath className="mr-1 inline size-3.5" />{p.bathrooms} baths</span>
          <span>{p.sqft.toLocaleString()} sqft</span>
        </div>
      </div>
    </Link>
  );
}

function Inquiry({ property }: { property?: Property }) {
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  if (sent) {
    return (
      <div className="border border-white/15 p-8">
        <p className="eyebrow text-white/40">Inquiry received</p>
        <h3 className="mt-3 font-serif text-4xl">Thank you.</h3>
        <p className="mt-3 text-white/55">NavalHomes will be in touch.</p>
      </div>
    );
  }

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        setError("");
        const f = new FormData(e.currentTarget);
        try {
          await submitInquiry({
            data: {
              propertyId: property?.id.startsWith("demo-") ? null : property?.id ?? null,
              name: f.get("name"),
              phone: f.get("phone"),
              email: f.get("email"),
              message: f.get("message"),
              allowPhone: f.get("phoneOk") === "on",
              allowSms: f.get("smsOk") === "on",
              allowWhatsapp: f.get("waOk") === "on",
            },
          });
          setSent(true);
        } catch {
          setError("We couldn't send your inquiry. Please try again.");
        }
      }}
      className="space-y-4"
    >
      <input required name="name" placeholder="Name" className="dark-field" />
      <input required name="phone" placeholder="Phone" className="dark-field" />
      <input required name="email" type="email" placeholder="Email" className="dark-field" />
      <textarea
        required
        name="message"
        rows={5}
        defaultValue={property ? `I'm interested in ${property.title}` : ""}
        placeholder="Tell us what you're looking for"
        className="dark-field resize-none"
      />
      <div className="space-y-2 text-xs text-white/60">
        <label className="block"><input name="phoneOk" type="checkbox" className="mr-2" />Permission to contact me by phone</label>
        <label className="block"><input name="smsOk" type="checkbox" className="mr-2" />Permission to contact me by SMS</label>
        <label className="block"><input name="waOk" type="checkbox" className="mr-2" />Permission to contact me on WhatsApp</label>
      </div>
      {error ? <p className="text-xs text-red-300">{error}</p> : null}
      <button className="bg-white px-7 py-4 text-xs uppercase tracking-[.16em] text-black">
        Send inquiry <ArrowRight className="ml-2 inline size-4" />
      </button>
    </form>
  );
}

function SellerSubmission() {
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  if (sent) return <div className="border border-white/15 p-8"><p className="eyebrow text-white/40">Submission received</p><h3 className="mt-3 font-serif text-4xl">We will follow up.</h3><p className="mt-3 text-sm leading-6 text-white/60">Your opportunity has been sent to NavalHomes for initial review.</p></div>;
  return <form className="grid gap-4 sm:grid-cols-2" onSubmit={async (e) => {
    e.preventDefault(); setError(""); const f = new FormData(e.currentTarget);
    const message = [
      "SELLER / CONTRACT OPPORTUNITY SUBMISSION",
      `Opportunity route: ${String(f.get("route") ?? "")}`,
      `Property location: ${String(f.get("city") ?? "")}`,
      `Property type: ${String(f.get("assetType") ?? "")}`,
      `Contract status: ${String(f.get("contractStatus") ?? "")}`,
      `Estimated price/value: ${String(f.get("value") ?? "") || "Not provided"}`,
      `Additional details: ${String(f.get("details") ?? "") || "Not provided"}`,
    ].join("\n");
    try {
      await submitInquiry({ data: { propertyId: null, name: f.get("name"), phone: f.get("phone"), email: f.get("email"), message, allowPhone: f.get("phoneOk") === "on", allowSms: f.get("smsOk") === "on", allowWhatsapp: f.get("waOk") === "on" } });
      setSent(true);
    } catch { setError("We could not send your submission. Please try again."); }
  }}>
    <input required name="name" placeholder="Your name" className="dark-field" />
    <input required name="phone" placeholder="Phone number" className="dark-field" />
    <input required type="email" name="email" placeholder="Email address" className="dark-field" />
    <input required name="city" placeholder="City / neighborhood" className="dark-field" />
    <label className="field text-white/55">Submission type<select name="route" required className="mt-1 border-b border-white/20 bg-transparent py-3 text-sm text-white"><option className="text-black" value="Seller property lead">Seller property lead</option><option className="text-black" value="Existing purchase contract for possible assignment">Existing purchase contract for possible assignment</option><option className="text-black" value="Direct property sale opportunity">Direct property sale opportunity</option></select></label>
    <label className="field text-white/55">Asset type<select name="assetType" required className="mt-1 border-b border-white/20 bg-transparent py-3 text-sm text-white"><option className="text-black">Single-family residential</option><option className="text-black">Multi-family</option><option className="text-black">Land</option><option className="text-black">Commercial</option><option className="text-black">Mixed-use</option><option className="text-black">Other</option></select></label>
    <label className="field text-white/55">Contract status<select name="contractStatus" required className="mt-1 border-b border-white/20 bg-transparent py-3 text-sm text-white"><option className="text-black" value="No purchase contract">No purchase contract</option><option className="text-black" value="Existing contract held">Existing contract held</option><option className="text-black" value="Contract rights / assignment eligibility unknown">Not sure</option></select></label>
    <input name="value" placeholder="Expected price / value (optional)" className="dark-field" />
    <textarea name="details" rows={3} placeholder="Brief property details (do not include confidential documents)" className="dark-field resize-none sm:col-span-2" />
    <div className="space-y-2 text-xs text-white/55 sm:col-span-2"><label className="block"><input name="phoneOk" type="checkbox" className="mr-2" />You may contact me by phone</label><label className="block"><input name="smsOk" type="checkbox" className="mr-2" />You may contact me by SMS</label><label className="block"><input name="waOk" type="checkbox" className="mr-2" />You may contact me on WhatsApp</label></div>
    {error ? <p className="text-xs text-red-300 sm:col-span-2">{error}</p> : null}
    <button className="w-fit bg-white px-7 py-4 text-xs uppercase tracking-[.16em] text-black sm:col-span-2">Submit opportunity <ArrowRight className="ml-2 inline size-4" /></button>
  </form>;
}

function Admin({ close, properties, onRefresh }: { close: () => void; properties: Property[]; onRefresh: () => void }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [ok, setOk] = useState(false);
  const [editing, setEditing] = useState<Property | null>(null);
  const empty = {
    title: "", slug: "", location: "Dallas", city: "Dallas", status: "For Sale", property_type: "House",
    price: "", bedrooms: "", bathrooms: "", sqft: "", lot_size: "", description: "", neighborhood: "",
    address: "", latitude: "", longitude: "", is_featured: false, is_published: false,
  };
  const [form, setForm] = useState(empty);

  const login = async () => {
    const email = import.meta.env.VITE_ADMIN_EMAIL;
    if (!email) return setError("Set VITE_ADMIN_EMAIL to the NavalHomes admin account.");
    const result = await supabase.auth.signInWithPassword({ email, password });
    if (result.error) setError("Incorrect password.");
    else setOk(true);
  };

  const save = async () => {
    setError("");
    const payload = {
      ...form,
      price: Number(form.price) || 0,
      bedrooms: Number(form.bedrooms) || 0,
      bathrooms: Number(form.bathrooms) || 0,
      sqft: Number(form.sqft) || 0,
      lot_size: form.lot_size ? Number(form.lot_size) : null,
      latitude: form.latitude ? Number(form.latitude) : null,
      longitude: form.longitude ? Number(form.longitude) : null,
    };
    const query = editing
      ? (supabase as any).from("properties").update(payload).eq("id", editing.id)
      : (supabase as any).from("properties").insert(payload);
    const { error: saveError } = await query;
    if (saveError) return setError(saveError.message);
    setForm(empty);
    setEditing(null);
    onRefresh();
  };

  const edit = (p: Property) => {
    setEditing(p);
    setForm({
      title: p.title, slug: p.slug, location: p.location, city: p.city, status: p.status,
      property_type: p.property_type, price: String(p.price), bedrooms: String(p.bedrooms),
      bathrooms: String(p.bathrooms), sqft: String(p.sqft), lot_size: p.lot_size ? String(p.lot_size) : "",
      description: p.description, neighborhood: p.neighborhood ?? "", address: p.address ?? "",
      latitude: p.latitude ? String(p.latitude) : "", longitude: p.longitude ? String(p.longitude) : "",
      is_featured: p.is_featured, is_published: p.is_published,
    });
  };

  const uploadMedia = async (files: FileList | null) => {
    if (!editing || !files) return;
    for (const file of Array.from(files)) {
      const path = `${editing.id}/${crypto.randomUUID()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "-")}`;
      const upload = await (supabase as any).storage.from("property-media").upload(path, file);
      if (upload.error) return setError(upload.error.message);
      const publicUrl = (supabase as any).storage.from("property-media").getPublicUrl(path).data.publicUrl;
      const { error: mediaError } = await (supabase as any).from("property_media").insert({
        property_id: editing.id,
        media_type: file.type.startsWith("video/") ? "video" : "image",
        url: publicUrl,
        caption: file.name,
        sort_order: 0,
      });
      if (mediaError) return setError(mediaError.message);
    }
    onRefresh();
  };

  if (!ok) {
    return (
      <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/85 p-5">
        <div className="w-full max-w-sm bg-[#f5f3ee] p-8 text-black">
          <div className="flex justify-between"><p className="eyebrow">NavalHomes Admin</p><button onClick={close}>×</button></div>
          <h2 className="mt-3 font-serif text-4xl">Private access.</h2>
          <input autoFocus type="password" value={password} onChange={(e) => setPassword(e.target.value)} onKeyDown={(e) => e.key === "Enter" && login()} placeholder="Password" className="field-input mt-8 w-full" />
          {error ? <p className="mt-2 text-xs text-red-700">{error}</p> : null}
          <button onClick={login} className="mt-4 w-full bg-black py-3 text-xs uppercase tracking-[.15em] text-white">Enter</button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[70] overflow-auto bg-[#111] text-white">
      <div className="mx-auto max-w-7xl p-6 lg:p-10">
        <div className="flex items-center justify-between">
          <div><p className="eyebrow text-white/40">Control room</p><h1 className="font-serif text-5xl">NavalHomes</h1></div>
          <button onClick={async () => { await supabase.auth.signOut(); close(); }} className="text-xs uppercase tracking-[.15em]">Sign out</button>
        </div>

        <div className="mt-10 grid gap-3 md:grid-cols-3">
          {[
            ["Properties", properties.length],
            ["Published", properties.filter((p) => p.is_published).length],
            ["Featured", properties.filter((p) => p.is_featured).length],
          ].map(([label, value]) => <div className="admin-stat" key={String(label)}><span>{label}</span><strong>{String(value)}</strong></div>)}
        </div>

        <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_1.5fr]">
          <div className="border border-white/10 p-6">
            <p className="eyebrow text-white/40">{editing ? "Edit property" : "New property"}</p>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {Object.entries({
                title: "Title", slug: "Slug", city: "City", price: "Price", bedrooms: "Bedrooms",
                bathrooms: "Bathrooms", sqft: "Sqft", lot_size: "Lot size", neighborhood: "Neighborhood",
                address: "Private address", latitude: "Latitude", longitude: "Longitude",
              }).map(([key, label]) => (
                <input key={key} placeholder={label} value={(form as any)[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} className="dark-field" />
              ))}
            </div>
            <div className="mt-3 grid grid-cols-3 gap-3">
              <select value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value as Location })} className="admin-select"><option>Dallas</option><option>Houston</option><option>Rio Grande Valley</option></select>
              <select value={form.property_type} onChange={(e) => setForm({ ...form, property_type: e.target.value })} className="admin-select"><option>House</option><option>Condo</option><option>Apartment</option></select>
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="admin-select"><option>For Sale</option><option>For Rent</option><option>Sold</option><option>Rented</option></select>
            </div>
            <textarea placeholder="Description" rows={5} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="dark-field mt-3 resize-none" />
            <div className="mt-4 flex gap-5 text-xs">
              <label><input type="checkbox" checked={form.is_featured} onChange={(e) => setForm({ ...form, is_featured: e.target.checked })} className="mr-2" />Featured</label>
              <label><input type="checkbox" checked={form.is_published} onChange={(e) => setForm({ ...form, is_published: e.target.checked })} className="mr-2" />Published</label>
            </div>
            {editing ? (
              <div className="mt-5 border border-white/10 p-4">
                <p className="eyebrow text-white/40">Property media</p>
                <input type="file" multiple accept="image/*,video/*" className="mt-3 w-full text-xs" onChange={(e) => uploadMedia(e.target.files)} />
                <p className="mt-2 text-[11px] text-white/40">Upload photos and videos to this property.</p>
              </div>
            ) : null}
            <div className="mt-5 flex gap-2">
              <button onClick={save} className="bg-white px-5 py-3 text-xs uppercase tracking-wider text-black">{editing ? "Save changes" : "Create property"}</button>
              {editing ? <button onClick={() => { setForm(empty); setEditing(null); }} className="border border-white/20 px-5 py-3 text-xs">Cancel</button> : null}
            </div>
            {error ? <p className="mt-3 text-xs text-red-400">{error}</p> : null}
          </div>

          <div className="border border-white/10">
            {properties.map((p) => (
              <div key={p.id} className="flex items-center justify-between gap-4 border-b border-white/10 p-5">
                <div><div className="font-serif text-2xl">{p.title}</div><div className="mt-1 text-xs text-white/45">{p.location} · {p.status} · {p.is_published ? "Published" : "Draft"}</div></div>
                <button onClick={() => edit(p)} className="border border-white/20 px-3 py-2 text-xs">Edit</button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function Home() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [location, setLocation] = useState<Location>("Dallas");
  const [search, setSearch] = useState(false);
  const [admin, setAdmin] = useState(false);
  const [filters, setFilters] = useState({ location: "", minPrice: "", maxPrice: "", beds: "", type: "", status: "", opportunityType: "" });
  const [sort, setSort] = useState("featured");
  const refresh = () => getProperties().then(setProperties);

  useEffect(refresh, []);

  const filtered = useMemo(() => {
    const list = properties.filter((p) =>
      (!filters.location || p.location === filters.location) &&
      (!filters.minPrice || p.price >= Number(filters.minPrice)) &&
      (!filters.maxPrice || p.price <= Number(filters.maxPrice)) &&
      (!filters.beds || p.bedrooms >= Number(filters.beds)) &&
      (!filters.type || p.property_type === filters.type) &&
      (!filters.status || p.status === filters.status) &&
      (!filters.opportunityType || p.opportunity_type === filters.opportunityType)
    );
    return [...list].sort((a, b) => {
      if (sort === "price-low") return a.price - b.price;
      if (sort === "price-high") return b.price - a.price;
      if (sort === "newest") return String(b.created_at ?? "").localeCompare(String(a.created_at ?? ""));
      return Number(b.is_featured) - Number(a.is_featured);
    });
  }, [properties, filters, sort]);

  return (
    <div className="min-h-screen bg-[#f5f3ee]">
      <header className="absolute inset-x-0 top-0 z-30 flex items-center justify-between px-6 py-6 text-white lg:px-10">
        <Link to="/" className="font-serif text-3xl">navalhomes.</Link>
        <nav className="hidden gap-9 text-xs uppercase tracking-[.18em] md:flex">
          <a href="#properties">Opportunities</a><a href="#how-it-works">How it works</a><a href="#seller-intake">Submit a property</a>
        </nav>
        <Menu className="md:hidden" />
      </header>

      <section className="relative flex min-h-[92vh] items-end overflow-hidden text-white">
        <img src={locationImages[location]} alt={location} className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-black/15" />
        <div className="relative w-full px-6 pb-12 lg:px-10 lg:pb-16">
          <div className="mx-auto max-w-7xl">
            <p className="eyebrow text-white/60">Texas real estate opportunities · Dallas · Houston · Rio Grande Valley</p>
            <div className="mt-4 flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
              <h1 className="font-serif text-[clamp(3.8rem,9vw,8.5rem)] leading-[.82] tracking-[-.045em]">Find your next<br /><i>opportunity.</i></h1>
              <p className="max-w-md text-sm leading-6 text-white/75">Explore property opportunities across Texas. Each listing identifies what is being offered, who is authorized to offer it, and the applicable acquisition price.</p>
            </div>
            <div className="mt-12 flex flex-wrap gap-2">
              {(["Dallas", "Houston", "Rio Grande Valley"] as const).map((l) => (
                <button key={l} onClick={() => { setLocation(l); setFilters({ ...filters, location: l }); }} className={`border px-5 py-3 text-xs uppercase tracking-[.14em] ${location === l ? "border-white bg-white text-black" : "border-white/35"}`}>{l}</button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-black/10 bg-[#f5f3ee] px-6 py-7 lg:px-10"><div className="mx-auto grid max-w-7xl gap-6 sm:grid-cols-3"><div><p className="eyebrow">01 / Discover</p><p className="mt-2 font-serif text-2xl">Browse opportunities</p><p className="mt-2 text-sm leading-6 text-black/55">Public summaries across Dallas, Houston, and the Rio Grande Valley.</p></div><div><p className="eyebrow">02 / Verify</p><p className="mt-2 font-serif text-2xl">Know what is offered</p><p className="mt-2 text-sm leading-6 text-black/55">Contract assignments, direct purchases, and seller opportunities are identified separately.</p></div><div><p className="eyebrow">03 / Progress</p><p className="mt-2 font-serif text-2xl">Move with clarity</p><p className="mt-2 text-sm leading-6 text-black/55">Request documents, submit an offer, and follow review milestones.</p></div></div></section>

      <section id="properties" className="mx-auto max-w-7xl px-6 py-24 lg:px-10">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div><p className="eyebrow">The marketplace</p><h2 className="section-title">Property opportunities.</h2><p className="mt-4 max-w-xl text-sm leading-6 text-black/55">Browse available opportunities and review the type of interest being offered before you proceed.</p></div>
          <div className="flex gap-2">
            <button onClick={() => setSearch(!search)} className="flex items-center gap-2 border border-black/15 px-5 py-3 text-xs uppercase tracking-[.14em]"><Search size={15} /> Refine search</button>
            <select value={sort} onChange={(e) => setSort(e.target.value)} className="field-input"><option value="featured">Featured first</option><option value="newest">Newest</option><option value="price-low">Price: low to high</option><option value="price-high">Price: high to low</option></select>
          </div>
        </div>

        {search ? (
          <div className="mt-8 grid gap-4 border border-black/10 bg-white p-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-7">
            <label className="field">Location<select value={filters.location} onChange={(e) => setFilters({ ...filters, location: e.target.value })}><option value="">All locations</option><option>Dallas</option><option>Houston</option><option>Rio Grande Valley</option></select></label>
            <label className="field">Min price<input type="number" value={filters.minPrice} onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })} /></label>
            <label className="field">Max price<input type="number" value={filters.maxPrice} onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })} /></label>
            <label className="field">Bedrooms<select value={filters.beds} onChange={(e) => setFilters({ ...filters, beds: e.target.value })}><option value="">Any</option><option value="2">2+</option><option value="3">3+</option><option value="4">4+</option><option value="5">5+</option></select></label>
            <label className="field">Type<select value={filters.type} onChange={(e) => setFilters({ ...filters, type: e.target.value })}><option value="">Any</option><option>House</option><option>Condo</option><option>Apartment</option></select></label>
            <label className="field">Status<select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}><option value="">Any</option><option>For Sale</option><option>For Rent</option><option>Sold</option><option>Rented</option></select></label>
            <label className="field">Opportunity type<select value={filters.opportunityType} onChange={(e) => setFilters({ ...filters, opportunityType: e.target.value })}><option value="">Any</option><option value="contract_assignment">Contract assignment</option><option value="direct_purchase">Direct purchase</option><option value="seller_introduction">Seller opportunity</option></select></label>
          </div>
        ) : null}

        <div className="mt-12 grid gap-x-6 gap-y-14 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p) => <Card key={p.id} p={p} />)}
        </div>
        {filtered.length === 0 ? <p className="mt-12 text-sm text-black/50">No approved opportunities match those filters yet. Try another market or check back as new opportunities are reviewed.</p> : null}
      </section>

      <section id="locations" className="px-6 pb-24 lg:px-10">
        <div className="mx-auto max-w-7xl">
          <p className="eyebrow">Explore by location</p>
          <div className="mt-6 grid gap-3 md:grid-cols-3">
            {(["Dallas", "Houston", "Rio Grande Valley"] as const).map((l) => (
              <button key={l} onClick={() => { setLocation(l); setFilters({ ...filters, location: l }); document.getElementById("properties")?.scrollIntoView({ behavior: "smooth" }); }} className="group relative aspect-[4/5] overflow-hidden text-left">
                <img src={locationImages[l]} alt={l} className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-black/30" /><span className="absolute bottom-6 left-6 font-serif text-3xl text-white">{l}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      <section id="how-it-works" className="bg-[#e9e6de] px-6 py-24 lg:px-10"><div className="mx-auto max-w-7xl"><p className="eyebrow">A clear process</p><h2 className="section-title">From interest to<br /><i>next steps.</i></h2><div className="mt-12 grid gap-8 md:grid-cols-3"><div className="border-t border-black/15 pt-5"><p className="eyebrow">01 · Explore</p><h3 className="mt-3 font-serif text-2xl">Review the opportunity</h3><p className="mt-3 text-sm leading-6 text-black/60">Start with the public summary, acquisition price, property details, and clearly stated opportunity type.</p></div><div className="border-t border-black/15 pt-5"><p className="eyebrow">02 · Request</p><h3 className="mt-3 font-serif text-2xl">Verify and review</h3><p className="mt-3 text-sm leading-6 text-black/60">Create an investor account to request restricted documents. Access may require approval and an NDA.</p></div><div className="border-t border-black/15 pt-5"><p className="eyebrow">03 · Propose</p><h3 className="mt-3 font-serif text-2xl">Submit your offer</h3><p className="mt-3 text-sm leading-6 text-black/60">Send a structured proposal. The seller or authorized contract holder makes the decision, with required approvals recorded.</p></div></div></div></section>

      <section id="seller-intake" className="relative overflow-hidden bg-[#171716] px-6 py-24 text-white lg:px-10"><img src={locationImages["Houston"]} alt="" aria-hidden="true" className="absolute inset-0 h-full w-full object-cover opacity-20" /><div className="absolute inset-0 bg-gradient-to-r from-[#171716] via-[#171716]/95 to-[#171716]/65" /><div className="relative mx-auto grid max-w-7xl gap-12 lg:grid-cols-2 lg:items-end"><div><p className="eyebrow text-white/45">For property owners and contract holders</p><h2 className="section-title text-white">Have an<br /><i>opportunity?</i></h2><p className="mt-6 max-w-lg text-sm leading-7 text-white/65">Submit a property for free. NavalHomes reviews the details and follows up. If you already hold a purchase contract you want to offer for assignment, tell us so it can be reviewed separately from an ordinary seller lead.</p><p className="mt-4 text-xs leading-5 text-white/45">Submitting a property does not guarantee an offer or publication. Do not upload confidential contract documents through this public form.</p></div><SellerSubmission /></div></section>

      <section className="bg-[#f5f3ee] px-6 py-12 lg:px-10"><div className="mx-auto max-w-7xl border-l-2 border-black/25 pl-5"><p className="eyebrow">Contract opportunity standards</p><p className="mt-3 max-w-5xl text-sm leading-6 text-black/60">NavalHomes distinguishes seller leads, direct property opportunities, and contract assignments. An opportunity is not presented as an assignment unless the required contractual rights and written disclosures are in place. Under Texas Property Code § 5.0205 and Texas Occupations Code § 1101.0045, applicable assignment disclosures include the nature of the interest and the fact that the assignor does not hold legal title; written disclosure to the property owner and potential buyer must be handled before entering into the assignment contract. This summary is informational, not legal advice.</p></div></section>

      <section id="contact" className="bg-[#171716] px-6 py-24 text-white lg:px-10">
        <div className="mx-auto grid max-w-7xl gap-16 lg:grid-cols-2">
          <div><p className="eyebrow text-white/45">Private inquiries</p><h2 className="section-title text-white">Tell us what<br /><i>you're looking for.</i></h2></div>
          <Inquiry />
        </div>
      </section>

      <footer className="flex flex-col gap-4 border-t border-white/10 bg-[#171716] px-6 py-8 text-[10px] uppercase tracking-[.15em] text-white/45 sm:flex-row sm:items-center sm:justify-between lg:px-10">
        <span>© 2026 NavalHomesDallas · Houston · Rio Grande Valley</span>
        <button aria-label="Admin" onClick={() => setAdmin(true)} className="inline-flex w-fit items-center gap-2 border border-white/15 px-3 py-2 text-white/45 transition hover:border-white/30 hover:text-white">
          <LockKeyhole size={12} /> Admin
        </button>
      </footer>

      {admin ? <Admin close={() => setAdmin(false)} properties={properties} onRefresh={refresh} /> : null}
    </div>
  );
}
