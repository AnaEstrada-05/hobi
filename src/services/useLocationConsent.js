import { useState, useEffect, useCallback } from 'react';

export const LOCATION_STATUS = {
  CHECKING: 'checking',
  PROMPT: 'prompt',
  GRANTED: 'granted',
  DENIED: 'denied',
};

// Consulta el permiso de geolocalización actual del navegador SIN disparar
// el prompt nativo. Vive como función suelta (no solo dentro del hook) para
// poder reutilizarse también desde Ajustes, sin depender de que Home esté
// montado.
export async function queryLocationPermission() {
  if (!navigator.permissions?.query) {
    // Safari viejo no soporta la Permissions API: no hay forma de saber el
    // estado sin pedirlo, así que lo tratamos como "hay que preguntar".
    return LOCATION_STATUS.PROMPT;
  }
  try {
    const result = await navigator.permissions.query({ name: 'geolocation' });
    return result.state; // 'granted' | 'prompt' | 'denied'
  } catch {
    return LOCATION_STATUS.PROMPT;
  }
}

// Dispara el prompt nativo del navegador (o resuelve directo si el
// navegador ya decidió antes). Se usa tanto desde la pantalla de
// consentimiento en Home como desde el botón "Reintentar ubicación" en
// Ajustes.
export function requestLocationAccess() {
  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      () => resolve(LOCATION_STATUS.GRANTED),
      () => resolve(LOCATION_STATUS.DENIED),
      { enableHighAccuracy: true, timeout: 10_000 }
    );
  });
}

// Hook para Home: resuelve el estado del permiso de ubicación al montar
// (sin pedirlo) y expone una función para solicitarlo explícitamente desde
// un botón — nunca en automático, para no mostrar el prompt nativo del
// navegador sin haber explicado antes por qué lo pedimos.
export function useLocationConsent() {
  const [status, setStatus] = useState(LOCATION_STATUS.CHECKING);

  const recheck = useCallback(async () => {
    setStatus(await queryLocationPermission());
  }, []);

  useEffect(() => {
    recheck();
  }, [recheck]);

  const request = useCallback(async () => {
    setStatus(await requestLocationAccess());
  }, []);

  return { status, request, recheck };
}
