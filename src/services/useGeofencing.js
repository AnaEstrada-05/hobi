import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from './supabaseClient';

const HAVERSINE_MOVEMENT_THRESHOLD_M = 25;
const CACHE_LOOKUP_RADIUS_M          = 35;


function haversineDistanceMeters(lat1, lng1, lat2, lng2) {
  const R    = 6_371_000; // radio de la Tierra en metros
  const toRad = (deg) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

async function lookupPlaceInCache(lat, lng) {
  const { data, error } = await supabase.rpc('find_nearby_cached_place', {
    user_lat: lat,
    user_lng:  lng,
    radius_m:  CACHE_LOOKUP_RADIUS_M,
  });

  if (error) {
    console.warn('[Hobi Cache] RPC error en lookup:', error.message);
    return null;
  }

  // La RPC devuelve el resultado mas cercano ordenado por distancia ASC
  return data && data.length > 0 ? data[0] : null;
}


async function savePlaceToCache(placeId, displayName, types, categoryId, lat, lng, userUid) {
  const { error } = await supabase.from('Places_Cache').upsert(
    {
      place_id:     placeId,
      display_name: displayName,
      types:        types,
      category_id:  categoryId,
      lat:          lat,
      lng:          lng,
      created_by:   userUid, // sin esto, Profile.jsx nunca puede contar "Aportes" reales
    },
    { onConflict: 'place_id' }
  );

  if (error) {
    console.warn('[Hobi Cache] Error al guardar en Places_Cache:', error.message);
  }
}

// La búsqueda en Google Places ya no se hace desde el navegador: antes esta
// función llamaba directo a Google con una API key embebida en el bundle
// (VITE_GOOGLE_MAPS_API_KEY), visible para cualquiera que abriera el código
// fuente servido. Ahora la Edge Function `places-nearby` hace esa llamada
// del lado del servidor, usando la key como secret de Supabase — ver
// supabase/functions/places-nearby/index.ts.
async function fetchNearbyPlaceFromGoogle(lat, lng) {
  const { data, error } = await supabase.functions.invoke('places-nearby', {
    body: { lat, lng },
  });

  if (error) {
    throw new Error(`Error consultando places-nearby: ${error.message}`);
  }
  if (data?.error) {
    throw new Error(`places-nearby: ${data.error}`);
  }
  if (!data?.places || data.places.length === 0) return null;

  const place = data.places[0];
  return {
    placeId:     place.id,
    displayName: place.displayName?.text ?? 'Establecimiento desconocido',
    types:       place.types ?? [],
  };
}

async function resolveCategoryFromDB(googleTypes) {
  const { data: categories, error } = await supabase
    .from('Categories')
    .select('id, name, google_place_type');

  if (error) throw new Error(`Error cargando Categories: ${error.message}`);
  if (!categories || categories.length === 0) return null;

  // Iteramos en orden de prioridad: el primer token de Google que coincida gana
  for (const googleType of googleTypes) {
    const match = categories.find(
      (cat) => cat.google_place_type === googleType
    );
    if (match) return { categoryId: match.id, categoryName: match.name };
  }

  return null; 
}

async function resolveBestCard(userUid, categoryId) {
  // User_Cards y Benefits_Matrix no tienen FK directa entre sí (ambas solo
  // se relacionan vía Cards_Master), así que PostgREST no puede resolver un
  // embed de las tres tablas en una sola consulta. Lo hacemos en dos pasos.
  const { data: walletRows, error: walletError } = await supabase
    .from('User_Cards')
    .select('card_id')
    .eq('user_id', userUid);

  if (walletError) throw new Error(`Error leyendo la wallet del usuario: ${walletError.message}`);

  const cardIds = (walletRows ?? []).map((row) => row.card_id);
  if (cardIds.length === 0) return null;

  const { data: bestRows, error: benefitsError } = await supabase
    .from('Benefits_Matrix')
    .select('card_id, percentage, type, Cards_Master (bank_name, card_name)')
    .in('card_id', cardIds)
    .eq('category_id', categoryId)
    .order('percentage', { ascending: false })
    .limit(1);

  if (benefitsError) throw new Error(`Error resolviendo tarjeta óptima: ${benefitsError.message}`);

  if (!bestRows || bestRows.length === 0) return null;

  const best = bestRows[0];
  return {
    card_id: best.card_id,
    Cards_Master: best.Cards_Master,
    Benefits_Matrix: { percentage: best.percentage, type: best.type },
  };
}


// HOOK PRINCIPAL 
export function useGeofencing({ userUid, enabled = true }) {
  const [isLoading,    setIsLoading]    = useState(false);
  const [error,        setError]        = useState(null);
  const [locationData, setLocationData] = useState(null);

  const lastQueriedCoords = useRef(null);

  const resolveLocation = useCallback(async () => {
    if (!userUid || !enabled) return;

    setIsLoading(true);
    setError(null);

    try {
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout:            10_000,
          maximumAge:         0,
        });
      });

      const { latitude: lat, longitude: lng } = position.coords;

      if (lastQueriedCoords.current) {
        const { lat: prevLat, lng: prevLng } = lastQueriedCoords.current;
        const distance = haversineDistanceMeters(prevLat, prevLng, lat, lng);

        if (distance <= HAVERSINE_MOVEMENT_THRESHOLD_M) {
          // No hubo movimiento significativo: mantenemos el resultado anterior
          setIsLoading(false);
          return;
        }
      }

      const cachedPlace = await lookupPlaceInCache(lat, lng);

      let placeId, displayName, googleTypes, categoryId, categoryName;
      let fromCache = false;

      if (cachedPlace) {
        ({ place_id: placeId, display_name: displayName, types: googleTypes, category_id: categoryId } = cachedPlace);
        // Recuperamos el nombre de categoria para el contrato de retorno
        const { data: catRow } = await supabase
          .from('Categories')
          .select('name')
          .eq('id', categoryId)
          .single();
        categoryName = catRow?.name ?? '';
        fromCache     = true;

      } else {
        const googlePlace = await fetchNearbyPlaceFromGoogle(lat, lng);

        if (!googlePlace) {
          setLocationData(null);
          setIsLoading(false);
          return;
        }

        ({ placeId, displayName, types: googleTypes } = googlePlace);

        
        const resolved = await resolveCategoryFromDB(googleTypes);

        if (!resolved) {
          // El establecimiento no mapea a ninguna categoria de Hobi
          setLocationData(null);
          lastQueriedCoords.current = { lat, lng };
          setIsLoading(false);
          return;
        }

        ({ categoryId, categoryName } = resolved);

        await savePlaceToCache(placeId, displayName, googleTypes, categoryId, lat, lng, userUid);
      }

      const bestCard = await resolveBestCard(userUid, categoryId);

      lastQueriedCoords.current = { lat, lng };

      setLocationData({
        placeName:    displayName,
        categoryId,
        categoryName,
        bestCard,
        fromCache,
      });

    } catch (err) {
      console.error('[Hobi Geofencing] Error en resolveLocation:', err.message);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [userUid, enabled]);

  // Disparo inicial al montar el componente (si esta habilitado)
  useEffect(() => {
    resolveLocation();
  }, [resolveLocation]);

  return {
    isLoading,
    error,
    locationData,
    refresh: resolveLocation,
  };
}