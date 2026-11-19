import { CATEGORY_ORDER, CATEGORY_META, INGREDIENT_MAP, type IngredientCategory } from "@/data/ingredients";
import type { Recipe } from "@/data/recipes";
import { PANTRY_STAPLES } from "@/lib/matcher";

export interface ShoppingItem { id: string; name: string; emoji: string; recipes: string[] }
export interface ShoppingGroup { category: IngredientCategory; label: string; emoji: string; items: ShoppingItem[] }

/** Missing ingredients across recipes, de-duplicated and grouped by category. Pantry staples are skipped. */
export function buildShoppingList(recipes: Recipe[], selected: Iterable<string>): ShoppingGroup[] {
  const have = new Set(selected);
  const map = new Map<string, ShoppingItem>();
  for (const r of recipes) {
    for (const id of r.ingredients) {
      if (have.has(id) || PANTRY_STAPLES.includes(id)) continue;
      const ing = INGREDIENT_MAP[id];
      if (!ing) continue;
      const item = map.get(id) ?? { id, name: ing.name, emoji: ing.emoji, recipes: [] };
      if (!item.recipes.includes(r.name)) item.recipes.push(r.name);
      map.set(id, item);
    }
  }
  return CATEGORY_ORDER.map((c) => ({
    category: c, ...CATEGORY_META[c],
    items: [...map.values()].filter((i) => INGREDIENT_MAP[i.id]?.category === c).sort((a, b) => a.name.localeCompare(b.name)),
  })).filter((g) => g.items.length > 0);
}

export function shoppingListText(groups: ShoppingGroup[]): string {
  return ["What2Cook shopping list", ...groups.flatMap((g) => ["", `${g.emoji} ${g.label}`, ...g.items.map((i) => `- ${i.name}`)])].join("\n");
}
