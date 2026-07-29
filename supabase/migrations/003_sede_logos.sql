-- Actualiza nombres y logos de sedes (ejecutar si ya tienes datos)
update public.sedes
set name = 'Dumbbell Club',
    logo_path = '/logos/dumbbell.jpeg'
where id = '11111111-1111-1111-1111-111111111111';

update public.sedes
set name = 'Personal Box',
    logo_path = '/logos/personal.jpeg'
where id = '22222222-2222-2222-2222-222222222222';
