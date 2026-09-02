import { supabase } from './supabaseClient';

// Log simple de uso — antes no había ninguna forma de saber si el piloto
// en Chihuahua está funcionando (cuánta gente abre la app, a cuántos se
// les muestra una recomendación real, quién usa la calculadora). Ver
// issue KIN-151.
//
// Como logCardApplicationClick en cardApplications.js: es de mejor
// esfuerzo, nunca debe cortarle el paso a un usuario real solo porque
// falló un insert de analítica.
export async function trackEvent(eventName, metadata = {}) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.from('Events').insert({
      user_id: user.id,
      event_name: eventName,
      metadata,
    });
    if (error) throw error;
  } catch (err) {
    console.warn('[Hobi Analytics] No se pudo registrar el evento:', eventName, err.message);
  }
}
