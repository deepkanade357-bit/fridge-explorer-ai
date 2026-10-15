import { createFileRoute } from "@tanstack/react-router";
import { HowItWorks } from "@/components/HowItWorks";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About What2Cook — how matching, fridge scan and Chef Bot work" },
      { name: "description", content: "Rule-based recipe ranking, AI fridge scanning with upload or live camera, and the context-aware Chef Bot." },
      { property: "og:title", content: "About What2Cook" },
      { property: "og:description", content: "How What2Cook matches recipes and where it uses AI." },
    ],
  }),
  component: About,
});

function About() {
  return (
    <div className="mx-auto max-w-4xl space-y-8 px-4 py-8">
      <h1 className="font-display text-4xl font-bold">About What2Cook</h1>
      <p className="text-lg text-muted-foreground">What2Cook helps you cook with what you already have and waste less food.</p>

      <section className="space-y-2">
        <h2 className="text-2xl font-bold">Features</h2>
        <ul className="list-disc space-y-1 pl-5">
          <li>Pick from a big ingredient list, searchable in English and common Hindi names.</li>
          <li>Fridge scan from uploaded photos (up to 4).</li>
          <li>Live camera fridge scan — capture one shelf at a time, up to 6 shots, with auto-capture.</li>
          <li>Recipes ranked by match percentage, veg filter and favourites.</li>
          <li>AI Chef Bot cooking assistant.</li>
        </ul>
      </section>

      <section className="space-y-2 rounded-3xl bg-cream p-5">
        <h2 className="text-2xl font-bold">🤖 AI Chef Bot</h2>
        <p>Chef Bot uses a real language model. It is context-aware: it sees your selected ingredients, your last fridge scan, the recipe you're viewing and your favourites, and prefers recommending recipes from our list. Recipe ranking itself stays rule-based. Chats are not stored.</p>
      </section>

      <section className="space-y-2">
        <h2 className="text-2xl font-bold">📸 Fridge scan & privacy</h2>
        <p>The scan uses a vision AI model to identify and count food items. Photos and camera frames are kept in memory only until the scan finishes and are never stored. Counts are estimates — you can edit everything before cooking.</p>
      </section>

      <div className="-mx-4"><HowItWorks /></div>
    </div>
  );
}
