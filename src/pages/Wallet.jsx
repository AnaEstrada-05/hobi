import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, X, ArrowLeft, Star, Percent, Info, ChevronRight, Check, CreditCard, AlertTriangle } from 'lucide-react';
import { supabase } from '../services/supabaseClient';

// ---------------------------------------------------------------------------
// POPUP DE CONFIRMACIÓN DE ELIMINACIÓN
// Se renderiza sobre todo el contenido para evitar conflictos de eventos.
// ---------------------------------------------------------------------------
const DeleteConfirmPopup = ({ card, onConfirm, onCancel, isDeleting }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 z-[200] flex items-center justify-center p-6"
  >
    {/* Backdrop */}
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onCancel}
      className="absolute inset-0 bg-black/60 backdrop-blur-md"
    />

    {/* Panel */}
    <motion.div
      initial={{ scale: 0.85, opacity: 0, y: 20 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      exit={{ scale: 0.85, opacity: 0, y: 20 }}
      transition={{ type: 'spring', stiffness: 320, damping: 28 }}
      className="relative bg-white w-full max-w-sm rounded-[2.5rem] p-8 shadow-2xl text-slate-900 z-10"
    >
      {/* Ícono */}
      <div className="w-16 h-16 bg-rose-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
        <AlertTriangle size={32} className="text-rose-500" />
      </div>

      <h3 className="text-2xl font-black tracking-tighter text-center mb-2">
        ¿Eliminar tarjeta?
      </h3>
      <p className="text-slate-500 text-sm font-bold text-center mb-1">
        Estás por quitar
      </p>
      <p className="text-blue-600 font-black text-center text-base mb-6">
        {card.bank} — {card.name}
      </p>
      <p className="text-slate-400 text-xs text-center font-bold mb-8">
        Puedes volver a añadirla cuando quieras desde el catálogo.
      </p>

      <div className="flex gap-3">
        {/* Cancelar */}
        <button
          onClick={onCancel}
          disabled={isDeleting}
          className="flex-1 py-4 rounded-2xl bg-slate-100 text-slate-700 font-black text-sm hover:bg-slate-200 transition-colors disabled:opacity-50"
        >
          Cancelar
        </button>

        {/* Confirmar eliminar */}
        <button
          onClick={onConfirm}
          disabled={isDeleting}
          className="flex-1 py-4 rounded-2xl bg-rose-500 text-white font-black text-sm hover:bg-rose-600 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
        >
          {isDeleting ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <Trash2 size={16} />
          )}
          {isDeleting ? 'Eliminando...' : 'Sí, eliminar'}
        </button>
      </div>
    </motion.div>
  </motion.div>
);

// ---------------------------------------------------------------------------
// COMPONENTE PRINCIPAL — Wallet
// ---------------------------------------------------------------------------
const Wallet = ({ onBack }) => {
  const [cards, setCards] = useState([]);
  const [availableDb, setAvailableDb] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);

  // Estado del popup de confirmación de eliminación
  const [cardToDelete, setCardToDelete] = useState(null); // card object | null
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);

        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError) throw authError;

        // Billetera real del usuario
        const { data: userCardsData, error: walletError } = await supabase
          .from('User_Cards')
          .select(`
            card_id,
            Cards_Master (
              id,
              bank_name,
              card_name,
              annual_fee
            )
          `)
          .eq('user_id', user.id);
        if (walletError) throw walletError;

        // Catálogo completo para el modal
        const { data: cardsMaster, error: masterError } = await supabase
          .from('Cards_Master')
          .select('id, bank_name, card_name, annual_fee');
        if (masterError) throw masterError;

        const formatCard = (card) => {
          let color = "bg-gradient-to-br from-[#0f172a] to-[#1e293b]";
          let benefitsList = ["Hasta 9% en puntos BBVA", "Promociones a MSI", "Seguro de compra"];

          if (card.card_name.includes('LikeU')) {
            color = "bg-gradient-to-br from-[#2563eb] to-[#1e40af]";
            benefitsList = ["6% Farmacias", "5% Entretenimiento", "4% Gasolineras"];
          } else if (card.card_name.includes('Rappi')) {
            color = "bg-gradient-to-br from-rose-600 to-rose-900";
            benefitsList = ["5% en Rappi restaurantes", "3% en Rappi Travel", "1% Cashback general"];
          } else if (card.card_name.includes('Nu')) {
            color = "bg-gradient-to-br from-purple-600 to-purple-900";
            benefitsList = ["$0 Anualidad de por vida", "Descuentos por adelantar mensualidades", "Meses sin intereses en marcas seleccionadas"];
          }

          return {
            id: card.id,
            bank: card.bank_name,
            name: card.card_name,
            color,
            anualidad: card.annual_fee === 0 ? "$0 MXN" : `$${card.annual_fee.toLocaleString()} MXN`,
            benefits: benefitsList,
          };
        };

        setCards((userCardsData ?? []).map((row) => formatCard(row.Cards_Master)));
        setAvailableDb((cardsMaster ?? []).map(formatCard));

      } catch (err) {
        console.error("Error cargando Wallet:", err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  // ── PASO 1: el botón de basura abre el popup (no borra todavía) ───────────
  const handleDeleteRequest = (e, card) => {
    e.stopPropagation(); // Bloquea la apertura del modal de beneficios
    setCardToDelete(card);
  };

  // ── PASO 2: el usuario confirma en el popup → borramos en DB ─────────────
  const handleDeleteConfirm = async () => {
    if (!cardToDelete || isDeleting) return;
    setIsDeleting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await supabase
        .from('User_Cards')
        .delete()
        .eq('user_id', user.id)
        .eq('card_id', cardToDelete.id);
      if (error) throw error;

      setCards(prev => prev.filter(c => c.id !== cardToDelete.id));
      setCardToDelete(null);
    } catch (err) {
      console.error("Error eliminando tarjeta:", err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    if (isDeleting) return;
    setCardToDelete(null);
  };

  // ── AGREGAR ───────────────────────────────────────────────────────────────
  const addCardToWallet = async (cardTemplate) => {
    if (cards.find(c => c.id === cardTemplate.id)) return;
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await supabase
        .from('User_Cards')
        .insert({ user_id: user.id, card_id: cardTemplate.id });
      if (error) throw error;
      setCards(prev => [...prev, cardTemplate]);
      setIsModalOpen(false);
    } catch (err) {
      console.error("Error agregando tarjeta:", err.message);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-[#1e3a8a] flex flex-col items-center justify-center text-white z-[999]">
        <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin mb-4" />
        <p className="font-black tracking-widest text-[10px] uppercase opacity-70">Sincronizando Wallet con Supabase...</p>
      </div>
    );
  }

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
                  {/* FIX: handleDeleteRequest llama e.stopPropagation() antes de
                      cualquier setState, cortando el evento antes de que el
                      onClick del motion.div padre pueda dispararse */}
                  <button 
                    onClick={(e) => handleDeleteRequest(e, card)}
                    className="p-2.5 bg-black/10 hover:bg-rose-500 rounded-2xl transition-colors z-10"
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

      {/* MODAL PARA AGREGAR TARJETA DESDE LA BD */}
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
                {availableDb.map((cardTemplate) => {
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

      {/* DETALLES EXPANDIDOS DE LA TARJETA */}
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

      {/* POPUP DE CONFIRMACIÓN DE ELIMINACIÓN — z-[200] sobre todo lo demás */}
      <AnimatePresence>
        {cardToDelete && (
          <DeleteConfirmPopup
            card={cardToDelete}
            onConfirm={handleDeleteConfirm}
            onCancel={handleDeleteCancel}
            isDeleting={isDeleting}
          />
        )}
      </AnimatePresence>

    </motion.div>
  );
};

export default Wallet;