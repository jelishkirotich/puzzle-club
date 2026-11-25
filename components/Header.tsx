"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Grid2x2 } from "lucide-react";
import ThemeToggle from "./ThemeToggle";

export default function Header() {
  const pathname = usePathname();

  const linkClass = (href: string) =>
    `rounded-full px-3 py-2 text-sm font-bold transition sm:px-5 sm:py-2.5 sm:text-[15px] ${
      pathname === href ? "bg-sand text-ink" : "text-muted hover:text-ink"
    }`;

  return (
    <header className="sticky top-0 z-20 bg-cream/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-2 px-6 sm:h-20">
        <Link href="/" className="flex items-center gap-2.5 sm:gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-full border border-forest text-forest sm:h-11 sm:w-11">
            <Grid2x2 className="h-5 w-5" strokeWidth={1.6} />
          </span>
          <span className="font-display text-xl font-bold tracking-tight sm:text-2xl">
            Puzzle Club
          </span>
        </Link>

        <nav className="flex items-center gap-1 sm:gap-2">
          <Link href="/" className={`${linkClass("/")} hidden sm:inline-block`}>
            Community
          </Link>
          <Link href="/create" className={linkClass("/create")}>
            <span className="sm:hidden">Create</span>
            <span className="hidden sm:inline">Make a puzzle</span>
          </Link>
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}