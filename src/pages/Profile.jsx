import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { User, Settings, Shield, CreditCard, LogOut, Award, ChevronRight, ArrowLeft } from 'lucide-react';
import { supabase } from '../services/supabaseClient';
import { StatCard } from '../components/StatCard';
import { SettingsPage } from './Settings';
import { SecurityPage } from './Security';
import { LogoutModal } from '../components/LogoutModal';

// CORRECCIÓN: Agregamos onBack como prop recibida
export default function Profile({ onBack }) {
  const navigate = useNavigate();
  const [subPage, setSubPage] = useState(null);
  const [isLogoutOpen, setIsLogoutOpen] = useState(false);
  
  // Estados para jalar la info real de la base de datos y auth
  const [userData, setUserData] = useState({ name: 'Cargando...', email: '' });
  const [cardsCount, setCardsCount] = useState(0);
  const [contributionsCount, setContributionsCount] = useState(0); 
  const [loading, setLoading] = useState(true);

  // Mapeo dinámico de colores y títulos según las reglas del Rango Gamer
  const getRankConfig = (contributions) => {
    if (contributions <= 5) {
      return {
        title: 'Rango Bronce',
        bgStyles: 'from-amber-800 via-amber-700 to-amber-900 shadow-amber-900/20'
      };
    } else if (contributions <= 15) {
      return {
        title: 'Rango Platino',
        bgStyles: 'from-slate-400 via-slate-500 to-slate-600 shadow-slate-500/20'
      };
    } else {
      return {
        title: 'Rango Diamante',
        bgStyles: 'from-cyan-600 via-indigo-900 to-amber-600 shadow-indigo-950/30'
      };
    }
  };

  const rank = getRankConfig(contributionsCount);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setLoading(true);
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError) throw authError;

        if (user) {
          const fullName = user.user_metadata?.full_name || 'Usuario Hobi';
          setUserData({
            name: fullName,
            email: user.email || '',
          });

          const { count: cardsCountResult } = await supabase
            .from('User_Cards')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id);

          setCardsCount(cardsCountResult || 0);

          const { count: geoCountResult } = await supabase
            .from('Places_Cache')
            .select('*', { count: 'exact', head: true })
            .eq('created_by', user.id);

          setContributionsCount(geoCountResult || 0);
        }
      } catch (err) {
        console.error('Error al cargar datos reales en el perfil:', err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, []);

  const handleConfirmLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      window.location.reload();
    } catch (err) {
      console.error('Error al cerrar sesión:', err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-40">
      <LogoutModal 
        isOpen={isLogoutOpen} 
        onClose={() => setIsLogoutOpen(false)} 
        onConfirm={handleConfirmLogout} 
      />

      <AnimatePresence>
        {subPage === 'settings' && <SettingsPage onBack={() => setSubPage(null)} />}
        {subPage === 'security' && <SecurityPage onBack={() => setSubPage(null)} />}
      </AnimatePresence>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        {/* HEADER CON DEGRADADO DINÁMICO SEGÚN RANGO */}
        <div className={`bg-gradient-to-br ${rank.bgStyles} pt-16 pb-24 px-6 rounded-b-[3.5rem] shadow-xl relative text-center transition-all duration-500`}>
          
          {/* CORRECCIÓN: Ahora ejecuta onBack directamente, mandando al usuario a 'inicio' */}
          <motion.button 
            whileTap={{ scale: 0.9 }} 
            onClick={onBack} 
            className="absolute top-16 left-6 p-2 hover:bg-white/10 rounded-full transition-colors text-white"
          >
            <ArrowLeft size={28} />
          </motion.button>

          <div className="max-w-xl mx-auto flex flex-col items-center">
            <div className="w-24 h-24 bg-white/20 backdrop-blur-xl rounded-[2.5rem] p-1 border border-white/30 flex items-center justify-center text-white">
              <User size={48} />
            </div>
            <h1 className="mt-4 text-3xl font-black text-white tracking-tighter">{userData.name}</h1>
            <p className="text-blue-100/70 text-xs font-bold uppercase tracking-widest mt-1">
              {loading ? "Calculando..." : rank.title}
            </p>
          </div>
        </div>

        {/* CONTENEDOR DE TARJETAS DE ESTADÍSTICAS */}
        <div className="max-w-xl mx-auto px-6 -mt-10 space-y-4">
          <div className="flex gap-3">
            <StatCard label="Aportes" value={loading ? "..." : contributionsCount.toString()} icon={Award} />
            <button className="flex-1 text-left" onClick={() => navigate('/wallet')}>
              <StatCard label="Cards" value={loading ? "..." : cardsCount.toString()} icon={CreditCard} />
            </button>
          </div>

          {/* MENÚ DE OPCIONES ORIGINAL */}
          <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl overflow-hidden divide-y divide-slate-50">
            <button onClick={() => setSubPage('settings')} className="w-full p-6 flex items-center justify-between hover:bg-slate-50">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-slate-50 rounded-2xl text-slate-600"><Settings size={20} /></div>
                <div className="text-left"><p className="text-sm font-black text-slate-900">Ajustes</p><p className="text-[10px] font-bold text-slate-400 uppercase">Notificaciones y cuenta</p></div>
              </div>
              <ChevronRight size={16} className="text-slate-300" />
            </button>

            <button onClick={() => setSubPage('security')} className="w-full p-6 flex items-center justify-between hover:bg-slate-50">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-slate-50 rounded-2xl text-slate-600"><Shield size={20} /></div>
                <div className="text-left"><p className="text-sm font-black text-slate-900">Seguridad</p><p className="text-[10px] font-bold text-slate-400 uppercase">FaceID y PIN</p></div>
              </div>
              <ChevronRight size={16} className="text-slate-300" />
            </button>

            <button 
              onClick={() => setIsLogoutOpen(true)} 
              className="w-full p-6 flex items-center justify-between hover:bg-rose-50/30 transition-colors text-rose-500"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-rose-50 rounded-2xl"><LogOut size={20} /></div>
                <div className="text-left"><p className="text-sm font-black">Cerrar Sesión</p><p className="text-[10px] font-bold opacity-60 uppercase">Salir de la cuenta</p></div>
              </div>
              <ChevronRight size={16} className="opacity-30" />
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}