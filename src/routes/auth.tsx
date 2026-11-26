import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { Landmark } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useServerFn } from "@tanstack/react-start";
import { getMe } from "@/lib/escrow.functions";
import { safeReturnPath } from "@/lib/escrow-rules";

export const Route = createFileRoute("/auth")({
  validateSearch: (search: Record<string, unknown>): { returnTo?: string } => {
    const returnTo = safeReturnPath(search["returnTo"]);
    return returnTo ? { returnTo } : {};
  },
  head: () => ({
    meta: [
      { title: "Secure sign-in | Liberty Crest Escrow" },
      { name: "description", content: "Secure email sign-in for Liberty Crest Escrow Services." },
      { property: "og:title", content: "Secure sign-in | Liberty Crest Escrow" },
      { property: "og:description", content: "Secure email sign-in for Liberty Crest Escrow Services." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const { returnTo } = Route.useSearch();
  const me = useServerFn(getMe);
  const finishSignIn = async () => {
    if (returnTo) { await navigate({ to: returnTo, replace: true }); return; }
    const identity = await me();
    const destination = identity.roles.includes("admin") ? "/admin" : identity.roles.includes("escrow_officer") ? "/escrow-officer" : "/realtor";
    await navigate({ to: destination, replace: true });
  };
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    void supabase.auth.getUser().then(({ data }) => {
      if (data.user) void finishSignIn();
    });
  }, [navigate, returnTo]);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email || password.length < 8) { toast.error("Enter your email and a password of at least 8 characters."); return; }
    setBusy(true);
    try {
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        await finishSignIn();
      } else {
        const callback = new URL("/auth", window.location.origin);
        if (returnTo) callback.searchParams.set("returnTo", returnTo);
        const { data, error } = await supabase.auth.signUp({ email, password, options: { emailRedirectTo: callback.toString() } });
        if (error) throw error;
        if (data.session) await finishSignIn();
        else setSent(true);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong.");
    } finally { setBusy(false); }
  };

  return (
    <main className="grid min-h-screen bg-background text-foreground lg:grid-cols-2">
      <section className="hidden flex-col justify-between bg-primary p-12 text-primary-foreground lg:flex">
        <Link to="/" className="flex items-center gap-3">
          <span className="flex size-10 items-center justify-center border border-accent/60 text-accent"><Landmark size={19} /></span>
          <span className="font-serif text-xl">LIBERTY CREST</span>
        </Link>
        <div>
          <p className="eyebrow text-accent">Texas residential escrow</p>
          <h1 className="mt-4 font-serif text-5xl leading-tight">Every deposit, document and release — on the record.</h1>
          <p className="mt-6 max-w-md text-sm leading-7 opacity-75">Realtors, buyers, administrators and escrow officers each see only what their role allows.</p>
        </div>
        <p className="text-xs opacity-60">Protected sign-in · Role-based access · Full audit trail</p>
      </section>
      <section className="flex items-center justify-center px-5 py-16">
        <div className="w-full max-w-sm">
          <p className="eyebrow">{mode === "signin" ? "Welcome back" : "Create account"}</p>
          <h2 className="mt-3 font-serif text-4xl">{mode === "signin" ? "Sign in" : "Register"}</h2>
          {sent ? (
            <div className="mt-8 border border-border bg-card p-6 text-sm leading-7">
              Check <strong>{email}</strong> for a confirmation link. Once confirmed, return here to sign in.
              <Button variant="outline" className="mt-5 w-full" onClick={() => { setSent(false); setMode("signin"); }}>Back to sign in</Button>
            </div>
          ) : (
            <form onSubmit={submit} className="mt-8 space-y-5">
              <label className="block text-xs uppercase tracking-widest text-muted-foreground">Email
                <input className="field mt-2" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </label>
              <label className="block text-xs uppercase tracking-widest text-muted-foreground">Password
                <input className="field mt-2" type="password" autoComplete={mode === "signin" ? "current-password" : "new-password"} value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} />
              </label>
              <Button type="submit" className="w-full" disabled={busy}>{busy ? "Please wait…" : mode === "signin" ? "Sign in" : "Create account"}</Button>
              <Button variant="link" type="button" className="w-full text-center text-xs text-muted-foreground" onClick={() => setMode(mode === "signin" ? "signup" : "signin")}>
                {mode === "signin" ? "New to Liberty Crest? Create an account" : "Already registered? Sign in"}
              </Button>
            </form>
          )}
        </div>
      </section>
    </main>
  );
}
