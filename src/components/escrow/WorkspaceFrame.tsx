import { useCallback, useEffect, useState, type ReactNode } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Landmark, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { getMe } from "@/lib/escrow.functions";
import { useServerFn } from "@tanstack/react-start";

export type WorkspaceIdentity = Awaited<ReturnType<typeof getMe>>;

export function useWorkspaceIdentity() {
  const getMeFn = useServerFn(getMe);
  const [identity, setIdentity] = useState<WorkspaceIdentity | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setIdentity(await getMeFn());
    } catch {
      setIdentity(null);
      setError("Sign in to access this workspace.");
    } finally {
      setLoading(false);
    }
  }, [getMeFn]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { identity, loading, error, refresh };
}

export function WorkspaceFrame({
  title,
  eyebrow,
  identity,
  children,
}: {
  title: string;
  eyebrow: string;
  identity: WorkspaceIdentity | null;
  children: ReactNode;
}) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const signOut = async () => {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    await navigate({ to: "/auth", replace: true });
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-5 py-4 md:px-8">
          <Link to="/" className="flex items-center gap-3" aria-label="Liberty Crest home">
            <span className="flex size-10 items-center justify-center border border-accent/50 text-accent"><Landmark size={19} /></span>
            <span><span className="block font-serif text-lg leading-tight">LIBERTY CREST</span><span className="mt-1 block text-[9px] uppercase tracking-[0.2em] text-muted-foreground">Escrow Services</span></span>
          </Link>
          <nav className="flex items-center gap-2 sm:gap-5">
            <Link to="/realtor" className="hidden text-xs text-muted-foreground hover:text-foreground md:inline">Realtor</Link>
            <Link to="/admin" className="hidden text-xs text-muted-foreground hover:text-foreground md:inline">Administration</Link>
            <Link to="/escrow-officer" className="hidden text-xs text-muted-foreground hover:text-foreground md:inline">Escrow officer</Link>
            {identity && <span className="hidden border-l border-border pl-4 text-xs text-muted-foreground sm:inline">{identity.email}</span>}
            {identity ? <Button variant="outline" size="sm" onClick={() => void signOut()}><LogOut /> Sign out</Button> : <Button variant="outline" size="sm" asChild><Link to="/"><ArrowLeft /> Home</Link></Button>}
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-5 py-10 md:px-8 md:py-14">
        <div className="mb-9 border-b border-border pb-7">
          <p className="eyebrow">{eyebrow}</p>
          <h1 className="mt-3 font-serif text-4xl leading-tight md:text-5xl">{title}</h1>
        </div>
        {children}
      </main>
    </div>
  );
}

export function WorkspaceLoading({ message = "Loading workspace…" }: { message?: string }) {
  return <div className="border-y border-border py-8 text-sm text-muted-foreground" role="status">{message}</div>;
}

export function WorkspaceSignInPrompt({ message = "Sign in to continue.", returnTo }: { message?: string; returnTo?: string }) {
  return (
    <div className="border-y border-border py-10">
      <p className="max-w-xl text-sm leading-7 text-muted-foreground">{message}</p>
      <Button className="mt-5" asChild><Link to="/auth" search={returnTo ? { returnTo } : {}}>Sign in <ArrowLeft className="rotate-180" /></Link></Button>
    </div>
  );
}