"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Grid2x2 } from "lucide-react";

export default function Header() {
  const pathname = usePathname();

  const linkClass = (href: string) =>
    `rounded-full px-5 py-2.5 text-[15px] font-bold transition ${
      pathname === href ? "bg-sand text-ink" : "text-muted hover:text-ink"
    }`;

  return (
    <header className="sticky top-0 z-20 bg-cream/85 backdrop-blur">
      <div className="mx-auto flex h-20 max-w-6xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-full border border-forest text-forest">
            <Grid2x2 className="h-5 w-5" strokeWidth={1.6} />
          </span>
          <span className="font-display text-2xl font-bold tracking-tight">
            Puzzle Club
          </span>
        </Link>

        <nav className="flex items-center gap-1">
          <Link href="/" className={linkClass("/")}>
            Community
          </Link>
          <Link href="/create" className={linkClass("/create")}>
            Make a puzzle
          </Link>
        </nav>
      </div>
    </header>
  );
}