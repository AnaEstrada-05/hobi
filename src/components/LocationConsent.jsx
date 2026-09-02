import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, ShieldAlert } from 'lucide-react';

// Pantalla propia que se muestra ANTES de disparar el prompt nativo de
// geolocalización del navegador. Sin esto, la app pedía ubicación en
// automático apenas había sesión, sin contexto — y mucha gente rechaza ese
// prompt genérico por reflejo.
export const LocationConsent = ({ status, onRequest }) => {
  const denied = status === 'denied';

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100"
    >
      <div className="flex items-start gap-3">
        <div className="bg-blue-50 p-2.5 rounded-xl text-blue-500 flex-none">
          <MapPin size={20} />
        </div>
        <div className="flex-1">
          <h4 className="text-sm font-bold text-gray-800">Activa tu ubicación</h4>
          <p className="text-xs text-gray-500 mt-1 leading-relaxed">
            Usamos tu ubicación solo para avisarte qué tarjeta te conviene cerca de ti. Nunca la compartimos ni la usamos para nada más.
          </p>

          {denied ? (
            <div className="mt-3 flex items-start gap-2 bg-amber-50 text-amber-700 text-[11px] p-2.5 rounded-xl border border-amber-200">
              <ShieldAlert size={14} className="flex-none mt-0.5" />
              <span>Bloqueaste el permiso de ubicación. Actívalo desde los ajustes de tu navegador para este sitio y vuelve a intentar aquí, o desde Perfil → Ajustes.</span>
            </div>
          ) : (
            <button
              onClick={onRequest}
              className="mt-3 w-full bg-blue-600 text-white text-xs font-bold py-2.5 rounded-xl active:scale-[0.98] transition-transform"
            >
              Activar ubicación
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};
