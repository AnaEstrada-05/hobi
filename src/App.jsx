import React, { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { supabase } from './services/supabaseClient';

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
  const [activeTab, setActiveTab] = useState('inicio');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [recoveryMode, setRecoveryMode] = useState(false);

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
      setIsAuthenticated(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [activeTab]);

  const goBack = () => setActiveTab('inicio');

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
        
        {activeTab === 'inicio' && (
          <Home key="home" setActiveTab={setActiveTab} />
        )}

        {activeTab === 'wallet' && (
          <Wallet key="wallet" onBack={goBack} />
        )}

        {activeTab === 'calculator' && (
          <Calculator key="calculator" onBack={goBack} />
        )}

        {activeTab === 'alertas' && (
          <Alerts key="alertas" onBack={goBack} />
        )}

        {activeTab === 'perfil' && (
          <Profile key="perfil" onBack={goBack} setActiveTab={setActiveTab} />
        )}
      </AnimatePresence>

      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
}

export default App;