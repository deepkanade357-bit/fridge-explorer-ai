import { useNavigate } from "@tanstack/react-router";
import { Minus, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Donut } from "@/components/Donut";
import { searchIngredients } from "@/data/ingredients";
import { confidenceLabel, dbToScanCategory, SCAN_CATEGORIES, SCAN_CATEGORY_META, summarize, type ScanItem } from "@/lib/scan";
import { useAppStore } from "@/lib/app-store";
import { cn } from "@/lib/utils";

export function ScanResults({ items, setItems, onScanAgain, onScanAnother, multiShot }: {
  items: ScanItem[];
  setItems: (fn: (p: ScanItem[]) => ScanItem[]) => void;
  onScanAgain: () => void;
  onScanAnother?: () => void;
  multiShot?: boolean;
}) {
  const { addIngredients } = useAppStore();
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const sum = summarize(items);
  const big = ["vegetable", "fruit", "non_veg"] as const;
  const small = ["dairy", "grain", "spice", "other"] as const;
  const suggestions = q ? searchIngredients(q).filter((i) => !items.some((x) => x.id === i.id)).slice(0, 6) : [];

  const update = (id: string, d: number) =>
    setItems((p) => p.map((i) => (i.id === id ? { ...i, count: Math.max(1, i.count + d) } : i)));

  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-3">
        {big.map((c) => (
          <div key={c} className="rounded-3xl border bg-card p-5 shadow-soft">
            <div className="text-lg font-bold">{SCAN_CATEGORY_META[c].emoji} {SCAN_CATEGORY_META[c].label}</div>
            <div className="text-2xl font-bold">{sum[c].types} <span className="text-sm font-semibold text-muted-foreground">types</span> · {sum[c].pieces} <span className="text-sm font-semibold text-muted-foreground">pieces</span></div>
            {c === "non_veg" && <div className="text-xs text-muted-foreground">Eggs count here</div>}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {small.map((c) => (
          <div key={c} className="rounded-2xl bg-cream p-3 text-sm">
            {SCAN_CATEGORY_META[c].emoji} {SCAN_CATEGORY_META[c].label}: <b>{sum[c].types}</b> types · <b>{sum[c].pieces}</b> pcs
          </div>
        ))}
      </div>

      <div className="rounded-3xl border bg-card p-5">
        <h3 className="mb-3 font-bold">Category split (pieces)</h3>
        <Donut data={SCAN_CATEGORIES.map((c) => ({ label: SCAN_CATEGORY_META[c].label, value: sum[c].pieces, color: SCAN_CATEGORY_META[c].color }))} />
      </div>

      <p className="rounded-2xl bg-accent/15 p-3 text-sm font-semibold">
        Counts are AI estimates. Please review before cooking.{multiShot && " Items seen in several shots are counted once."}
      </p>

      {SCAN_CATEGORIES.map((c) => {
        const list = items.filter((i) => i.category === c);
        if (!list.length) return null;
        return (
          <section key={c}>
            <h3 className="mb-2 font-bold">{SCAN_CATEGORY_META[c].emoji} {SCAN_CATEGORY_META[c].label}</h3>
            <ul className="divide-y rounded-3xl border bg-card">
              {list.map((i) => {
                const conf = confidenceLabel(i.confidence);
                return (
                  <li key={i.id} className="flex items-center gap-2 p-3">
                    <span className="text-2xl">{i.emoji}</span>
                    <div className="min-w-0 flex-1">
                      <div className="truncate font-semibold">{i.name}</div>
                      <span className={cn("rounded-full px-2 py-0.5 text-xs font-bold",
                        conf === "High" ? "bg-primary/15 text-primary" : conf === "Medium" ? "bg-accent/20 text-accent-foreground" : "bg-destructive/15 text-destructive")}>
                        {conf}
                      </span>
                    </div>
                    <Button size="icon" variant="outline" className="rounded-full" aria-label={`Fewer ${i.name}`} onClick={() => update(i.id, -1)}><Minus /></Button>
                    <span className="w-8 text-center font-bold">{i.count}</span>
                    <Button size="icon" variant="outline" className="rounded-full" aria-label={`More ${i.name}`} onClick={() => update(i.id, 1)}><Plus /></Button>
                    <Button size="icon" variant="ghost" aria-label={`Remove ${i.name}`} onClick={() => setItems((p) => p.filter((x) => x.id !== i.id))}><Trash2 /></Button>
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })}

      <div className="relative">
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Add missed item… (e.g. paneer, aloo)" className="h-12 rounded-full" />
        {suggestions.length > 0 && (
          <div className="absolute z-10 mt-1 w-full rounded-2xl border bg-popover p-1 shadow-soft">
            {suggestions.map((s) => (
              <button key={s.id} className="block w-full rounded-xl px-3 py-2 text-left hover:bg-secondary"
                onClick={() => {
                  setItems((p) => [...p, { id: s.id, name: s.name, emoji: s.emoji, category: dbToScanCategory(s.category), count: 1, confidence: 1, inDatabase: true }]);
                  setQ("");
                }}>
                {s.emoji} {s.name}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-3">
        <Button size="lg" className="h-14 flex-1 rounded-full text-lg" disabled={!items.length}
          onClick={() => {
            addIngredients(items.filter((i) => i.inDatabase).map((i) => i.id));
            navigate({ to: "/recipes" });
          }}>
          What Can I Cook? 🍳
        </Button>
        {onScanAnother && <Button size="lg" variant="secondary" className="h-14 rounded-full" onClick={onScanAnother}>Scan another shelf</Button>}
        <Button size="lg" variant="outline" className="h-14 rounded-full" onClick={onScanAgain}>Scan again</Button>
      </div>
    </div>
  );
}
