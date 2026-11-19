import { Copy, ShoppingCart } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import type { Recipe } from "@/data/recipes";
import { useAppStore } from "@/lib/app-store";
import { buildShoppingList, shoppingListText } from "@/lib/shopping";

export function ShoppingListButton({ recipes, label = "Generate Grocery List" }: { recipes: Recipe[]; label?: string }) {
  const { selected } = useAppStore();
  const groups = useMemo(() => buildShoppingList(recipes, selected), [recipes, selected]);
  const [checked, setChecked] = useState<string[]>([]);
  const total = groups.reduce((n, g) => n + g.items.length, 0);
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="secondary" className="rounded-full" disabled={!recipes.length}><ShoppingCart /> {label}</Button>
      </DialogTrigger>
      <DialogContent className="max-h-[85dvh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">Shopping list</DialogTitle>
          <DialogDescription>{total ? `${total} items missing for ${recipes.length} recipe${recipes.length > 1 ? "s" : ""}.` : "You already have everything you need!"}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          {groups.map((g) => (
            <section key={g.category}>
              <h3 className="mb-2 font-bold">{g.emoji} {g.label}</h3>
              <ul className="space-y-2">
                {g.items.map((i) => {
                  const on = checked.includes(i.id);
                  return (
                    <li key={i.id}>
                      <label className="flex items-start gap-3 rounded-2xl border bg-card p-3">
                        <Checkbox checked={on} onCheckedChange={() => setChecked((p) => (on ? p.filter((x) => x !== i.id) : [...p, i.id]))} className="mt-0.5" />
                        <span className={on ? "text-muted-foreground line-through" : ""}>
                          <span className="font-semibold">{i.emoji} {i.name}</span>
                          <span className="block text-xs text-muted-foreground">For {i.recipes.join(", ")}</span>
                        </span>
                      </label>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
        </div>
        {total > 0 && (
          <Button className="rounded-full" onClick={() => navigator.clipboard.writeText(shoppingListText(groups)).then(() => toast.success("Shopping list copied"), () => toast.error("Couldn't copy — please try again"))}>
            <Copy /> Copy list
          </Button>
        )}
      </DialogContent>
    </Dialog>
  );
}
