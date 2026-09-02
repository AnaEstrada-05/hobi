-- KIN-142 (canal de feedback) + KIN-151 (analítica básica)
--
-- Cómo correrlo: Supabase Dashboard → SQL Editor → pega todo esto → Run.

-- 1. KIN-142 — Feedback: para que los testers reporten bugs/ideas sin
--    salir de la app, en vez de depender de que te busquen por WhatsApp.
create table if not exists "Feedback" (
  id bigint generated always as identity primary key,
  user_id uuid references auth.users(id) on delete set null,
  message text not null,
  screen text, -- ruta desde donde se mandó (contexto útil para diagnosticar)
  created_at timestamptz not null default now()
);

alter table "Feedback" enable row level security;

create policy "Users can insert their own feedback"
  on "Feedback" for insert
  to authenticated
  with check (auth.uid() = user_id);

-- Sin policy de select para el cliente a propósito: el feedback se revisa
-- desde el Table Editor del dashboard de Supabase (con tu propio login,
-- eso sí ve todo sin importar RLS), no se necesita exponerlo a la app.

-- 2. KIN-151 — Events: log simple de uso para saber si el piloto
--    funciona. event_name identifica qué pasó, metadata guarda detalles
--    específicos de ese evento (categoría, tarjeta, etc.) sin necesidad
--    de una columna por cada cosa distinta que se quiera medir.
create table if not exists "Events" (
  id bigint generated always as identity primary key,
  user_id uuid references auth.users(id) on delete set null,
  event_name text not null, -- 'app_opened' | 'recommendation_shown' | 'recommendation_empty' | 'calculator_opened' | 'feedback_submitted'
  metadata jsonb,
  created_at timestamptz not null default now()
);

alter table "Events" enable row level security;

create policy "Users can insert their own events"
  on "Events" for insert
  to authenticated
  with check (auth.uid() = user_id);

-- Consulta rápida útil para revisar el piloto desde el SQL Editor:
--   select event_name, count(*) from "Events" group by event_name order by count(*) desc;
