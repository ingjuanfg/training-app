"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { deleteWorkoutAction } from "@/app/admin/actions";
import { formatDisplayDate } from "@/lib/dates/bogota";
import type { DayWorkoutSummary, SedeRow } from "@/lib/types";

type Props = {
  summaries: DayWorkoutSummary[];
  sedes: SedeRow[];
  emptyMessage?: string;
};

export function WorkoutList({
  summaries,
  sedes,
  emptyMessage = "Aún no hay entrenamientos. Crea el primero.",
}: Props) {
  const router = useRouter();

  if (summaries.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-[var(--line)] bg-white/70 px-4 py-8 text-center text-[var(--muted)]">
        {emptyMessage}
      </p>
    );
  }

  return (
    <ul className="flex flex-col gap-3">
      {summaries.map((day) => (
        <li
          key={day.date}
          className="rounded-xl border border-[var(--line)] bg-white p-4 shadow-sm md:p-5"
        >
          <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-center md:gap-6">
            <div className="min-w-0">
              <p className="text-lg font-semibold text-[var(--ink)]">
                {formatDisplayDate(day.date)}
              </p>
              <p className="mt-1 text-sm font-medium text-[var(--ink-soft)]">
                {day.statusLabel}
              </p>
              <ul className="mt-2 space-y-1 text-sm text-[var(--muted)]">
                {day.entries.map((entry) => (
                  <li key={entry.workoutId}>
                    <span className="font-medium text-[var(--ink)]">
                      {entry.sedeName}:
                    </span>{" "}
                    {entry.sectionLabels.join(", ") || "Sin secciones"}
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex flex-wrap items-center gap-2 md:justify-end">
              {day.entries.map((entry) => (
                <Link
                  key={entry.workoutId}
                  href={`/admin/workouts/${entry.workoutId}/edit`}
                  className="rounded-lg border border-[var(--line)] px-3 py-2 text-sm font-medium whitespace-nowrap hover:bg-[var(--surface)]"
                >
                  Editar {entry.sedeName}
                </Link>
              ))}
              <DeleteDayButton
                date={day.date}
                entries={day.entries}
                sedes={sedes}
                onDone={() => router.refresh()}
              />
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}

function DeleteDayButton({
  date,
  entries,
  sedes,
  onDone,
}: {
  date: string;
  entries: DayWorkoutSummary["entries"];
  sedes: SedeRow[];
  onDone: () => void;
}) {
  const entrySedeIds = entries.map((e) => e.sedeId);
  const [selected, setSelected] = useState<string[]>(entrySedeIds);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const available = sedes.filter((s) => entrySedeIds.includes(s.id));

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setSelected(entrySedeIds);
          setError(null);
          setOpen(true);
        }}
        className="rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-100"
      >
        Eliminar…
      </button>

      {open ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4"
          role="presentation"
          onClick={() => !loading && setOpen(false)}
        >
          <div
            role="alertdialog"
            aria-modal="true"
            className="w-full max-w-md rounded-xl bg-white p-5 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-semibold text-[var(--ink)]">
              ¿Eliminar entrenamiento?
            </h2>
            <p className="mt-2 text-sm text-[var(--muted)]">
              Elige para qué sedes eliminar el WOD del {formatDisplayDate(date)}.
            </p>
            <div className="mt-4 flex flex-col gap-2">
              {available.map((sede) => (
                <label key={sede.id} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={selected.includes(sede.id)}
                    onChange={() =>
                      setSelected((prev) =>
                        prev.includes(sede.id)
                          ? prev.filter((id) => id !== sede.id)
                          : [...prev, sede.id],
                      )
                    }
                  />
                  {sede.name}
                </label>
              ))}
            </div>
            {error ? (
              <p className="mt-3 text-sm text-red-700">{error}</p>
            ) : null}
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                disabled={loading}
                onClick={() => setOpen(false)}
                className="rounded-lg border border-[var(--line)] px-3 py-2 text-sm font-medium"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={async () => {
                  if (selected.length === 0) {
                    setError("Selecciona al menos una sede");
                    return;
                  }
                  setLoading(true);
                  setError(null);
                  try {
                    const result = await deleteWorkoutAction({
                      workoutDate: date,
                      sedeIds: selected,
                    });
                    if (!result.ok) {
                      setError(result.error);
                      return;
                    }
                    setOpen(false);
                    onDone();
                  } finally {
                    setLoading(false);
                  }
                }}
                className="rounded-lg bg-red-600 px-3 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60"
              >
                {loading ? "Eliminando…" : "Sí, eliminar"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
