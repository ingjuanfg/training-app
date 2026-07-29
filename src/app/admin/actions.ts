"use server";

import { revalidatePath } from "next/cache";
import { requireSession } from "@/lib/auth/session";
import { deleteWorkoutSchema, workoutFormSchema } from "@/lib/validation";
import {
  applyWorkoutToSedes,
  createWorkoutsForSedes,
  deleteWorkoutsForSedesOnDate,
  getWorkoutById,
  getWorkoutsForDate,
} from "@/lib/workouts/repository";
import { sectionsFingerprint } from "@/lib/workouts/fingerprint";

export type ActionResult =
  | { ok: true; id?: string; warn?: string }
  | { ok: false; error: string };

function mapDbError(error: unknown): string {
  const message =
    error && typeof error === "object" && "message" in error
      ? String((error as { message: string }).message)
      : "Error desconocido";

  if (message.includes("duplicate") || message.includes("unique")) {
    return "Ya existe un entrenamiento para esa fecha en una de las sedes.";
  }
  return message;
}

export async function createWorkoutAction(
  input: unknown,
): Promise<ActionResult> {
  try {
    const session = await requireSession("admin");
    if (!session.adminId) return { ok: false, error: "No autorizado" };

    const parsed = workoutFormSchema.safeParse(input);
    if (!parsed.success) {
      return {
        ok: false,
        error: parsed.error.issues[0]?.message ?? "Datos inválidos",
      };
    }

    const ids = await createWorkoutsForSedes({
      sedeIds: parsed.data.sedeIds,
      adminId: session.adminId,
      workoutDate: parsed.data.workoutDate,
      sections: parsed.data.sections,
    });

    revalidatePath("/admin");
    return { ok: true, id: ids[0] };
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return { ok: false, error: "No autorizado" };
    }
    return { ok: false, error: mapDbError(error) };
  }
}

export async function updateWorkoutAction(
  sourceWorkoutId: string,
  input: unknown,
): Promise<ActionResult> {
  try {
    const session = await requireSession("admin");
    if (!session.adminId) return { ok: false, error: "No autorizado" };

    const parsed = workoutFormSchema.safeParse(input);
    if (!parsed.success) {
      return {
        ok: false,
        error: parsed.error.issues[0]?.message ?? "Datos inválidos",
      };
    }

    const source = await getWorkoutById(sourceWorkoutId);
    if (!source) return { ok: false, error: "Entrenamiento no encontrado" };

    const dayWorkouts = await getWorkoutsForDate(source.workout_date);
    const targets = dayWorkouts.filter((w) =>
      parsed.data.sedeIds.includes(w.sede_id),
    );
    const fingerprints = targets.map((w) =>
      sectionsFingerprint(w.workout_sections ?? []),
    );
    const diverged =
      fingerprints.length >= 2 &&
      fingerprints.some((fp) => fp !== fingerprints[0]);

    await applyWorkoutToSedes({
      sourceWorkoutId,
      targetSedeIds: parsed.data.sedeIds,
      adminId: session.adminId,
      workoutDate: parsed.data.workoutDate,
      sections: parsed.data.sections,
    });

    revalidatePath("/admin");
    revalidatePath(`/admin/workouts/${sourceWorkoutId}/edit`);
    return {
      ok: true,
      id: sourceWorkoutId,
      warn: diverged
        ? "Se sobrescribió contenido que antes era distinto entre sedes."
        : undefined,
    };
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return { ok: false, error: "No autorizado" };
    }
    return { ok: false, error: mapDbError(error) };
  }
}

export async function deleteWorkoutAction(
  input: unknown,
): Promise<ActionResult> {
  try {
    await requireSession("admin");
    const parsed = deleteWorkoutSchema.safeParse(input);
    if (!parsed.success) {
      return {
        ok: false,
        error: parsed.error.issues[0]?.message ?? "Datos inválidos",
      };
    }

    await deleteWorkoutsForSedesOnDate({
      workoutDate: parsed.data.workoutDate,
      sedeIds: parsed.data.sedeIds,
    });

    revalidatePath("/admin");
    return { ok: true };
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return { ok: false, error: "No autorizado" };
    }
    return { ok: false, error: mapDbError(error) };
  }
}
