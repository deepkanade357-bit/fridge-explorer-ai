import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useAppStore } from "@/lib/app-store";

export const Route = createFileRoute("/account")({
  head: () => ({ meta: [
    { title: "My account | What2Cook" },
    { name: "description", content: "Your What2Cook account and role." },
    { property: "og:title", content: "My account | What2Cook" },
    { property: "og:description", content: "Your What2Cook account and role." },
  ] }),
  component: Account,
});

function Account() {
  const { user, roles, isOwner, loading } = useAuth();
  const { selected, favourites } = useAppStore();
  const navigate = useNavigate();
  if (loading) return <p className="p-8 text-center text-muted-foreground">Loading…</p>;
  if (!user) return (
    <div className="mx-auto max-w-md space-y-4 px-4 py-12 text-center">
      <h1 className="font-display text-3xl font-bold">You're not signed in</h1>
      <Button asChild className="rounded-full"><Link to="/auth">Sign in or sign up</Link></Button>
    </div>
  );
  return (
    <div className="mx-auto max-w-2xl space-y-6 px-4 py-10">
      <h1 className="font-display text-4xl font-bold">My account</h1>
      <div className="space-y-2 rounded-3xl border bg-card p-6">
        <p><span className="font-semibold">Email:</span> {user.email}</p>
        <p><span className="font-semibold">Role:</span> <span className="rounded-full bg-secondary px-3 py-1 text-sm font-bold capitalize">{roles.join(", ") || "client"}</span></p>
        <p className="text-sm text-muted-foreground">{selected.length} ingredients selected · {favourites.length} favourites</p>
      </div>
      {isOwner && (
        <div className="space-y-3 rounded-3xl border bg-hero p-6">
          <h2 className="font-display text-2xl font-bold">Owner tools</h2>
          <p className="text-sm text-muted-foreground">Overview of the recipe library and ingredient data.</p>
          <Button asChild className="rounded-full"><Link to="/dashboard">Open dashboard</Link></Button>
        </div>
      )}
      <Button variant="outline" className="rounded-full" onClick={async () => { await supabase.auth.signOut(); navigate({ to: "/auth", replace: true }); }}>Sign out</Button>
    </div>
  );
}
