import { supabase } from '../services/supabaseClient';
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, MapPin, CreditCard, ThumbsUp, ThumbsDown, AlertTriangle } from 'lucide-react';

export const AlertItem = ({ brand, location, category, card, cashback, time, initialStatus }) => {
  const [feedback, setFeedback] = useState(null); 

  const handleFeedback = async (status) => {
  setFeedback(status);

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    console.error("No hay sesión activa, no se puede guardar el feedback:", authError?.message);
    return;
  }

  const { error } = await supabase
    .from('Feedback_Log')
    .insert([
      {
        user_id: user.id,
        status: status === 'success' ? 'Yes' : 'No',
        place_id: brand // TODO: usar el place_id real de Google una vez que Alerts.jsx muestre detecciones reales en vez de datos de ejemplo
      }
    ]);

  if (error) {
    console.error("Error al guardar feedback:", error.message);
  } else {
    console.log("¡Feedback comunitario guardado con éxito!");
  }
};

  return (
    <motion.div 
      layout
      className="bg-white p-5 rounded-[2.5rem] border border-slate-100 shadow-sm mb-4 relative overflow-hidden"
    >
      {feedback === 'fail' && (
        <div className="absolute top-0 left-0 right-0 bg-rose-500 text-white text-[9px] font-black uppercase py-1 px-4 flex items-center justify-center gap-2">
          <AlertTriangle size={10} />
          Reportado: No aplica como {category}
        </div>
      )}

      <div className={`flex justify-between items-start mb-4 ${feedback === 'fail' ? 'mt-4' : ''}`}>
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-white font-bold text-lg transition-colors ${feedback === 'fail' ? 'bg-rose-500' : 'bg-slate-900'}`}>
            {brand[0]}
          </div>
          <div>
            <h4 className="font-black text-slate-900 leading-none mb-1">{brand}</h4>
            <span className="text-[10px] font-bold text-blue-500 uppercase tracking-tighter">{category}</span>
          </div>
        </div>
        <span className="text-[10px] font-bold text-slate-400">{time}</span>
      </div>

      <div className="bg-slate-50 rounded-2xl p-3 mb-4 border border-slate-100">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <CreditCard size={14} className="text-slate-400" />
            <span className="text-xs font-bold text-slate-700">{card}</span>
          </div>
          <span className="text-xs font-black text-slate-900">{cashback}</span>
        </div>
      </div>

      <div className="pt-3 border-t border-slate-50">
        <AnimatePresence mode="wait">
          {feedback === null ? (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="flex flex-col gap-3"
            >
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">¿Recibiste tu cashback?</p>
              <div className="flex gap-2">
                <button 
                  onClick={() => handleFeedback('success')}
                  className="flex-1 flex items-center justify-center gap-2 py-2 bg-emerald-50 text-emerald-600 rounded-xl text-[10px] font-black hover:bg-emerald-100 transition-colors"
                >
                  <ThumbsUp size={12} /> SÍ, TODO BIEN
                </button>
                <button 
                  onClick={() => setFeedback('fail')}
                  className="flex-1 flex items-center justify-center gap-2 py-2 bg-rose-50 text-rose-600 rounded-xl text-[10px] font-black hover:bg-rose-100 transition-colors"
                >
                  <ThumbsDown size={12} /> NO RECIBÍ
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}
              className={`flex items-center gap-2 font-bold text-[10px] ${feedback === 'success' ? 'text-emerald-600' : 'text-rose-600'}`}
            >
              {feedback === 'success' ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
              {feedback === 'success' ? 'GRACIAS POR AYUDAR A LA COMUNIDAD' : 'REPORTE ENVIADO: ACTUALIZAREMOS LA CATEGORÍA'}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};