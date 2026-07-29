-- Schema for training visualization platform
-- Timezone for "today" is handled in application code (America/Bogota)

create extension if not exists "pgcrypto";

create table public.sedes (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  logo_path text not null,
  pin_hash text not null,
  created_at timestamptz not null default now()
);

-- Admins manage both sedes; PIN lives on sede for TV display
create table public.admins (
  id uuid primary key default gen_random_uuid(),
  username text not null unique,
  name text not null,
  password_hash text not null,
  created_at timestamptz not null default now(),
  constraint admins_username_format check (username ~ '^[a-zA-Z0-9._]{3,30}$')
);

create table public.workouts (
  id uuid primary key default gen_random_uuid(),
  workout_date date not null,
  sede_id uuid not null references public.sedes (id) on delete cascade,
  created_by uuid references public.admins (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (workout_date, sede_id)
);

create type public.section_type as enum (
  'calentamiento',
  'fuerza',
  'accesorios',
  'conditioning',
  'skills'
);

create table public.workout_sections (
  id uuid primary key default gen_random_uuid(),
  workout_id uuid not null references public.workouts (id) on delete cascade,
  section_type public.section_type not null,
  content text not null,
  sort_order int not null,
  unique (workout_id, section_type)
);

create index workouts_sede_date_idx on public.workouts (sede_id, workout_date desc);
create index workouts_date_idx on public.workouts (workout_date desc);
create index workout_sections_workout_idx on public.workout_sections (workout_id, sort_order);

alter table public.sedes enable row level security;
alter table public.admins enable row level security;
alter table public.workouts enable row level security;
alter table public.workout_sections enable row level security;
