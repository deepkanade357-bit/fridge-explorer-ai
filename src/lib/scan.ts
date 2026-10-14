// Shared fridge-scan types and helpers (browser + server safe).
import { findIngredientByName, slugify, type IngredientCategory } from "@/data/ingredients";

export type ScanCategory = "vegetable" | "fruit" | "non_veg" | "dairy" | "grain" | "spice" | "other";
export const SCAN_CATEGORIES: ScanCategory[] = ["vegetable", "fruit", "non_veg", "dairy", "grain", "spice", "other"];

export interface ScanItem {
  id: string; // ingredient id when matched to the database
  name: string;
  emoji: string;
  category: ScanCategory;
  count: number;
  confidence: number;
  inDatabase: boolean;
}

export interface RawScanItem {
  name: string;
  category: ScanCategory;
  count: number;
  confidence: number;
}

export function dbToScanCategory(c: IngredientCategory): ScanCategory {
  if (c === "egg" || c === "nonveg") return "non_veg";
  return c as ScanCategory;
}

const FALLBACK_EMOJI: Record<ScanCategory, string> = {
  vegetable: "🥬", fruit: "🍏", non_veg: "🍗", dairy: "🥛", grain: "🌾", spice: "🧂", other: "🫙",
};

export function normalizeItem(raw: RawScanItem): ScanItem {
  const ing = findIngredientByName(raw.name);
  const count = Math.max(1, Math.round(Number(raw.count) || 1));
  const confidence = Math.min(1, Math.max(0, Number(raw.confidence) || 0));
  if (ing) {
    return { id: ing.id, name: ing.name, emoji: ing.emoji, category: dbToScanCategory(ing.category), count, confidence, inDatabase: true };
  }
  const category = SCAN_CATEGORIES.includes(raw.category) ? raw.category : "other";
  return { id: slugify(raw.name) || "item", name: raw.name, emoji: FALLBACK_EMOJI[category], category, count, confidence, inDatabase: false };
}

/** Merge items seen across several shots: same item → highest count, not the sum. */
export function mergeShots(shots: ScanItem[][]): ScanItem[] {
  const map = new Map<string, ScanItem>();
  for (const shot of shots) {
    for (const item of shot) {
      const prev = map.get(item.id);
      if (!prev) map.set(item.id, { ...item });
      else map.set(item.id, { ...prev, count: Math.max(prev.count, item.count), confidence: Math.max(prev.confidence, item.confidence) });
    }
  }
  return [...map.values()];
}

export function confidenceLabel(c: number): "High" | "Medium" | "Low" {
  if (c >= 0.8) return "High";
  if (c >= 0.5) return "Medium";
  return "Low";
}

export function summarize(items: ScanItem[]) {
  const out = Object.fromEntries(SCAN_CATEGORIES.map((c) => [c, { types: 0, pieces: 0 }])) as Record<ScanCategory, { types: number; pieces: number }>;
  for (const i of items) {
    out[i.category].types += 1;
    out[i.category].pieces += i.count;
  }
  return out;
}

export const SCAN_CATEGORY_META: Record<ScanCategory, { label: string; emoji: string; color: string }> = {
  vegetable: { label: "Vegetables", emoji: "🥕", color: "var(--cat-vegetable)" },
  fruit: { label: "Fruits", emoji: "🍎", color: "var(--cat-fruit)" },
  non_veg: { label: "Non-Veg", emoji: "🍗", color: "var(--cat-nonveg)" },
  dairy: { label: "Dairy", emoji: "🥛", color: "var(--cat-dairy)" },
  grain: { label: "Grains & Pulses", emoji: "🌾", color: "var(--chart-4)" },
  spice: { label: "Spices", emoji: "🌶️", color: "var(--accent)" },
  other: { label: "Others", emoji: "🫙", color: "var(--cat-other)" },
};
