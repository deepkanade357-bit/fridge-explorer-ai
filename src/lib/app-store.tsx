import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { ScanItem } from "@/lib/scan";

export interface LastScan {
  at: string;
  items: ScanItem[];
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  error?: string;
}

interface Store {
  selected: string[];
  toggleIngredient: (id: string) => void;
  addIngredients: (ids: string[]) => void;
  clearIngredients: () => void;
  favourites: string[];
  toggleFavourite: (id: string) => void;
  vegOnly: boolean;
  setVegOnly: (v: boolean) => void;
  lastScan: LastScan | null;
  setLastScan: (s: LastScan | null) => void;
  currentRecipeId: string | null;
  setCurrentRecipeId: (id: string | null) => void;
  chat: ChatMessage[];
  setChat: (fn: (prev: ChatMessage[]) => ChatMessage[]) => void;
}

const Ctx = createContext<Store | null>(null);
const KEY = "what2cook:v2";

export function AppStoreProvider({ children }: { children: ReactNode }) {
  const [selected, setSelected] = useState<string[]>([]);
  const [favourites, setFavourites] = useState<string[]>([]);
  const [vegOnly, setVegOnly] = useState(false);
  const [lastScan, setLastScan] = useState<LastScan | null>(null);
  const [currentRecipeId, setCurrentRecipeId] = useState<string | null>(null);
  const [chat, setChatState] = useState<ChatMessage[]>([]); // memory only, never persisted
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const s = JSON.parse(raw);
        setSelected(s.selected ?? []);
        setFavourites(s.favourites ?? []);
        setVegOnly(!!s.vegOnly);
        setLastScan(s.lastScan ?? null);
      }
    } catch {
      /* ignore */
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    // Only ingredient names/counts are saved — never photos.
    localStorage.setItem(KEY, JSON.stringify({ selected, favourites, vegOnly, lastScan }));
  }, [loaded, selected, favourites, vegOnly, lastScan]);

  const toggleIngredient = useCallback(
    (id: string) => setSelected((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id])),
    [],
  );
  const addIngredients = useCallback((ids: string[]) => setSelected((p) => Array.from(new Set([...p, ...ids]))), []);
  const toggleFavourite = useCallback(
    (id: string) => setFavourites((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id])),
    [],
  );
  const setChat = useCallback((fn: (prev: ChatMessage[]) => ChatMessage[]) => setChatState(fn), []);

  const value = useMemo<Store>(
    () => ({
      selected, toggleIngredient, addIngredients, clearIngredients: () => setSelected([]),
      favourites, toggleFavourite, vegOnly, setVegOnly, lastScan, setLastScan,
      currentRecipeId, setCurrentRecipeId, chat, setChat,
    }),
    [selected, toggleIngredient, addIngredients, favourites, toggleFavourite, vegOnly, lastScan, currentRecipeId, chat, setChat],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAppStore() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useAppStore must be used inside AppStoreProvider");
  return v;
}
