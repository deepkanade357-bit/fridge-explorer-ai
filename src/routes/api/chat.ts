import { createFileRoute } from "@tanstack/react-router";
import { RECIPES } from "@/data/recipes";
import { INGREDIENTS } from "@/data/ingredients";
import { aigHeaders, callResponses, errorFromUpstream } from "@/lib/ai-gateway.server";

const SYSTEM = `You are Chef Bot, a friendly cooking assistant inside the What2Cook app. Help users decide what to cook from the ingredients they have. Prefer recommending recipes from the What2Cook database and mention them by exact name. You may also suggest simple general recipes, ingredient substitutions, cooking tips, storage tips, portion and time guidance, and basic nutrition information. Answer only cooking, food and kitchen topics; politely decline anything else. Be concise, warm and practical. If you are unsure about something, say so instead of inventing facts. Never claim exact nutrition numbers are medical advice. If the user mentions allergies or health conditions, give general information only and suggest checking with a doctor or dietitian. Always respect the user's veg or non-veg preference if they state it.`;

const FORMAT = `Formatting rules:
- Use short markdown: **bold**, "- " bullet lists, "1. " numbered steps.
- When you recommend a recipe from the What2Cook database, add a tag on its own line: [[recipe:RECIPE_ID]] (the app turns it into a clickable card).
- When the user should add an ingredient that exists in the ingredient database, add [[add:INGREDIENT_ID]] on its own line.
- Only use ids from the lists below.`;

type Msg = { role: "user" | "assistant"; content: string };

function buildContext(ctx: Record<string, unknown>) {
  const safe = (v: unknown) => JSON.stringify(v ?? null).slice(0, 4000);
  return `App context (live, from the user's session):
- Selected ingredients: ${safe(ctx.selectedIngredients)}
- Latest fridge scan: ${safe(ctx.lastScan)}
- Recipe currently viewed: ${safe(ctx.currentRecipe)}
- Favourite recipes: ${safe(ctx.favourites)}
- Veg preference: ${safe(ctx.vegOnly)}

What2Cook recipe database (id: name [veg/non-veg, minutes]):
${RECIPES.map((r) => `${r.id}: ${r.name} [${r.veg ? "veg" : "non-veg"}, ${r.time}m]`).join("\n")}

Ingredient ids: ${INGREDIENTS.map((i) => i.id).join(", ")}`;
}

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let messages: Msg[] = [];
        let context: Record<string, unknown> = {};
        try {
          const body = await request.json();
          messages = (Array.isArray(body?.messages) ? body.messages : [])
            .filter((m: Msg) => (m?.role === "user" || m?.role === "assistant") && typeof m.content === "string" && m.content.trim())
            .slice(-10)
            .map((m: Msg) => ({ role: m.role, content: m.content.slice(0, m.role === "user" ? 500 : 4000) }));
          context = body?.context && typeof body.context === "object" ? body.context : {};
        } catch {
          return Response.json({ error: "bad_request", message: "Invalid request." }, { status: 400 });
        }
        if (!messages.length || messages[messages.length - 1].role !== "user")
          return Response.json({ error: "bad_request", message: "Send a message first." }, { status: 400 });

        try {
          const upstream = await callResponses(request, {
            instructions: `${SYSTEM}\n\n${FORMAT}\n\n${buildContext(context)}`,
            input: messages.map((m) => ({ role: m.role, content: m.content })),
          });
          if (!upstream.ok) return errorFromUpstream(upstream);
          return new Response(upstream.body, {
            status: 200,
            headers: aigHeaders(upstream.headers, {
              "Content-Type": "text/event-stream",
              "Cache-Control": "no-cache, no-transform",
            }),
          });
        } catch (e) {
          if (request.signal.aborted) return new Response(null, { status: 499 });
          return Response.json({ error: "upstream", message: String(e) }, { status: 502 });
        }
      },
    },
  },
});
