import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { RefreshCw, Save, LogOut, Users } from "lucide-react";
import { adminCheck, adminListBuyerRequests, adminLogin, adminUpdateBuyerRequest } from "@/lib/admin.functions";

export const Route = createFileRoute("/admin-buyer-requests")({ component: AdminBuyerRequests });
const KEY = "navalhomes_admin_token";
type BuyerRequest = any;
const statuses = ["new", "reviewing", "contacted", "matched", "closed"];

function AdminBuyerRequests() {
  const [token, setToken] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  useEffect(() => { const t = sessionStorage.getItem(KEY); if (!t) { setReady(true); return; } adminCheck({ data: { token: t } }).then((r) => { if (r.ok) setToken(t); else sessionStorage.removeItem(KEY); setReady(true); }); }, []);
  if (!ready) return <main className="min-h-screen bg-[#f5f3ee]" />;
  if (!token) return <Login onToken={(t) => { sessionStorage.setItem(KEY, t); setToken(t); }} />;
  return <Dashboard token={token} logout={() => { sessionStorage.removeItem(KEY); setToken(null); }} />;
}

function Login({ onToken }: { onToken: (token: string) => void }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  return <main className="flex min-h-screen items-center justify-center bg-[#171716] p-5"><form className="w-full max-w-sm bg-[#f5f3ee] p-8" onSubmit={async (e) => { e.preventDefault(); setBusy(true); setError(""); try { const result = await adminLogin({ data: { password } }); onToken(result.token); } catch { setError("Unable to sign in. Check your credentials."); } finally { setBusy(false); } }}><p className="eyebrow">Liberty Crest Realty</p><h1 className="mt-3 font-serif text-4xl">Buyer requests</h1><label className="field mt-7">Admin password<input type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} /></label>{error ? <p role="alert" className="mt-3 text-sm text-red-700">{error}</p> : null}<button disabled={busy} className="mt-5 w-full bg-black px-5 py-4 text-xs uppercase tracking-wider text-white">{busy ? "Signing in…" : "Sign in"}</button><Link to="/" className="mt-6 block text-center text-xs text-black/50">Back to site</Link></form></main>;
}

function Dashboard({ token, logout }: { token: string; logout: () => void }) {
  const [rows, setRows] = useState<BuyerRequest[]>([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [assignees, setAssignees] = useState<Record<string, string>>({});
  const [statusesById, setStatusesById] = useState<Record<string, string>>({});
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const load = useCallback(async () => { setError(""); try { const result = await adminListBuyerRequests({ data: { token, status: statusFilter === "all" ? "" : statusFilter } }); setRows(result); } catch (e) { const message = e instanceof Error ? e.message : "Could not load requests."; setError(message); if (message.includes("UNAUTHORIZED")) logout(); } }, [token, statusFilter, logout]);
  useEffect(() => { void load(); }, [load]);
  async function save(row: BuyerRequest) {
    setBusy(true); setError("");
    try { await adminUpdateBuyerRequest({ data: { token, id: row.id, status: statusesById[row.id] ?? row.status, notes: notes[row.id] ?? row.admin_notes ?? "", assignedTo: assignees[row.id] ?? row.assigned_to ?? "" } }); await load(); }
    catch (e) { setError(e instanceof Error ? e.message : "Could not save request."); }
    finally { setBusy(false); }
  }
  return <main className="min-h-screen bg-[#f5f3ee] text-[#171716]"><header className="border-b border-black/10 px-6 py-5"><div className="mx-auto flex max-w-7xl items-center justify-between"><Link to="/" className="font-serif text-2xl sm:text-3xl">Liberty Crest Realty</Link><div className="flex gap-3"><Link to="/admin" className="text-xs uppercase tracking-wider">Main admin</Link><button onClick={logout} className="text-xs uppercase tracking-wider"><LogOut className="mr-1 inline size-4" />Sign out</button></div></div></header>
    <div className="mx-auto max-w-7xl px-6 py-10 lg:py-14"><p className="eyebrow">Private control room</p><h1 className="mt-3 font-serif text-5xl">Buyer requests</h1><p className="mt-4 max-w-2xl text-sm leading-6 text-black/55">Review buyer preferences, update follow-up status, assign an owner, and keep internal notes. Contact details and financial ranges are private.</p>
      <div className="mt-8 flex flex-wrap items-center justify-between gap-3"><label className="field">Filter by status<select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}><option value="all">All requests</option>{statuses.map((s) => <option key={s}>{s}</option>)}</select></label><button onClick={() => void load()} className="border border-black/15 px-4 py-3 text-xs uppercase tracking-wider"><RefreshCw className="mr-2 inline size-4" />Refresh</button></div>
      {error ? <p role="alert" className="mt-5 bg-red-50 p-4 text-sm text-red-800">{error}</p> : null}
      {rows.length === 0 ? <div className="mt-6 bg-white p-8 text-sm text-black/55"><Users className="mb-3 size-6" />No buyer requests found for this filter.</div> : <div className="mt-6 space-y-5">{rows.map((row) => <article key={row.id} className="bg-white p-5 sm:p-7"><div className="flex flex-wrap items-start justify-between gap-4"><div><p className="eyebrow">{row.status} · {new Date(row.created_at).toLocaleString()}</p><h2 className="mt-2 font-serif text-3xl">{row.contact_name}</h2><p className="mt-2 text-sm text-black/60">{row.contact_email} · {row.contact_phone}</p></div><span className="text-xs uppercase tracking-wider text-black/45">ID {String(row.id).slice(0, 8)}</span></div>
        <div className="mt-6 grid gap-4 border-y border-black/10 py-5 sm:grid-cols-2 lg:grid-cols-3">{[["Home type", row.home_type], ["Price range", row.price_range], ["Intended use", row.intended_use], ["Markets", (row.preferred_markets ?? []).join(", ")], ["City / community", row.preferred_city || "Not specified"], ["Neighborhood / ZIP", row.preferred_area || "Not specified"], ["Buying journey", row.buying_journey], ["Timeline", row.timeline], ["Down payment", row.down_payment_range], ["Credit score", row.credit_score_range || "Not provided"], ["Employment", row.employment_situation || "Not provided"], ["Annual income", row.annual_income_range || "Not provided"], ["Military status", row.military_status], ["Branch", row.military_branch || "Not applicable"], ["Requested path", row.opportunity_path]].map(([label, value]) => <div key={label}><p className="text-[10px] uppercase tracking-[.14em] text-black/40">{label}</p><p className="mt-1 text-sm">{value}</p></div>)}</div>
        {row.additional_notes ? <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-black/65"><strong>Additional notes:</strong> {row.additional_notes}</p> : null}
        <div className="mt-6 grid gap-4 md:grid-cols-3"><label className="field">Status<select value={statusesById[row.id] ?? row.status} onChange={(e) => setStatusesById({ ...statusesById, [row.id]: e.target.value })}>{statuses.map((s) => <option key={s}>{s}</option>)}</select></label><label className="field">Assigned to<input value={assignees[row.id] ?? row.assigned_to ?? ""} onChange={(e) => setAssignees({ ...assignees, [row.id]: e.target.value })} maxLength={120} placeholder="Team member" /></label><label className="field">Internal notes<textarea rows={2} value={notes[row.id] ?? row.admin_notes ?? ""} onChange={(e) => setNotes({ ...notes, [row.id]: e.target.value })} maxLength={4000} /></label></div><button disabled={busy} onClick={() => void save(row)} className="mt-4 bg-black px-5 py-3 text-xs uppercase tracking-wider text-white disabled:opacity-50"><Save className="mr-2 inline size-4" />Save updates</button>
      </article>)}</div>}
    </div></main>;
}
