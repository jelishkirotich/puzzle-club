import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import LessonPlayer from "@/components/LessonPlayer";
import { lessons } from "@/lib/lessons";

export function generateStaticParams() {
  return lessons.map((lesson) => ({ slug: lesson.slug }));
}

export default async function LessonPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const index = lessons.findIndex((lesson) => lesson.slug === slug);

  if (index === -1) notFound();

  const lesson = lessons[index];
  const next = lessons[index + 1]
    ? { slug: lessons[index + 1].slug, title: lessons[index + 1].title }
    : null;

  return (
    <div className="pt-4">
      <Link
        href="/learn"
        className="inline-flex items-center gap-2 text-[15px] font-bold text-muted transition hover:text-ink"
      >
        <ArrowLeft className="h-4 w-4" />
        All lessons
      </Link>

      <div className="mt-6 flex items-center gap-3">
        <span className="rounded-full bg-sand px-3 py-1 text-xs font-bold text-ink">
          {lesson.level}
        </span>
        <span className="text-sm text-muted">
          Lesson {index + 1} of {lessons.length}
        </span>
      </div>

      <h1 className="mt-4 text-3xl font-bold leading-tight sm:text-4xl md:text-5xl">
        {lesson.title}
      </h1>
      <p className="mt-3 max-w-2xl text-lg text-muted">{lesson.summary}</p>

      <div className="mt-10">
        <LessonPlayer lesson={lesson} next={next} />
      </div>

      <section className="mt-16 border-t border-line pt-8">
        <h2 className="text-xl font-bold">Go deeper</h2>
        <ul className="mt-4 flex flex-wrap gap-3">
          {lesson.sources.map((source) => (
            <li key={source.url}>
              <a
                href={source.url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-line bg-paper px-4 py-2 text-sm font-bold transition hover:border-forest-soft"
              >
                {source.label}
                <ArrowUpRight className="h-3.5 w-3.5" />
              </a>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}