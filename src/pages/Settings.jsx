import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, Bell, Moon, User, Save, MapPin } from 'lucide-react';
import { queryLocationPermission, requestLocationAccess } from '../services/useLocationConsent';

export const SettingsPage = ({ onBack }) => {
  const [notifs, setNotifs] = useState(true);

  // Estado del permiso de ubicación, para poder reintentarlo desde aquí si
  // se rechazó la primera vez en Inicio (ver LocationConsent.jsx).
  const [locationStatus, setLocationStatus] = useState('checking');

  useEffect(() => {
    queryLocationPermission().then(setLocationStatus);
  }, []);

  const handleRetryLocation = async () => {
    setLocationStatus(await requestLocationAccess());
  };

  return (
    <motion.div 
      initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
      className="fixed inset-0 bg-gray-50 z-[60] pb-20"
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
              <input type="text" className="w-full bg-slate-50 p-4 rounded-2xl mt-1 outline-none font-bold" defaultValue="Alex Rivera" />
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
              className={`w-12 h-6 rounded-full transition-colors ${notifs ? 'bg-blue-600' : 'bg-slate-200'} relative`}
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
        </div>

        <button className="w-full bg-blue-600 text-white font-black py-4 rounded-2xl shadow-lg flex items-center justify-center gap-2">
          <Save size={18} /> Guardar Cambios
        </button>
      </div>
    </motion.div>
  );
};