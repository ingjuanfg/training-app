import Link from "next/link";
import { redirect } from "next/navigation";
import { HistoryDatePicker } from "@/components/admin/HistoryDatePicker";
import { WorkoutList } from "@/components/admin/WorkoutList";
import { LogoutButton } from "@/components/LogoutButton";
import { getSession } from "@/lib/auth/session";
import {
  formatDisplayDate,
  todayInBogota,
  yesterdayInBogota,
} from "@/lib/dates/bogota";
import { listSedes } from "@/lib/sedes/repository";
import { getDayWorkoutSummary } from "@/lib/workouts/repository";

type Props = {
  searchParams: Promise<{ date?: string }>;
};

export default async function AdminHistoryPage({ searchParams }: Props) {
  const session = await getSession();
  if (!session || session.role !== "admin") redirect("/login");

  const params = await searchParams;
  const today = todayInBogota();
  const maxDate = yesterdayInBogota();
  const requested = params.date?.trim();

  const selectedDate =
    requested && /^\d{4}-\d{2}-\d{2}$/.test(requested) && requested < today
      ? requested
      : undefined;

  const [sedes, summary] = await Promise.all([
    listSedes(),
    selectedDate ? getDayWorkoutSummary(selectedDate) : Promise.resolve(null),
  ]);

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-6 px-4 py-8">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="font-display text-3xl text-[var(--ink)]">
            Entrenos anteriores
          </p>
          <p className="text-sm text-[var(--muted)]">
            Consulta un día pasado con el calendario
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/admin"
            className="rounded-lg border border-[var(--line)] bg-white px-4 py-2.5 text-sm font-medium hover:bg-[var(--surface)]"
          >
            Volver al panel
          </Link>
          <LogoutButton />
        </div>
      </header>

      <HistoryDatePicker maxDate={maxDate} selectedDate={selectedDate} />

      {!selectedDate ? (
        <p className="rounded-xl border border-dashed border-[var(--line)] bg-white/70 px-4 py-8 text-center text-[var(--muted)]">
          Elige una fecha anterior a hoy para ver el entrenamiento de ese día.
        </p>
      ) : summary ? (
        <div className="flex flex-col gap-3">
          <h2 className="text-lg font-semibold text-[var(--ink)]">
            Resultado · {formatDisplayDate(selectedDate)}
          </h2>
          <WorkoutList summaries={[summary]} sedes={sedes} />
        </div>
      ) : (
        <p className="rounded-xl border border-dashed border-[var(--line)] bg-white/70 px-4 py-8 text-center text-[var(--muted)]">
          No hay entrenamientos registrados el {formatDisplayDate(selectedDate)}.
        </p>
      )}
    </main>
  );
}
