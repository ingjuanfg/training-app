-- Mensaje inicial del WOD (primer slide en TV). Opcional.
alter table public.workouts
  add column if not exists intro_message text;
