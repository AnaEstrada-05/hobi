import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LogOut, AlertCircle } from 'lucide-react';

// title/message/confirmLabel son opcionales (con los valores de siempre
// como default) para poder reutilizar este mismo modal en "cerrar sesión en
// todos los dispositivos" (Security.jsx) sin duplicar el componente.
export const LogoutModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = '¿Cerrar sesión?',
  message = 'Tendrás que volver a ingresar tus credenciales para acceder a tus beneficios.',
  confirmLabel = 'SÍ, CERRAR SESIÓN',
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop: Fondo oscurecido */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100]"
          />
          
          {/* Contenedor del Modal */}
          <div className="fixed inset-0 flex items-center justify-center z-[101] px-6">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white w-full max-w-xs rounded-[3rem] p-8 shadow-2xl text-center"
            >
              <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <LogOut size={32} />
              </div>
              
              <h3 className="text-xl font-black text-slate-900 mb-2">{title}</h3>
              <p className="text-sm font-bold text-slate-400 leading-relaxed mb-8">
                {message}
              </p>

              <div className="space-y-3">
                <button
                  onClick={onConfirm}
                  className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-sm hover:bg-slate-800 transition-colors shadow-lg shadow-slate-200"
                >
                  {confirmLabel}
                </button>
                <button 
                  onClick={onClose}
                  className="w-full py-4 bg-slate-50 text-slate-400 rounded-2xl font-black text-sm hover:bg-slate-100 transition-colors"
                >
                  CANCELAR
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};