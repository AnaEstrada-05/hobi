import React from 'react';
import { motion } from 'framer-motion';
import { CreditCard, ChevronRight } from 'lucide-react';
import { CardToggle } from './CardSelection';

export const CardSelection = ({ cards, selected, onToggle, onFinish }) => (
  <div className="flex-1 flex flex-col pt-16 px-6 z-10 overflow-y-auto pb-40">
    <div className="max-w-md mx-auto w-full">
      <div className="flex items-center justify-between mb-10 text-white">
        <div className="flex flex-col">
          <h2 className="text-3xl font-black tracking-tighter leading-none">Tus Tarjetas</h2>
          <p className="text-blue-100/60 text-[10px] font-black uppercase tracking-widest mt-2">¿Cuáles usas hoy?</p>
        </div>
        <div className="p-4 bg-white/15 rounded-[1.8rem] border border-white/10"><CreditCard size={24} /></div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {cards.map(card => (
          <CardToggle 
            key={card.id} 
            card={card} 
            isSelected={selected.includes(card.id)} 
            onToggle={() => onToggle(card.id)} 
          />
        ))}
      </div>

      <motion.button 
        whileTap={{ scale: 0.95 }}
        onClick={onFinish}
        className={`fixed bottom-10 left-6 right-6 max-w-sm mx-auto py-6 rounded-[2.2rem] font-black text-lg transition-all shadow-2xl flex items-center justify-center gap-3 ${
          selected.length > 0 ? 'bg-white text-slate-900' : 'bg-white/10 text-white/20 pointer-events-none'
        }`}
      >
        COMENZAR AHORA <ChevronRight size={20} />
      </motion.button>
    </div>
  </div>
);