import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import LessonGrid from "@/components/LessonGrid";
import { lessons, levels, references } from "@/lib/lessons";

export const metadata = { title: "Learn Sudoku | Puzzle Club" };

export default function LearnPage() {
  return (
    <div className="pt-6">
      <section className="grid items-center gap-10 md:grid-cols-[minmax(0,1fr)_320px]">
        <div>
          <h1 className="text-4xl font-bold leading-[1.05] sm:text-5xl md:text-6xl">
            Learn Sudoku one idea at a time.
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-muted">
            {lessons.length} short lessons, from the single rule to the patterns experts
            reach for. Step through each example at your own pace, then try it on a real
            puzzle.
          </p>
          <Link
            href="/learn/start-small"
            className="mt-8 inline-flex rounded-full bg-forest-soft px-7 py-3.5 text-[15px] font-bold text-paper transition hover:bg-forest"
          >
            Start the first lesson
          </Link>
        </div>
        <div className="w-full max-w-[320px] md:justify-self-end">
          <LessonGrid diagram={lessons[0].steps[1].diagram} />
        </div>
      </section>

      {levels.map((level) => {
        const items = lessons.filter((lesson) => lesson.level === level.name);
        return (
          <section key={level.name} className="mt-16">
            <h2 className="text-3xl font-bold">{level.name}</h2>
            <p className="mt-2 max-w-xl text-muted">{level.blurb}</p>

            <ol className="relative ml-4 mt-8 border-l-2 border-line">
              {items.map((lesson) => (
                <li key={lesson.slug} className="relative pb-9 pl-8 last:pb-0">
                  <span className="absolute -left-[17px] top-0 flex h-8 w-8 items-center justify-center rounded-full border-2 border-forest-soft bg-cream text-sm font-bold">
                    {lessons.indexOf(lesson) + 1}
                  </span>
                  <Link href={`/learn/${lesson.slug}`} className="group block">
                    <h3 className="text-xl font-bold group-hover:underline">
                      {lesson.title}
                    </h3>
                    <p className="mt-1 text-[15px] text-muted">{lesson.summary}</p>
                    <p className="mt-2 text-sm text-forest-soft">
                      {lesson.steps.length} steps
                    </p>
                  </Link>
                </li>
              ))}
            </ol>
          </section>
        );
      })}

      <section className="mt-20">
        <h2 className="text-3xl font-bold">Keep learning</h2>
        <p className="mt-2 max-w-xl text-muted">
          These lessons cover what most puzzles need. These sites go further, into
          chains, fish and more.
        </p>
        <ul className="mt-6 divide-y divide-line border-y border-line">
          {references.map((reference) => (
            <li key={reference.url}>
              <a
                href={reference.url}
                target="_blank"
                rel="noreferrer"
                className="flex items-start justify-between gap-4 py-4 transition hover:text-forest-soft"
              >
                <span>
                  <span className="block font-bold">{reference.label}</span>
                  <span className="mt-0.5 block text-[15px] text-muted">
                    {reference.note}
                  </span>
                </span>
                <ArrowUpRight className="mt-1 h-4 w-4 shrink-0" />
              </a>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}