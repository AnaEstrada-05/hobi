import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { CreditCard, Calculator, ChevronRight, LayoutGrid } from 'lucide-react';

const ActionCard = ({ title, subtitle, icon: Icon, delay = 0, onClick }) => (
  <motion.button 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.8, delay, ease: [0.22, 1, 0.36, 1] }}
    onClick={onClick}
    className="relative overflow-hidden bg-white/70 backdrop-blur-xl border border-white/60 p-5 rounded-[2.5rem] flex flex-col gap-4 shadow-[0_10px_30px_rgba(0,0,0,0.03)] text-left group w-full"
  >
    <div className="relative z-10 bg-slate-900 w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg group-hover:bg-blue-600 transition-colors">
      <Icon size={22} strokeWidth={2} />
    </div>
    <div className="relative z-10 flex flex-col gap-1">
      <div className="flex items-center justify-between">
        <h4 className="font-black text-slate-900 text-[15px] tracking-tight">{title}</h4>
        <ChevronRight size={14} className="text-slate-400 group-hover:text-slate-900 transition-colors" />
      </div>
      <p className="text-slate-500 text-[11px] font-medium uppercase tracking-wider">{subtitle}</p>
    </div>
  </motion.button>
);

export const QuickActions = () => {
  const navigate = useNavigate();

  return (
    <div className="w-full py-2">
      <div className="flex items-center gap-2 mb-4">
        <div className="bg-white p-1.5 shadow-sm rounded-lg border border-slate-100 ml-1">
          <LayoutGrid size={16} className="text-slate-600" />
        </div>
        <h2 className="text-lg font-black text-slate-900 tracking-tight">Acciones rápidas</h2>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <ActionCard title="Tarjetas" subtitle="Gestionar" icon={CreditCard} delay={0.1} onClick={() => navigate('/wallet')} />
        <ActionCard title="Calculadora" subtitle="Gastos" icon={Calculator} delay={0.2} onClick={() => navigate('/calculadora')} />
      </div>
    </div>
  );
};