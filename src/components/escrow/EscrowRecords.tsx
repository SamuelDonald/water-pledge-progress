import { useState, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ArrowUpRight, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { money, statusLabels } from "@/lib/payment-config";
import type { listMyTransactions } from "@/lib/escrow.functions";

export function useEscrowAction() {
  const client = useQueryClient();
  const [busy, setBusy] = useState(false);
  const run = async (action: () => Promise<unknown>, message: string) => {
    setBusy(true);
    try {
      await action();
      await client.invalidateQueries();
      toast.success(message);
      return true;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "This action could not be completed.");
      return false;
    } finally { setBusy(false); }
  };
  return { run, busy };
}

export function StatusBadge({ status }: { status: string }) {
  const success = ["approved", "verified", "completed", "funds_secured", "release_authorized"].includes(status);
  const danger = ["rejected", "suspended", "cancelled"].includes(status);
  return <span className={`inline-flex items-center gap-2 text-xs capitalize ${success ? "text-success" : danger ? "text-destructive" : "text-muted-foreground"}`}><span className="size-1.5 shrink-0 rounded-full bg-current" />{statusLabels[status] ?? status.replace(/_/g, " ")}</span>;
}

export function RecordField({ label, children }: { label: string; children: ReactNode }) {
  return <label className="block min-w-0 text-xs font-medium text-muted-foreground">{label}<div className="mt-2">{children}</div></label>;
}

export function RecordError({ error, retry }: { error: unknown; retry: () => unknown }) {
  return <div role="alert" className="border-y border-border py-8"><p className="flex items-center gap-2 text-sm text-destructive"><AlertCircle size={16} />{error instanceof Error ? error.message : "Records could not be loaded."}</p><Button variant="outline" className="mt-4" onClick={() => { void retry(); }}>Try again</Button></div>;
}

export function TransactionTable({ rows }: { rows: Awaited<ReturnType<typeof listMyTransactions>> }) {
  if (!rows.length) return <p className="border-y border-border py-10 text-sm text-muted-foreground">No transactions to display.</p>;
  return <div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead className="border-y border-border text-xs text-muted-foreground"><tr><th className="px-3 py-4">Transaction</th><th className="px-3 py-4">Buyer</th><th className="px-3 py-4">Deposit</th><th className="px-3 py-4">Status</th><th className="px-3 py-4"><span className="sr-only">Open</span></th></tr></thead><tbody>{rows.map((tx) => <tr key={tx.id} className="border-b border-border"><td className="min-w-48 px-3 py-5"><p className="font-mono text-xs text-muted-foreground">{tx.reference}</p><p className="mt-1 font-medium">{tx.property_address}</p><p className="text-xs text-muted-foreground">{tx.city}, {tx.state}</p></td><td className="px-3 py-5">{tx.buyer_email}</td><td className="whitespace-nowrap px-3 py-5">{money(tx.deposit_amount_cents, tx.currency)}</td><td className="px-3 py-5"><StatusBadge status={tx.status} /></td><td className="px-3 py-5"><Button variant="ghost" size="icon" asChild><Link to="/transactions/$id" params={{ id: tx.id }} aria-label={`Open ${tx.reference}`} title={`Open ${tx.reference}`}><ArrowUpRight /></Link></Button></td></tr>)}</tbody></table></div>;
}