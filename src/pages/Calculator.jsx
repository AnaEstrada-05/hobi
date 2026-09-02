import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Utensils, Fuel, ShoppingCart, Calculator as CalcIcon, RefreshCcw, ArrowLeft } from 'lucide-react';
import { CategoryInput } from '../components/CategoryInput';
import { ResultCard } from '../components/ResultCard';
import { supabase } from '../services/supabaseClient';
import { trackEvent } from '../services/analytics';

export default function Calculator({ onBack }) {
  const [expenses, setExpenses] = useState({ restaurantes: '', gasolina: '', super: '' });
  const [cardsMatrix, setCardsMatrix] = useState([]);
  const [loading, setLoading] = useState(true);

  // Analítica: uso de la Calculadora — ver issue KIN-151.
  useEffect(() => {
    trackEvent('calculator_opened');
  }, []);

  useEffect(() => {
    const fetchMatrixData = async () => {
      try {
        setLoading(true);

        // 1. Traemos las tarjetas master
        const { data: masterData, error: masterError } = await supabase
          .from('Cards_Master')
          .select('id, bank_name, card_name, annual_fee, affiliate_url');

        if (masterError) throw masterError;

        // 2. Traemos la matriz de beneficios por separado (Evita errores de llaves foráneas)
        const { data: matrixData, error: matrixError } = await supabase
          .from('Benefits_Matrix')
          .select('card_id, category_id, percentage');

        if (matrixError) throw matrixError;

        // 3. Estructuramos el objeto relacional en memoria limpia
        const structuredCards = {};
        
        masterData.forEach(card => {
          let color = "bg-gradient-to-br from-[#0f172a] to-[#1e293b]"; // BBVA
          if (card.card_name.includes('LikeU')) color = "bg-rose-600";
          if (card.card_name.includes('Rappi')) color = "bg-orange-500";
          if (card.card_name.includes('Nu')) color = "bg-purple-600";

          structuredCards[card.id] = {
            id: card.id,
            name: `${card.bank_name} ${card.card_name}`,
            annualFee: card.annual_fee,
            affiliateUrl: card.affiliate_url,
            color: color,
            cashbackRates: { restaurantes: 0, gasolina: 0, super: 0 },
            // Antes, una tarjeta sin ninguna tarifa cargada en Benefits_Matrix
            // (ej. BBVA Azul, Nu Mastercard Gold, Plata Card) mostraba "$0 /
            // Faltan $0" — se veía como si la calculadora estuviera mal,
            // cuando en realidad simplemente no hay datos de cashback
            // cargados para esa tarjeta todavía. Estas dos banderas permiten
            // distinguir "no hay ningún dato" de "sí hay datos, pero no para
            // restaurantes/gasolina/súper".
            hasAnyBenefitData: false,
            hasCalculatorCategoryData: false,
          };
        });

        // 4. Cruzamos los porcentajes con base en el ID de categoría
        matrixData.forEach(row => {
          const card = structuredCards[row.card_id];
          if (!card) return;

          card.hasAnyBenefitData = true;
          const rateValue = row.percentage / 100;
          if (row.category_id === 1) { card.cashbackRates.restaurantes = rateValue; card.hasCalculatorCategoryData = true; }
          if (row.category_id === 2) { card.cashbackRates.gasolina = rateValue; card.hasCalculatorCategoryData = true; }
          if (row.category_id === 4) { card.cashbackRates.super = rateValue; card.hasCalculatorCategoryData = true; }
        });

        setCardsMatrix(Object.values(structuredCards));
      } catch (err) {
        console.error("Error construyendo matriz de calculadora:", err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMatrixData();
  }, []);

  const calculateCashback = (card) => {
    const res = (Number(expenses.restaurantes) || 0) * card.cashbackRates.restaurantes;
    const gas = (Number(expenses.gasolina) || 0) * card.cashbackRates.gasolina;
    const sup = (Number(expenses.super) || 0) * card.cashbackRates.super;
    return res + gas + sup;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center font-bold text-slate-400">
        <div className="w-10 h-10 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin mb-3" />
        <p className="text-xs uppercase tracking-wider font-black opacity-60">Sincronizando Matriz...</p>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }} 
      className="min-h-screen bg-gray-50 pb-40"
    >
      <motion.div 
        layoutId="blue-surface"
        className="bg-gradient-to-br from-[#1e3a8a] via-[#2563eb] to-[#0ea5e9] pt-16 pb-30 px-6 shadow-xl"
        style={{ borderRadius: "0px 0px 3.5rem 3.5rem" }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="max-w-xl text-white"
        >
          <div className="flex items-center gap-3 mb-4">
            <motion.button whileTap={{ scale: 0.9 }} onClick={onBack} className="p-2 hover:bg-white/10 rounded-full"><ArrowLeft size={24} /></motion.button>
            <div className="p-3 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/10"><CalcIcon size={24} /></div>
            <h1 className="text-3xl font-black tracking-tighter">Calculadora</h1>
          </div>
        </motion.div>
      </motion.div>

      <div className="max-w-xl mx-auto px-6 -mt-20 space-y-4 z-10 relative">
        <CategoryInput label="Restaurantes" icon={Utensils} value={expenses.restaurantes} onChange={(v)=>setExpenses({...expenses, restaurantes:v})} />
        <CategoryInput label="Gasolina" icon={Fuel} value={expenses.gasolina} onChange={(v)=>setExpenses({...expenses, gasolina:v})} />
        <CategoryInput label="Súper" icon={ShoppingCart} value={expenses.super} onChange={(v)=>setExpenses({...expenses, super:v})} />

        <div className="pt-8 flex items-center justify-between">
          <h2 className="text-xl font-black text-slate-900 tracking-tight">Comparativa Anual</h2>
          <button onClick={() => setExpenses({restaurantes: '', gasolina: '', super: ''})} className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors">
            <RefreshCcw size={20} />
          </button>
        </div>

        <div className="space-y-2">
          {cardsMatrix.map(card => (
            <ResultCard
              key={card.id}
              card={card}
              cashbackEarned={calculateCashback(card)}
              hasAnyBenefitData={card.hasAnyBenefitData}
              hasCalculatorCategoryData={card.hasCalculatorCategoryData}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}