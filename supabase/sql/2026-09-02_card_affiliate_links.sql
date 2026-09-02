-- KIN-150: link de afiliado por tarjeta + log de clics en "Solicitar esta tarjeta"
--
-- Cómo correrlo: Supabase Dashboard → SQL Editor → pega todo esto → Run.

-- 1. Columna nueva en Cards_Master para el link de afiliado/referido de
--    cada tarjeta (Nu, Stori, Klar, RappiCard, etc.). Mientras no la
--    llenes para una tarjeta, el botón "Solicitar esta tarjeta" no se
--    muestra para ella en la app (mejor que mostrar un botón roto).
alter table "Cards_Master"
  add column if not exists affiliate_url text;

-- Ejemplo de cómo cargar un link una vez que te den de alta en el
-- programa de afiliados de cada fintech (ajusta el nombre y la URL real):
--   update "Cards_Master" set affiliate_url = 'https://tu-link-de-nu.com/?ref=hobi' where card_name ilike '%Nu%';
--   update "Cards_Master" set affiliate_url = 'https://tu-link-de-stori.com/?ref=hobi' where card_name ilike '%Stori%';

-- 2. Tabla para loggear cada clic en "Solicitar esta tarjeta" — permite
--    medir el embudo del piloto (cuántos ven una recomendación -> cuántos
--    le dan clic). La aprobación real hay que preguntarla a mano al banco
--    mientras no haya un webhook de ellos.
create table if not exists "Card_Applications" (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  card_id bigint not null references "Cards_Master"(id) on delete cascade,
  source text, -- 'location_alert' | 'calculator' | 'wallet'
  created_at timestamptz not null default now()
);

alter table "Card_Applications" enable row level security;

-- Cada usuario solo puede insertar/ver SUS PROPIOS clics — nunca los de
-- otro usuario. No hay policy de update/delete a propósito: es un log de
-- solo-agregar, nadie debería poder editar su propio historial.
create policy "Users can insert their own application clicks"
  on "Card_Applications" for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can view their own application clicks"
  on "Card_Applications" for select
  to authenticated
  using (auth.uid() = user_id);
