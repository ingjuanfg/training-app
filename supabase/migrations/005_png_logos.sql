-- Logos PNG (reemplazan los JPEG)
update public.sedes
set logo_path = '/logos/dumbbell.png'
where slug = 'gym-1';

update public.sedes
set logo_path = '/logos/personal.png'
where slug = 'gym-2';
