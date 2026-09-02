import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Zap, ChevronRight, Navigation } from 'lucide-react';
import { ApplyCardButton } from './ApplyCardButton';

export const LocationAlert = ({
  place = "Starbucks",
  location = "Centro Comercial Santa Fe",
  offer = "5% con Santander LikeU",
  cardId,
  affiliateUrl,
}) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      className="mx-4 sm:mx-8 lg:mx-auto lg:max-w-4xl mt-6 sm:mt-8 relative group"
    >
      <div className="absolute -inset-1 bg-gradient-to-r from-orange-600 to-amber-400 rounded-[1.5rem] sm:rounded-[2rem] blur-xl opacity-20 group-hover:opacity-30 transition duration-700" />
      
      <div className="relative bg-gradient-to-br from-[#f97316] to-[#f59e0b] p-4 sm:p-6 rounded-[1.8rem] sm:rounded-[2rem] border border-white/20 shadow-2xl shadow-orange-500/20 overflow-hidden">
        
        <div className="absolute -right-6 -top-6 sm:-right-10 sm:-top-10 w-24 h-24 sm:w-32 sm:h-32 bg-white/10 rounded-full blur-2xl sm:blur-3xl" />

        <div className="flex flex-col gap-5 relative z-10">
          
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="bg-white/20 backdrop-blur-md p-2.5 sm:p-3 rounded-xl sm:rounded-2xl border border-white/30 shadow-inner shrink-0">
              <Zap size={20} className="text-white fill-white sm:w-[22px] sm:h-[22px]" />
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 className="text-white font-black text-base sm:text-lg leading-tight tracking-tight uppercase">
                Cashback Detectado
              </h3>
              <p className="text-orange-50/90 text-[11px] sm:text-[13px] mt-0.5 sm:mt-1">
                Promoción activa en <span className="font-bold text-white underline underline-offset-2 decoration-white/30">{place}</span>
              </p>
            </div>
          </div>

          <div className="relative group/loc">
            <div className="absolute inset-0 bg-black/10 blur-md rounded-xl group-hover/loc:bg-black/20 transition-colors" />
            <div className="relative flex items-center gap-3 px-4 py-3 bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 shadow-sm overflow-hidden">
              <div className="relative flex items-center justify-center">
                <Navigation size={14} className="text-white rotate-45" />
                <span className="absolute inset-0 animate-ping bg-white/40 rounded-full scale-150" />
              </div>

              <div className="flex flex-col min-w-0">
                <span className="text-[10px] text-orange-100/70 font-bold uppercase tracking-widest leading-none mb-1">
                  Ubicación Actual
                </span>
                <span className="text-white text-xs sm:text-sm font-medium truncate pr-4">
                  {location}
                </span>
              </div>
              
              <div className="ml-auto h-8 w-[1px] bg-white/10" />
              <div className="pl-2">
                <MapPin size={16} className="text-white/60" />
              </div>
            </div>
          </div>

          <motion.div
            whileHover={{ scale: 1.01, backgroundColor: '#52ea90' }}
            className="w-full bg-[#4ade80] text-[#1e4d3a] font-black py-4 px-4 sm:px-6 rounded-xl sm:rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-green-900/10 transition-colors"
          >
            <span className="text-[12px] sm:text-[14px] uppercase tracking-wider">
              {offer}
            </span>
          </motion.div>

          <ApplyCardButton cardId={cardId} affiliateUrl={affiliateUrl} source="location_alert" />

        </div>
      </div>
    </motion.div>
  );
};