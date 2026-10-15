const STEPS = [
  { emoji: "📸", title: "Scan your fridge", text: "Upload photos or use the live camera scanner, one shelf at a time." },
  { emoji: "🤖", title: "AI identifies items", text: "A vision AI model lists and counts the food it can see. You review and edit." },
  { emoji: "🍲", title: "Match recipes", text: "A simple rule-based engine ranks recipes by the share of ingredients you have." },
];

export function HowItWorks() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-8">
      <h2 className="mb-6 font-display text-3xl font-bold">How it works</h2>
      <div className="grid gap-4 md:grid-cols-3">
        {STEPS.map((s, i) => (
          <div key={s.title} className="rounded-3xl bg-cream p-5">
            <div className="text-3xl">{s.emoji}</div>
            <h3 className="mt-2 font-bold">{i + 1}. {s.title}</h3>
            <p className="text-sm text-muted-foreground">{s.text}</p>
          </div>
        ))}
      </div>
      <p className="mt-4 text-sm text-muted-foreground">
        Honest note: recipe ranking is rule-based (match % = ingredients you have ÷ ingredients needed; salt and oil are assumed).
        Only the fridge scan and Chef Bot use AI models. You can also skip scanning and pick ingredients by hand.
      </p>
    </section>
  );
}
