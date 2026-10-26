import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { ArrowLeft, Check, RefreshCw, X, ExternalLink, LogOut } from "lucide-react";
import { adminCheck, adminLogin, adminListPropertySubmissions, adminReviewPropertySubmission } from "@/lib/admin.functions";

export const Route = createFileRoute("/admin-submissions")({ component: AdminSubmissions });
const KEY = "navalhomes_admin_token";
type Row = any;
const money = (value: unknown) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(Number(value) || 0);

function AdminSubmissions() {
  const [token, setToken] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [rows, setRows] = useState<Row[]>([]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [verified, setVerified] = useState<Record<string, boolean>>({});

  const load = useCallback(async (activeToken: string) => {
    setError("");
    try {
      const result = await adminListPropertySubmissions({ data: { token: activeToken } });
      setRows(result);
    } catch (e) {
      const message = e instanceof Error ? e.message : "Could not load submissions.";
      setError(message);
      if (message.includes("UNAUTHORIZED")) {
        sessionStorage.removeItem(KEY);
        setToken(null);
      }
    }
  }, []);

  useEffect(() => {
    const saved = sessionStorage.getItem(KEY);
    if (!saved) { setReady(true); return; }
    void adminCheck({ data: { token: saved } }).then((result) => {
      if (result.ok) { setToken(saved); void load(saved); }
      else sessionStorage.removeItem(KEY);
      setReady(true);
    }).catch(() => { sessionStorage.removeItem(KEY); setReady(true); });
  }, [load]);

  async function login(password: string) {
    setBusy(true); setError("");
    try {
      const result = await adminLogin({ data: { password } });
      sessionStorage.setItem(KEY, result.token);
      setToken(result.token);
      await load(result.token);
    } catch {
      setError("Sign-in failed. Check the admin password.");
    } finally { setBusy(false); }
  }

  async function review(row: Row, decision: "approved" | "rejected" | "changes_requested") {
    if (!token) return;
    setBusy(true); setError("");
    try {
      await adminReviewPropertySubmission({
        data: { token, id: row.id, decision, notes: notes[row.id] ?? row.admin_notes ?? "", verifyContractRights: !!verified[row.id] },
      });
      await load(token);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Review action failed.");
    } finally { setBusy(false); }
  }

  function logout() {
    sessionStorage.removeItem(KEY);
    setToken(null);
    setRows([]);
  }

  if (!ready) return <main className="min-h-screen bg-[#f5f3ee]" />;
  if (!token) return <Login onLogin={login} busy={busy} error={error} />;

  return <main className="min-h-screen bg-[#f5f3ee] text-[#171716]">
    <header className="border-b border-black/10 px-6 py-6">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4">
        <Link to="/" className="font-serif text-3xl">Liberty Crest Realty</Link>
        <div className="flex flex-wrap items-center gap-4">
          <Link to="/admin" className="text-xs uppercase tracking-wider">Admin dashboard</Link>
          <Link to="/admin-buyer-requests" className="text-xs uppercase tracking-wider">Buyer requests</Link>
          <button onClick={logout} className="text-xs uppercase tracking-wider"><LogOut className="mr-1 inline size-4" />Sign out</button>
          <Link to="/" className="text-xs uppercase tracking-wider"><ArrowLeft className="mr-2 inline size-4" />Marketplace</Link>
        </div>
      </div>
    </header>
    <div className="mx-auto max-w-7xl px-6 py-12">
      <p className="eyebrow">Private control room</p>
      <h1 className="mt-3 font-serif text-5xl">Property submissions</h1>
      <p className="mt-4 max-w-2xl text-sm leading-6 text-black/55">Review seller details, gallery media and private contract documents. Approval publishes the property to the marketplace.</p>
      <div className="mt-8 flex justify-end gap-2">
        <button onClick={() => void load(token)} className="border border-black/15 px-4 py-3 text-xs uppercase tracking-wider"><RefreshCw className="mr-2 inline size-4" />Refresh</button>
        <button onClick={logout} className="border border-black/15 px-4 py-3 text-xs uppercase tracking-wider">Sign out</button>
      </div>
      {error ? <p role="alert" className="mt-5 bg-red-50 p-4 text-sm text-red-800">{error}</p> : null}
      {rows.length === 0 ? <p className="mt-5 bg-white p-8 text-sm text-black/55">No submissions yet.</p> : <div className="mt-6 space-y-6">
        {rows.map((row) => <article key={row.id} className="bg-white p-5 md:p-8">
          <div className="flex flex-wrap justify-between gap-4">
            <div><p className="eyebrow">{row.review_status} · {row.location} / {row.city}</p><h2 className="mt-2 font-serif text-3xl">{row.title}</h2><p className="mt-2 text-sm text-black/55">{row.seller_name} · {row.seller_phone} · {row.seller_email}</p></div>
            <strong className="text-xl">{money(row.asking_price)}</strong>
          </div>
          <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-black/65">{row.description}</p>
          <div className="mt-4 grid grid-cols-2 gap-2 text-xs text-black/55 sm:grid-cols-3"><p>Type: {row.property_type}</p><p>Bedrooms: {row.bedrooms} · Baths: {row.bathrooms}</p><p>Seller role: {row.seller_role}</p></div>
          {row.has_contract_rights ? <div className="mt-5 border border-amber-200 bg-amber-50 p-4 text-sm">
            <strong>Contract rights offered</strong><p className="mt-1">Proposed assignment price: {money(row.contract_price)} · Status: {row.contract_status}</p><p className="mt-2">{row.contract_notes}</p>
            {row.contractUrl ? <a href={row.contractUrl} target="_blank" rel="noreferrer" className="mt-3 inline-flex underline">Open private contract <ExternalLink className="ml-2 size-4" /></a> : null}
          </div> : null}
          <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4">{(row.media ?? []).map((m: any) => <a key={m.path} href={m.url ?? "#"} target="_blank" rel="noreferrer" className="block overflow-hidden bg-black/5">
            {m.url && /\.(mp4|mov|webm)(\?|$)/i.test(m.url) ? <video src={m.url} controls className="aspect-square w-full object-cover" /> : <img src={m.url ?? ""} alt="" className="aspect-square w-full object-cover" />}
          </a>)}</div>
          {["pending", "changes_requested"].includes(row.review_status) ? <div className="mt-6 border-t border-black/10 pt-5">
            <label className="field">Internal review notes<textarea rows={2} value={notes[row.id] ?? row.admin_notes ?? ""} onChange={(e) => setNotes({ ...notes, [row.id]: e.target.value })} /></label>
            {row.has_contract_rights ? <label className="mt-4 flex items-start gap-2 text-sm"><input type="checkbox" checked={!!verified[row.id]} onChange={(e) => setVerified({ ...verified, [row.id]: e.target.checked })} className="mt-1" /><span>I verified assignment eligibility, seller authority and required written disclosures.</span></label> : null}
            <div className="mt-4 flex flex-wrap gap-2">
              <button disabled={busy} onClick={() => void review(row, "approved")} className="bg-black px-4 py-3 text-xs uppercase tracking-wider text-white disabled:opacity-50"><Check className="mr-2 inline size-4" />Approve & publish</button>
              <button disabled={busy} onClick={() => void review(row, "changes_requested")} className="border border-black/15 px-4 py-3 text-xs uppercase tracking-wider disabled:opacity-50">Request changes</button>
              <button disabled={busy} onClick={() => void review(row, "rejected")} className="border border-red-200 px-4 py-3 text-xs uppercase tracking-wider text-red-700 disabled:opacity-50"><X className="mr-2 inline size-4" />Reject</button>
            </div>
          </div> : <p className="mt-5 text-xs uppercase tracking-wider text-black/45">Reviewed: {row.reviewed_at ? new Date(row.reviewed_at).toLocaleString() : "—"} · {row.created_property_id ? "Published to marketplace" : row.review_status}</p>}
        </article>)}
      </div>}
    </div>
  </main>;
}

function Login({ onLogin, busy, error }: { onLogin: (password: string) => Promise<void>; busy: boolean; error: string }) {
  const [password, setPassword] = useState("");
  return <main className="flex min-h-screen items-center justify-center bg-[#171716] p-5"><form className="w-full max-w-sm bg-[#f5f3ee] p-8" onSubmit={(e) => { e.preventDefault(); void onLogin(password); }}>
    <p className="eyebrow">Liberty Crest Realty</p><h1 className="mt-3 font-serif text-4xl">Admin sign in</h1>
    <p className="mt-3 text-sm text-black/55">Use the same admin password as the main dashboard and buyer requests.</p>
    <label className="field mt-7">Admin password<input type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} /></label>
    {error ? <p role="alert" className="mt-3 text-sm text-red-700">{error}</p> : null}
    <button disabled={busy} className="mt-5 w-full bg-black px-5 py-4 text-xs uppercase tracking-wider text-white disabled:opacity-50">{busy ? "Signing in…" : "Sign in"}</button>
    <Link to="/" className="mt-6 block text-center text-xs text-black/50">Back to site</Link>
  </form></main>;
}
