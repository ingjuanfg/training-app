-- Migración si ya corriste el schema anterior (admin ligado a sede + PIN en admin).
-- Si es instalación nueva con 001 actualizado, NO ejecutes este archivo.

alter table public.sedes
  add column if not exists pin_hash text;

update public.sedes s
set pin_hash = a.pin_hash
from public.admins a
where a.sede_id = s.id
  and (s.pin_hash is null or s.pin_hash = '');

-- Fallback si algún sede quedó sin pin
update public.sedes
set pin_hash = '$2b$10$fO5ue6/vmQ.tfaoYF7kRCuX.5NHvPtmL0IdtgJFCLuWoffzs87nQa'
where pin_hash is null;

alter table public.sedes
  alter column pin_hash set not null;

alter table public.admins
  drop constraint if exists admins_sede_id_key;

alter table public.admins
  drop constraint if exists admins_sede_id_fkey;

alter table public.admins
  drop column if exists pin_hash;

alter table public.admins
  drop column if exists sede_id;

create index if not exists workouts_date_idx on public.workouts (workout_date desc);
