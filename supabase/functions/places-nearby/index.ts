// Edge Function: hace la búsqueda de comercios cercanos en Google Places
// del lado del servidor, para que GOOGLE_MAPS_API_KEY nunca llegue al
// bundle del cliente.
//
// Antes, `useGeofencing.js` llamaba a Google Places directo desde el
// navegador con `VITE_GOOGLE_MAPS_API_KEY` — cualquier variable `VITE_*`
// queda embebida en el JS servido públicamente, así que la key era
// visible para cualquiera que abriera el código fuente. Ver issue KIN-135.
//
// Deploy (requiere estar logueado con `supabase login` y el project ref):
//   supabase functions deploy places-nearby --project-ref <project-ref>
//   supabase secrets set GOOGLE_MAPS_API_KEY=<tu-key> --project-ref <project-ref>
//
// SUPABASE_URL y SUPABASE_ANON_KEY ya los inyecta Supabase automáticamente
// en cada Edge Function — no hace falta configurarlos a mano.

import { createClient } from "npm:@supabase/supabase-js@2";

const GOOGLE_PLACES_NEARBY_ENDPOINT = "https://places.googleapis.com/v1/places:searchNearby";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: CORS_HEADERS });
  }

  if (req.method !== "POST") {
    return json({ error: "Method not allowed" }, 405);
  }

  try {
    // El endpoint solo responde a usuarios ya autenticados en Hobi (mismo
    // JWT que usa el resto de la app) — no queremos dejarlo abierto a
    // cualquiera en internet, aunque no exponga la key de Google.
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return json({ error: "Falta el header Authorization" }, 401);
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL"),
      Deno.env.get("SUPABASE_ANON_KEY"),
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return json({ error: "No autorizado" }, 401);
    }

    const { lat, lng } = await req.json();
    if (typeof lat !== "number" || typeof lng !== "number") {
      return json({ error: "Se requieren lat/lng numéricos" }, 400);
    }

    const apiKey = Deno.env.get("GOOGLE_MAPS_API_KEY");
    if (!apiKey) {
      console.error("[places-nearby] Falta configurar el secret GOOGLE_MAPS_API_KEY");
      return json({ error: "Servicio de ubicación no configurado" }, 500);
    }

    const googleRes = await fetch(GOOGLE_PLACES_NEARBY_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-FieldMask": "places.displayName,places.types,places.id",
        "X-Goog-Api-Key": apiKey,
      },
      body: JSON.stringify({
        locationRestriction: {
          circle: { center: { latitude: lat, longitude: lng }, radius: 50.0 },
        },
        maxResultCount: 1,
      }),
    });

    const body = await googleRes.json();

    if (!googleRes.ok) {
      console.error("[places-nearby] Google Places respondió con error:", googleRes.status, body);
    }

    return json(body, googleRes.status);
  } catch (err) {
    console.error("[places-nearby] Error inesperado:", err);
    return json({ error: err instanceof Error ? err.message : "Error inesperado" }, 500);
  }
});
