import { createFileRoute, Link } from "@tanstack/react-router";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { RecipeCard } from "@/components/RecipeCard";
import { RECIPES } from "@/data/recipes";
import { recommend } from "@/lib/matcher";
import { useAppStore } from "@/lib/app-store";

export const Route = createFileRoute("/recipes/")({
  head: () => ({
    meta: [
      { title: "Recipe Recommendations | What2Cook" },
      { name: "description", content: "Recipes ranked by how many of your ingredients they use, with match percentages." },
      { property: "og:title", content: "Recipe Recommendations | What2Cook" },
      { property: "og:description", content: "See what you can cook right now, ranked by ingredient match." },
    ],
  }),
  component: Recipes,
});

function Recipes() {
  const { selected, vegOnly, setVegOnly, favourites } = useAppStore();
  const matches = recommend(selected, { vegOnly });
  const favs = RECIPES.filter((r) => favourites.includes(r.id));
  const all = RECIPES.filter((r) => (vegOnly ? r.veg : true));

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl font-bold">Recommendations</h1>
          <p className="text-muted-foreground">
            {selected.length ? `Based on your ${selected.length} ingredients` : "Pick ingredients or scan your fridge to see match percentages."}
          </p>
        </div>
        <label className="flex items-center gap-2 text-sm font-semibold">
          <Switch checked={vegOnly} onCheckedChange={setVegOnly} /> Veg only
        </label>
      </div>

      {selected.length === 0 ? (
        <div className="flex flex-wrap gap-3">
          <Button asChild className="rounded-full"><Link to="/find">Pick ingredients</Link></Button>
          <Button asChild variant="outline" className="rounded-full"><Link to="/scan">Scan My Fridge 📸</Link></Button>
        </div>
      ) : matches.length === 0 ? (
        <p className="rounded-3xl bg-cream p-6">No recipes match yet — try adding a few more ingredients.</p>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {matches.map((m) => (
            <RecipeCard key={m.recipe.id} recipe={m.recipe} percent={m.percent} missing={m.missing.length} />
          ))}
        </div>
      )}

      {favs.length > 0 && (
        <section>
          <h2 className="mb-4 font-display text-2xl font-bold">Your favourites</h2>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {favs.map((r) => <RecipeCard key={r.id} recipe={r} />)}
          </div>
        </section>
      )}

      {selected.length === 0 && (
        <section>
          <h2 className="mb-4 font-display text-2xl font-bold">All recipes ({all.length})</h2>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {all.map((r) => <RecipeCard key={r.id} recipe={r} />)}
          </div>
        </section>
      )}
    </div>
  );
}
