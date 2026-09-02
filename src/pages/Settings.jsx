import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, Bell, User, Save, MapPin, Check, AlertCircle } from 'lucide-react';
import { supabase } from '../services/supabaseClient';
import { queryLocationPermission, requestLocationAccess } from '../services/useLocationConsent';

export const SettingsPage = ({ onBack }) => {
  // Antes esta pantalla era enteramente decorativa: el nombre venía
  // hardcodeado ("Alex Rivera"), el toggle de notificaciones solo vivía en
  // estado local de React, y "Guardar Cambios" no tenía onClick — no hacía
  // absolutamente nada. Ver issue KIN-136.
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [fullName, setFullName] = useState('');
  const [notifs, setNotifs] = useState(true);

  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null); // null | 'success' | 'error'
  const [saveError, setSaveError] = useState('');

  // Estado del permiso de ubicación, para poder reintentarlo desde aquí si
  // se rechazó la primera vez en Inicio (ver LocationConsent.jsx).
  const [locationStatus, setLocationStatus] = useState('checking');

  useEffect(() => {
    queryLocationPermission().then(setLocationStatus);
  }, []);

  // Carga el nombre y la preferencia de notificaciones reales del usuario.
  // Ambos viven en user_metadata de Supabase Auth — igual que full_name ya
  // se guarda ahí desde el signup en AuthFlow.jsx — así que no hace falta
  // una tabla nueva para esto.
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error) throw error;

        if (user) {
          setFullName(user.user_metadata?.full_name ?? '');
          // Si nunca se guardó la preferencia, asumimos activado (el
          // comportamiento que ya tenía la app antes de este fix).
          setNotifs(user.user_metadata?.notifications_enabled ?? true);
        }
      } catch (err) {
        console.error('Error cargando el perfil en Ajustes:', err.message);
      } finally {
        setLoadingProfile(false);
      }
    };

    loadProfile();
  }, []);

  const handleRetryLocation = async () => {
    setLocationStatus(await requestLocationAccess());
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveStatus(null);
    setSaveError('');

    try {
      const { error } = await supabase.auth.updateUser({
        data: {
          full_name: fullName.trim(),
          notifications_enabled: notifs,
        },
      });
      if (error) throw error;

      setSaveStatus('success');
    } catch (err) {
      setSaveStatus('error');
      setSaveError(err.message || 'No pudimos guardar tus cambios.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div
      initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
      className="fixed inset-0 bg-gray-50 z-[60] pb-20 overflow-y-auto"
    >
      <div className="bg-white p-6 pt-16 flex items-center gap-4 border-b border-slate-100">
        <button onClick={onBack} className="p-2 bg-slate-50 rounded-xl"><ChevronLeft /></button>
        <h2 className="text-xl font-black tracking-tight">Ajustes</h2>
      </div>

      <div className="p-6 space-y-4">
        <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100">
          <p className="text-[10px] font-black uppercase text-slate-400 mb-4 tracking-widest">Cuenta</p>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-900 ml-1">Nombre Público</label>
              <input
                type="text"
                className="w-full bg-slate-50 p-4 rounded-2xl mt-1 outline-none font-bold disabled:opacity-50"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                disabled={loadingProfile || saving}
                placeholder={loadingProfile ? 'Cargando...' : 'Tu nombre'}
              />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100">
          <p className="text-[10px] font-black uppercase text-slate-400 mb-4 tracking-widest">Preferencias</p>
          <div className="flex items-center justify-between py-2">
            <div className="flex items-center gap-3">
              <Bell size={20} className="text-blue-600" />
              <span className="font-bold text-sm">Notificaciones de proximidad</span>
            </div>
            <button
              onClick={() => setNotifs(!notifs)}
              disabled={loadingProfile || saving}
              className={`w-12 h-6 rounded-full transition-colors disabled:opacity-50 ${notifs ? 'bg-blue-600' : 'bg-slate-200'} relative`}
            >
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${notifs ? 'left-7' : 'left-1'}`} />
            </button>
          </div>
        </div>

        <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100">
          <p className="text-[10px] font-black uppercase text-slate-400 mb-4 tracking-widest">Ubicación</p>
          <div className="flex items-center justify-between py-2">
            <div className="flex items-center gap-3">
              <MapPin size={20} className="text-blue-600" />
              <div>
                <p className="font-bold text-sm">Permiso de ubicación</p>
                <p className="text-[10px] font-bold uppercase text-slate-400">
                  {locationStatus === 'granted' && 'Activado'}
                  {locationStatus === 'denied' && 'Bloqueado'}
                  {locationStatus === 'prompt' && 'No activado'}
                  {locationStatus === 'checking' && 'Verificando...'}
                </p>
              </div>
            </div>
            {locationStatus !== 'granted' && (
              <button
                onClick={handleRetryLocation}
                className="text-[11px] font-black uppercase text-blue-600 bg-blue-50 px-3 py-2 rounded-xl active:scale-95 transition-transform"
              >
                Reintentar
              </button>
            )}
          </div>
          {locationStatus === 'denied' && (
            <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">
              Bloqueaste el permiso desde el navegador — actívalo en los ajustes del sitio antes de reintentar aquí.
            </p>
          )}
          {locationStatus === 'granted' && (
            // Ninguna app web puede quitar un permiso de ubicación ya
            // concedido — ni Chrome ni Safari exponen esa función en JS.
            // Solo se puede revocar desde los ajustes del propio navegador,
            // así que en vez de no dar ninguna opción, explicamos cómo.
            <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">
              Para desactivarla, hazlo desde los ajustes de tu navegador para este sitio (el candado o "ⓘ" junto a la dirección web) — ninguna app puede quitarte un permiso ya concedido por su cuenta.
            </p>
          )}
        </div>

        {saveStatus === 'success' && (
          <div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 text-xs font-bold p-4 rounded-2xl border border-emerald-100">
            <Check size={16} /> Cambios guardados.
          </div>
        )}
        {saveStatus === 'error' && (
          <div className="flex items-center gap-2 bg-rose-50 text-rose-600 text-xs font-bold p-4 rounded-2xl border border-rose-100">
            <AlertCircle size={16} /> {saveError}
          </div>
        )}

        <button
          onClick={handleSave}
          disabled={loadingProfile || saving}
          className="w-full bg-blue-600 text-white font-black py-4 rounded-2xl shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 active:scale-[0.98] transition-transform"
        >
          <Save size={18} /> {saving ? 'Guardando...' : 'Guardar Cambios'}
        </button>
      </div>
    </motion.div>
  );
};
