import Link from "next/link";
import { redirect } from "next/navigation";
import { WorkoutList } from "@/components/admin/WorkoutList";
import { LogoutButton } from "@/components/LogoutButton";
import { getSession } from "@/lib/auth/session";
import { todayInBogota } from "@/lib/dates/bogota";
import { listSedes } from "@/lib/sedes/repository";
import { listWorkoutDaySummaries } from "@/lib/workouts/repository";

export default async function AdminPage() {
  const session = await getSession();
  if (!session || session.role !== "admin") redirect("/login");

  const today = todayInBogota();
  const [summaries, sedes] = await Promise.all([
    listWorkoutDaySummaries({ fromDate: today, ascending: true }),
    listSedes(),
  ]);

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-6 px-4 py-8">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="font-display text-3xl text-[var(--ink)]">
            Training Board
          </p>
          <p className="text-sm text-[var(--muted)]">
            Admin · @{session.username} · ambas sedes
          </p>
        </div>
        <LogoutButton />
      </header>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-semibold">Entrenamientos</h1>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/admin/history"
            className="rounded-lg border border-[var(--line)] bg-white px-4 py-2.5 text-sm font-medium text-[var(--ink)] hover:bg-[var(--surface)]"
          >
            Ver entrenos anteriores
          </Link>
          <Link
            href="/admin/workouts/new"
            className="rounded-lg bg-[var(--ink)] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[var(--ink-soft)]"
          >
            Nuevo entrenamiento
          </Link>
        </div>
      </div>

      <p className="text-sm text-[var(--muted)]">
        Solo se listan el día de hoy y los próximos.
      </p>

      <WorkoutList
        summaries={summaries}
        sedes={sedes}
        emptyMessage="No hay entrenamientos de hoy ni futuros. Crea uno nuevo o revisa el historial."
      />
    </main>
  );
}
