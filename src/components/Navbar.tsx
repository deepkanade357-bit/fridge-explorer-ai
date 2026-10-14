import { Link } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { useAppStore } from "@/lib/app-store";

const LINKS = [
  { to: "/", label: "Home" },
  { to: "/find", label: "Find Recipes" },
  { to: "/scan", label: "Scan Fridge" },
  { to: "/recipes", label: "Recommendations" },
  { to: "/dashboard", label: "Dashboard" },
  { to: "/about", label: "About" },
] as const;

export function Navbar() {
  const [open, setOpen] = useState(false);
  const { selected } = useAppStore();
  return (
    <header className="sticky top-0 z-40 border-b bg-background/90 backdrop-blur">
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2 font-display text-2xl font-bold text-primary">
          <span aria-hidden>🍲</span> What2Cook
        </Link>
        <div className="hidden items-center gap-1 lg:flex">
          {LINKS.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              activeOptions={{ exact: l.to === "/" }}
              className="rounded-full px-3 py-2 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground data-[status=active]:bg-secondary data-[status=active]:text-secondary-foreground"
            >
              {l.label}
              {l.to === "/find" && selected.length > 0 && (
                <span className="ml-1 rounded-full bg-accent px-1.5 text-xs text-accent-foreground">{selected.length}</span>
              )}
            </Link>
          ))}
        </div>
        <button className="rounded-full p-2 lg:hidden" aria-label="Toggle menu" onClick={() => setOpen((o) => !o)}>
          {open ? <X className="size-6" /> : <Menu className="size-6" />}
        </button>
      </nav>
      {open && (
        <div className="border-t bg-background px-4 py-3 lg:hidden">
          {LINKS.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              onClick={() => setOpen(false)}
              activeOptions={{ exact: l.to === "/" }}
              className="block rounded-xl px-3 py-3 font-semibold data-[status=active]:bg-secondary"
            >
              {l.label}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}
