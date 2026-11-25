import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative overflow-hidden rounded-[2rem] bg-hero px-6 py-10 sm:px-8 sm:py-14 md:px-14 md:py-16">
      <div
        aria-hidden
        className="pointer-events-none absolute left-[68%] top-[40%] hidden md:block"
      >
        <div className="absolute h-[560px] w-[560px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/[0.06]" />
        <div className="absolute h-[340px] w-[340px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/10 bg-hero" />
        <div className="absolute left-6 top-6 h-[150px] w-[150px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-[#e0a874] to-[#c9705a]" />
      </div>

      <div className="relative z-10 max-w-xl">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#e5b97f]">
          A community of curious minds
        </p>
        <h1 className="mt-5 text-4xl font-bold leading-[1.05] text-[#f6f3ec] sm:mt-6 sm:text-5xl md:text-6xl">
          Good puzzles.
          <br />
          Better company.
        </h1>
        <p className="mt-5 max-w-lg text-base leading-relaxed text-[#f6f3ec]/75 sm:mt-6 sm:text-lg">
          Find a fresh challenge, share one of your own, and leave a note for
          the next person who stops by.
        </p>
        <Link
          href="/create"
          className="mt-8 inline-flex items-center gap-3 rounded-full bg-[#eee6d9] px-7 py-4 text-[15px] font-bold text-[#254f45] transition hover:bg-[#f6f3ec] sm:mt-9"
        >
          Make a puzzle
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}