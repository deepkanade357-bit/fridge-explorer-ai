import { Link } from "@tanstack/react-router";
import { Clock, Heart } from "lucide-react";
import type { Recipe } from "@/data/recipes";
import { useAppStore } from "@/lib/app-store";
import { cn } from "@/lib/utils";

export function MatchBadge({ percent }: { percent: number }) {
  const tone = percent >= 75 ? "bg-primary text-primary-foreground" : percent >= 40 ? "bg-accent text-accent-foreground" : "bg-muted text-muted-foreground";
  return <span className={cn("rounded-full px-2.5 py-1 text-xs font-bold", tone)}>{percent}% match</span>;
}

export function RecipeCard({ recipe, percent, missing }: { recipe: Recipe; percent?: number; missing?: number }) {
  const { favourites, toggleFavourite } = useAppStore();
  const fav = favourites.includes(recipe.id);
  return (
    <div className="group relative overflow-hidden rounded-3xl border bg-card shadow-soft transition-transform hover:-translate-y-1">
      <Link to="/recipes/$id" params={{ id: recipe.id }} className="block">
        <img src={recipe.image} alt={recipe.name} loading="lazy" width={944} height={704} className="aspect-[4/3] w-full object-cover" />
        <div className="space-y-2 p-4">
          <div className="flex items-center justify-between gap-2">
            <span className={cn("text-xs font-bold uppercase tracking-wide", recipe.veg ? "text-primary" : "text-destructive")}>
              {recipe.veg ? "● Veg" : "● Non-veg"} · {recipe.meal}
            </span>
            {percent !== undefined && <MatchBadge percent={percent} />}
          </div>
          <h3 className="text-lg font-bold leading-tight">{recipe.name}</h3>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><Clock className="size-3.5" /> {recipe.time} min</span>
            <span>{recipe.difficulty}</span>
            {missing !== undefined && <span>{missing === 0 ? "You have everything!" : `${missing} missing`}</span>}
          </div>
        </div>
      </Link>
      <button
        aria-label={fav ? "Remove from favourites" : "Save to favourites"}
        onClick={() => toggleFavourite(recipe.id)}
        className="absolute right-3 top-3 rounded-full bg-card/90 p-2 shadow-soft"
      >
        <Heart className={cn("size-4", fav ? "fill-accent text-accent" : "text-muted-foreground")} />
      </button>
    </div>
  );
}
