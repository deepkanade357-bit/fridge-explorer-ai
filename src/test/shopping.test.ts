import { describe, expect, it } from "vitest";

import { INGREDIENT_MAP } from "@/data/ingredients";
import { RECIPES } from "@/data/recipes";
import { buildShoppingList, shoppingListText } from "@/lib/shopping";

describe("recipe library and shopping list", () => {
  it("includes at least 25 added recipes with complete, valid ingredient data", () => {
    expect(RECIPES.length).toBeGreaterThanOrEqual(68);
    expect(new Set(RECIPES.map((recipe) => recipe.id)).size).toBe(RECIPES.length);

    const unresolved = RECIPES.flatMap((recipe) =>
      recipe.ingredients
        .filter((ingredientId) => !INGREDIENT_MAP[ingredientId])
        .map((ingredientId) => `${recipe.name}: ${ingredientId}`),
    );
    expect(unresolved).toEqual([]);

    for (const recipe of RECIPES) {
      expect(recipe.image).toBeTruthy();
      expect(recipe.time).toBeGreaterThan(0);
      expect(recipe.difficulty).toMatch(/^(Easy|Medium|Hard)$/);
      expect(recipe.ingredients.length).toBeGreaterThan(0);
      expect(recipe.steps.length).toBeGreaterThanOrEqual(2);
      expect(Object.values(recipe.nutrition).every((value) => value >= 0)).toBe(true);
    }
  });

  it("groups missing ingredients, skips owned pantry staples, and deduplicates across recipes", () => {
    const recipes = RECIPES.filter((recipe) => ["aloo-gobi", "dal-tadka"].includes(recipe.id));
    const groups = buildShoppingList(recipes, ["potato", "tomato"]);
    const items = groups.flatMap((group) => group.items);
    const onion = items.find((item) => item.id === "onion");

    expect(groups.map((group) => group.category)).toContain("vegetable");
    expect(onion?.recipes).toEqual(["Aloo Gobi", "Dal Tadka"]);
    expect(items.some((item) => ["potato", "tomato", "salt", "oil"].includes(item.id))).toBe(false);
    expect(items.filter((item) => item.id === "onion")).toHaveLength(1);
  });

  it("copies a readable shopping list with category headings and item names", () => {
    const groups = buildShoppingList(
      RECIPES.filter((recipe) => recipe.id === "aloo-gobi"),
      ["potato", "tomato", "onion", "ginger", "green-chilli", "turmeric", "cumin", "coriander-leaves", "coriander-powder"],
    );

    expect(shoppingListText(groups)).toBe("What2Cook shopping list\n\n🥕 Vegetables\n- Cauliflower");
  });
});