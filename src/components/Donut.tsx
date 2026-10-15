export function Donut({ data, size = 160 }: { data: { label: string; value: number; color: string }[]; size?: number }) {
  const total = data.reduce((a, d) => a + d.value, 0);
  const r = 15.9;
  let offset = 25;
  return (
    <div className="flex flex-wrap items-center gap-4">
      <svg viewBox="0 0 42 42" width={size} height={size} role="img" aria-label="Category split">
        <circle cx="21" cy="21" r={r} fill="none" stroke="var(--muted)" strokeWidth="6" />
        {total > 0 &&
          data.filter((d) => d.value > 0).map((d) => {
            const pct = (d.value / total) * 100;
            const el = (
              <circle key={d.label} cx="21" cy="21" r={r} fill="none" stroke={d.color} strokeWidth="6"
                strokeDasharray={`${pct} ${100 - pct}`} strokeDashoffset={offset} />
            );
            offset -= pct;
            return el;
          })}
        <text x="21" y="23" textAnchor="middle" fontSize="7" fontWeight="700" fill="currentColor">{total}</text>
      </svg>
      <ul className="space-y-1 text-sm">
        {data.filter((d) => d.value > 0).map((d) => (
          <li key={d.label} className="flex items-center gap-2">
            <span className="size-3 rounded-full" style={{ background: d.color }} /> {d.label}: {d.value}
          </li>
        ))}
      </ul>
    </div>
  );
}
