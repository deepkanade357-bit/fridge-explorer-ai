import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Clock, Heart, Users } from "lucide-react";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { MatchBadge } from "@/components/RecipeCard";
import { RECIPE_MAP } from "@/data/recipes";
import { INGREDIENT_MAP } from "@/data/ingredients";
import { matchRecipe } from "@/lib/matcher";
import { useAppStore } from "@/lib/app-store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/recipes/$id")({
  loader: ({ params }) => {
    const recipe = RECIPE_MAP[params.id];
    if (!recipe) throw notFound();
    return { id: recipe.id, name: recipe.name, time: recipe.time };
  },
  head: ({ loaderData }) => {
    const title = loaderData ? `${loaderData.name} — ${loaderData.time} min recipe | What2Cook` : "Recipe not found | What2Cook";
    const desc = loaderData ? `How to make ${loaderData.name}: ingredients, steps and nutrition.` : "This recipe isn't on the menu.";
    return { meta: [{ title }, { name: "description", content: desc }, { property: "og:title", content: title }, { property: "og:description", content: desc }, { property: "og:type", content: "article" }] };
  },
  component: RecipePage,
});

function RecipePage() {
  const { id } = Route.useLoaderData();
  const recipe = RECIPE_MAP[id]!;
  const { selected, addIngredients, favourites, toggleFavourite, setCurrentRecipeId } = useAppStore();
  const m = matchRecipe(recipe, selected);
  const fav = favourites.includes(id);

  useEffect(() => {
    setCurrentRecipeId(id);
    return () => setCurrentRecipeId(null);
  }, [id, setCurrentRecipeId]);

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-8">
      <Link to="/recipes" className="text-sm font-semibold text-primary">← All recommendations</Link>
      <div className="grid gap-6 md:grid-cols-2">
        <img src={recipe.image} alt={recipe.name} width={944} height={704} className="aspect-[4/3] w-full rounded-3xl object-cover" />
        <div className="space-y-4">
          <span className={cn("text-xs font-bold uppercase", recipe.veg ? "text-primary" : "text-destructive")}>
            {recipe.veg ? "● Veg" : "● Non-veg"} · {recipe.cuisine} · {recipe.meal}
          </span>
          <h1 className="font-display text-4xl font-bold">{recipe.name}</h1>
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1"><Clock className="size-4" /> {recipe.time} min</span>
            <span className="flex items-center gap-1"><Users className="size-4" /> {recipe.servings} servings</span>
            <span>{recipe.difficulty}</span>
            <MatchBadge percent={m.percent} />
          </div>
          <Button variant="outline" className="rounded-full" onClick={() => toggleFavourite(id)}>
            <Heart className={cn("size-4", fav && "fill-accent text-accent")} /> {fav ? "Saved" : "Save to favourites"}
          </Button>
          <div className="grid grid-cols-4 gap-2 text-center">
            {[["Calories", recipe.nutrition.calories, "kcal"], ["Protein", recipe.nutrition.protein, "g"], ["Carbs", recipe.nutrition.carbs, "g"], ["Fat", recipe.nutrition.fat, "g"]].map(([l, v, u]) => (
              <div key={l} className="rounded-2xl bg-cream p-2">
                <div className="font-bold">{v}{u}</div>
                <div className="text-xs text-muted-foreground">{l}</div>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">Nutrition per serving is an approximate estimate, not medical advice.</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <section className="rounded-3xl border bg-card p-5">
          <h2 className="mb-3 text-xl font-bold">Ingredients</h2>
          <ul className="space-y-1">
            {recipe.ingredients.map((ing) => {
              const have = m.have.includes(ing);
              return (
                <li key={ing} className="flex items-center justify-between">
                  <span>{INGREDIENT_MAP[ing]?.emoji} {INGREDIENT_MAP[ing]?.name ?? ing}</span>
                  <span className={cn("text-xs font-bold", have ? "text-primary" : "text-accent")}>{have ? "✓ have" : "missing"}</span>
                </li>
              );
            })}
          </ul>
          {m.missing.length > 0 && (
            <Button size="sm" variant="secondary" className="mt-4 rounded-full" onClick={() => addIngredients(m.missing)}>
              I have the missing items
            </Button>
          )}
        </section>
        <section className="rounded-3xl border bg-card p-5">
          <h2 className="mb-3 text-xl font-bold">Steps</h2>
          <ol className="list-decimal space-y-2 pl-5">
            {recipe.steps.map((s, i) => <li key={i}>{s}</li>)}
          </ol>
        </section>
      </div>
    </div>
  );
}
