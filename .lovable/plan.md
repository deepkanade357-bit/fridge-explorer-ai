# What2Cook recipe library upgrade

## Build
- Add a dedicated `/recipes/a-z` cookbook page, linked from the home page and navigation, with alphabet jump links, live name/ingredient search, vegetarian, meal, and cuisine filters, and recipe cards showing match percentages when ingredient selections exist.
- Expand the cookbook with beginner-friendly recipes that use the central ingredient IDs and include image, timing, difficulty, servings, nutrition, and concise cooking steps. Cover ingredients across the existing database and keep dashboard totals data-driven.
- Add a reusable missing-ingredients shopping list on recommendation and recipe-detail pages. Group items by ingredient category, allow checklist selection, and copy the checked list in a clean text format.

## Technical details
- Keep recommendation scoring in `src/lib/matcher.ts`; use the existing ingredient, recipe, button, route, and app-store patterns.
- Add focused tests for recipe ingredient coverage and the shopping-list grouping/checklist formatting; run relevant tests and check preview diagnostics.
