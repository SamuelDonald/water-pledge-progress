import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useCallback, useEffect, useState, type FormEvent } from "react";
import { Copy, Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { WorkspaceFrame, WorkspaceLoading, WorkspaceSignInPrompt, useWorkspaceIdentity } from "@/components/escrow/WorkspaceFrame";
import { applyAsRealtor, createTransaction, listMyTransactions } from "@/lib/escrow.functions";

export const Route = createFileRoute("/realtor")({
  head: () => ({
    meta: [
      { title: "Realtor workspace | Liberty Crest Escrow" },
      { name: "description", content: "Manage Texas escrow transactions and buyer invitations." },
      { property: "og:title", content: "Realtor workspace | Liberty Crest Escrow" },
      { property: "og:description", content: "Manage Texas escrow transactions and buyer invitations." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: RealtorPage,
});

const usd = (c: number) => (c / 100).toLocaleString("en-US", { style: "currency", currency: "USD" });
const label = (s: string) => s.replace(/_/g, " ");

function RealtorPage() {
  const { identity, loading, refresh } = useWorkspaceIdentity();
  const isRealtor = identity?.roles.includes("realtor");
  return (
    <WorkspaceFrame title="Realtor workspace" eyebrow="Liberty Crest · Realtor" identity={identity}>
      {loading ? <WorkspaceLoading /> : !identity ? <WorkspaceSignInPrompt message="Sign in with your realtor account to manage escrow transactions." />
        : isRealtor ? <Transactions />
        : identity.application ? <ApplicationStatus status={identity.application.status} note={identity.application.review_note} />
        : <ApplyForm onDone={refresh} />}
    </WorkspaceFrame>
  );
}

function ApplicationStatus({ status, note }: { status: string; note: string | null }) {
  return (
    <div className="max-w-2xl border border-border bg-card p-8">
      <p className="eyebrow">Application status</p>
      <h2 className="mt-3 font-serif text-3xl capitalize">{status}</h2>
      <p className="mt-4 text-sm leading-7 text-muted-foreground">
        {status === "pending" ? "Your realtor application is under review. You'll be able to open transactions once an administrator approves it."
          : status === "rejected" ? "Your application was not approved." : "Your realtor access is currently suspended."}
      </p>
      {note && <p className="mt-4 border-l-2 border-accent pl-4 text-sm">{note}</p>}
    </div>
  );
}

function ApplyForm({ onDone }: { onDone: () => Promise<void> }) {
  const apply = useServerFn(applyAsRealtor);
  const [busy, setBusy] = useState(false);
  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    setBusy(true);
    try {
      await apply({ data: { fullName: String(f.get("fullName")), brokerage: String(f.get("brokerage")), licenseNumber: String(f.get("license")), phone: String(f.get("phone")), markets: String(f.get("markets")) } });
      toast.success("Application submitted for review.");
      await onDone();
    } catch (err) { toast.error(err instanceof Error ? err.message : "Could not submit."); } finally { setBusy(false); }
  };
  return (
    <form onSubmit={submit} className="grid max-w-3xl gap-5 border border-border bg-card p-8 md:grid-cols-2">
      <div className="md:col-span-2"><p className="eyebrow">Realtor application</p><h2 className="mt-2 font-serif text-3xl">Apply for realtor access</h2>
        <p className="mt-2 text-sm text-muted-foreground">An administrator verifies your Texas license before you can open escrow transactions.</p></div>
      <Field name="fullName" label="Full legal name" required />
      <Field name="brokerage" label="Brokerage" required />
      <Field name="license" label="TREC license number" required />
      <Field name="phone" label="Phone" />
      <div className="md:col-span-2"><Field name="markets" label="Markets served (e.g. Dallas, Houston)" /></div>
      <div className="md:col-span-2"><Button type="submit" disabled={busy}>{busy ? "Submitting…" : "Submit application"}</Button></div>
    </form>
  );
}

function Field({ name, label, type = "text", required }: { name: string; label: string; type?: string; required?: boolean }) {
  return <label className="block text-xs uppercase tracking-widest text-muted-foreground">{label}<input name={name} type={type} required={required} className="field mt-2" step={type === "number" ? "0.01" : undefined} /></label>;
}

type Tx = Awaited<ReturnType<typeof listMyTransactions>>[number];

function Transactions() {
  const list = useServerFn(listMyTransactions);
  const create = useServerFn(createTransaction);
  const [rows, setRows] = useState<Tx[] | null>(null);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [invite, setInvite] = useState<string | null>(null);

  const load = useCallback(async () => { try { setRows(await list()); } catch { setRows([]); } }, [list]);
  useEffect(() => { void load(); }, [load]);

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    setBusy(true);
    try {
      const res = await create({ data: {
        buyerEmail: String(f.get("buyerEmail")), propertyAddress: String(f.get("address")), city: String(f.get("city")), zip: String(f.get("zip")),
        transactionType: String(f.get("type")), depositAmount: Number(f.get("amount")), paymentDeadline: String(f.get("deadline")),
        releaseConditions: String(f.get("release")), refundConditions: String(f.get("refund")),
      } });
      setInvite(`${window.location.origin}/invite/${res.inviteToken}`);
      setOpen(false);
      await load();
    } catch (err) { toast.error(err instanceof Error ? err.message : "Could not create transaction."); } finally { setBusy(false); }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground">{rows ? `${rows.length} transaction${rows.length === 1 ? "" : "s"}` : "Loading…"}</p>
        <Button onClick={() => setOpen(!open)}><Plus /> New transaction</Button>
      </div>
      {invite && (
        <div className="border border-accent/60 bg-card p-6">
          <p className="eyebrow">Buyer invitation link</p>
          <p className="mt-2 text-sm text-muted-foreground">Share this private link with the buyer. For security it is shown only once.</p>
          <div className="mt-4 flex gap-2"><input readOnly value={invite} className="field" />
            <Button variant="outline" onClick={() => { void navigator.clipboard.writeText(invite); toast.success("Link copied"); }}><Copy /> Copy</Button></div>
        </div>
      )}
      {open && (
        <form onSubmit={submit} className="grid gap-5 border border-border bg-card p-8 md:grid-cols-2">
          <div className="md:col-span-2"><h2 className="font-serif text-3xl">Open a transaction</h2></div>
          <Field name="buyerEmail" label="Buyer email" type="email" required />
          <label className="block text-xs uppercase tracking-widest text-muted-foreground">Transaction type
            <select name="type" className="field mt-2"><option value="earnest_money">Earnest money</option><option value="option_fee">Option fee</option><option value="down_payment">Down payment</option></select></label>
          <div className="md:col-span-2"><Field name="address" label="Property address" required /></div>
          <Field name="city" label="City" required />
          <Field name="zip" label="ZIP" />
          <Field name="amount" label="Deposit amount (USD)" type="number" required />
          <Field name="deadline" label="Payment deadline" type="date" />
          <label className="block text-xs uppercase tracking-widest text-muted-foreground md:col-span-2">Release conditions<textarea name="release" rows={3} className="field mt-2" /></label>
          <label className="block text-xs uppercase tracking-widest text-muted-foreground md:col-span-2">Refund conditions<textarea name="refund" rows={3} className="field mt-2" /></label>
          <div className="flex gap-3 md:col-span-2"><Button type="submit" disabled={busy}>{busy ? "Creating…" : "Create & generate invite"}</Button><Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button></div>
        </form>
      )}
      {rows && rows.length === 0 && !open && <div className="border-y border-border py-10 text-sm text-muted-foreground">No transactions yet. Open your first one to invite a buyer.</div>}
      {rows && rows.length > 0 && (
        <div className="overflow-x-auto border border-border bg-card">
          <table className="w-full text-sm">
            <thead className="border-b border-border text-left text-xs uppercase tracking-widest text-muted-foreground">
              <tr><th className="p-4">Reference</th><th className="p-4">Property</th><th className="p-4">Buyer</th><th className="p-4">Deposit</th><th className="p-4">Status</th><th className="p-4" /></tr>
            </thead>
            <tbody>
              {rows.map((t) => (
                <tr key={t.id} className="border-b border-border last:border-0">
                  <td className="p-4 font-mono text-xs">{t.reference}</td>
                  <td className="p-4">{t.property_address}<span className="block text-xs text-muted-foreground">{t.city}</span></td>
                  <td className="p-4">{t.buyer_email}</td>
                  <td className="p-4">{usd(t.deposit_amount_cents)}</td>
                  <td className="p-4 capitalize">{label(t.status)}</td>
                  <td className="p-4 text-right"><Link to="/transactions/$id" params={{ id: t.id }} className="text-xs underline underline-offset-4">Open</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
