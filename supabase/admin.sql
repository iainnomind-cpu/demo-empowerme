-- ═══════════════════════════════════════════════════════════
-- Empowerme · administradores desde Supabase
-- ═══════════════════════════════════════════════════════════

-- 1) (Una sola vez) Crea el perfil automáticamente cuando se registra
--    o se da de alta cualquier usuario en Authentication.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id::text, new.email, coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', ''))
  on conflict (id) do nothing;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 2) Dar acceso de administrador a un usuario ya creado en
--    Authentication › Users (cambia el correo y ejecuta).
insert into public.profiles (id, email, full_name, role)
select id::text, email, coalesce(raw_user_meta_data->>'full_name', ''), 'admin'
from auth.users
where email = 'CAMBIA-ESTE-CORREO@empowerme.mx'
on conflict (id) do update set role = 'admin';

-- Quitar acceso:
-- update public.profiles set role = 'user' where email = 'correo@empowerme.mx';

-- Ver quién es admin:
-- select email, role from public.profiles where role = 'admin';
