-- Seed: 2 sedes (PIN por sede) + 2 admins (ambos gestionan ambas sedes)
-- Credenciales:
--   Admins: personal / personal2026  ·  dumbell / dumbell2026
--   PIN Personal Box: 2026
--   PIN Dumbbell Club: 2027

insert into public.sedes (id, slug, name, logo_path, pin_hash) values
  (
    '11111111-1111-1111-1111-111111111111',
    'gym-1',
    'Dumbbell Club',
    '/logos/dumbbell.jpeg',
    '$2b$10$krrLzeCtoURrhhjCxBv7A.GuU0q8BrNJjPwbgrkkRikGDRLBvGCCm'
  ),
  (
    '22222222-2222-2222-2222-222222222222',
    'gym-2',
    'Personal Box',
    '/logos/personal.jpeg',
    '$2b$10$WLgByfDa6YFRCUBRuYhx2OQ64Egu2OjSHJQYJCGrbZnF4BXaOkDhu'
  )
on conflict (id) do update set
  name = excluded.name,
  logo_path = excluded.logo_path,
  pin_hash = excluded.pin_hash;

insert into public.admins (id, username, name, password_hash) values
  (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'personal',
    'Personal Box Admin',
    '$2b$10$wosy6gHQPzMqA2if9hicludX0Ff9ybCdNvYfL8BKk1O7g3qWVoI3S'
  ),
  (
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    'dumbell',
    'Dumbbell Club Admin',
    '$2b$10$bcuA5dplm9yXLbwoWWEfSupxK7afkcb.g.01StmiQ6oLSJu.CfOba'
  )
on conflict (id) do update set
  username = excluded.username,
  name = excluded.name,
  password_hash = excluded.password_hash;
