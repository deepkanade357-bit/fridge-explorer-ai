import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/reset-password")({
  head: () => ({ meta: [
    { title: "Set a new password | What2Cook" },
    { name: "description", content: "Choose a new password for your What2Cook account." },
    { property: "og:title", content: "Reset password | What2Cook" },
    { property: "og:description", content: "Choose a new password for your What2Cook account." },
  ] }),
  component: Reset,
});

function Reset() {
  const [pw, setPw] = useState("");
  const navigate = useNavigate();
  async function save(e: React.FormEvent) {
    e.preventDefault();
    const { error } = await supabase.auth.updateUser({ password: pw });
    if (error) { toast.error(error.message); return; }
    toast.success("Password updated");
    navigate({ to: "/account" });
  }
  return (
    <form onSubmit={save} className="mx-auto max-w-md space-y-4 px-4 py-12">
      <h1 className="font-display text-3xl font-bold">Set a new password</h1>
      <Input type="password" required minLength={6} value={pw} onChange={(e) => setPw(e.target.value)} aria-label="New password" />
      <Button type="submit" className="w-full rounded-full">Save password</Button>
    </form>
  );
}
