import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { ArrowLeft, Mail, Phone, RefreshCw, Star, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import {
  adminAddMedia, adminCheck, adminCreateUpload, adminDeleteProperty, adminListInquiries,
  adminListProperties, adminListPropertySubmissions, adminLogin, adminMediaAction, adminSaveProperty, adminUpdateInquiry,
} from "@/lib/admin.functions";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [
    { title: "Admin — Liberty Crest Realty" },
    { name: "description", content: "Private Liberty Crest Realty control room for listings and inquiries." },
    { name: "robots", content: "noindex,nofollow" },
    { property: "og:title", content: "Admin — Liberty Crest Realty" },
    { property: "og:description", content: "Private Liberty Crest Realty control room." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  component: AdminPage,
});

const KEY = "navalhomes_admin_token";
const money = (n: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
const empty = {
  title: "", slug: "", location: "Dallas", city: "", status: "For Sale", property_type: "House",
  price: "", bedrooms: "", bathrooms: "", sqft: "", lot_size: "", description: "", neighborhood: "",
  address: "", latitude: "", longitude: "", is_featured: false, is_published: true,
};

function AdminPage() {
  const [token, setToken] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const t = sessionStorage.getItem(KEY);
    if (!t) return setReady(true);
    adminCheck({ data: { token: t } }).then((r) => { if (r.ok) setToken(t); else sessionStorage.removeItem(KEY); setReady(true); });
  }, []);
  if (!ready) return <main className="min-h-screen bg-[#f5f3ee]" />;
  if (!token) return <Lock onToken={(t) => { sessionStorage.setItem(KEY, t); setToken(t); }} />;
  return <Dashboard token={token} logout={() => { sessionStorage.removeItem(KEY); setToken(null); }} />;
}

function Lock({ onToken }: { onToken: (t: string) => void }) {
  const [pw, setPw] = useState(""), [err, setErr] = useState(""), [busy, setBusy] = useState(false);
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#171716] p-5">
      <form onSubmit={async (e) => { e.preventDefault(); setBusy(true); setErr(""); try { const r = await adminLogin({ data: { password: pw } }); onToken(r.token); } catch { setErr("Incorrect password."); } finally { setBusy(false); } }}
        className="w-full max-w-sm bg-[#f5f3ee] p-8 text-black">
        <p className="eyebrow">Liberty Crest Realty Admin</p>
        <h1 className="mt-3 font-serif text-4xl">Private access.</h1>
        <input autoFocus type="password" value={pw} onChange={(e) => setPw(e.target.value)} placeholder="Password" className="field-input mt-8 w-full" />
        {err ? <p className="mt-2 text-xs text-red-700">{err}</p> : null}
        <button disabled={busy} className="mt-4 w-full bg-black py-3 text-xs uppercase tracking-[.15em] text-white">{busy ? "Checking…" : "Enter"}</button>
        <Link to="/" className="mt-6 block text-center text-xs text-black/50">Back to site</Link>
      </form>
    </main>
  );
}

function Dashboard({ token, logout }: { token: string; logout: () => void }) {
  const [tab, setTab] = useState<"properties" | "inquiries">("properties");
  const [props, setProps] = useState<any[]>([]), [inq, setInq] = useState<any[]>([]), [pendingSubs, setPendingSubs] = useState(0);
  const [form, setForm] = useState<any>(empty), [editId, setEditId] = useState<string | null>(null);
  const [err, setErr] = useState(""), [msg, setMsg] = useState(""), [busy, setBusy] = useState(false);

  const guard = useCallback(async (fn: () => Promise<void>) => {
    setErr(""); setMsg(""); setBusy(true);
    try { await fn(); } catch (e) {
      const m = e instanceof Error ? e.message : "Something went wrong";
      if (m.includes("UNAUTHORIZED")) logout(); else setErr(m);
    } finally { setBusy(false); }
  }, [logout]);

  const load = useCallback(() => guard(async () => {
    const [p, i] = await Promise.all([adminListProperties({ data: { token } }), adminListInquiries({ data: { token } })]);
    setProps(p); setInq(i);
    adminListPropertySubmissions({ data: { token } }).then((s) => setPendingSubs(s.filter((x: any) => x.review_status === "pending").length)).catch(() => {});
  }), [guard, token]);
  useEffect(() => { void load(); }, [load]);

  const editing = props.find((p) => p.id === editId);
  const startEdit = (p: any) => {
    setEditId(p.id);
    const f: any = {}; for (const k of Object.keys(empty)) f[k] = p[k] ?? (typeof (empty as any)[k] === "boolean" ? false : "");
    for (const k of ["price", "bedrooms", "bathrooms", "sqft", "lot_size", "latitude", "longitude"]) f[k] = p[k] == null ? "" : String(p[k]);
    setForm(f); window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const save = () => guard(async () => {
    const r = await adminSaveProperty({ data: { token, id: editId, property: form } });
    setEditId(r.id); setMsg(editId ? "Changes saved." : "Property created — add photos below.");
    const p = await adminListProperties({ data: { token } }); setProps(p);
  });
  const upload = (files: FileList | null) => editId && files && guard(async () => {
    for (const file of Array.from(files)) {
      const u = await adminCreateUpload({ data: { token, propertyId: editId, filename: file.name } });
      const { error } = await supabase.storage.from("property-media").uploadToSignedUrl(u.path, u.token, file);
      if (error) throw new Error(error.message);
      await adminAddMedia({ data: { token, propertyId: editId, path: u.path, mediaType: file.type.startsWith("video/") ? "video" : "image", caption: file.name } });
    }
    setProps(await adminListProperties({ data: { token } })); setMsg("Media uploaded.");
  });
  const media = (id: string, action: "delete" | "cover") => guard(async () => { await adminMediaAction({ data: { token, id, action } }); setProps(await adminListProperties({ data: { token } })); });
  const remove = (p: any) => confirm(`Delete "${p.title}" permanently?`) && guard(async () => { await adminDeleteProperty({ data: { token, id: p.id } }); if (editId === p.id) { setEditId(null); setForm(empty); } setProps(await adminListProperties({ data: { token } })); });
  const setStatus = (id: string, status: string) => guard(async () => { await adminUpdateInquiry({ data: { token, id, status } }); setInq(await adminListInquiries({ data: { token } })); });
  const newCount = inq.filter((i) => i.status === "new").length;
  const field = (k: string, label: string, type = "text") => <label className="field" key={k}>{label}<input type={type} value={form[k]} onChange={(e) => setForm({ ...form, [k]: e.target.value })} /></label>;

  return (
    <main className="min-h-screen bg-[#f5f3ee] text-[#171716]">
      <header className="border-b border-black/10 px-6 py-6">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <Link to="/" className="font-serif text-3xl">Liberty Crest Realty</Link>
          <div className="flex gap-2 text-xs uppercase tracking-wider">
            <button onClick={() => void load()} className="border border-black/15 px-4 py-3"><RefreshCw className="mr-2 inline size-4" />Refresh</button>
            <button onClick={logout} className="border border-black/15 px-4 py-3">Sign out</button>
            <Link to="/" className="hidden px-4 py-3 sm:block"><ArrowLeft className="mr-2 inline size-4" />Site</Link>
          </div>
        </div>
      </header>
      <div className="border-b border-black/10 bg-white px-6 py-3">
        <nav aria-label="Admin sections" className="mx-auto flex max-w-7xl flex-wrap gap-2">
          <Link to="/admin" className="border border-black/15 bg-black px-4 py-3 text-xs uppercase tracking-wider text-white">Admin dashboard</Link>
          <Link to="/admin-buyer-requests" className="border border-black/15 px-4 py-3 text-xs uppercase tracking-wider hover:bg-black hover:text-white">Buyer requests</Link>
          <Link to="/admin-submissions" className="border border-black/15 px-4 py-3 text-xs uppercase tracking-wider hover:bg-black hover:text-white">Seller submissions{pendingSubs ? ` (${pendingSubs} pending)` : ""}</Link>
        </nav>
      </div>
      <div className="mx-auto max-w-7xl px-6 py-10">
        <p className="eyebrow">Control room</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-4">
          {[["Listings", props.length], ["Published", props.filter((p) => p.is_published).length], ["Inquiries", inq.length], ["New inquiries", newCount]].map(([l, v]) => (
            <div key={String(l)} className="bg-white p-5"><p className="eyebrow">{l}</p><p className="mt-2 font-serif text-4xl">{String(v)}</p></div>
          ))}
        </div>
        <div className="mt-8 flex gap-2">
          {(["properties", "inquiries"] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)} className={`px-5 py-3 text-xs uppercase tracking-wider ${tab === t ? "bg-black text-white" : "border border-black/15"}`}>
              {t === "properties" ? "Properties" : `Inquiries${newCount ? ` (${newCount} new)` : ""}`}
            </button>
          ))}
        </div>
        {err ? <p role="alert" className="mt-6 bg-red-50 p-4 text-sm text-red-800">{err}</p> : null}
        {msg ? <p className="mt-6 bg-white p-4 text-sm">{msg}</p> : null}

        {tab === "properties" ? (
          <div className="mt-8 grid gap-8 lg:grid-cols-[1.1fr_1fr]">
            <section className="bg-white p-6">
              <div className="flex items-center justify-between"><h2 className="font-serif text-3xl">{editId ? "Edit listing" : "New listing"}</h2>
                {editId ? <button onClick={() => { setEditId(null); setForm(empty); setMsg(""); }} className="text-xs underline">+ New instead</button> : null}</div>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                {field("title", "Title")}{field("slug", "URL slug (optional)")}
                <label className="field">Location<select value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })}><option>Dallas</option><option>Houston</option><option>Rio Grande Valley</option></select></label>
                {field("city", "City")}{field("neighborhood", "Neighborhood")}{field("address", "Address (private)")}
                <label className="field">Status<select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}><option>For Sale</option><option>For Rent</option><option>Sold</option><option>Rented</option></select></label>
                <label className="field">Type<select value={form.property_type} onChange={(e) => setForm({ ...form, property_type: e.target.value })}><option>House</option><option>Condo</option><option>Apartment</option><option>Multi-family</option><option>Land</option><option>Commercial</option></select></label>
                {field("price", "Price (USD)", "number")}{field("bedrooms", "Bedrooms", "number")}{field("bathrooms", "Bathrooms", "number")}{field("sqft", "Sqft", "number")}{field("lot_size", "Lot size (acres)", "number")}
              </div>
              <label className="field mt-4">Description<textarea rows={5} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></label>
              <div className="mt-4 flex gap-6 text-sm">
                <label><input type="checkbox" checked={form.is_published} onChange={(e) => setForm({ ...form, is_published: e.target.checked })} className="mr-2" />Published (visible on home page)</label>
                <label><input type="checkbox" checked={form.is_featured} onChange={(e) => setForm({ ...form, is_featured: e.target.checked })} className="mr-2" />Featured</label>
              </div>
              <button disabled={busy} onClick={save} className="mt-6 bg-black px-6 py-3 text-xs uppercase tracking-wider text-white">{busy ? "Saving…" : editId ? "Save changes" : "Create listing"}</button>

              {editing ? (
                <div className="mt-8 border-t border-black/10 pt-6">
                  <p className="eyebrow">Photos & videos</p>
                  <input type="file" multiple accept="image/*,video/*" disabled={busy} onChange={(e) => { void upload(e.target.files); e.target.value = ""; }} className="mt-3 w-full text-xs" />
                  <div className="mt-4 grid grid-cols-3 gap-3">
                    {(editing.media ?? []).map((m: any, i: number) => (
                      <div key={m.id} className="relative">
                        {m.media_type === "video" ? <video src={m.url} className="aspect-square w-full object-cover" /> : <img src={m.url} alt="" className="aspect-square w-full object-cover" />}
                        {i === 0 ? <span className="absolute left-1 top-1 bg-black px-2 py-1 text-[9px] uppercase text-white">Cover</span> : null}
                        <div className="absolute bottom-1 right-1 flex gap-1">
                          {i !== 0 ? <button title="Make cover" onClick={() => void media(m.id, "cover")} className="bg-white p-1"><Star className="size-3" /></button> : null}
                          <button title="Delete" onClick={() => void media(m.id, "delete")} className="bg-white p-1"><Trash2 className="size-3" /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : <p className="mt-6 text-xs text-black/50">Create the listing first, then upload its photos.</p>}
            </section>
            <section className="space-y-3">
              {props.length === 0 ? <p className="bg-white p-8 text-sm text-black/55">No listings yet. Create your first one.</p> : props.map((p) => (
                <div key={p.id} className={`flex gap-4 bg-white p-4 ${editId === p.id ? "ring-2 ring-black" : ""}`}>
                  {p.media?.[0]?.url ? <img src={p.media[0].url} alt="" className="size-20 object-cover" /> : <div className="size-20 bg-black/5" />}
                  <div className="min-w-0 flex-1">
                    <p className="font-serif text-xl">{p.title}</p>
                    <p className="text-xs text-black/55">{p.location} · {p.city} · {p.status} · {money(Number(p.price))}</p>
                    <p className="mt-1 text-[10px] uppercase tracking-wider">{p.is_published ? "Published" : "Draft"}{p.is_featured ? " · Featured" : ""}</p>
                  </div>
                  <div className="flex flex-col gap-1 text-xs">
                    <button onClick={() => startEdit(p)} className="border border-black/15 px-3 py-1">Edit</button>
                    <button onClick={() => void remove(p)} className="border border-red-200 px-3 py-1 text-red-700">Delete</button>
                  </div>
                </div>
              ))}
            </section>
          </div>
        ) : (
          <div className="mt-8 space-y-3">
            {inq.length === 0 ? <p className="bg-white p-8 text-sm text-black/55">No inquiries yet.</p> : inq.map((i) => (
              <article key={i.id} className={`bg-white p-5 ${i.status === "new" ? "border-l-4 border-black" : ""}`}>
                <div className="flex flex-wrap justify-between gap-3">
                  <div>
                    <p className="eyebrow">{new Date(i.created_at).toLocaleString()} · {i.status}</p>
                    <h3 className="mt-1 font-serif text-2xl">{i.name}</h3>
                    <p className="mt-1 flex flex-wrap gap-4 text-sm">
                      <a href={`mailto:${i.email}`} className="underline"><Mail className="mr-1 inline size-3" />{i.email}</a>
                      <a href={`tel:${i.phone}`} className="underline"><Phone className="mr-1 inline size-3" />{i.phone}</a>
                    </p>
                    <p className="mt-1 text-xs text-black/55">
                      {i.properties ? <>About: <Link to="/properties/$slug" params={{ slug: i.properties.slug }} className="underline">{i.properties.title}</Link></> : "General inquiry"}
                      {" · "}OK to contact: {[i.allow_phone && "Phone", i.allow_sms && "SMS", i.allow_whatsapp && "WhatsApp"].filter(Boolean).join(", ") || "Email only"}
                    </p>
                  </div>
                  <select value={i.status} onChange={(e) => void setStatus(i.id, e.target.value)} className="field-input h-fit">
                    <option value="new">New</option><option value="contacted">Contacted</option><option value="archived">Archived</option>
                  </select>
                </div>
                <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-black/70">{i.message}</p>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
