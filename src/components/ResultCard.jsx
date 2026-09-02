import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, AlertCircle, HelpCircle } from 'lucide-react';
import { ApplyCardButton } from './ApplyCardButton';

// Antes, una tarjeta sin ninguna tarifa cargada en Benefits_Matrix (ej.
// BBVA Azul, Nu Mastercard Gold) mostraba "$0 / Faltan $0" — matemáticamente
// correcto dado el dato vacío, pero se ve como si la calculadora estuviera
// mal, justo en tarjetas que la gente sabe que sí dan cashback en la vida
// real. Ahora se distingue "no hay ningún dato cargado" de "sí hay datos,
// pero no para restaurantes/gasolina/súper" del resultado normal.
export const ResultCard = ({ card, cashbackEarned, hasAnyBenefitData, hasCalculatorCategoryData }) => {
  const annualCashback = (cashbackEarned || 0) * 12;
  const isProfitable = annualCashback > card.annualFee;
  const netProfit = annualCashback - card.annualFee;

  return (
    <motion.div layout className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-xl overflow-hidden relative mb-4">
      {isProfitable && hasCalculatorCategoryData && (
        <div className="absolute top-0 right-0 bg-emerald-500 text-white px-4 py-1.5 rounded-bl-2xl text-[10px] font-black uppercase tracking-tighter">
          Rentable
        </div>
      )}
      <div className="flex items-center gap-3 mb-4">
        <div className={`w-3 h-3 rounded-full ${card.color}`} />
        <h3 className="font-black text-slate-900">{card.name}</h3>
      </div>

      {!hasAnyBenefitData ? (
        <div className="p-4 rounded-2xl flex items-center gap-3 bg-slate-50 text-slate-500">
          <HelpCircle size={18} />
          <p className="text-[11px] font-bold">Todavía no tenemos los datos de cashback de esta tarjeta.</p>
        </div>
      ) : !hasCalculatorCategoryData ? (
        <div className="p-4 rounded-2xl flex items-center gap-3 bg-slate-50 text-slate-500">
          <HelpCircle size={18} />
          <p className="text-[11px] font-bold">Esta tarjeta no da cashback en restaurantes, gasolina o súper.</p>
        </div>
      ) : (
        <>
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
        </>
      )}

      {/* Fuera del condicional a propósito: puedes solicitar la tarjeta
          aunque todavía no tengamos sus datos de cashback cargados. */}
      <ApplyCardButton cardId={card.id} affiliateUrl={card.affiliateUrl} source="calculator" className="mt-4" />
    </motion.div>
  );
};
