import React from 'react';
import { Bell, Wallet, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

export const HomeHeader = ({ name, onNotificationClick, onWalletClick, onAlertsClick }) => {
  return (
    <motion.div 
      layoutId="blue-surface"
      className="relative bg-gradient-to-br from-[#1e3a8a] via-[#2563eb] to-[#0ea5e9] text-white pt-12 pb-20 px-6 shadow-xl z-10"
      style={{ borderRadius: "0px 0px 50px 50px" }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }}
      >
        <div className="relative z-10 max-w-7xl mx-auto">
          <div className="flex justify-between items-center">
            <motion.button 
              whileTap={{ scale: 0.9 }}
              onClick={onWalletClick}
              className="bg-white/10 p-2.5 rounded-xl backdrop-blur-xl border border-white/10 shadow-lg"
            >
              <Wallet size={22} strokeWidth={1.5} />
            </motion.button>

            <div className="relative">
              <motion.button 
                whileTap={{ scale: 0.9 }}
                onClick={onAlertsClick}
                className="p-2 bg-white/5 rounded-full hover:bg-white/15"
              >
                <Bell size={22} strokeWidth={1.5} />
              </motion.button>
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-cyan-300 rounded-full animate-pulse" />
            </div>
          </div>

          <div className="mt-8">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles size={12} className="text-blue-200" />
              <span className="text-[9px] uppercase tracking-[0.2em] font-bold text-blue-100/70">Dashboard</span>
            </div>
            <motion.h1 className="text-3xl font-black tracking-tighter">¡Hola, {name}!</motion.h1>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};