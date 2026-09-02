import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ShieldCheck, Lock, Check, AlertCircle, LogOut, ShieldOff, Mail } from 'lucide-react';
import { supabase } from '../services/supabaseClient';
import { LogoutModal } from '../components/LogoutModal';

// Antes esta pantalla afirmaba, como texto fijo sin lógica detrás, que Face
// ID, PIN y "encriptación de 256 bits" estaban "Activado"/"Configurado" —
// nada de eso existía. En una app financiera, eso no es solo una feature
// faltante: es información falsa sobre la seguridad de la cuenta. Ver
// issue KIN-137.
//
// Se rediseñó pensando en lo que Hobi realmente hace y guarda (qué tarjetas
// tienes para recomendarte cuál usar — nunca el número real ni el CVV) en
// vez de simular controles de una app bancaria completa:
// - Face ID/Huella, PIN de acceso y Modo Incógnito se quitaron por completo
//   (no solo se marcaron "Próximamente") — no encajan con una web app sin
//   plan concreto de construirlos.
// - Se agregó lo que sí es real y relevante: cambiar contraseña, cerrar
//   sesión en todos los dispositivos, transparencia de qué datos se
//   guardan, y cómo pedir que se borre la cuenta.
export const SecurityPage = ({ onBack }) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState(null); // null | 'success' | 'error'
  const [errorMessage, setErrorMessage] = useState('');

  const [isSignOutAllOpen, setIsSignOutAllOpen] = useState(false);
  const [signingOutAll, setSigningOutAll] = useState(false);

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

  // scope: 'global' cierra TODAS las sesiones activas (este dispositivo y
  // cualquier otro donde hayas iniciado sesión), a diferencia del logout
  // normal de Perfil que solo cierra la de este dispositivo. App.jsx ya
  // escucha onAuthStateChange, así que no hace falta recargar la página a
  // mano — el listener detecta el SIGNED_OUT y manda de vuelta al login.
  const handleSignOutEverywhere = async () => {
    setSigningOutAll(true);
    try {
      const { error } = await supabase.auth.signOut({ scope: 'global' });
      if (error) throw error;
    } catch (err) {
      console.error('Error al cerrar sesión en todos los dispositivos:', err.message);
    } finally {
      setSigningOutAll(false);
      setIsSignOutAllOpen(false);
    }
  };

  return (
    <motion.div
      initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
      className="fixed inset-0 bg-gray-50 z-[60] pb-20 overflow-y-auto"
    >
      <LogoutModal
        isOpen={isSignOutAllOpen}
        onClose={() => setIsSignOutAllOpen(false)}
        onConfirm={handleSignOutEverywhere}
        title="¿Cerrar sesión en todos lados?"
        message="Vas a salir de tu cuenta en este dispositivo y en cualquier otro donde la hayas dejado abierta."
        confirmLabel={signingOutAll ? 'CERRANDO...' : 'SÍ, CERRAR TODAS'}
      />

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
          <button
            onClick={() => setIsSignOutAllOpen(true)}
            className="w-full p-5 flex items-center justify-between hover:bg-slate-50 transition-colors"
          >
            <div className="flex items-center gap-4">
              <LogOut size={20} className="text-slate-400" />
              <div className="text-left">
                <p className="font-bold text-sm">Cerrar sesión en todos los dispositivos</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase">Por si dejaste tu cuenta abierta en otro lado</p>
              </div>
            </div>
          </button>
        </div>

        {/* Transparencia real sobre qué datos guarda Hobi — más relevante
            para la confianza del usuario (o de un banco aliado evaluando el
            producto) que una lista de features de seguridad inventadas. */}
        <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <ShieldOff size={18} className="text-slate-400" />
            <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Qué datos guardamos</p>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            <b className="text-slate-700">No guardamos el número de tu tarjeta ni tu CVV.</b> Solo el banco y el nombre de la tarjeta que nos dices que usas, para poder recomendarte cuál conviene según dónde estás. También guardamos tu historial de ubicaciones aportadas a la comunidad.
          </p>
        </div>

        <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <Mail size={18} className="text-slate-400" />
            <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Eliminar mi cuenta</p>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed mb-4">
            Si quieres que borremos tu cuenta y tus datos, escríbenos y lo hacemos por ti.
          </p>
          <a
            href="mailto:contacto@kinalia.com.mx?subject=Quiero%20eliminar%20mi%20cuenta%20de%20Hobi"
            className="block w-full text-center bg-slate-50 text-slate-600 font-black text-xs uppercase py-3 rounded-2xl hover:bg-slate-100 transition-colors"
          >
            Solicitar eliminación de cuenta
          </a>
        </div>
      </div>
    </motion.div>
  );
};
