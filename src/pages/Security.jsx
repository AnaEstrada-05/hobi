import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ShieldCheck, Lock, Check, AlertCircle, LogOut, ShieldOff, HelpCircle, Trash2, X } from 'lucide-react';
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
  const [email, setEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState(null); // null | 'success' | 'error'
  const [errorMessage, setErrorMessage] = useState('');

  const [isSignOutAllOpen, setIsSignOutAllOpen] = useState(false);
  const [signingOutAll, setSigningOutAll] = useState(false);

  const [forgotSending, setForgotSending] = useState(false);
  const [forgotSent, setForgotSent] = useState(false);

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deleteRequested, setDeleteRequested] = useState(false);

  // Se necesita el email tanto para reautenticar (verificar la contraseña
  // actual) como para el link de recuperación por correo.
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user?.email) setEmail(user.email);
    });
  }, []);

  const handleChangePassword = async () => {
    setStatus(null);
    setErrorMessage('');

    if (!currentPassword) {
      setStatus('error');
      setErrorMessage('Escribe tu contraseña actual.');
      return;
    }
    if (newPassword.length < 6) {
      setStatus('error');
      setErrorMessage('La contraseña nueva debe tener al menos 6 caracteres.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setStatus('error');
      setErrorMessage('Las contraseñas no coinciden.');
      return;
    }

    setSaving(true);
    try {
      // Supabase no tiene un endpoint dedicado para "verificar la
      // contraseña actual" — el patrón estándar es reautenticar con
      // signInWithPassword. Sin este paso, cualquiera con la sesión ya
      // abierta (una compu compartida, un celular sin bloquear) podría
      // robarse la cuenta poniendo una contraseña nueva sin saber la
      // actual.
      const { error: reauthError } = await supabase.auth.signInWithPassword({
        email,
        password: currentPassword,
      });
      if (reauthError) {
        throw new Error('La contraseña actual no es correcta.');
      }

      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;

      setStatus('success');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setStatus('error');
      setErrorMessage(err.message || 'No pudimos cambiar tu contraseña.');
    } finally {
      setSaving(false);
    }
  };

  // Mismo flujo que "¿Olvidaste tu contraseña?" en el login (AuthFlow.jsx) —
  // para cuando de plano no te acuerdas de la actual y por eso no puedes
  // usar el formulario de arriba.
  const handleForgotPassword = async () => {
    if (!email) return;
    setForgotSending(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin,
      });
      if (error) throw error;
      setForgotSent(true);
    } catch (err) {
      setStatus('error');
      setErrorMessage(err.message || 'No pudimos enviar el correo de recuperación.');
    } finally {
      setForgotSending(false);
    }
  };

  // Borrar la cuenta de verdad requiere la service_role key de Supabase —
  // eso nunca puede vivir en el navegador (mismo motivo por el que
  // useGeofencing.js ya no llama a Google Places directo, ver KIN-135). Así
  // que por ahora esto sigue siendo una solicitud por correo, pero con la
  // misma gravedad que un borrado real: como en GitHub al borrar un repo,
  // no se habilita el botón hasta escribir tu correo exacto.
  const handleConfirmDelete = () => {
    window.location.href = 'mailto:contacto@kinalia.com.mx?subject=Quiero%20eliminar%20mi%20cuenta%20de%20Hobi&body=Confirmo%20que%20quiero%20eliminar%20mi%20cuenta%20y%20mis%20datos%20de%20Hobi.';
    setDeleteRequested(true);
    setIsDeleteOpen(false);
    setDeleteConfirmText('');
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
                placeholder="Contraseña actual"
                className="w-full bg-transparent p-4 outline-none font-bold text-sm disabled:opacity-50"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                disabled={saving}
              />
            </div>
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
                placeholder="Confirmar contraseña nueva"
                className="w-full bg-transparent p-4 outline-none font-bold text-sm disabled:opacity-50"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={saving}
              />
            </div>

            <button
              onClick={handleChangePassword}
              disabled={saving || !currentPassword || !newPassword || !confirmPassword}
              className="w-full bg-blue-600 text-white font-black text-sm py-4 rounded-2xl shadow-lg disabled:opacity-50 active:scale-[0.98] transition-transform"
            >
              {saving ? 'Verificando...' : 'Actualizar contraseña'}
            </button>

            {/* Para cuando de plano no te acuerdas de la actual y por eso no
                puedes usar el formulario de arriba — mismo flujo de correo
                que "¿Olvidaste tu contraseña?" en el login. */}
            {forgotSent ? (
              <p className="text-center text-[11px] font-bold text-emerald-600 pt-1">
                Te mandamos un link a {email} para poner una contraseña nueva.
              </p>
            ) : (
              <button
                onClick={handleForgotPassword}
                disabled={forgotSending || !email}
                className="w-full flex items-center justify-center gap-1.5 text-[11px] font-bold text-slate-400 hover:text-slate-600 pt-1 disabled:opacity-50"
              >
                <HelpCircle size={13} />
                {forgotSending ? 'Enviando...' : '¿No recuerdas tu contraseña actual? Recupérala por correo'}
              </button>
            )}
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

        <div className="bg-white p-6 rounded-[2.5rem] border border-rose-100 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <Trash2 size={18} className="text-rose-500" />
            <p className="text-[10px] font-black uppercase text-rose-500 tracking-widest">Zona de riesgo</p>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed mb-4">
            Vamos a mandar una solicitud para borrar tu cuenta y tus datos de Hobi. Esto no se puede deshacer.
          </p>
          {deleteRequested ? (
            <p className="text-center text-[11px] font-bold text-emerald-600 py-3">
              Listo, se abrió tu correo con la solicitud lista para enviar.
            </p>
          ) : (
            <button
              onClick={() => setIsDeleteOpen(true)}
              className="w-full bg-rose-50 text-rose-600 font-black text-xs uppercase py-3 rounded-2xl hover:bg-rose-100 transition-colors"
            >
              Eliminar mi cuenta
            </button>
          )}
        </div>
      </div>

      {/* Confirmación estilo GitHub: no se habilita "Eliminar" hasta
          escribir el correo exacto de la cuenta, para que borrar algo tan
          serio no dependa de un solo click accidental. */}
      {isDeleteOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => { setIsDeleteOpen(false); setDeleteConfirmText(''); }}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100]"
          />
          <div className="fixed inset-0 flex items-center justify-center z-[101] px-6">
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white w-full max-w-sm rounded-[2.5rem] p-7 shadow-2xl"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-14 h-14 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center">
                  <Trash2 size={26} />
                </div>
                <button onClick={() => { setIsDeleteOpen(false); setDeleteConfirmText(''); }} className="p-2 text-slate-300 hover:text-slate-500">
                  <X size={20} />
                </button>
              </div>

              <h3 className="text-lg font-black text-slate-900 mb-2">Eliminar tu cuenta</h3>
              <p className="text-xs text-slate-500 leading-relaxed mb-4">
                Esta acción no se puede deshacer. Para confirmar, escribe tu correo <b className="text-slate-700">{email}</b> abajo.
              </p>

              <input
                type="text"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder={email}
                autoCapitalize="none"
                autoCorrect="off"
                className="w-full bg-slate-50 rounded-2xl px-4 py-3 outline-none font-bold text-sm mb-4 border border-slate-100 focus:border-rose-300"
              />

              <button
                onClick={handleConfirmDelete}
                disabled={deleteConfirmText.trim().toLowerCase() !== email.toLowerCase()}
                className="w-full py-4 bg-rose-600 text-white rounded-2xl font-black text-sm hover:bg-rose-700 transition-colors disabled:opacity-40 disabled:hover:bg-rose-600"
              >
                ELIMINAR MI CUENTA
              </button>
            </motion.div>
          </div>
        </>
      )}
    </motion.div>
  );
};
