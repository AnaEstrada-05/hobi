import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ShieldCheck, Fingerprint, KeyRound, EyeOff, Check, AlertCircle, Lock } from 'lucide-react';
import { supabase } from '../services/supabaseClient';

// Antes esta pantalla afirmaba, como texto fijo sin lógica detrás, que Face
// ID, PIN y "encriptación de 256 bits" estaban "Activado"/"Configurado" —
// nada de eso existía. En una app financiera, eso no es solo una feature
// faltante: es información falsa sobre la seguridad de la cuenta. Ver
// issue KIN-137.
//
// Se implementa lo único de la lista que sí es alcanzable ahora mismo
// (cambiar contraseña, vía Supabase Auth) y el resto se marca
// honestamente como "Próximamente" en vez de afirmar un estado falso.
export const SecurityPage = ({ onBack }) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState(null); // null | 'success' | 'error'
  const [errorMessage, setErrorMessage] = useState('');

  const handleChangePassword = async () => {
    setStatus(null);
    setErrorMessage('');

    if (newPassword.length < 6) {
      setStatus('error');
      setErrorMessage('La contraseña debe tener al menos 6 caracteres.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setStatus('error');
      setErrorMessage('Las contraseñas no coinciden.');
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;

      setStatus('success');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setStatus('error');
      setErrorMessage(err.message || 'No pudimos cambiar tu contraseña.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div
      initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
      className="fixed inset-0 bg-gray-50 z-[60] pb-20 overflow-y-auto"
    >
      <div className="bg-slate-900 p-6 pt-16 flex items-center gap-4 text-white">
        <button onClick={onBack} className="p-2 bg-white/10 rounded-xl"><ChevronLeft /></button>
        <h2 className="text-xl font-black tracking-tight">Seguridad</h2>
      </div>

      <div className="p-6 space-y-4">
        <div className="bg-blue-50 p-6 rounded-[2.5rem] border border-blue-100 flex items-center gap-4">
          <div className="p-3 bg-blue-600 rounded-2xl text-white"><ShieldCheck /></div>
          <div>
            <p className="text-sm font-black text-blue-900">Tu conexión está cifrada</p>
            <p className="text-[10px] font-bold text-blue-600 uppercase">HTTPS · tu contraseña nunca se guarda en texto plano</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm">
          <p className="text-[10px] font-black uppercase text-slate-400 mb-4 tracking-widest">Cambiar contraseña</p>

          {status === 'success' && (
            <div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 text-xs font-bold p-4 rounded-2xl border border-emerald-100 mb-4">
              <Check size={16} /> Contraseña actualizada.
            </div>
          )}
          {status === 'error' && (
            <div className="flex items-center gap-2 bg-rose-50 text-rose-600 text-xs font-bold p-4 rounded-2xl border border-rose-100 mb-4">
              <AlertCircle size={16} /> {errorMessage}
            </div>
          )}

          <div className="space-y-3">
            <div className="flex items-center gap-3 bg-slate-50 rounded-2xl px-4">
              <Lock size={16} className="text-slate-400" />
              <input
                type="password"
                placeholder="Nueva contraseña"
                className="w-full bg-transparent p-4 outline-none font-bold text-sm disabled:opacity-50"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                disabled={saving}
              />
            </div>
            <div className="flex items-center gap-3 bg-slate-50 rounded-2xl px-4">
              <Lock size={16} className="text-slate-400" />
              <input
                type="password"
                placeholder="Confirmar contraseña"
                className="w-full bg-transparent p-4 outline-none font-bold text-sm disabled:opacity-50"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={saving}
              />
            </div>

            <button
              onClick={handleChangePassword}
              disabled={saving || !newPassword || !confirmPassword}
              className="w-full bg-blue-600 text-white font-black text-sm py-4 rounded-2xl shadow-lg disabled:opacity-50 active:scale-[0.98] transition-transform"
            >
              {saving ? 'Guardando...' : 'Actualizar contraseña'}
            </button>
          </div>
        </div>

        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
          {[
            { icon: Fingerprint, label: 'Face ID / Huella' },
            { icon: KeyRound, label: 'PIN de acceso' },
            { icon: EyeOff, label: 'Modo Incógnito' },
          ].map((item, i) => (
            <div key={i} className="p-5 flex items-center justify-between border-b border-slate-50 last:border-0 opacity-60">
              <div className="flex items-center gap-4">
                <item.icon size={20} className="text-slate-400" />
                <span className="font-bold text-sm">{item.label}</span>
              </div>
              <span className="text-[10px] font-black text-slate-500 uppercase bg-slate-100 px-2 py-1 rounded-md">
                Próximamente
              </span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};
