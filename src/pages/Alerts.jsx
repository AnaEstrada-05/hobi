import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Radar, Sparkles, ShieldCheck, ArrowLeft, ChevronRight } from 'lucide-react';
import { AlertItem } from '../components/Alertitem';
// Conexión a la base de datos real
import { supabase } from '../services/supabaseClient';

const Alerts = ({ onBack }) => {
  const [alertsHistory, setAlertsHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAlertsData = async () => {
      try {
        setLoading(true);
        
        // Consultamos la matriz para simular las validaciones/alertas de la comunidad en tiempo real
        const { data, error } = await supabase
          .from('Benefits_Matrix')
          .select(`
            id,
            percentage,
            type,
            category_id,
            Cards_Master (bank_name, card_name)
          `)
          .limit(5); // Traemos los más relevantes para la comunidad

        if (error) throw error;

        // Mapeamos los datos reales de la BD al formato visual que espera <AlertItem />
        const formattedAlerts = data.map((row, index) => {
          const cardInfo = row.Cards_Master;
          
          // Mapeo dinámico de comercios ficticios según tu ID de categoría en Supabase
          let brand = "Comercio Asociado";
          let location = "Ubicación cercana";
          let category = "General";

          if (row.category_id === 1) {
            brand = "Starbucks";
            location = "Distrito Uno / Local Centro";
            category = "Restaurantes";
          } else if (row.category_id === 2) {
            brand = "Pemex / Oxxo Gas";
            location = "Av. de la Juventud";
            category = "Gasolineras";
          } else if (row.category_id === 4) {
            brand = "Walmart / Soriana";
            location = "Periférico de la Juventud";
            category = "Súper";
          }

          return {
            id: row.id || index,
            brand: brand,
            location: location,
            category: category,
            card: cardInfo ? `${cardInfo.bank_name} ${cardInfo.card_name}` : "Tarjeta de Crédito",
            cashback: `${row.percentage}% ${row.type || 'Cashback'}`,
            time: `Hace ${index + 1} hora${index > 0 ? 's' : ''}`
          };
        });

        setAlertsHistory(formattedAlerts);
      } catch (err) {
        console.error("Error cargando alertas de comunidad desde BD:", err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAlertsData();
  }, []);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-[#1e3a8a] flex flex-col items-center justify-center text-white z-[999]">
        <div className="w-10 h-10 border-4 border-white/20 border-t-white rounded-full animate-spin mb-4" />
        <p className="font-black tracking-widest text-[10px] uppercase opacity-70">Cargando Radar de Comunidad...</p>
      </div>
    );
  }

  return (
    <motion.div 
      layoutId="blue-surface"
      className="fixed inset-0 bg-gradient-to-br from-[#1e3a8a] via-[#2563eb] to-[#0ea5e9] text-white z-50 overflow-y-auto"
      style={{ borderRadius: "0px" }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="pt-12 px-6 max-w-xl mx-auto pb-40"
      >
        <div className="flex justify-between items-center mb-6">
          <motion.button 
            whileTap={{ scale: 0.9 }}
            onClick={onBack}
            className="p-2 hover:bg-white/10 rounded-full transition-colors flex items-center justify-center"
          >
            <ArrowLeft size={24} />
          </motion.button>
          <h1 className="text-2xl font-black tracking-tighter">Comunidad</h1>
          <motion.div 
            whileTap={{ scale: 0.95 }}
            className="w-10 h-10 bg-white/15 rounded-xl flex items-center justify-center border border-white/20"
          >
            <ShieldCheck size={20} className="text-cyan-300" />
          </motion.div>
        </div>

        <motion.div 
          whileTap={{ scale: 0.98 }}
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white/10 backdrop-blur-md p-4 rounded-3xl border border-white/10 shadow-xl flex items-center gap-4 mb-8 cursor-pointer"
        >
          <div className="relative flex-shrink-0">
            <div className="absolute inset-0 bg-cyan-400/30 rounded-full animate-ping" />
            <div className="relative p-2.5 bg-white text-blue-600 rounded-full shadow-lg">
              <Radar size={20} />
            </div>
          </div>
          <div className="flex-1">
            <p className="text-cyan-300 text-[10px] font-black uppercase tracking-widest">Radar Activo</p>
            <p className="text-blue-50 text-xs font-medium">Buscando comercios cercanos...</p>
          </div>
          <ChevronRight size={16} className="text-white/40" />
        </motion.div>

        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black text-white flex items-center gap-2">
              <Sparkles size={18} className="text-amber-400" />
              Validaciones Pendientes
            </h2>
            <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase bg-white/20">
              {alertsHistory.length} Nuevas
            </span>
          </div>
          
          <div className="flex flex-col gap-4 relative">
            {alertsHistory.map((alert, index) => (
                <motion.div
                  key={alert.id}
                  layout 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ 
                      delay: 0.2 + (index * 0.1),
                      duration: 0.4,
                      ease: "easeOut"
                  }}
                  className="relative w-full overflow-hidden rounded-[1.5rem] active:scale-[0.98] transition-transform"
                >
                  <AlertItem {...alert} />
                </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Alerts;