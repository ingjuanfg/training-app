"use client";

import { useCallback, useEffect, useState } from "react";
import {
  SECTION_LABELS,
  type WorkoutSection,
} from "@/lib/types";
import {
  shouldUseTwoColumns,
  splitLinesIntoColumns,
} from "@/lib/text/columns";

type Props = {
  sections: WorkoutSection[];
  dateLabel: string;
};

export function SectionPager({ sections, dateLabel }: Props) {
  const [index, setIndex] = useState(0);
  const current = sections[index];
  const total = sections.length;

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

  const useColumns = shouldUseTwoColumns(current.content);
  const columns = useColumns
    ? splitLinesIntoColumns(current.content, 2)
    : [current.content.split("\n")];

  const navButtonClass =
    "fixed top-1/2 z-30 flex h-[42vh] w-9 -translate-y-1/2 items-center justify-center rounded-2xl bg-white/10 text-3xl text-white backdrop-blur transition hover:bg-white/20 disabled:opacity-25 md:h-[48vh] md:w-10 md:text-4xl lg:h-[52vh] lg:w-11 lg:text-5xl";

  return (
    <div className="relative flex h-full min-h-0 flex-col">
      <header className="relative px-14 pt-20 pb-3 md:px-16 md:pt-24 md:pb-4 lg:px-20 lg:pt-28">
        <div className="mx-auto max-w-[90rem] text-center">
          <p className="text-base text-white/65 md:text-xl lg:text-2xl xl:text-3xl">
            {dateLabel}
          </p>
          <h1 className="mt-1 font-display text-5xl font-bold tracking-tight text-white md:text-7xl lg:text-8xl xl:text-9xl">
            {SECTION_LABELS[current.section_type]}
          </h1>
        </div>
        <p className="absolute top-20 right-5 text-lg text-white/55 md:top-24 md:right-10 md:text-2xl lg:top-28 lg:right-14 lg:text-3xl">
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

      <div className="relative min-h-0 flex-1 px-14 pb-20 md:px-16 md:pb-24 lg:px-20 lg:pb-28">
        <div
          className={`mx-auto grid h-full max-w-[90rem] gap-8 overflow-auto rounded-2xl bg-black/35 p-6 md:gap-12 md:p-10 lg:gap-16 lg:p-14 ${
            useColumns ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1"
          }`}
        >
          {columns.map((col, colIndex) => (
            <pre
              key={colIndex}
              className="whitespace-pre-wrap font-sans text-2xl leading-relaxed text-white md:text-4xl md:leading-snug lg:text-5xl lg:leading-snug xl:text-6xl"
            >
              {col.join("\n")}
            </pre>
          ))}
        </div>
      </div>

      <div className="absolute bottom-4 left-4 rounded-lg bg-black/45 px-3 py-2 text-white backdrop-blur md:bottom-5 md:left-6 md:px-3.5 md:py-2.5">
        <p className="text-[10px] tracking-wide text-white/65 uppercase md:text-xs">
          Secciones activas
        </p>
        <p className="text-xl font-bold tabular-nums leading-none md:text-2xl lg:text-3xl">
          {total}
        </p>
      </div>
    </div>
  );
}
