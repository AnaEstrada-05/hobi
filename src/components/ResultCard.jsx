import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import { ApplyCardButton } from './ApplyCardButton';

export const ResultCard = ({ card, cashbackEarned }) => {
  const annualCashback = (cashbackEarned || 0) * 12;
  const isProfitable = annualCashback > card.annualFee;
  const netProfit = annualCashback - card.annualFee;

  return (
    <motion.div layout className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-xl overflow-hidden relative mb-4">
      {isProfitable && (
        <div className="absolute top-0 right-0 bg-emerald-500 text-white px-4 py-1.5 rounded-bl-2xl text-[10px] font-black uppercase tracking-tighter">
          Rentable
        </div>
      )}
      <div className="flex items-center gap-3 mb-4">
        <div className={`w-3 h-3 rounded-full ${card.color}`} />
        <h3 className="font-black text-slate-900">{card.name}</h3>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-[9px] font-bold text-slate-400 uppercase">Cashback Anual</p>
          <p className="text-xl font-black text-slate-900">${annualCashback.toLocaleString()}</p>
        </div>
        <div>
          <p className="text-[9px] font-bold text-slate-400 uppercase">Anualidad</p>
          <p className="text-xl font-black text-slate-900">${card.annualFee.toLocaleString()}</p>
        </div>
      </div>
      <div className={`mt-5 p-4 rounded-2xl flex items-center gap-3 ${isProfitable ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
        {isProfitable ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
        <p className="text-[11px] font-bold">
          {isProfitable
            ? `¡Ganancia de $${netProfit.toLocaleString()}!`
            : `Faltan $${Math.abs(netProfit).toLocaleString()}`}
        </p>
      </div>

      <ApplyCardButton cardId={card.id} affiliateUrl={card.affiliateUrl} source="calculator" className="mt-4" />
    </motion.div>
  );
};