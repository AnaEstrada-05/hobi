import React from 'react';
import { motion } from 'framer-motion';
import { CreditCard, ExternalLink } from 'lucide-react';

const CreditCardItem = ({ bank, name, annualFee, color, delay }) => (
  <motion.div
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ duration: 0.8, delay, ease: [0.22, 1, 0.36, 1] }}
    whileHover={{ scale: 1.02 }}
    className={`relative overflow-hidden p-6 rounded-[2.5rem] text-white shadow-xl mb-4 h-44 flex flex-col justify-between group cursor-pointer ${color}`}
  >
    <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:opacity-40 transition-opacity">
      <CreditCard size={80} strokeWidth={1} className="-rotate-12 translate-x-8 -translate-y-4" />
    </div>

    <div className="relative z-10 flex justify-between items-start">
      <div>
        <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-white/80 mb-1">{bank}</p>
        <h3 className="text-xl font-black tracking-tight">{name}</h3>
      </div>
    </div>

    <div className="relative z-10 flex justify-between items-end">
      <div className="bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/20">
        <p className="text-[10px] font-medium text-white/90">
          Anualidad: <span className="font-bold text-white">${annualFee} MXN</span>
        </p>
      </div>
    </div>
  </motion.div>
);

// Recibimos la función onSeeAll como prop
export const CardList = ({ onSeeAll }) => {
  const myCards = [
    {
      id: 1,
      bank: "Santander",
      name: "Santander LikeU",
      annualFee: "1,200",
      color: "bg-gradient-to-br from-[#1e40af] to-[#2563eb]", 
    },
    {
      id: 2,
      bank: "BBVA",
      name: "BBVA Azul",
      annualFee: "800",
      color: "bg-gradient-to-br from-[#0f172a] to-[#1e293b]", 
    }
  ];

  return (
    <div className="w-full mt-10">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-black text-slate-900 tracking-tight">Mis tarjetas</h2>
          <span className="bg-slate-100 text-slate-500 text-[10px] font-bold px-2 py-0.5 rounded-full">
            {myCards.length}
          </span>
        </div>
        {/* Ejecutamos la función al hacer click */}
        <button 
          onClick={onSeeAll}
          className="text-blue-600 text-sm font-bold flex items-center gap-1 hover:text-blue-800 transition-colors"
        >
          Ver todas
          <ExternalLink size={14} />
        </button>
      </div>

      <div className="flex flex-col">
        {myCards.map((card, index) => (
          <CreditCardItem 
            key={card.id} 
            {...card} 
            delay={0.2 * index} 
          />
        ))}
      </div>
    </div>
  );
};