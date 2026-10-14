// Rule-based recommendation engine. No AI involved: a recipe's score is the
// share of its ingredients you have. Salt and oil are treated as pantry staples.
import { RECIPES, type Recipe } from "@/data/recipes";

export const PANTRY_STAPLES = ["salt", "oil"];

export interface RecipeMatch {
  recipe: Recipe;
  percent: number;
  have: string[];
  missing: string[];
}

export function matchRecipe(recipe: Recipe, selected: Iterable<string>): RecipeMatch {
  const owned = new Set([...selected, ...PANTRY_STAPLES]);
  const have = recipe.ingredients.filter((i) => owned.has(i));
  const missing = recipe.ingredients.filter((i) => !owned.has(i));
  const counted = recipe.ingredients.filter((i) => !PANTRY_STAPLES.includes(i));
  const counted_have = counted.filter((i) => owned.has(i)).length;
  const percent = counted.length ? Math.round((counted_have / counted.length) * 100) : 0;
  return { recipe, percent, have, missing };
}

export function recommend(
  selected: string[],
  opts: { vegOnly?: boolean; minPercent?: number; recipes?: Recipe[] } = {},
): RecipeMatch[] {
  const { vegOnly = false, minPercent = 1, recipes = RECIPES } = opts;
  return recipes
    .filter((r) => (vegOnly ? r.veg : true))
    .map((r) => matchRecipe(r, selected))
    .filter((m) => m.percent >= minPercent)
    .sort((a, b) => b.percent - a.percent || a.missing.length - b.missing.length || a.recipe.time - b.recipe.time);
}
