"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState, type FormEvent } from "react";
import {
  createWorkoutAction,
  updateWorkoutAction,
} from "@/app/admin/actions";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { todayInBogota } from "@/lib/dates/bogota";
import {
  SECTION_LABELS,
  SECTION_TYPES,
  type SectionType,
  type SedeRow,
  type WorkoutSection,
} from "@/lib/types";

type Props = {
  mode: "create" | "edit";
  sedes: SedeRow[];
  workoutId?: string;
  initialDate?: string;
  initialSections?: WorkoutSection[];
  /** Sede del WOD que se abrió (modo edit). */
  sourceSedeId?: string;
  /** Sedes que ya tienen WOD ese día (para preselección y avisos). */
  existingSedeIds?: string[];
  /** true si las sedes del día tienen contenido distinto. */
  dayContentDiverged?: boolean;
};

export function WorkoutForm({
  mode,
  sedes,
  workoutId,
  initialDate,
  initialSections = [],
  sourceSedeId,
  existingSedeIds = [],
  dayContentDiverged = false,
}: Props) {
  const router = useRouter();
  const [workoutDate, setWorkoutDate] = useState(
    initialDate ?? todayInBogota(),
  );
  const [selectedSedeIds, setSelectedSedeIds] = useState<string[]>(() => {
    if (mode === "edit" && sourceSedeId) return [sourceSedeId];
    return sedes.map((s) => s.id);
  });
  const [active, setActive] = useState<SectionType[]>(() =>
    initialSections.length > 0
      ? initialSections.map((s) => s.section_type)
      : ["calentamiento", "fuerza"],
  );
  const [contents, setContents] = useState<Partial<Record<SectionType, string>>>(
    () =>
      Object.fromEntries(
        initialSections.map((s) => [s.section_type, s.content]),
      ),
  );
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const payload = useMemo(
    () => ({
      workoutDate,
      sedeIds: selectedSedeIds,
      sections: active.map((section_type) => ({
        section_type,
        content: contents[section_type] ?? "",
      })),
    }),
    [active, contents, selectedSedeIds, workoutDate],
  );

  const willOverwriteDiverged =
    mode === "edit" &&
    dayContentDiverged &&
    selectedSedeIds.length > 1 &&
    selectedSedeIds.every((id) => existingSedeIds.includes(id));

  function toggleSede(id: string) {
    setSelectedSedeIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }

  function toggleSection(type: SectionType) {
    setActive((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type],
    );
  }

  async function save() {
    if (selectedSedeIds.length === 0) {
      setError("Selecciona al menos una sede");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const result =
        mode === "create"
          ? await createWorkoutAction(payload)
          : await updateWorkoutAction(workoutId!, payload);

      if (!result.ok) {
        setError(result.error);
        return;
      }
      router.push("/admin");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (mode === "create") {
      await save();
    }
  }

  const sedeFieldsetLabel =
    mode === "create"
      ? "¿Para qué sedes aplica?"
      : "¿A qué sedes aplicar esta edición?";

  return (
    <form onSubmit={onSubmit} className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <label className="flex flex-col gap-1.5 text-sm font-medium">
        Fecha
        <input
          type="date"
          value={workoutDate}
          onChange={(e) => setWorkoutDate(e.target.value)}
          className="rounded-lg border border-[var(--line)] bg-white px-3 py-2.5"
          required
        />
      </label>

      <fieldset>
        <legend className="mb-2 text-sm font-medium">{sedeFieldsetLabel}</legend>
        <div className="grid gap-2 sm:grid-cols-2">
          {sedes.map((sede) => (
            <label
              key={sede.id}
              className="flex items-center gap-2 rounded-lg border border-[var(--line)] bg-white px-3 py-2.5 text-sm"
            >
              <input
                type="checkbox"
                checked={selectedSedeIds.includes(sede.id)}
                onChange={() => toggleSede(sede.id)}
              />
              <span>
                {sede.name}
                {mode === "edit" && sourceSedeId === sede.id ? (
                  <span className="text-[var(--muted)]"> · origen</span>
                ) : null}
              </span>
            </label>
          ))}
        </div>
        {mode === "edit" ? (
          <p className="mt-2 text-xs text-[var(--muted)]">
            Abres el WOD de una sede y eliges el alcance. Si marcas solo la otra
            sede, la origen no cambia.
          </p>
        ) : null}
      </fieldset>

      <fieldset>
        <legend className="mb-2 text-sm font-medium">
          Secciones del entrenamiento
        </legend>
        <div className="grid gap-2 sm:grid-cols-2">
          {SECTION_TYPES.map((type) => (
            <label
              key={type}
              className="flex items-center gap-2 rounded-lg border border-[var(--line)] bg-white px-3 py-2.5 text-sm"
            >
              <input
                type="checkbox"
                checked={active.includes(type)}
                onChange={() => toggleSection(type)}
              />
              {SECTION_LABELS[type]}
            </label>
          ))}
        </div>
      </fieldset>

      {SECTION_TYPES.filter((t) => active.includes(t)).map((type) => (
        <label key={type} className="flex flex-col gap-1.5 text-sm font-medium">
          {SECTION_LABELS[type]}
          <textarea
            rows={8}
            value={contents[type] ?? ""}
            onChange={(e) =>
              setContents((prev) => ({ ...prev, [type]: e.target.value }))
            }
            className="rounded-lg border border-[var(--line)] bg-white px-3 py-2.5 font-mono text-sm leading-relaxed"
            placeholder={`Escribe el contenido de ${SECTION_LABELS[type]}…`}
            required
          />
        </label>
      ))}

      {error ? (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
          {error}
        </p>
      ) : null}

      <div className="flex flex-wrap gap-3">
        {mode === "create" ? (
          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-[var(--ink)] px-4 py-3 text-sm font-semibold text-white disabled:opacity-60"
          >
            {loading ? "Guardando…" : "Guardar entrenamiento"}
          </button>
        ) : (
          <ConfirmDialog
            title="¿Guardar cambios?"
            description={
              willOverwriteDiverged
                ? "Las sedes seleccionadas tienen contenido distinto. Al guardar se sobrescribirán con este contenido."
                : "Se actualizará el entrenamiento en las sedes seleccionadas."
            }
            confirmLabel="Sí, guardar"
            onConfirm={save}
            trigger={
              <button
                type="button"
                disabled={loading}
                className="rounded-lg bg-[var(--ink)] px-4 py-3 text-sm font-semibold text-white disabled:opacity-60"
              >
                {loading ? "Guardando…" : "Guardar cambios"}
              </button>
            }
          />
        )}
        <button
          type="button"
          onClick={() => router.push("/admin")}
          className="rounded-lg border border-[var(--line)] bg-white px-4 py-3 text-sm font-medium"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
