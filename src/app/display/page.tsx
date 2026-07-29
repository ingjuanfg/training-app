import { redirect } from "next/navigation";
import { SectionPager } from "@/components/display/SectionPager";
import { LogoutButton } from "@/components/LogoutButton";
import { getSession } from "@/lib/auth/session";
import { formatDisplayDate, todayInBogota } from "@/lib/dates/bogota";
import { getSedeById } from "@/lib/sedes/repository";
import { getWorkoutForDate } from "@/lib/workouts/repository";

export default async function DisplayPage() {
  const session = await getSession();
  if (!session || session.role !== "viewer" || !session.sedeId) {
    redirect("/login");
  }

  const sede = await getSedeById(session.sedeId);
  if (!sede) redirect("/login");

  const today = todayInBogota();
  const workout = await getWorkoutForDate(sede.id, today);
  const sections = workout?.workout_sections ?? [];

  return (
    <main
      className="relative flex min-h-screen flex-col text-white"
      style={{
        background: `linear-gradient(to right, var(--display-from), var(--display-to))`,
      }}
    >
      {/* Logo sede — esquina superior izquierda */}
      <div className="absolute top-4 left-4 z-20 md:top-6 md:left-8 lg:top-8 lg:left-10">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={sede.logo_path}
          alt={sede.name}
          width={240}
          height={240}
          className="h-14 w-auto max-w-[40vw] object-contain md:h-20 lg:h-24 xl:h-28"
        />
      </div>

      {/* Logout — esquina superior derecha (sin logo de prueba) */}
      <div className="absolute top-4 right-4 z-20 md:top-6 md:right-8 lg:top-8 lg:right-10">
        <LogoutButton className="rounded-lg border border-white/25 bg-white/10 px-3 py-2 text-sm font-medium text-white hover:bg-white/20 md:px-4 md:py-2.5 md:text-base lg:text-lg" />
      </div>

      {sections.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 pt-24 text-center md:gap-5">
          <p className="font-display text-5xl md:text-7xl lg:text-8xl xl:text-9xl">
            {sede.name}
          </p>
          <p className="text-2xl text-white/70 md:text-3xl lg:text-4xl xl:text-5xl">
            No hay entrenamiento para hoy ({formatDisplayDate(today)})
          </p>
          <div className="mt-8 rounded-lg bg-black/40 px-3 py-2 text-left md:mt-10">
            <p className="text-[10px] tracking-wide text-white/65 uppercase md:text-xs">
              Secciones activas
            </p>
            <p className="text-xl font-bold leading-none md:text-2xl lg:text-3xl">0</p>
          </div>
        </div>
      ) : (
        <SectionPager
          sections={sections}
          dateLabel={formatDisplayDate(today)}
        />
      )}
    </main>
  );
}
