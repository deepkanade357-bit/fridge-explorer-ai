import { Link, useNavigate } from "@tanstack/react-router";
import { ChefHat, Heart, Plus, RotateCcw, Send, Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Markdown } from "@/components/Markdown";
import { useAppStore, type ChatMessage } from "@/lib/app-store";
import { RECIPE_MAP } from "@/data/recipes";
import { INGREDIENT_MAP } from "@/data/ingredients";
import { matchRecipe } from "@/lib/matcher";
import { cn } from "@/lib/utils";

const MAX_LEN = 500;
const SUGGESTIONS = [
  "What can I cook with my ingredients?",
  "Suggest a quick 15-minute meal",
  "What can I substitute for [missing ingredient]?",
  "Give me a healthy dinner idea",
];

const uid = () => Math.random().toString(36).slice(2);

function friendlyError(status: number | "network", message?: string) {
  if (status === "network") return "I couldn't reach the kitchen — check your connection and try again.";
  if (status === 429) return "I'm getting a lot of questions right now. Please wait a moment and try again.";
  if (status === 402) return message || "AI credits have run out for this app. Please try again later.";
  if (status === 403) return message || "Chef Bot isn't available right now.";
  return "Something went wrong while cooking up an answer. Please try again.";
}

function BotMessage({ content }: { content: string }) {
  const { addIngredients, selected, favourites, toggleFavourite } = useAppStore();
  const recipeIds = [...content.matchAll(/\[\[recipe:([a-z0-9-]+)\]\]/g)].map((m) => m[1]).filter((id) => RECIPE_MAP[id]);
  const addIds = [...content.matchAll(/\[\[add:([a-z0-9-]+)\]\]/g)].map((m) => m[1]).filter((id) => INGREDIENT_MAP[id]);
  const clean = content.replace(/\[\[(recipe|add):[^\]]*\]\]?/g, "").replace(/\[\[[^\]]*$/, "");
  return (
    <div className="space-y-2">
      <Markdown text={clean} />
      {[...new Set(recipeIds)].map((id) => {
        const r = RECIPE_MAP[id];
        const m = matchRecipe(r, selected);
        const fav = favourites.includes(id);
        return (
          <div key={id} className="flex items-center gap-3 rounded-2xl border bg-card p-2">
            <Link to="/recipes/$id" params={{ id }} className="flex flex-1 items-center gap-3">
              <img src={r.image} alt="" className="size-12 rounded-xl object-cover" />
              <div className="min-w-0">
                <p className="truncate text-sm font-bold">{r.name}</p>
                <p className="text-xs text-muted-foreground">{r.time} min · {m.percent}% match</p>
              </div>
            </Link>
            <button aria-label="Save to favourites" onClick={() => toggleFavourite(id)} className="rounded-full p-2 hover:bg-muted">
              <Heart className={cn("size-4", fav ? "fill-accent text-accent" : "text-muted-foreground")} />
            </button>
          </div>
        );
      })}
      {addIds.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {[...new Set(addIds)].map((id) => {
            const ing = INGREDIENT_MAP[id];
            const has = selected.includes(id);
            return (
              <Button key={id} size="sm" variant="secondary" disabled={has} onClick={() => { addIngredients([id]); toast.success(`${ing.name} added to your ingredients`); }}>
                <Plus /> {has ? `${ing.name} added` : `Add ${ing.emoji} ${ing.name} to my ingredients`}
              </Button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function ChefBot() {
  const store = useAppStore();
  const { chat, setChat } = store;
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const navigate = useNavigate();
  void navigate;

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [chat, busy]);

  function buildContext() {
    const names = (ids: string[]) => ids.map((id) => INGREDIENT_MAP[id]?.name).filter(Boolean);
    const recipe = store.currentRecipeId ? RECIPE_MAP[store.currentRecipeId] : null;
    const m = recipe ? matchRecipe(recipe, store.selected) : null;
    return {
      selectedIngredients: names(store.selected),
      lastScan: store.lastScan ? store.lastScan.items.map((i) => ({ name: i.name, category: i.category, count: i.count })) : null,
      currentRecipe: recipe && m ? { id: recipe.id, name: recipe.name, available: names(m.have), missing: names(m.missing) } : null,
      favourites: store.favourites.map((id) => RECIPE_MAP[id]?.name).filter(Boolean),
      vegOnly: store.vegOnly,
    };
  }

  async function run(history: ChatMessage[]) {
    const botId = uid();
    setChat(() => [...history, { id: botId, role: "assistant", content: "" }]);
    setBusy(true);
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    const setBot = (patch: Partial<ChatMessage>) => setChat((p) => p.map((m) => (m.id === botId ? { ...m, ...patch } : m)));
    try {
      let res: Response;
      try {
        res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          signal: ctrl.signal,
          body: JSON.stringify({
            messages: history.filter((m) => !m.error && m.content).slice(-10).map(({ role, content }) => ({ role, content })),
            context: buildContext(),
          }),
        });
      } catch {
        if (ctrl.signal.aborted) return;
        return setBot({ error: friendlyError("network") });
      }
      if (!res.ok || !res.body) {
        const j = await res.json().catch(() => ({}));
        return setBot({ error: friendlyError(res.status, j?.message) });
      }
      const reader = res.body.getReader();
      const dec = new TextDecoder();
      let buf = "";
      let text = "";
      let failed = false;
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += dec.decode(value, { stream: true });
        let idx;
        while ((idx = buf.indexOf("\n\n")) !== -1) {
          const frame = buf.slice(0, idx);
          buf = buf.slice(idx + 2);
          for (const line of frame.split("\n")) {
            if (!line.startsWith("data:")) continue;
            try {
              const ev = JSON.parse(line.slice(5).trim());
              if (ev.type === "response.output_text.delta") {
                text += ev.delta ?? "";
                setBot({ content: text });
              } else if (ev.type === "error" || ev.type === "response.failed") failed = true;
            } catch {
              /* partial / non-JSON frame */
            }
          }
        }
      }
      if (failed && !text) setBot({ error: friendlyError(500) });
      else if (!text.trim()) setBot({ error: "I didn't come up with an answer that time. Please try again." });
    } catch {
      if (!ctrl.signal.aborted) setBot({ error: friendlyError("network") });
    } finally {
      setBusy(false);
      abortRef.current = null;
    }
  }

  function send(text: string) {
    const t = text.trim().slice(0, MAX_LEN);
    if (!t || busy) return;
    setInput("");
    run([...chat.filter((m) => !m.error), { id: uid(), role: "user", content: t }]);
  }

  function retry() {
    const history = chat.filter((m) => !m.error && (m.role === "user" || m.content));
    if (history.length && history[history.length - 1].role === "user") run(history);
  }

  function clear() {
    abortRef.current?.abort();
    setChat(() => []);
  }

  const last = chat[chat.length - 1];

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="Open Chef Bot cooking assistant"
        className="fixed right-5 bottom-safe z-40 flex size-16 items-center justify-center rounded-full bg-accent-gradient text-3xl shadow-pop transition-transform hover:scale-105"
      >
        <span aria-hidden>🧑‍🍳</span>
      </button>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="right" className="flex h-dvh w-full flex-col gap-0 p-0 sm:max-w-md">
          <SheetHeader className="border-b bg-hero p-4 pr-12 text-left">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-full bg-primary text-primary-foreground"><ChefHat className="size-5" /></div>
              <div className="flex-1">
                <SheetTitle className="font-display text-lg">Chef Bot – your cooking assistant</SheetTitle>
                <SheetDescription className="text-xs">Knows your ingredients, fridge scan and favourites.</SheetDescription>
              </div>
              {chat.length > 0 && (
                <Button size="sm" variant="ghost" onClick={clear} aria-label="Clear chat"><Trash2 /> Clear chat</Button>
              )}
            </div>
          </SheetHeader>

          <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto p-4">
            {chat.length === 0 && (
              <div className="space-y-4 pt-6 text-center">
                <div className="animate-bob text-5xl">🧑‍🍳</div>
                <p className="text-sm text-muted-foreground">Hi! Ask me what to cook, swaps, tips or quick ideas.</p>
                <div className="flex flex-col gap-2">
                  {SUGGESTIONS.map((s) => (
                    <button key={s} onClick={() => (s.includes("[") ? setInput(s.replace("[missing ingredient]", "")) : send(s))} className="rounded-2xl border bg-card px-4 py-3 text-left text-sm font-semibold hover:bg-secondary">
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {chat.map((m) => (
              <div key={m.id} className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}>
                <div className={cn("max-w-[88%] rounded-3xl px-4 py-3", m.role === "user" ? "rounded-br-md bg-primary text-primary-foreground" : "rounded-bl-md bg-muted")}>
                  {m.role === "user" ? (
                    <p className="whitespace-pre-wrap text-sm">{m.content}</p>
                  ) : m.error ? (
                    <div className="space-y-2">
                      {m.content && <BotMessage content={m.content} />}
                      <p className="text-sm text-destructive">{m.error}</p>
                      {m === last && <Button size="sm" variant="outline" onClick={retry}><RotateCcw /> Try again</Button>}
                    </div>
                  ) : m.content ? (
                    <BotMessage content={m.content} />
                  ) : (
                    <div className="flex gap-1 py-1" aria-label="Chef Bot is typing">
                      {[0, 1, 2].map((i) => <span key={i} className="size-2 animate-bounce rounded-full bg-muted-foreground" style={{ animationDelay: `${i * 0.15}s` }} />)}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="border-t bg-card p-3 pb-safe">
            <form onSubmit={(e) => { e.preventDefault(); send(input); }} className="flex items-end gap-2">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value.slice(0, MAX_LEN))}
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(input); } }}
                rows={1}
                placeholder="Ask Chef Bot…"
                aria-label="Message Chef Bot"
                className="max-h-32 min-h-11 flex-1 resize-none rounded-2xl border bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-ring"
              />
              <Button type="submit" size="icon" disabled={busy || !input.trim()} aria-label="Send message" className="size-11 shrink-0"><Send /></Button>
            </form>
            <div className="mt-2 flex justify-between gap-2 text-[11px] text-muted-foreground">
              <span>Chef Bot uses AI and can make mistakes. Double-check allergy and safety information.</span>
              <span className="shrink-0">{input.length}/{MAX_LEN}</span>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
