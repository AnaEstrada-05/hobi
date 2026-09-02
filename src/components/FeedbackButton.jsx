import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { MessageSquarePlus, X, Send, Check } from 'lucide-react';
import { supabase } from '../services/supabaseClient';
import { trackEvent } from '../services/analytics';

// Antes no había ninguna forma de que un tester reportara un bug o una
// idea sin salir de la app y buscar a Ana por WhatsApp. Un botón flotante
// visible en cualquier pantalla baja muchísimo la fricción de reportar.
// Ver issue KIN-142.
export const FeedbackButton = () => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleClose = () => {
    setIsOpen(false);
    // Se limpia con un pequeño delay para no ver el formulario "brincar"
    // vacío justo antes de que termine la animación de salida.
    setTimeout(() => {
      setMessage('');
      setSent(false);
      setErrorMessage('');
    }, 300);
  };

  const handleSubmit = async () => {
    if (!message.trim()) return;
    setSending(true);
    setErrorMessage('');
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await supabase.from('Feedback').insert({
        user_id: user?.id ?? null,
        message: message.trim(),
        screen: location.pathname,
      });
      if (error) throw error;

      trackEvent('feedback_submitted', { screen: location.pathname });
      setSent(true);
    } catch (err) {
      setErrorMessage(err.message || 'No pudimos enviar tu feedback. Inténtalo de nuevo.');
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-24 right-5 z-40 w-12 h-12 bg-slate-900 text-white rounded-2xl shadow-xl flex items-center justify-center"
        title="Enviar feedback"
      >
        <MessageSquarePlus size={20} />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleClose}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[150]"
            />
            <div className="fixed inset-0 z-[151] flex items-end sm:items-center justify-center p-0 sm:p-6">
              <motion.div
                initial={{ y: '100%', opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: '100%', opacity: 0 }}
                transition={{ type: 'spring', stiffness: 320, damping: 32 }}
                className="relative bg-white w-full sm:max-w-sm rounded-t-[2.5rem] sm:rounded-[2.5rem] p-7 shadow-2xl"
              >
                <button
                  onClick={handleClose}
                  className="absolute top-6 right-6 p-2 bg-slate-50 rounded-full text-slate-400 hover:bg-slate-100"
                >
                  <X size={18} />
                </button>

                {sent ? (
                  <div className="py-6 flex flex-col items-center text-center">
                    <div className="w-14 h-14 bg-emerald-50 text-emerald-500 rounded-2xl flex items-center justify-center mb-4">
                      <Check size={28} />
                    </div>
                    <h3 className="text-lg font-black text-slate-900 mb-1">¡Gracias!</h3>
                    <p className="text-sm text-slate-500">Ya nos llegó tu mensaje.</p>
                  </div>
                ) : (
                  <>
                    <h3 className="text-lg font-black text-slate-900 mb-1 pr-8">¿Algo que contarnos?</h3>
                    <p className="text-xs text-slate-400 mb-4">
                      Un bug, una idea, lo que sea — nos ayuda muchísimo.
                    </p>

                    {errorMessage && (
                      <div className="mb-3 p-3 bg-rose-50 text-rose-600 text-xs font-bold rounded-2xl">
                        {errorMessage}
                      </div>
                    )}

                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      disabled={sending}
                      placeholder="Escribe aquí..."
                      rows={4}
                      className="w-full bg-slate-50 rounded-2xl p-4 text-sm font-medium outline-none resize-none disabled:opacity-50 border border-slate-100 focus:border-blue-300"
                    />

                    <button
                      onClick={handleSubmit}
                      disabled={sending || !message.trim()}
                      className="mt-4 w-full flex items-center justify-center gap-2 bg-blue-600 text-white font-black text-xs uppercase tracking-wider py-3.5 rounded-2xl disabled:opacity-50 active:scale-[0.98] transition-transform"
                    >
                      {sending ? 'Enviando...' : 'Enviar'}
                      {!sending && <Send size={14} />}
                    </button>
                  </>
                )}
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};
