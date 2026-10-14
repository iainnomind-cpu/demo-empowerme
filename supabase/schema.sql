-- ═══════════════════════════════════════════════════════════
-- Empowerme · esquema de base de datos (Supabase / Postgres)
-- Ejecuta este archivo completo en Supabase › SQL Editor.
-- Luego entra al panel /admin y usa "Cargar datos de ejemplo".
-- ═══════════════════════════════════════════════════════════

create table if not exists public.activities (
  id text primary key,
  slug text unique not null,
  title text not null,
  type text not null check (type in ('clase','taller','carrera')),
  mode text not null check (mode in ('unica','recurrente')),
  tagline text not null default '',
  description text not null default '',
  includes jsonb not null default '[]',
  image text not null default '',
  location jsonb not null default '{}',
  coach text,
  duration_min int not null default 60,
  level text not null default '',
  tickets jsonb not null default '[]',
  faqs jsonb not null default '[]',
  requires_shirt_size boolean not null default false,
  published boolean not null default false,
  featured boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.sessions (
  id text primary key,
  activity_id text not null references public.activities(id) on delete cascade,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  capacity int not null check (capacity >= 0),
  booked int not null default 0 check (booked >= 0)
);
create index if not exists sessions_activity_idx on public.sessions(activity_id, starts_at);

create table if not exists public.profiles (
  id text primary key,               -- auth.users.id para usuarios reales
  email text not null,
  full_name text not null default '',
  phone text not null default '',
  birthdate date,
  emergency_name text,
  emergency_phone text,
  role text not null default 'user' check (role in ('user','admin')),
  consents jsonb,                    -- { version, privacy, image, waiver } con fecha de aceptación
  tags jsonb not null default '[]',
  created_at timestamptz not null default now()
);

create table if not exists public.orders (
  id text primary key,
  code text unique not null,
  user_id text not null,
  email text not null,
  full_name text not null,
  phone text not null default '',
  channel text not null default 'email' check (channel in ('email','whatsapp')),
  status text not null default 'pendiente' check (status in ('pendiente','pagado','cancelado')),
  total int not null default 0,
  items jsonb not null default '[]',
  provider text not null default 'demo',
  provider_ref text,
  created_at timestamptz not null default now(),
  paid_at timestamptz
);
create index if not exists orders_user_idx on public.orders(user_id, created_at desc);

create table if not exists public.bookings (
  id text primary key,
  code text unique not null,
  order_id text not null references public.orders(id) on delete cascade,
  order_code text not null,
  user_id text not null,
  activity_id text not null,
  activity_title text not null,
  session_id text references public.sessions(id) on delete set null,
  starts_at timestamptz not null,
  attendee_name text not null,
  email text not null,
  phone text not null default '',
  ticket_name text not null,
  shirt_size text,
  status text not null default 'pendiente',
  checked_in_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists bookings_session_idx on public.bookings(session_id);
create index if not exists bookings_user_idx on public.bookings(user_id);

create table if not exists public.leads (
  id text primary key,
  company text not null,
  contact_name text not null,
  role text,
  email text not null,
  phone text,
  employees text not null default '',
  program_id text,
  program_title text,
  message text,
  status text not null default 'nuevo' check (status in ('nuevo','contactado','propuesta','ganado','perdido')),
  value int,
  notes jsonb not null default '[]',
  source text not null default 'Sitio web',
  created_at timestamptz not null default now()
);

create table if not exists public.programs (
  id text primary key,
  slug text unique not null,
  title text not null,
  duration_days int not null default 30,
  tagline text not null default '',
  description text not null default '',
  pillars jsonb not null default '[]',
  includes jsonb not null default '[]',
  outcomes jsonb not null default '[]',
  image text not null default '',
  format text not null default '',
  color text not null default 'brand',
  published boolean not null default true,
  sort int not null default 0
);

create table if not exists public.notifications (
  id text primary key,
  channel text not null,
  "to" text not null,
  subject text,
  body text not null,
  status text not null,
  ref text,
  created_at timestamptz not null default now()
);

-- Reserva atómica de lugares: solo descuenta si hay cupo.
create or replace function public.reserve_spots(p_session text, p_n int)
returns boolean
language plpgsql
security definer
as $$
declare ok boolean;
begin
  update public.sessions
     set booked = booked + p_n
   where id = p_session and capacity - booked >= p_n
  returning true into ok;
  return coalesce(ok, false);
end $$;

create or replace function public.release_spots(p_session text, p_n int)
returns void
language sql
security definer
as $$
  update public.sessions set booked = greatest(0, booked - p_n) where id = p_session;
$$;

-- ── Seguridad ──────────────────────────────────────────────
-- El servidor de Next.js usa la service role (omite RLS) y valida permisos en código.
-- Para el público solo se expone lectura de lo publicado.
alter table public.activities enable row level security;
alter table public.sessions enable row level security;
alter table public.profiles enable row level security;
alter table public.orders enable row level security;
alter table public.bookings enable row level security;
alter table public.leads enable row level security;
alter table public.programs enable row level security;
alter table public.notifications enable row level security;

drop policy if exists "public read published activities" on public.activities;
create policy "public read published activities" on public.activities for select using (published);
drop policy if exists "public read sessions" on public.sessions;
create policy "public read sessions" on public.sessions for select using (true);
drop policy if exists "public read published programs" on public.programs;
create policy "public read published programs" on public.programs for select using (published);

-- ── Almacenamiento de imágenes ─────────────────────────────
insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do nothing;
