import { supabase } from './supabaseClient';

// Registra el clic en "Solicitar esta tarjeta" para poder medir el embudo
// del piloto (cuántos ven una recomendación -> cuántos le dan clic ->
// cuántas aprobaciones reales hay, esto último por ahora hay que
// preguntarlo a mano al banco/fintech). Ver issues KIN-150 y KIN-151.
//
// Es un log de mejor esfuerzo: si falla, no bloquea al usuario para llegar
// al link de afiliado — perder un registro de analítica es mucho menos
// grave que cortarle el paso a alguien que sí quiere solicitar la tarjeta.
export async function logCardApplicationClick(cardId, source) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.from('Card_Applications').insert({
      user_id: user.id,
      card_id: cardId,
      source,
    });
    if (error) throw error;
  } catch (err) {
    console.warn('[Hobi] No se pudo registrar el clic de solicitud:', err.message);
  }
}
