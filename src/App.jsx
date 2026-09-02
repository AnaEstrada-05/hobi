import React, { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { supabase } from './services/supabaseClient';
import { signupFlags } from './services/signupFlags';

// Importación de Páginas
import Home from './pages/Home';
import Wallet from './pages/Wallet';
import Calculator from './pages/Calculator';
import Alerts from './pages/Alerts';
import Profile from './pages/Profile';
import AuthFlow from './pages/AuthFlow';
import ResetPassword from './pages/ResetPassword';
import { BottomNav } from './components/BottomNav';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [recoveryMode, setRecoveryMode] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  // Sin esto, cualquier sesión ya iniciada (recargar la página, o volver de
  // un login con Google/Apple) se perdía y la app regresaba siempre a la
  // pantalla de "Iniciar sesión" aunque Supabase sí tuviera la sesión activa.
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAuthenticated(!!session);
      setCheckingSession(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      // Cuando alguien entra desde el link de "recuperar contraseña", Supabase
      // abre una sesión temporal de tipo recovery. Sin este check, esa sesión
      // se trataría como login normal y la persona caería directo a Home en
      // vez de poder poner su contraseña nueva.
      if (event === 'PASSWORD_RECOVERY') {
        setRecoveryMode(true);
      }

      // supabase.auth.signUp() crea sesión real de inmediato en este
      // proyecto, lo cual dispara este mismo listener a media mitad del
      // registro — sin este check, un usuario nuevo saltaba directo a
      // Inicio sin pasar nunca por "elige tus tarjetas" en AuthFlow.jsx.
      if (signupFlags.inProgress) return;

      setIsAuthenticated(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  // Antes, "volver" siempre regresaba a la pestaña de inicio, porque toda la
  // navegación vivía en un único estado `activeTab` en memoria (nunca en la
  // URL). Con rutas reales, goHome conserva ese mismo comportamiento para los
  // botones de "atrás" propios de cada sección — mientras que ahora el botón
  // atrás del navegador (o el gesto de swipe en móvil) sí recorre el
  // historial real en vez de sacar a la persona de la app.
  const goHome = () => navigate('/');

  if (checkingSession) {
    return (
      <div className="min-h-screen bg-[#1e3a8a] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  if (recoveryMode) {
    return <ResetPassword onDone={() => setRecoveryMode(false)} />;
  }

  if (!isAuthenticated) {
    return <AuthFlow onFinish={() => setIsAuthenticated(true)} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 overflow-x-hidden font-sans">
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<Home key="home" />} />
          <Route path="/wallet" element={<Wallet key="wallet" onBack={goHome} />} />
          <Route path="/calculadora" element={<Calculator key="calculator" onBack={goHome} />} />
          <Route path="/alertas" element={<Alerts key="alertas" onBack={goHome} />} />
          <Route path="/perfil" element={<Profile key="perfil" onBack={goHome} />} />
          {/* Cualquier ruta desconocida (link viejo, typo, etc.) regresa a inicio
              en vez de mostrar una pantalla en blanco. */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AnimatePresence>

      <BottomNav />
    </div>
  );
}

export default App;
