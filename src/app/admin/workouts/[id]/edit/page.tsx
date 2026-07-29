import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { WorkoutForm } from "@/components/admin/WorkoutForm";
import { getSession } from "@/lib/auth/session";
import { listSedes } from "@/lib/sedes/repository";
import { sectionsFingerprint } from "@/lib/workouts/fingerprint";
import {
  getWorkoutById,
  getWorkoutsForDate,
} from "@/lib/workouts/repository";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function EditWorkoutPage({ params }: Props) {
  const session = await getSession();
  if (!session || session.role !== "admin") redirect("/login");

  const { id } = await params;
  const workout = await getWorkoutById(id);
  if (!workout) notFound();

  const [sedes, dayWorkouts] = await Promise.all([
    listSedes(),
    getWorkoutsForDate(workout.workout_date),
  ]);

  const fingerprints = dayWorkouts.map((w) =>
    sectionsFingerprint(w.workout_sections ?? []),
  );
  const dayContentDiverged =
    fingerprints.length >= 2 &&
    fingerprints.some((fp) => fp !== fingerprints[0]);

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-4 py-8">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl text-[var(--ink)]">
            Editar entrenamiento
          </h1>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Origen: {workout.sede?.name ?? "Sede"}
          </p>
        </div>
        <Link href="/admin" className="text-sm font-medium text-[var(--accent-deep)]">
          Volver
        </Link>
      </div>
      <WorkoutForm
        mode="edit"
        sedes={sedes}
        workoutId={workout.id}
        initialDate={workout.workout_date}
        initialSections={workout.workout_sections ?? []}
        sourceSedeId={workout.sede_id}
        existingSedeIds={dayWorkouts.map((w) => w.sede_id)}
        dayContentDiverged={dayContentDiverged}
      />
    </main>
  );
}
