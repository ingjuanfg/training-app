export const SECTION_TYPES = [
  "calentamiento",
  "fuerza",
  "accesorios",
  "conditioning",
  "skills",
] as const;

export type SectionType = (typeof SECTION_TYPES)[number];

export const SECTION_LABELS: Record<SectionType, string> = {
  calentamiento: "Calentamiento",
  fuerza: "Fuerza",
  accesorios: "Accesorios",
  conditioning: "Conditioning",
  skills: "Skills",
};

export const SECTION_ORDER: Record<SectionType, number> = {
  calentamiento: 1,
  fuerza: 2,
  accesorios: 3,
  conditioning: 4,
  skills: 5,
};

export type SessionRole = "admin" | "viewer";

/** Admin: sede* null. Viewer (PIN): sede* filled, adminId null. */
export type SessionPayload = {
  role: SessionRole;
  adminId: string | null;
  username: string;
  name: string;
  sedeId: string | null;
  sedeName: string | null;
  sedeLogoPath: string | null;
};

export type WorkoutSection = {
  id: string;
  section_type: SectionType;
  content: string;
  sort_order: number;
};

export type Workout = {
  id: string;
  workout_date: string;
  sede_id: string;
  created_at: string;
  updated_at: string;
  workout_sections?: WorkoutSection[];
  sede?: SedeRow;
};

export type SedeRow = {
  id: string;
  name: string;
  logo_path: string;
  slug: string;
};

export type AdminRow = {
  id: string;
  username: string;
  name: string;
  password_hash: string;
};

export type SedeWithPin = SedeRow & {
  pin_hash: string;
};

export type DaySummaryStatus = "both_equal" | "both_different" | "single";

export type DayWorkoutEntry = {
  workoutId: string;
  sedeId: string;
  sedeName: string;
  sedeSlug: string;
  sectionLabels: string[];
  fingerprint: string;
};

export type DayWorkoutSummary = {
  date: string;
  status: DaySummaryStatus;
  statusLabel: string;
  entries: DayWorkoutEntry[];
};
