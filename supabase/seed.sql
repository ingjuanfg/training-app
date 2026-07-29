-- Seed: 2 sedes (PIN por sede) + 2 admins (ambos gestionan ambas sedes)
-- Credenciales por defecto (cámbialas en producción):
--   Admins: admin1 / admin123  ·  admin2 / admin123
--   PIN Dumbbell Club: 1111
--   PIN Personal Box: 2222

insert into public.sedes (id, slug, name, logo_path, pin_hash) values
  (
    '11111111-1111-1111-1111-111111111111',
    'gym-1',
    'Dumbbell Club',
    '/logos/dumbbell.jpeg',
    '$2b$10$fO5ue6/vmQ.tfaoYF7kRCuX.5NHvPtmL0IdtgJFCLuWoffzs87nQa'
  ),
  (
    '22222222-2222-2222-2222-222222222222',
    'gym-2',
    'Personal Box',
    '/logos/personal.jpeg',
    '$2b$10$BT5vHxZyvztFhHxyZrMZyec3RFHCDsni1Pai6uI711f76rhxd877.'
  )
on conflict (id) do update set
  name = excluded.name,
  logo_path = excluded.logo_path,
  pin_hash = excluded.pin_hash;

insert into public.admins (id, username, name, password_hash) values
  (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'admin1',
    'Admin 1',
    '$2b$10$izvJC1.g3nyY7EsTzqVB9.De0i7WUlA.YltE35fN4Q1MUTqT426u2'
  ),
  (
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    'admin2',
    'Admin 2',
    '$2b$10$izvJC1.g3nyY7EsTzqVB9.De0i7WUlA.YltE35fN4Q1MUTqT426u2'
  )
on conflict (id) do update set
  username = excluded.username,
  name = excluded.name,
  password_hash = excluded.password_hash;
