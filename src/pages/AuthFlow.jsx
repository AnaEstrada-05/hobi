import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ChevronRight,
    Check,
    CreditCard,
    ArrowLeft,
    Mail,
    User,
    Lock,
} from 'lucide-react';
import logo from "../assets/logo_white.png";
import { supabase } from '../services/supabaseClient';

// ---------------------------------------------------------------------------
// Sub-componentes de UI (sin cambios de diseño)
// ---------------------------------------------------------------------------

const LogoHeader = ({ title, subtitle }) => (
    <div className="mb-50 text-center flex flex-col items-center">
        <img src={logo} alt="Hobi logo" className="w-50 h-50 object-contain" />
        <h1 className="text-5xl font-black text-white tracking-tighter leading-none mb-3">{title}</h1>
        <p className="text-blue-100/70 font-bold uppercase text-[10px] tracking-[0.2em]">{subtitle}</p>
    </div>
);

// SPEC §6 — Control de Concurrencia: disabled={loading} aplicado en todos los
// botones de disparo para mitigar el error "Email rate limit exceeded".
const ActionButton = ({ text, onClick, variant = 'outline', disabled = false }) => (
    <button
        onClick={onClick}
        disabled={disabled}
        className={`w-full py-5 rounded-[1.8rem] font-black text-sm tracking-widest active:scale-[0.97] transition-all shadow-xl ${
            variant === 'white'
                ? 'bg-white text-blue-600 disabled:bg-white/50 disabled:cursor-not-allowed'
                : 'bg-white/5 text-white border border-white/10 disabled:opacity-50 disabled:cursor-not-allowed'
        }`}
    >
        {text}
    </button>
);

const InputGroup = ({ icon, ...props }) => (
    <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md rounded-[1.8rem] px-6 border border-white/10 focus-within:bg-white/20 transition-all shadow-inner">
        <div className="text-white/40">{icon}</div>
        <input
            {...props}
            className="w-full bg-transparent py-5 font-bold text-white placeholder:text-white/30 outline-none text-sm"
        />
    </div>
);

const CardToggle = ({ card, isSelected, onToggle }) => (
    <motion.div
        layout
        whileTap={{ scale: 0.98 }}
        onClick={onToggle}
        className={`relative p-7 rounded-[2.5rem] h-44 flex flex-col justify-between transition-all duration-300 border-4 cursor-pointer overflow-hidden shadow-2xl ${
            isSelected
                ? 'border-white scale-[1.02] shadow-black/30'
                : 'border-white/5 opacity-60'
        } ${card.color}`}
    >
        <div className="flex justify-between items-start relative z-10">
            <div className="bg-white/20 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest text-white backdrop-blur-sm">
                {card.bank}
            </div>
            <div className={`p-2.5 rounded-2xl transition-all ${
                isSelected ? 'bg-white text-blue-600 scale-110 shadow-lg' : 'bg-black/10 text-white/20'
            }`}>
                <Check size={18} strokeWidth={4} />
            </div>
        </div>

        <div className="mt-auto relative z-10">
            <h4 className="text-2xl font-black text-white leading-tight">{card.name}</h4>
            <p className="text-[10px] font-bold text-white/50 uppercase tracking-tighter mt-1">
                {isSelected ? 'Seleccionada' : 'Tocar para añadir'}
            </p>
        </div>

        <CreditCard size={90} className="absolute -right-6 -bottom-6 text-white/10 -rotate-12 pointer-events-none" />
    </motion.div>
);

// ---------------------------------------------------------------------------
// Componente principal
// ---------------------------------------------------------------------------

export default function AuthFlow({ onFinish }) {
    const [view, setView] = useState('landing');
    const [availableCards, setAvailableCards] = useState([]);
    const [selectedCards, setSelectedCards] = useState([]);
    const [loading, setLoading] = useState(false);

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    // CORRECCIÓN CRÍTICA §6: El uid del usuario recién creado en signUp se
    // persiste en estado local para poder usarlo en el bulk insert posterior.
    // Sin este estado, el uid se perdería al navegar a la vista 'cards'.
    const [newUserUid, setNewUserUid] = useState(null);

    // Catálogo de tarjetas disponibles desde Supabase (Cards_Master)
    useEffect(() => {
        const fetchCards = async () => {
            try {
                const { data, error } = await supabase
                    .from('Cards_Master')
                    .select('id, bank_name, card_name');
                if (error) throw error;

                const formatted = data.map((card) => {
                    let color = 'bg-gradient-to-br from-[#0f172a] to-[#1e293b]';
                    if (card.card_name.includes('LikeU'))  color = 'bg-gradient-to-br from-[#2563eb] to-[#1e40af]';
                    if (card.card_name.includes('Rappi'))  color = 'bg-gradient-to-br from-rose-600 to-rose-900';
                    if (card.card_name.includes('Nu'))     color = 'bg-gradient-to-br from-purple-800 to-purple-600';

                    return { id: card.id, bank: card.bank_name, name: card.card_name, color };
                });

                setAvailableCards(formatted);
            } catch (err) {
                console.error('Error cargando tarjetas en registro:', err.message);
            }
        };
        fetchCards();
    }, []);

    const toggleCard = (id) => {
        setSelectedCards((prev) =>
            prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
        );
    };

    // -----------------------------------------------------------------------
    // SPEC §6 — Manejo de Login y Signup con disabled={loading}
    // -----------------------------------------------------------------------
    const handleAuthAction = async () => {
        setErrorMessage('');
        setLoading(true);
        try {
            if (view === 'login') {
                const { error } = await supabase.auth.signInWithPassword({ email, password });
                if (error) throw error;
                onFinish();
            } else if (view === 'signup') {
                const { data, error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: { data: { full_name: fullName } },
                });
                if (error) throw error;

                // Supabase puede regresar user:null sin error (p. ej. email
                // duplicado con confirmación pendiente). Sin este guard,
                // data.user.id truena con un TypeError en crudo.
                if (!data.user) {
                    throw new Error(
                        'No pudimos crear la cuenta con ese correo. Prueba con otro o inicia sesión si ya tienes una cuenta.'
                    );
                }

                // CORRECCIÓN CRÍTICA: persistimos el uid antes de cambiar de vista
                // para que handleFinishRegistration pueda usarlo en el bulk insert.
                setNewUserUid(data.user.id);
                setView('cards');
            }
        } catch (err) {
            setErrorMessage(err.message || 'Ocurrió un error inesperado.');
        } finally {
            setLoading(false);
        }
    };

    // -----------------------------------------------------------------------
    // SPEC §6 — Bulk Insert en User_Cards antes de invocar onFinish()
    // -----------------------------------------------------------------------
    const handleFinishRegistration = async () => {
        if (selectedCards.length === 0 || !newUserUid) return;

        setLoading(true);
        setErrorMessage('');
        try {
            // Mapeamos el arreglo de IDs seleccionados al shape exacto de
            // la tabla User_Cards: { user_id: uuid, card_id: int8 }
            const rows = selectedCards.map((cardId) => ({
                user_id: newUserUid,
                card_id: cardId,
            }));

            const { error } = await supabase.from('User_Cards').insert(rows);
            if (error) throw error;

            // Solo invocamos onFinish() tras confirmar el insert exitoso.
            onFinish();
        } catch (err) {
            setErrorMessage(
                err.message || 'Error guardando tu billetera. Inténtalo de nuevo.'
            );
        } finally {
            setLoading(false);
        }
    };

    // -----------------------------------------------------------------------
    // Recuperar contraseña
    // -----------------------------------------------------------------------
    const [resetSent, setResetSent] = useState(false);

    const handleForgotPassword = async () => {
        setErrorMessage('');
        if (!email) {
            setErrorMessage('Escribe tu correo primero.');
            return;
        }
        setLoading(true);
        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: window.location.origin,
            });
            if (error) throw error;
            setResetSent(true);
        } catch (err) {
            setErrorMessage(err.message || 'No pudimos enviar el correo de recuperación.');
        } finally {
            setLoading(false);
        }
    };

    const navigateTo = (destination) => {
        setErrorMessage('');
        setResetSent(false);
        setView(destination);
    };

    const variants = {
        initial: { opacity: 0, x: 20 },
        animate: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: -20 },
    };

    // -----------------------------------------------------------------------
    // Render
    // -----------------------------------------------------------------------
    return (
        <div className="min-h-screen bg-gradient-to-br from-[#1e3a8a] via-[#2563eb] to-[#0ea5e9] flex flex-col relative overflow-hidden font-sans">
            <div className="absolute -right-20 -top-20 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -left-20 -bottom-20 w-64 h-64 bg-black/10 rounded-full blur-3xl pointer-events-none" />

            <AnimatePresence mode="wait">

                {/* ── LANDING ─────────────────────────────────────────────── */}
                {view === 'landing' && (
                    <motion.div key="landing" {...variants} className="flex-1 flex flex-col justify-center px-8 z-10">
                        <div className="max-w-md mx-auto w-full text-center">
                            <LogoHeader title="Hobi" subtitle="Maximiza cada compra" />
                            <div className="space-y-4 mt-12">
                                <ActionButton
                                    text="INICIAR SESIÓN"
                                    variant="white"
                                    onClick={() => navigateTo('login')}
                                />
                                <ActionButton
                                    text="CREAR CUENTA"
                                    onClick={() => navigateTo('signup')}
                                />
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* ── LOGIN / SIGNUP ───────────────────────────────────────── */}
                {(view === 'login' || view === 'signup') && (
                    <motion.div key="form" {...variants} className="flex-1 flex flex-col pt-16 pb-10 px-8 z-10 overflow-y-auto">
                        {/* Encabezado: siempre arriba, tamaño fijo — la flecha
                            nunca se mueve sin importar cuántos campos haya. */}
                        <div className="max-w-md mx-auto w-full">
                            {/* SPEC §6 — disabled={loading} en botón de retroceso
                                para evitar navegación durante una llamada activa */}
                            <button
                                onClick={() => navigateTo('landing')}
                                disabled={loading}
                                className="mb-8 p-3 bg-white/10 rounded-full text-white w-fit leading-none flex items-center justify-center transition-transform active:scale-90 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <ArrowLeft size={20} />
                            </button>

                            <h2 className="text-4xl font-black text-white tracking-tighter mb-2 leading-none">
                                {view === 'login' ? 'Bienvenido de vuelta' : 'Crea tu perfil'}
                            </h2>
                            <p className="text-blue-100/60 font-bold uppercase text-[10px] tracking-[0.2em]">
                                {view === 'login' ? 'Ingresa tus datos' : 'Únete a la comunidad'}
                            </p>
                        </div>

                        {/* Campos + botón centrados en el espacio que queda
                            debajo del encabezado (no pegados al borde). */}
                        <div className="flex-1 flex flex-col justify-center">
                            <div className="max-w-md mx-auto w-full space-y-4">
                                {errorMessage && (
                                    <div className="p-4 bg-rose-500/20 border border-rose-500/30 rounded-2xl text-rose-200 text-xs font-bold">
                                        {errorMessage}
                                    </div>
                                )}

                                {view === 'signup' && (
                                    <InputGroup
                                        icon={<User size={18} />}
                                        placeholder="Nombre completo"
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                        disabled={loading}
                                    />
                                )}
                                <InputGroup
                                    icon={<Mail size={18} />}
                                    placeholder="Email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    disabled={loading}
                                />
                                <InputGroup
                                    icon={<Lock size={18} />}
                                    placeholder="Contraseña"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    disabled={loading}
                                />

                                {view === 'login' && (
                                    <button
                                        onClick={() => navigateTo('forgot')}
                                        disabled={loading}
                                        className="w-full text-right text-blue-100/60 text-xs font-bold hover:text-white transition-colors disabled:opacity-50"
                                    >
                                        ¿Olvidaste tu contraseña?
                                    </button>
                                )}

                                <ActionButton
                                    text={loading ? 'PROCESANDO...' : (view === 'login' ? 'ENTRAR' : 'CONTINUAR')}
                                    variant="white"
                                    disabled={loading}
                                    onClick={handleAuthAction}
                                />
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* ── RECUPERAR CONTRASEÑA ─────────────────────────────────── */}
                {view === 'forgot' && (
                    <motion.div key="forgot" {...variants} className="flex-1 flex flex-col pt-16 pb-10 px-8 z-10 overflow-y-auto">
                        {/* Encabezado: siempre arriba, tamaño fijo */}
                        <div className="max-w-md mx-auto w-full">
                            <button
                                onClick={() => navigateTo('login')}
                                disabled={loading}
                                className="mb-8 p-3 bg-white/10 rounded-full text-white w-fit leading-none flex items-center justify-center transition-transform active:scale-90 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <ArrowLeft size={20} />
                            </button>

                            <h2 className="text-4xl font-black text-white tracking-tighter mb-2 leading-none">
                                Recupera tu acceso
                            </h2>
                            <p className="text-blue-100/60 font-bold uppercase text-[10px] tracking-[0.2em]">
                                Te mandamos un link a tu correo
                            </p>
                        </div>

                        {/* Campo + botón centrados en el espacio debajo del encabezado. */}
                        <div className="flex-1 flex flex-col justify-center">
                            <div className="max-w-md mx-auto w-full space-y-4">
                                {errorMessage && (
                                    <div className="p-4 bg-rose-500/20 border border-rose-500/30 rounded-2xl text-rose-200 text-xs font-bold">
                                        {errorMessage}
                                    </div>
                                )}

                                {resetSent ? (
                                    <div className="p-4 bg-emerald-500/20 border border-emerald-500/30 rounded-2xl text-emerald-100 text-xs font-bold">
                                        Listo, revisa <span className="text-white">{email}</span> — te mandamos un link para poner una contraseña nueva. Si no lo ves, checa spam.
                                    </div>
                                ) : (
                                    <>
                                        <InputGroup
                                            icon={<Mail size={18} />}
                                            placeholder="Email"
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            disabled={loading}
                                        />
                                        <ActionButton
                                            text={loading ? 'ENVIANDO...' : 'ENVIAR LINK DE RECUPERACIÓN'}
                                            variant="white"
                                            disabled={loading}
                                            onClick={handleForgotPassword}
                                        />
                                    </>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* ── SELECCIÓN DE TARJETAS ────────────────────────────────── */}
                {view === 'cards' && (
                    <motion.div key="cards" {...variants} className="flex-1 flex flex-col pt-16 px-6 z-10 overflow-y-auto pb-40">
                        <div className="max-w-md mx-auto w-full">
                            <div className="flex items-center justify-between mb-10 text-white">
                                <div className="flex flex-col">
                                    <h2 className="text-3xl font-black tracking-tighter leading-none">Tus Tarjetas</h2>
                                    <p className="text-blue-100/60 text-[10px] font-black uppercase tracking-widest mt-2">
                                        ¿Cuáles usas hoy?
                                    </p>
                                </div>
                                <div className="p-4 bg-white/15 rounded-3xl border border-white/10">
                                    <CreditCard size={24} />
                                </div>
                            </div>

                            {errorMessage && (
                                <div className="mb-6 p-4 bg-rose-500/20 border border-rose-500/30 rounded-2xl text-rose-200 text-xs font-bold">
                                    {errorMessage}
                                </div>
                            )}

                            <div className="grid grid-cols-1 gap-6">
                                {availableCards.map((card) => (
                                    <CardToggle
                                        key={card.id}
                                        card={card}
                                        isSelected={selectedCards.includes(card.id)}
                                        onToggle={() => !loading && toggleCard(card.id)}
                                    />
                                ))}
                            </div>

                            {/* SPEC §6 — Bulk Insert: handleFinishRegistration ejecuta el
                                insert en User_Cards antes de invocar onFinish().
                                El botón es inerte mientras loading=true o no hay selección. */}
                            <motion.button
                                whileTap={{ scale: 0.95 }}
                                onClick={handleFinishRegistration}
                                disabled={loading || selectedCards.length === 0}
                                className={`fixed bottom-10 left-6 right-6 max-w-sm mx-auto py-5 rounded-[2rem] font-black text-sm tracking-widest transition-all shadow-2xl flex items-center justify-center gap-3 ${
                                    selectedCards.length > 0 && !loading
                                        ? 'bg-white text-blue-600'
                                        : 'bg-white/10 text-white/20 pointer-events-none'
                                }`}
                            >
                                {loading ? 'GUARDANDO...' : 'FINALIZAR REGISTRO'}
                                {!loading && <ChevronRight size={20} />}
                            </motion.button>
                        </div>
                    </motion.div>
                )}

            </AnimatePresence>
        </div>
    );
}