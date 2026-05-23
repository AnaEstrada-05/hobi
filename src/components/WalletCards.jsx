import React from 'react';
import { motion } from 'framer-motion';
import { Trash2, Info } from 'lucide-react';
import { CreditCard } from 'lucide-react';

export const WalletCard = ({ card, onSelect, onDelete }) => (
  <motion.div
    layout
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, x: -100 }}
    onClick={() => onSelect(card)}
    className={`relative p-7 rounded-[2.5rem] h-48 flex flex-col justify-between shadow-2xl cursor-pointer transform active:scale-95 transition-all ${card.color}`}
  >
    <div className="flex justify-between items-start">
      <div className="bg-white/15 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest">
        {card.bank}
      </div>
      <button 
        onClick={(e) => {
          e.stopPropagation();
          onDelete(card.id);
        }} 
        className="p-2.5 bg-black/10 hover:bg-rose-500 rounded-2xl transition-colors"
      >
        <Trash2 size={18} />
      </button>
    </div>
    <div className="mt-auto">
      <h3 className="text-2xl font-black mb-1">{card.name}</h3>
      <div className="flex items-center gap-2 text-[10px] opacity-70">
        <Info size={12} /> Detalles y beneficios
      </div>
      <CreditCard size={80} className="absolute -right-6 -bottom-6 text-white/10 -rotate-12 pointer-events-none" />
    </div>
  </motion.div>
);