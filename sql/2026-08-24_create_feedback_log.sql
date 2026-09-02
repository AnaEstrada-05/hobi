-- Crea la tabla Feedback_Log que el frontend ya espera (AlertItem.jsx) pero
-- que nunca se creó en la base — por eso el botón "¿Recibiste tu cashback?"
-- fallaba en silencio.
--
-- Correr en: Supabase Dashboard → SQL Editor → New query → pegar y ejecutar.

create table if not exists public."Feedback_Log" (
  id         bigint generated always as identity primary key,
  user_id    uuid not null references auth.users(id) on delete cascade,
  place_id   text not null,
  status     text not null check (status in ('Yes', 'No')),
  created_at timestamptz not null default now()
);

alter table public."Feedback_Log" enable row level security;

-- Cada usuario solo puede insertar feedback a su propio nombre.
create policy "Users can insert their own feedback"
  on public."Feedback_Log"
  for insert
  to authenticated
  with check (auth.uid() = user_id);

-- Cada usuario solo puede leer su propio historial de feedback.
create policy "Users can read their own feedback"
  on public."Feedback_Log"
  for select
  to authenticated
  using (auth.uid() = user_id);
