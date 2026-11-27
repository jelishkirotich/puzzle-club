"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import LessonGrid from "./LessonGrid";
import type { Lesson } from "@/lib/lessons";

type Props = {
  lesson: Lesson;
  next: { slug: string; title: string } | null;
};

function practiceFor(lesson: Lesson) {
  if (lesson.slug === "start-small") return { size: 4, level: "Easy" };
  if (lesson.level === "Beginner") return { size: 9, level: "Easy" };
  if (lesson.level === "Intermediate") return { size: 9, level: "Medium" };
  return { size: 9, level: "Hard" };
}

export default function LessonPlayer({ lesson, next }: Props) {
  const [index, setIndex] = useState(0);
  const total = lesson.steps.length;
  const step = lesson.steps[index];
  const last = index === total - 1;
  const practice = practiceFor(lesson);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "ArrowRight") setIndex((i) => Math.min(total - 1, i + 1));
      if (event.key === "ArrowLeft") setIndex((i) => Math.max(0, i - 1));
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [total]);

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,420px)] lg:items-start lg:gap-12">
      <div className="mx-auto w-full max-w-[520px] lg:sticky lg:top-28">
        <LessonGrid diagram={step.diagram} />
      </div>

      <div>
        <div className="flex gap-1.5">
          {lesson.steps.map((item, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Go to step ${i + 1}: ${item.title}`}
              onClick={() => setIndex(i)}
              className={`h-1.5 flex-1 rounded-full transition-colors ${
                i <= index ? "bg-forest-soft" : "bg-line"
              }`}
            />
          ))}
        </div>

        <p className="mt-5 text-sm text-muted">
          Step {index + 1} of {total}
        </p>
        <h2 className="mt-1 text-2xl font-bold sm:text-3xl">{step.title}</h2>
        <p className="mt-4 min-h-[9rem] text-lg leading-relaxed">{step.text}</p>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => setIndex((i) => Math.max(0, i - 1))}
            disabled={index === 0}
            className="inline-flex items-center gap-2 rounded-full border border-line bg-paper px-5 py-3 text-[15px] font-bold transition hover:border-forest-soft disabled:opacity-40"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>

          {!last && (
            <button
              type="button"
              onClick={() => setIndex((i) => Math.min(total - 1, i + 1))}
              className="inline-flex items-center gap-2 rounded-full bg-forest-soft px-6 py-3 text-[15px] font-bold text-paper transition hover:bg-forest"
            >
              Next step
              <ArrowRight className="h-4 w-4" />
            </button>
          )}

          {last && (
            <a
              href={`/play/start?size=${practice.size}&level=${practice.level}`}
              className="inline-flex items-center gap-2 rounded-full bg-forest-soft px-6 py-3 text-[15px] font-bold text-paper transition hover:bg-forest"
            >
              Practice on a {practice.size} by {practice.size} {practice.level}
              <ArrowRight className="h-4 w-4" />
            </a>
          )}

          {last && next && (
            <Link
              href={`/learn/${next.slug}`}
              className="inline-flex items-center gap-2 rounded-full border border-line bg-paper px-6 py-3 text-[15px] font-bold transition hover:border-forest-soft"
            >
              Next lesson
              <ArrowRight className="h-4 w-4" />
            </Link>
          )}

          {last && (
            <button
              type="button"
              onClick={() => setIndex(0)}
              className="rounded-full px-4 py-3 text-[15px] font-bold text-muted transition hover:text-ink"
            >
              Replay
            </button>
          )}
        </div>
      </div>
    </div>
  );
}