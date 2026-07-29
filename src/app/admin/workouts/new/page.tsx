import Link from "next/link";
import { redirect } from "next/navigation";
import { WorkoutForm } from "@/components/admin/WorkoutForm";
import { getSession } from "@/lib/auth/session";
import { listSedes } from "@/lib/sedes/repository";

export default async function NewWorkoutPage() {
  const session = await getSession();
  if (!session || session.role !== "admin") redirect("/login");

  const sedes = await listSedes();

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-4 py-8">
      <div className="flex items-center justify-between gap-3">
        <h1 className="font-display text-3xl text-[var(--ink)]">
          Nuevo entrenamiento
        </h1>
        <Link href="/admin" className="text-sm font-medium text-[var(--accent-deep)]">
          Volver
        </Link>
      </div>
      <WorkoutForm mode="create" sedes={sedes} />
    </main>
  );
}
