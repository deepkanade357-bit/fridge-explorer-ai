import { createFileRoute, Link } from "@tanstack/react-router";
import { Donut } from "@/components/Donut";
import { RECIPES } from "@/data/recipes";
import { INGREDIENTS, INGREDIENT_MAP } from "@/data/ingredients";
import { PANTRY_STAPLES } from "@/lib/matcher";
import { useAppStore } from "@/lib/app-store";
import { SCAN_CATEGORIES, SCAN_CATEGORY_META, summarize } from "@/lib/scan";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — recipe and ingredient stats | What2Cook" },
      { name: "description", content: "Totals for recipes and ingredients, most used ingredients, and your last fridge scan." },
      { property: "og:title", content: "Dashboard | What2Cook" },
      { property: "og:description", content: "Recipe and ingredient statistics plus your last fridge scan." },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const { lastScan, favourites, selected } = useAppStore();
  const usage = new Map<string, number>();
  for (const r of RECIPES) for (const i of r.ingredients) if (!PANTRY_STAPLES.includes(i)) usage.set(i, (usage.get(i) ?? 0) + 1);
  const top = [...usage.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8);
  const max = top[0]?.[1] ?? 1;
  const veg = RECIPES.filter((r) => r.veg).length;
  const meals = ["breakfast", "lunch", "dinner", "snack", "dessert"].map((m) => ({ m, n: RECIPES.filter((r) => r.meal === m).length }));
  const colors = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)"];

  const stats = [
    ["Total recipes", RECIPES.length],
    ["Total ingredients", INGREDIENTS.length],
    ["Most used ingredient", top[0] ? INGREDIENT_MAP[top[0][0]]?.name : "—"],
    ["Your favourites", favourites.length],
  ] as const;

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-8">
      <h1 className="font-display text-4xl font-bold">Dashboard</h1>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map(([l, v]) => (
          <div key={l} className="rounded-3xl border bg-card p-5 shadow-soft">
            <div className="text-sm text-muted-foreground">{l}</div>
            <div className="text-2xl font-bold">{v}</div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <section className="rounded-3xl border bg-card p-5">
          <h2 className="mb-4 font-bold">Most used ingredients</h2>
          <div className="space-y-2">
            {top.map(([id, n]) => (
              <div key={id} className="flex items-center gap-2 text-sm">
                <span className="w-32 truncate">{INGREDIENT_MAP[id]?.emoji} {INGREDIENT_MAP[id]?.name}</span>
                <div className="h-3 flex-1 rounded-full bg-muted">
                  <div className="h-3 rounded-full bg-primary" style={{ width: `${(n / max) * 100}%` }} />
                </div>
                <span className="w-6 text-right font-bold">{n}</span>
              </div>
            ))}
          </div>
        </section>
        <section className="space-y-6 rounded-3xl border bg-card p-5">
          <div>
            <h2 className="mb-3 font-bold">Recipes by meal</h2>
            <Donut data={meals.map((x, i) => ({ label: x.m, value: x.n, color: colors[i]! }))} size={130} />
          </div>
          <div>
            <h2 className="mb-3 font-bold">Veg vs non-veg</h2>
            <Donut data={[{ label: "Veg", value: veg, color: "var(--primary)" }, { label: "Non-veg", value: RECIPES.length - veg, color: "var(--accent)" }]} size={130} />
          </div>
        </section>
      </div>

      <section className="rounded-3xl border bg-card p-5">
        <h2 className="mb-3 font-bold">Last fridge scan</h2>
        {lastScan ? (
          <>
            <p className="mb-3 text-sm text-muted-foreground">{new Date(lastScan.at).toLocaleString()} · {lastScan.items.length} item types</p>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
              {SCAN_CATEGORIES.map((c) => {
                const s = summarize(lastScan.items)[c];
                return (
                  <div key={c} className="rounded-2xl bg-cream p-3 text-sm">
                    <div>{SCAN_CATEGORY_META[c].emoji} {SCAN_CATEGORY_META[c].label}</div>
                    <div className="font-bold">{s.types} types · {s.pieces} pcs</div>
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          <p className="text-sm text-muted-foreground">No scan yet. <Link to="/scan" className="font-semibold text-primary">Scan your fridge →</Link></p>
        )}
        <p className="mt-3 text-xs text-muted-foreground">Currently selected ingredients: {selected.length}</p>
      </section>
    </div>
  );
}
