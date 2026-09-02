import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { supabase } from "../services/supabaseClient";
import { useGeofencing } from "../services/useGeofencing"; 
import { HomeHeader } from "../components/HomeHeader";
import { LocationAlert } from "../components/LocationAlert";
import { QuickActions } from "../components/QuickActions";
import { CardList } from "../components/CardList";
import { MapPin, RefreshCw } from "lucide-react"; // Iconos para feedback visual

export default function Home() {
  const navigate = useNavigate();
  const [userUid, setUserUid] = useState(null);
  const [firstName, setFirstName] = useState("Usuario");
  const googleApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  // 1. Efecto inicial para recuperar la sesión del usuario
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error) throw error;

        if (user) {
          setUserUid(user.id);
          const fullName = user.user_metadata?.full_name;
          if (fullName) {
            setFirstName(fullName.trim().split(" ")[0]);
          }
        }
      } catch (err) {
        console.error("Error al recuperar el perfil en Home:", err.message);
      }
    };

    fetchUserProfile();
  }, []);

  // 2. Conexión con el motor de Geofencing
  // Se activa automáticamente solo cuando ya tenemos el UID del usuario
  const { isLoading, error: geoError, locationData, refresh } = useGeofencing({
    userUid,
    googleApiKey,
    enabled: !!userUid,
  });

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }} 
      className="min-h-screen bg-gray-50 pb-32"
    >
      {/* Encabezado dinámico */}
      <HomeHeader
        name={firstName}
        onWalletClick={() => navigate('/wallet')}
        onAlertsClick={() => navigate('/alertas')}
      />
      
      <div className="max-w-xl mx-auto px-4 sm:px-6 -mt-8 relative z-20 space-y-4">
        
        {/* 3. Renderizado Condicional del Estado de Ubicación */}
        {isLoading ? (
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between animate-pulse">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-50 p-2 rounded-xl text-blue-500">
                <MapPin className="animate-bounce" size={20} />
              </div>
              <div>
                <div className="h-4 w-32 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 w-24 bg-gray-100 rounded"></div>
              </div>
            </div>
          </div>
        ) : locationData ? (
          /* Puntos de venta reales detectados */
          <div className="relative group">
            <LocationAlert 
              place={locationData.placeName} 
              location={locationData.categoryName} 
              offer={
                locationData.bestCard 
                  ? `${locationData.bestCard.Benefits_Matrix.percentage}% con ${locationData.bestCard.Cards_Master.card_name}`
                  : "Sin beneficios disponibles aquí"
              } 
            />
            {/* Pequeño indicador discreto si la info vino de tu Places_Cache */}
            {locationData.fromCache && (
              <span className="absolute -top-2 right-4 bg-emerald-500 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full shadow-sm">
                ⚡ HOBI CACHE
              </span>
            )}
          </div>
        ) : (
          /* Estado de reposo o sin locales mapeados cerca */
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-gray-50 p-2 rounded-xl text-gray-400">
                <MapPin size={20} />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-gray-700">Explorando tu entorno</h4>
                <p className="text-xs text-gray-400">Camina cerca de un negocio para ver beneficios</p>
              </div>
            </div>
            <button 
              onClick={refresh}
              className="p-2 text-gray-400 hover:text-blue-500 hover:bg-gray-50 rounded-xl transition-colors"
              title="Forzar actualización"
            >
              <RefreshCw size={16} />
            </button>
          </div>
        )}

        {/* Alertas de error de geofencing no fatales */}
        {geoError && (
          <div className="bg-amber-50 text-amber-700 text-xs p-3 rounded-xl border border-amber-200">
            Aviso de ubicación: {geoError}
          </div>
        )}

        <QuickActions />
        <CardList onSeeAll={() => navigate('/wallet')} />
      </div>
    </motion.div>
  );
}