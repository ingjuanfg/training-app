"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { HighlightedWorkoutText } from "@/components/display/HighlightedWorkoutText";
import {
  SECTION_LABELS,
  type SectionType,
  type WorkoutSection,
} from "@/lib/types";
import { splitSectionContent } from "@/lib/text/highlight";
import {
  shouldUseTwoColumns,
  splitLinesIntoColumns,
} from "@/lib/text/columns";

type Props = {
  sections: WorkoutSection[];
  dateLabel: string;
  introMessage?: string | null;
};

type Slide =
  | { id: string; kind: "intro"; content: string }
  | { id: string; kind: "section"; section: WorkoutSection };

export function SectionPager({
  sections,
  dateLabel,
  introMessage,
}: Props) {
  const slides = useMemo<Slide[]>(() => {
    const intro = introMessage?.trim() ?? "";
    const sectionSlides: Slide[] = sections.map((section) => ({
      id: section.id,
      kind: "section",
      section,
    }));
    if (!intro) return sectionSlides;
    return [{ id: "intro", kind: "intro", content: intro }, ...sectionSlides];
  }, [introMessage, sections]);

  const [index, setIndex] = useState(0);
  const current = slides[index];
  const total = slides.length;
  const sectionCount = sections.length;

  const go = useCallback(
    (delta: number) => {
      setIndex((prev) => {
        const next = prev + delta;
        if (next < 0 || next >= total) return prev;
        return next;
      });
    },
    [total],
  );

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "ArrowRight") go(1);
      if (event.key === "ArrowLeft") go(-1);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go]);

  if (!current) {
    return (
      <div className="flex h-full items-center justify-center text-3xl text-white/80 md:text-4xl lg:text-5xl">
        No hay secciones activas para hoy.
      </div>
    );
  }

  const navButtonClass =
    "fixed top-1/2 z-30 flex h-[42vh] w-9 -translate-y-1/2 items-center justify-center rounded-2xl bg-white/10 text-3xl text-white backdrop-blur transition hover:bg-white/20 disabled:opacity-25 md:h-[48vh] md:w-10 md:text-4xl lg:h-[52vh] lg:w-11 lg:text-5xl";

  const bodyClass =
    "whitespace-pre-wrap font-sans text-2xl leading-relaxed text-white md:text-4xl md:leading-snug lg:text-5xl lg:leading-snug xl:text-6xl";

  return (
    <div className="relative flex h-full min-h-0 flex-col">
      <header className="relative shrink-0 px-14 pt-14 pb-2 md:px-16 md:pt-16 md:pb-2 lg:px-20 lg:pt-16">
        <div className="mx-auto max-w-[90rem] text-center">
          <p className="text-base text-white/65 md:text-xl lg:text-2xl xl:text-3xl">
            {dateLabel}
          </p>
          {current.kind === "section" ? (
            <h1 className="mt-1 font-display text-4xl font-bold tracking-tight text-white md:text-6xl lg:text-7xl xl:text-8xl">
              {SECTION_LABELS[current.section.section_type]}
            </h1>
          ) : (
            <h1 className="mt-1 font-display text-4xl font-bold tracking-tight text-white md:text-6xl lg:text-7xl">
              Mensaje del día
            </h1>
          )}
        </div>
        <p className="absolute top-14 right-5 text-lg text-white/55 md:top-16 md:right-10 md:text-2xl lg:right-14 lg:text-3xl">
          {index + 1} / {total}
        </p>
      </header>

      <button
        type="button"
        aria-label="Sección anterior"
        onClick={() => go(-1)}
        disabled={index === 0}
        className={`${navButtonClass} left-2 md:left-3 lg:left-4`}
      >
        ‹
      </button>
      <button
        type="button"
        aria-label="Sección siguiente"
        onClick={() => go(1)}
        disabled={index >= total - 1}
        className={`${navButtonClass} right-2 md:right-3 lg:right-4`}
      >
        ›
      </button>

      <div className="relative min-h-0 flex-1 px-12 pb-14 md:px-14 md:pb-16 lg:px-16">
        {current.kind === "intro" ? (
          <div className="mx-auto flex h-full max-w-5xl items-center justify-center overflow-auto rounded-2xl bg-black/35 p-8 text-center md:p-12">
            <HighlightedWorkoutText
              text={current.content}
              className={bodyClass}
            />
          </div>
        ) : (
          <SectionBody
            content={current.section.content}
            sectionType={current.section.section_type}
            bodyClass={bodyClass}
          />
        )}
      </div>

      <div className="absolute bottom-4 left-4 rounded-lg bg-black/45 px-3 py-2 text-white backdrop-blur md:bottom-5 md:left-6 md:px-3.5 md:py-2.5">
        <p className="text-[10px] tracking-wide text-white/65 uppercase md:text-xs">
          Secciones activas
        </p>
        <p className="text-xl font-bold tabular-nums leading-none md:text-2xl lg:text-3xl">
          {sectionCount}
        </p>
      </div>
    </div>
  );
}

function SectionBody({
  content,
  sectionType,
  bodyClass,
}: {
  content: string;
  sectionType: SectionType;
  bodyClass: string;
}) {
  const { banners, body } = splitSectionContent(content);
  const centered = sectionType === "fuerza";
  const useColumns = !centered && shouldUseTwoColumns(body.join("\n"));
  const columns = useColumns
    ? splitLinesIntoColumns(body.join("\n"), 2)
    : [body];

  return (
    <div className="mx-auto flex h-full max-w-[90rem] flex-col overflow-auto rounded-2xl bg-black/35 px-6 py-8 md:px-10 md:py-10 lg:px-14">
      {banners.length > 0 ? (
        <div className="mb-8 text-center md:mb-10">
          {banners.map((banner, index) => (
            <HighlightedWorkoutText
              key={`${banner}-${index}`}
              text={banner}
              className={`${bodyClass} text-center`}
            />
          ))}
        </div>
      ) : null}

      {body.length > 0 ? (
        <div
          className={`grid flex-1 content-center gap-8 md:gap-12 ${
            useColumns ? "md:grid-cols-2" : "grid-cols-1"
          } ${centered ? "text-center" : ""}`}
        >
          {columns.map((col, colIndex) => (
            <HighlightedWorkoutText
              key={colIndex}
              text={col.join("\n")}
              className={centered ? `${bodyClass} text-center` : bodyClass}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
