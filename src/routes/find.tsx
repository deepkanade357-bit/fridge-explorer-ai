import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronDown, X } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { CATEGORY_META, CATEGORY_ORDER, INGREDIENT_MAP, INGREDIENTS, searchIngredients } from "@/data/ingredients";
import { useAppStore } from "@/lib/app-store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/find")({
  head: () => ({
    meta: [
      { title: "Find Recipes — pick your ingredients | What2Cook" },
      { name: "description", content: "Choose from 200+ ingredients (search in English or Hindi) and find recipes you can cook." },
      { property: "og:title", content: "Find Recipes | What2Cook" },
      { property: "og:description", content: "Pick the ingredients you have and see matching recipes." },
    ],
  }),
  component: Find,
});

function Find() {
  const { selected, toggleIngredient, clearIngredients, vegOnly, setVegOnly } = useAppStore();
  const [q, setQ] = useState("");
  const [closed, setClosed] = useState<Record<string, boolean>>({});
  const results = useMemo(() => searchIngredients(q), [q]);

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl font-bold">What's in your kitchen?</h1>
          <p className="text-muted-foreground">{INGREDIENTS.length} ingredients · search "aloo", "pyaz", "dahi"…</p>
        </div>
        <Button asChild variant="outline" className="rounded-full"><Link to="/scan">Scan My Fridge 📸</Link></Button>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search ingredients…" className="h-12 max-w-md rounded-full" />
        <label className="flex items-center gap-2 text-sm font-semibold">
          <Switch checked={vegOnly} onCheckedChange={setVegOnly} /> Veg recipes only
        </label>
      </div>

      {selected.length > 0 && (
        <div className="sticky top-16 z-10 rounded-3xl border bg-card p-4 shadow-soft">
          <div className="mb-2 flex items-center justify-between">
            <span className="font-bold">{selected.length} selected</span>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={clearIngredients}>Clear</Button>
              <Button asChild size="sm" className="rounded-full"><Link to="/recipes">Show recipes →</Link></Button>
            </div>
          </div>
          <div className="flex max-h-24 flex-wrap gap-2 overflow-y-auto">
            {selected.map((id) => (
              <button key={id} onClick={() => toggleIngredient(id)} className="flex items-center gap-1 rounded-full bg-secondary px-3 py-1 text-sm">
                {INGREDIENT_MAP[id]?.emoji} {INGREDIENT_MAP[id]?.name ?? id} <X className="size-3" />
              </button>
            ))}
          </div>
        </div>
      )}

      {CATEGORY_ORDER.map((cat) => {
        const items = results.filter((i) => i.category === cat);
        if (!items.length) return null;
        const isClosed = closed[cat] && !q;
        const count = items.filter((i) => selected.includes(i.id)).length;
        return (
          <section key={cat} className="rounded-3xl border bg-card">
            <button
              className="flex w-full items-center justify-between p-4 text-left"
              onClick={() => setClosed((c) => ({ ...c, [cat]: !c[cat] }))}
              aria-expanded={!isClosed}
            >
              <span className="text-lg font-bold">
                {CATEGORY_META[cat].emoji} {CATEGORY_META[cat].label}{" "}
                <span className="text-sm font-semibold text-muted-foreground">({items.length}{count ? ` · ${count} picked` : ""})</span>
              </span>
              <ChevronDown className={cn("size-5 transition-transform", isClosed && "-rotate-90")} />
            </button>
            {!isClosed && (
              <div className="flex flex-wrap gap-2 px-4 pb-4">
                {items.map((i) => {
                  const on = selected.includes(i.id);
                  return (
                    <button
                      key={i.id}
                      onClick={() => toggleIngredient(i.id)}
                      aria-pressed={on}
                      className={cn(
                        "rounded-full border px-3 py-2 text-sm font-semibold transition-colors",
                        on ? "border-primary bg-primary text-primary-foreground" : "bg-background hover:bg-secondary",
                      )}
                    >
                      {i.emoji} {i.name}
                    </button>
                  );
                })}
              </div>
            )}
          </section>
        );
      })}
      {!results.length && <p className="text-muted-foreground">No ingredient matches "{q}".</p>}
    </div>
  );
}
