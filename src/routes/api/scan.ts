import { createFileRoute } from "@tanstack/react-router";
import { INGREDIENTS } from "@/data/ingredients";
import { mergeShots, normalizeItem, type RawScanItem } from "@/lib/scan";
import { aigHeaders, callResponses, collectText, errorFromUpstream } from "@/lib/ai-gateway.server";

const MAX_IMAGES = 6;

const SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["is_food_image", "shots"],
  properties: {
    is_food_image: { type: "boolean" },
    shots: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["items"],
        properties: {
          items: {
            type: "array",
            items: {
              type: "object",
              additionalProperties: false,
              required: ["name", "category", "count", "confidence"],
              properties: {
                name: { type: "string" },
                category: { type: "string", enum: ["vegetable", "fruit", "non_veg", "dairy", "grain", "spice", "other"] },
                count: { type: "integer" },
                confidence: { type: "number" },
              },
            },
          },
        },
      },
    },
  },
};

function prompt(n: number) {
  return `You identify food in fridge / kitchen photos for a recipe app. There are ${n} photo(s); return one entry in "shots" per photo, in order.
Rules:
- Only list food items you can actually SEE. Never guess hidden items.
- count = number of individual pieces visible (e.g. 4 tomatoes). For bags/bunches give a rough estimate (bag of onions ≈ 8). For packs like milk or paneer, count packs.
- category: vegetable, fruit, non_veg (meat, poultry, fish, seafood AND eggs), dairy, grain (grains and pulses), spice, other.
- confidence between 0 and 1.
- Use these exact database names whenever the item matches one: ${INGREDIENTS.map((i) => i.name).join(", ")}.
- If the photos show no fridge or food at all, set is_food_image=false and return empty items.`;
}

export const Route = createFileRoute("/api/scan")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let images: string[];
        try {
          const body = await request.json();
          images = Array.isArray(body?.images) ? body.images.filter((s: unknown) => typeof s === "string" && s.startsWith("data:image/")) : [];
        } catch {
          return Response.json({ error: "bad_request", message: "Invalid request." }, { status: 400 });
        }
        if (!images.length) return Response.json({ error: "unreadable", message: "No readable images were sent." }, { status: 400 });
        images = images.slice(0, MAX_IMAGES);

        let upstream: Response;
        try {
          upstream = await callResponses(request, {
            input: [
              {
                role: "user",
                content: [
                  { type: "input_text", text: prompt(images.length) },
                  ...images.map((url) => ({ type: "input_image", image_url: url })),
                ],
              },
            ],
            text: { format: { type: "json_schema", name: "fridge_scan", strict: true, schema: SCHEMA } },
          });
        } catch (e) {
          if (request.signal.aborted) return new Response(null, { status: 499 });
          return Response.json({ error: "upstream", message: String(e) }, { status: 502 });
        }
        if (!upstream.ok) return errorFromUpstream(upstream);

        try {
          const { text, refused } = await collectText(upstream);
          if (refused || !text) return Response.json({ error: "empty", message: "The AI could not read these photos." }, { status: 422 });
          const parsed = JSON.parse(text) as { is_food_image: boolean; shots: { items: RawScanItem[] }[] };
          const shots = (parsed.shots ?? []).map((s) => (s.items ?? []).map(normalizeItem));
          const items = mergeShots(shots);
          return Response.json(
            { items, isFood: parsed.is_food_image && items.length > 0, shots: shots.length },
            { headers: aigHeaders(upstream.headers) },
          );
        } catch (e) {
          return Response.json({ error: "upstream", message: e instanceof Error ? e.message : "Scan failed" }, { status: 502 });
        }
      },
    },
  },
});
