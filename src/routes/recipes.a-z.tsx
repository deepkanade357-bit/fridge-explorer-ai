import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { RecipeCard } from "@/components/RecipeCard";
import { RECIPES, type Meal } from "@/data/recipes";
import { INGREDIENT_MAP } from "@/data/ingredients";
import { useAppStore } from "@/lib/app-store";
import { matchRecipe } from "@/lib/matcher";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/recipes/a-z")({
  head: () => ({
    meta: [
      { title: "A–Z Cookbook | What2Cook" },
      { name: "description", content: "Browse every What2Cook recipe alphabetically, with search, filters and ingredient match." },
      { property: "og:title", content: "A–Z Cookbook | What2Cook" },
      { property: "og:description", content: "Every recipe from A to Z, searchable by name or ingredient." },
    ],
  }),
  component: AZ,
});

const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
const MEALS: (Meal | "all")[] = ["all", "breakfast", "lunch", "dinner", "snack", "dessert"];

function AZ() {
  const { selected, vegOnly, setVegOnly } = useAppStore();
  const [q, setQ] = useState("");
  const [meal, setMeal] = useState<Meal | "all">("all");
  const [cuisine, setCuisine] = useState<"all" | "Indian" | "International">("all");

  const groups = useMemo(() => {
    const s = q.trim().toLowerCase();
    const list = RECIPES.filter((r) =>
      (!vegOnly || r.veg) && (meal === "all" || r.meal === meal) && (cuisine === "all" || r.cuisine === cuisine) &&
      (!s || r.name.toLowerCase().includes(s) || r.ingredients.some((id) => {
        const ing = INGREDIENT_MAP[id];
        return ing && (ing.name.toLowerCase().includes(s) || ing.aliases.some((a) => a.toLowerCase().includes(s)));
      })),
    ).sort((a, b) => a.name.localeCompare(b.name));
    const g: Record<string, typeof list> = {};
    for (const r of list) (g[r.name[0]!.toUpperCase()] ??= []).push(r);
    return g;
  }, [q, meal, cuisine, vegOnly]);

  const count = Object.values(groups).reduce((n, l) => n + l.length, 0);

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-8">
      <div>
        <h1 className="font-display text-4xl font-bold">A–Z Cookbook</h1>
        <p className="text-muted-foreground">{count} of {RECIPES.length} recipes</p>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search recipe or ingredient (e.g. aloo, paneer)…" aria-label="Search recipes" className="max-w-sm rounded-full" />
        <select value={meal} onChange={(e) => setMeal(e.target.value as Meal | "all")} aria-label="Meal type" className="h-10 rounded-full border bg-background px-4 text-sm capitalize">
          {MEALS.map((m) => <option key={m} value={m}>{m === "all" ? "All meals" : m}</option>)}
        </select>
        <select value={cuisine} onChange={(e) => setCuisine(e.target.value as typeof cuisine)} aria-label="Cuisine" className="h-10 rounded-full border bg-background px-4 text-sm">
          <option value="all">All cuisines</option><option value="Indian">Indian</option><option value="International">International</option>
        </select>
        <label className="flex items-center gap-2 text-sm font-semibold"><Switch checked={vegOnly} onCheckedChange={setVegOnly} /> Veg only</label>
      </div>
      <nav aria-label="Jump to letter" className="sticky top-16 z-30 -mx-4 flex flex-wrap gap-1 bg-background/95 px-4 py-2 backdrop-blur">
        {LETTERS.map((l) => (
          <a key={l} href={groups[l] ? `#letter-${l}` : undefined} aria-disabled={!groups[l]}
            className={cn("flex size-8 items-center justify-center rounded-full text-sm font-bold", groups[l] ? "bg-secondary text-secondary-foreground hover:bg-primary hover:text-primary-foreground" : "text-muted-foreground/40")}>
            {l}
          </a>
        ))}
      </nav>
      {count === 0 && <p className="rounded-3xl bg-cream p-6">No recipes match these filters.</p>}
      {LETTERS.filter((l) => groups[l]).map((l) => (
        <section key={l} id={`letter-${l}`} className="scroll-mt-32">
          <h2 className="mb-4 font-display text-3xl font-bold text-primary">{l}</h2>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {groups[l]!.map((r) => {
              const m = selected.length ? matchRecipe(r, selected) : null;
              return <RecipeCard key={r.id} recipe={r} percent={m?.percent} missing={m?.missing.length} />;
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
