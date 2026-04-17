import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Zap, Trash2, LayoutGrid, X, ArrowLeft, Star, Percent, Info, ChevronRight, Check, CreditCard } from 'lucide-react';

const AVAILABLE_CARDS_DB = [
  { 
    id: 'santander-likeu', 
    bank: "Santander", 
    name: "LikeU", 
    color: "bg-gradient-to-br from-[#2563eb] to-[#1e40af]",
    benefits: ["5% Entretenimiento", "4% Gasolina", "6% Farmacias"],
    anualidad: "$0 (Gasto mínimo $200)"
  },
  { 
    id: 'bbva-azul', 
    bank: "BBVA", 
    name: "Azul", 
    color: "bg-gradient-to-br from-[#0f172a] to-[#1e293b]",
    benefits: ["9% Puntos BBVA", "Promociones a MSI", "Seguro de Compra"],
    anualidad: "$699 + IVA"
  },
  { 
    id: 'amex-gold', 
    bank: "Amex", 
    name: "Gold Elite", 
    color: "bg-gradient-to-br from-amber-600 to-amber-800",
    benefits: ["3% en Supermercados", "MSI automáticos", "Seguro de Viajes"],
    anualidad: "$3,500 + IVA"
  },
  { 
    id: 'nu-mexico', 
    bank: "Nu", 
    name: "Morada", 
    color: "bg-gradient-to-br from-purple-600 to-purple-900",
    benefits: ["Sin anualidad", "Cajeros ilimitados", "Atención 24/7"],
    anualidad: "$0"
  }
];

const Wallet = ({ onBack }) => {
  const [cards, setCards] = useState([AVAILABLE_CARDS_DB[0], AVAILABLE_CARDS_DB[1]]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);

  const addCardToWallet = (cardTemplate) => {
    if (!cards.find(c => c.id === cardTemplate.id)) {
      setCards([...cards, cardTemplate]);
      setIsModalOpen(false);
    }
  };

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
        className="pt-16 px-6 max-w-xl mx-auto pb-40"
      >
        <div className="flex justify-between items-center mb-10">
          <motion.button whileTap={{ scale: 0.9 }} onClick={onBack} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <ArrowLeft size={28} />
          </motion.button>
          <h1 className="text-3xl font-black tracking-tighter">Mi Wallet</h1>
          <motion.button 
            whileTap={{ scale: 0.9 }} 
            onClick={() => setIsModalOpen(true)}
            className="p-4 bg-white/15 rounded-2xl border border-white/20"
          >
            <Plus size={24} strokeWidth={3} />
          </motion.button>
        </div>

        <div className="space-y-6">
          <AnimatePresence mode="popLayout">
            {cards.map(card => (
              <motion.div
                key={card.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, x: -100 }}
                onClick={() => setSelectedCard(card)}
                className={`relative overflow-hidden p-7 rounded-[2.5rem] h-48 flex flex-col justify-between shadow-2xl cursor-pointer transform active:scale-95 transition-all ${card.color}`}
              >
                <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:opacity-40 transition-opacity">
                  <CreditCard size={80} strokeWidth={1} className="-rotate-12 translate-x-8 -translate-y-4" />
                </div>
                <div className="flex justify-between items-start">
                   <div className="bg-white/15 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest">{card.bank}</div>
                   <button 
                     onClick={(e) => {
                       e.stopPropagation();
                       setCards(cards.filter(c => c.id !== card.id));
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
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </motion.div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsModalOpen(false)} className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }} 
              animate={{ scale: 1, opacity: 1, y: 0 }} 
              exit={{ scale: 0.9, opacity: 0, y: 20 }} 
              className="relative bg-white w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl text-slate-900 overflow-hidden flex flex-col max-h-[80vh]"
            >
               <div className="flex justify-between items-center mb-6">
                 <h2 className="text-xl font-black tracking-tight">Agregar Tarjeta</h2>
                 <button onClick={() => setIsModalOpen(false)} className="p-2 bg-slate-100 rounded-full hover:bg-slate-200">
                   <X size={20} />
                 </button>
               </div>
               
               <div className="overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                 {AVAILABLE_CARDS_DB.map((cardTemplate) => {
                   const isAlreadyAdded = cards.some(c => c.id === cardTemplate.id);
                   return (
                     <motion.button
                       key={cardTemplate.id}
                       disabled={isAlreadyAdded}
                       onClick={() => addCardToWallet(cardTemplate)}
                       whileTap={isAlreadyAdded ? {} : { scale: 0.97 }}
                       className={`w-full flex items-center justify-between p-4 rounded-2xl border-2 transition-all ${
                         isAlreadyAdded 
                         ? 'bg-slate-50 border-slate-100 opacity-60 cursor-not-allowed' 
                         : 'bg-white border-slate-100 hover:border-blue-500 active:bg-blue-50'
                       }`}
                     >
                       <div className="flex items-center gap-4">
                         <div className={`w-12 h-8 rounded-md shadow-sm ${cardTemplate.color}`} />
                         <div className="text-left">
                           <p className="text-[10px] font-black text-slate-400 uppercase leading-none">{cardTemplate.bank}</p>
                           <p className="text-sm font-black text-slate-900">{cardTemplate.name}</p>
                         </div>
                       </div>
                       {isAlreadyAdded ? <Check size={18} className="text-emerald-500" /> : <ChevronRight size={18} className="text-slate-300" />}
                     </motion.button>
                   );
                 })}
               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedCard && (
          <div className="fixed inset-0 z-[120] flex items-end sm:items-center justify-center p-0 sm:p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedCard(null)} className="absolute inset-0 bg-black/60 backdrop-blur-md" />
            <motion.div 
              layoutId={`card-${selectedCard.id}`}
              className="relative bg-white w-full max-w-lg rounded-t-[3rem] sm:rounded-[3rem] p-10 text-slate-900 shadow-2xl"
            >
               <div className="flex justify-between items-start mb-8">
                 <div>
                   <span className="text-blue-600 font-black text-xs uppercase tracking-[0.2em]">{selectedCard.bank}</span>
                   <h2 className="text-4xl font-black tracking-tighter">{selectedCard.name}</h2>
                 </div>
                 <button onClick={() => setSelectedCard(null)} className="p-3 bg-slate-100 rounded-full hover:bg-slate-200">
                   <X size={24} />
                 </button>
               </div>
               <div className="space-y-8">
                 <div>
                    <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2"><Percent size={14} /> Beneficios Principales</h4>
                    <div className="grid gap-3">
                      {selectedCard.benefits.map((benefit, i) => (
                        <div key={i} className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                          <div className="w-2 h-2 bg-blue-500 rounded-full" />
                          <span className="font-bold text-slate-700">{benefit}</span>
                        </div>
                      ))}
                    </div>
                 </div>
                 <div className="pt-6 border-t border-slate-100 flex justify-between items-center">
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Anualidad</p>
                      <p className="text-lg font-black text-slate-900">{selectedCard.anualidad}</p>
                    </div>
                    <div className="p-4 bg-amber-50 rounded-2xl text-amber-600"><Star size={24} fill="currentColor" /></div>
                 </div>
               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Wallet;