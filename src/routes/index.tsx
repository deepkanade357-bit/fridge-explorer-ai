import { createFileRoute, Link } from "@tanstack/react-router";
import { Bot, Camera, ChefHat, Search, Sparkles, Heart } from "lucide-react";
import hero from "@/assets/dish-curry.jpg";
import { Button } from "@/components/ui/button";
import { HowItWorks } from "@/components/HowItWorks";
import { RECIPES } from "@/data/recipes";
import { INGREDIENTS } from "@/data/ingredients";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "What2Cook — cook with what's in your fridge" },
      { name: "description", content: "Pick or scan your fridge ingredients and get matching Indian and international recipes, with an AI Chef Bot." },
      { property: "og:title", content: "What2Cook — cook with what's in your fridge" },
      { property: "og:description", content: "Pick or scan your ingredients, get recipes ranked by match, and chat with Chef Bot." },
    ],
  }),
  component: Home,
});

const FEATURES = [
  { icon: Search, title: "Pick ingredients", text: `${INGREDIENTS.length}+ ingredients with Hindi names like aloo, pyaz and palak.` },
  { icon: Camera, title: "Fridge Scan", text: "Upload photos or use the live camera — AI spots and counts your food." },
  { icon: ChefHat, title: "Smart matching", text: `${RECIPES.length} recipes ranked by how much of each you already have.` },
  { icon: Bot, title: "AI Cooking Assistant", text: "Chef Bot knows your ingredients and suggests what to cook." },
  { icon: Heart, title: "Favourites", text: "Save the dishes you love and come back to them." },
  { icon: Sparkles, title: "Veg filter", text: "Show only vegetarian recipes with one tap." },
];

function Home() {
  return (
    <div>
      <section className="mx-auto grid max-w-6xl items-center gap-8 px-4 py-10 md:grid-cols-2 md:py-16">
        <div className="space-y-5">
          <h1 className="font-display text-4xl font-bold leading-tight md:text-6xl">
            Cook with what you <span className="text-primary">already have</span>.
          </h1>
          <p className="text-lg text-muted-foreground">
            Tell us what's in your kitchen — or just snap your fridge — and we'll show the recipes you can make right now.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button asChild size="lg" className="rounded-full"><Link to="/find">Find Recipes</Link></Button>
            <Button asChild size="lg" variant="outline" className="rounded-full"><Link to="/scan">Scan My Fridge 📸</Link></Button>
          </div>
        </div>
        <img src={hero} alt="A bowl of home-style curry" width={944} height={704} className="aspect-[4/3] w-full rounded-3xl object-cover shadow-soft" />
      </section>

      <section className="mx-auto max-w-6xl px-4 py-8">
        <h2 className="mb-6 font-display text-3xl font-bold">Features</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <div key={f.title} className="rounded-3xl border bg-card p-5 shadow-soft">
              <f.icon className="mb-3 size-7 text-primary" />
              <h3 className="font-bold">{f.title}</h3>
              <p className="text-sm text-muted-foreground">{f.text}</p>
            </div>
          ))}
        </div>
      </section>

      <HowItWorks />
    </div>
  );
}
