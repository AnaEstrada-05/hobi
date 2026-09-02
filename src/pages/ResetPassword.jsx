import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock } from 'lucide-react';
import logo from '../assets/logo_white.png';
import { supabase } from '../services/supabaseClient';

// Pantalla que se muestra cuando el usuario regresa del link de "recuperar
// contraseña" que le llega por correo (Supabase abre una sesión temporal de
// tipo recovery — App.jsx detecta ese evento y renderiza esto en vez de
// dejarlo pasar directo a Home).
export default function ResetPassword({ onDone }) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async () => {
    setErrorMessage('');

    if (password.length < 6) {
      setErrorMessage('La contraseña debe tener al menos 6 caracteres.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage('Las contraseñas no coinciden.');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      onDone();
    } catch (err) {
      setErrorMessage(err.message || 'No pudimos actualizar tu contraseña.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1e3a8a] via-[#2563eb] to-[#0ea5e9] flex flex-col relative overflow-hidden font-sans">
      <div className="absolute -right-20 -top-20 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -left-20 -bottom-20 w-64 h-64 bg-black/10 rounded-full blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex-1 flex flex-col justify-center px-8 z-10"
      >
        <div className="max-w-md mx-auto w-full text-center">
          <img src={logo} alt="Hobi logo" className="w-24 h-24 object-contain mx-auto mb-4" />
          <h2 className="text-4xl font-black text-white tracking-tighter mb-2 leading-none">
            Nueva contraseña
          </h2>
          <p className="text-blue-100/60 font-bold uppercase text-[10px] tracking-[0.2em] mb-8">
            Elige una contraseña para tu cuenta
          </p>

          {errorMessage && (
            <div className="mb-4 p-4 bg-rose-500/20 border border-rose-500/30 rounded-2xl text-rose-200 text-xs font-bold text-left">
              {errorMessage}
            </div>
          )}

          <div className="space-y-4 text-left">
            <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md rounded-[1.8rem] px-6 border border-white/10 focus-within:bg-white/20 transition-all shadow-inner">
              <div className="text-white/40"><Lock size={18} /></div>
              <input
                type="password"
                placeholder="Contraseña nueva"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                className="w-full bg-transparent py-5 font-bold text-white placeholder:text-white/30 outline-none text-sm"
              />
            </div>
            <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md rounded-[1.8rem] px-6 border border-white/10 focus-within:bg-white/20 transition-all shadow-inner">
              <div className="text-white/40"><Lock size={18} /></div>
              <input
                type="password"
                placeholder="Confirma la contraseña"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={loading}
                className="w-full bg-transparent py-5 font-bold text-white placeholder:text-white/30 outline-none text-sm"
              />
            </div>

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full py-5 rounded-[1.8rem] font-black text-sm tracking-widest active:scale-[0.97] transition-all shadow-xl bg-white text-blue-600 disabled:bg-white/50 disabled:cursor-not-allowed"
            >
              {loading ? 'GUARDANDO...' : 'GUARDAR CONTRASEÑA'}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
