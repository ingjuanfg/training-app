import { getSupabaseAdmin } from "@/lib/supabase/server";
import {
  SECTION_ORDER,
  type DayWorkoutEntry,
  type DayWorkoutSummary,
  type SectionType,
  type Workout,
  type WorkoutSection,
} from "@/lib/types";
import {
  sectionLabels,
  sectionsFingerprint,
} from "@/lib/workouts/fingerprint";

export type SectionInput = {
  section_type: SectionType;
  content: string;
};

const WORKOUT_SELECT =
  "id, workout_date, sede_id, created_at, updated_at, workout_sections(id, section_type, content, sort_order), sedes(id, name, logo_path, slug)";

export type ListSummariesOptions = {
  /** Inclusive YYYY-MM-DD */
  fromDate?: string;
  /** Inclusive YYYY-MM-DD */
  toDate?: string;
  /** Default: false (más recientes primero) */
  ascending?: boolean;
};

export async function listWorkoutDaySummaries(
  options: ListSummariesOptions = {},
): Promise<DayWorkoutSummary[]> {
  const supabase = getSupabaseAdmin();
  let query = supabase.from("workouts").select(WORKOUT_SELECT);

  if (options.fromDate) {
    query = query.gte("workout_date", options.fromDate);
  }
  if (options.toDate) {
    query = query.lte("workout_date", options.toDate);
  }

  const { data, error } = await query.order("workout_date", {
    ascending: options.ascending ?? false,
  });

  if (error) throw error;

  return groupWorkoutsIntoDaySummaries((data ?? []).map(normalizeWorkout));
}

export async function getDayWorkoutSummary(
  workoutDate: string,
): Promise<DayWorkoutSummary | null> {
  const summaries = await listWorkoutDaySummaries({
    fromDate: workoutDate,
    toDate: workoutDate,
  });
  return summaries[0] ?? null;
}

function groupWorkoutsIntoDaySummaries(
  workouts: Workout[],
): DayWorkoutSummary[] {
  const byDate = new Map<string, Workout[]>();

  for (const workout of workouts) {
    const list = byDate.get(workout.workout_date) ?? [];
    list.push(workout);
    byDate.set(workout.workout_date, list);
  }

  return [...byDate.entries()].map(([date, dayWorkouts]) => {
    const entries: DayWorkoutEntry[] = dayWorkouts
      .map((w) => ({
        workoutId: w.id,
        sedeId: w.sede_id,
        sedeName: w.sede?.name ?? "Sede",
        sedeSlug: w.sede?.slug ?? w.sede_id,
        sectionLabels: sectionLabels(w.workout_sections ?? []),
        fingerprint: sectionsFingerprint(w.workout_sections ?? []),
      }))
      .sort((a, b) => a.sedeName.localeCompare(b.sedeName));

    let status: DayWorkoutSummary["status"] = "single";
    let statusLabel = entries.map((e) => e.sedeName).join(" · ");

    if (entries.length >= 2) {
      const same = entries.every(
        (e) => e.fingerprint === entries[0].fingerprint,
      );
      if (same) {
        status = "both_equal";
        statusLabel = `${entries.map((e) => e.sedeName).join(" + ")} (iguales)`;
      } else {
        status = "both_different";
        statusLabel = `${entries.map((e) => e.sedeName).join(" + ")} (distintos)`;
      }
    } else if (entries.length === 1) {
      statusLabel = `Solo ${entries[0].sedeName}`;
    }

    return { date, status, statusLabel, entries };
  });
}

export async function getWorkoutById(id: string): Promise<Workout | null> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("workouts")
    .select(WORKOUT_SELECT)
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  return data ? normalizeWorkout(data) : null;
}

export async function getWorkoutForDate(
  sedeId: string,
  workoutDate: string,
): Promise<Workout | null> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("workouts")
    .select(WORKOUT_SELECT)
    .eq("sede_id", sedeId)
    .eq("workout_date", workoutDate)
    .maybeSingle();

  if (error) throw error;
  return data ? normalizeWorkout(data) : null;
}

export async function getWorkoutsForDate(
  workoutDate: string,
): Promise<Workout[]> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("workouts")
    .select(WORKOUT_SELECT)
    .eq("workout_date", workoutDate);

  if (error) throw error;
  return (data ?? []).map(normalizeWorkout);
}

async function replaceSections(
  workoutId: string,
  sections: SectionInput[],
): Promise<void> {
  const supabase = getSupabaseAdmin();
  const { error: deleteError } = await supabase
    .from("workout_sections")
    .delete()
    .eq("workout_id", workoutId);

  if (deleteError) throw deleteError;

  const rows = sections.map((section) => ({
    workout_id: workoutId,
    section_type: section.section_type,
    content: section.content.trim(),
    sort_order: SECTION_ORDER[section.section_type],
  }));

  const { error: sectionsError } = await supabase
    .from("workout_sections")
    .insert(rows);

  if (sectionsError) throw sectionsError;
}

async function insertWorkoutWithSections(params: {
  sedeId: string;
  adminId: string;
  workoutDate: string;
  sections: SectionInput[];
}): Promise<string> {
  const supabase = getSupabaseAdmin();
  const { data: workout, error } = await supabase
    .from("workouts")
    .insert({
      workout_date: params.workoutDate,
      sede_id: params.sedeId,
      created_by: params.adminId,
    })
    .select("id")
    .single();

  if (error) throw error;

  try {
    await replaceSections(workout.id, params.sections);
  } catch (sectionsError) {
    await supabase.from("workouts").delete().eq("id", workout.id);
    throw sectionsError;
  }

  return workout.id;
}

/** Crea el mismo contenido en una o más sedes. */
export async function createWorkoutsForSedes(params: {
  sedeIds: string[];
  adminId: string;
  workoutDate: string;
  sections: SectionInput[];
}): Promise<string[]> {
  const ids: string[] = [];
  for (const sedeId of params.sedeIds) {
    const id = await insertWorkoutWithSections({
      sedeId,
      adminId: params.adminId,
      workoutDate: params.workoutDate,
      sections: params.sections,
    });
    ids.push(id);
  }
  return ids;
}

/**
 * Aplica el contenido a las sedes objetivo.
 * Parte de un WOD de una sede; el alcance decide qué filas actualizar/crear.
 */
export async function applyWorkoutToSedes(params: {
  sourceWorkoutId: string;
  targetSedeIds: string[];
  adminId: string;
  workoutDate: string;
  sections: SectionInput[];
}): Promise<void> {
  const source = await getWorkoutById(params.sourceWorkoutId);
  if (!source) throw new Error("Entrenamiento no encontrado");

  const supabase = getSupabaseAdmin();
  const originalDate = source.workout_date;

  for (const sedeId of params.targetSedeIds) {
    let targetId: string | null = null;

    if (sedeId === source.sede_id) {
      targetId = source.id;
    } else {
      const sibling = await getWorkoutForDate(sedeId, originalDate);
      if (sibling) {
        targetId = sibling.id;
      } else {
        const onNewDate = await getWorkoutForDate(sedeId, params.workoutDate);
        if (onNewDate) targetId = onNewDate.id;
      }
    }

    if (targetId) {
      if (params.workoutDate !== originalDate || sedeId === source.sede_id) {
        const conflict = await getWorkoutForDate(sedeId, params.workoutDate);
        if (conflict && conflict.id !== targetId) {
          throw new Error(
            "Ya existe un entrenamiento en esa fecha para una de las sedes seleccionadas.",
          );
        }
      }

      const { error } = await supabase
        .from("workouts")
        .update({
          workout_date: params.workoutDate,
          updated_at: new Date().toISOString(),
        })
        .eq("id", targetId);

      if (error) throw error;
      await replaceSections(targetId, params.sections);
    } else {
      await insertWorkoutWithSections({
        sedeId,
        adminId: params.adminId,
        workoutDate: params.workoutDate,
        sections: params.sections,
      });
    }
  }
}

export async function deleteWorkoutsForSedesOnDate(params: {
  workoutDate: string;
  sedeIds: string[];
}): Promise<void> {
  const supabase = getSupabaseAdmin();
  const { error } = await supabase
    .from("workouts")
    .delete()
    .eq("workout_date", params.workoutDate)
    .in("sede_id", params.sedeIds);

  if (error) throw error;
}

function normalizeWorkout(row: {
  id: string;
  workout_date: string;
  sede_id: string;
  created_at: string;
  updated_at: string;
  workout_sections?: WorkoutSection[] | null;
  sedes?:
    | { id: string; name: string; logo_path: string; slug: string }
    | { id: string; name: string; logo_path: string; slug: string }[]
    | null;
}): Workout {
  const sections = [...(row.workout_sections ?? [])].sort(
    (a, b) => a.sort_order - b.sort_order,
  );
  const sede = Array.isArray(row.sedes) ? row.sedes[0] : row.sedes;

  return {
    id: row.id,
    workout_date: row.workout_date,
    sede_id: row.sede_id,
    created_at: row.created_at,
    updated_at: row.updated_at,
    workout_sections: sections,
    sede: sede ?? undefined,
  };
}
