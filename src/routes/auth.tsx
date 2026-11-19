import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in or sign up | What2Cook" },
      { name: "description", content: "Log in or create your What2Cook account." },
      { property: "og:title", content: "Sign in | What2Cook" },
      { property: "og:description", content: "Log in or create your What2Cook account." },
    ],
  }),
  component: AuthPage,
});

const GoogleG = () => (
  <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z"/><path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09C3.26 21.3 7.31 24 12 24z"/><path fill="#FBBC05" d="M5.27 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.98-3.09z"/><path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.98 3.09c.95-2.85 3.6-4.96 6.73-4.96z"/></svg>
);

function AuthPage() {
  const [mode, setMode] = useState<"login" | "signup" | "forgot">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => { if (user) navigate({ to: "/account", replace: true }); }, [user, navigate]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({ email, password, options: { emailRedirectTo: window.location.origin } });
        if (error) throw error;
        toast.success("Check your email to confirm your account.");
      } else if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/reset-password` });
        if (error) throw error;
        toast.success("Password reset link sent — check your email.");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally { setBusy(false); }
  }

  async function oauth(p: "google" | "lovable") {
    const r = await lovable.auth.signInWithOAuth(p, { redirect_uri: window.location.origin });
    if (r.error) toast.error("Sign-in didn't work. Please try again.");
  }

  const title = mode === "signup" ? "Create your account" : mode === "login" ? "Welcome back" : "Reset your password";
  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <div className="space-y-6 rounded-3xl border bg-card p-6 shadow-soft">
        <div className="text-center">
          <div className="text-4xl" aria-hidden>🍲</div>
          <h1 className="font-display text-3xl font-bold">{title}</h1>
          <p className="text-sm text-muted-foreground">Save your ingredients, favourites and scans.</p>
        </div>
        {mode !== "forgot" && (
          <div className="space-y-2">
            <button type="button" onClick={() => oauth("google")} className="flex h-11 w-full items-center justify-center gap-2.5 rounded-full border border-[#747775] bg-[#FFFFFF] px-3 text-sm font-medium text-[#1F1F1F]">
              <GoogleG /> Continue with Google
            </button>
            <Button type="button" variant="outline" className="h-11 w-full rounded-full" onClick={() => oauth("lovable")}>Continue with Lovable</Button>
            <p className="text-center text-xs text-muted-foreground">or use email</p>
          </div>
        )}
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-1.5"><Label htmlFor="email">Email</Label><Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} /></div>
          {mode !== "forgot" && (
            <div className="space-y-1.5"><Label htmlFor="pw">Password</Label><Input id="pw" type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} /></div>
          )}
          <Button type="submit" className="h-11 w-full rounded-full" disabled={busy}>
            {mode === "signup" ? "Sign up" : mode === "login" ? "Log in" : "Send reset link"}
          </Button>
        </form>
        <div className="space-y-1 text-center text-sm">
          {mode === "login" && <button className="text-muted-foreground underline" onClick={() => setMode("forgot")}>Forgot password?</button>}
          <p>
            {mode === "signup" ? "Already have an account? " : "New to What2Cook? "}
            <button className="font-bold text-primary" onClick={() => setMode(mode === "signup" ? "login" : "signup")}>{mode === "signup" ? "Log in" : "Sign up"}</button>
          </p>
          <p className="text-xs text-muted-foreground">New accounts are clients. Owner access is granted by the app owner.</p>
          <Link to="/" className="text-xs text-muted-foreground underline">Back home</Link>
        </div>
      </div>
    </div>
  );
}
