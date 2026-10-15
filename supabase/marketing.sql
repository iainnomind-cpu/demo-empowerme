-- ═══════════════════════════════════════════════════════════
-- Empowerme · módulo de Marketing por WhatsApp
-- Ejecuta este archivo en Supabase › SQL Editor (una vez).
-- ═══════════════════════════════════════════════════════════

-- Permiso de marketing por persona: { optIn, at, optOutAt }
alter table public.profiles add column if not exists marketing jsonb;

create table if not exists public.campaigns (
  id text primary key,
  name text not null,
  kind text not null check (kind in ('evento','recordatorio','felicitacion','libre')),
  audience jsonb not null,
  body text not null,
  activity_id text,
  image_url text,
  template_name text,
  status text not null default 'borrador' check (status in ('borrador','programada','enviando','enviada')),
  scheduled_at timestamptz,
  sent_at timestamptz,
  stats jsonb not null default '{"total":0,"sent":0,"failed":0,"skipped":0}',
  created_by text not null default '',
  created_at timestamptz not null default now()
);

-- Ajustes generales (automatizaciones de recordatorios y cumpleaños)
create table if not exists public.settings (
  key text primary key,
  value jsonb not null
);

create index if not exists notifications_ref_idx on public.notifications(ref);

alter table public.campaigns enable row level security;
alter table public.settings enable row level security;
