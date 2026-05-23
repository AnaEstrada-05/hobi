import React, { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';

// Importación de Páginas
import Home from './pages/Home';
import Wallet from './pages/Wallet';
import Calculator from './pages/Calculator';
import Alerts from './pages/Alerts';
import Profile from './pages/Profile';
import AuthFlow from './pages/AuthFlow';
import { BottomNav } from './components/BottomNav';

function App() {
  const [activeTab, setActiveTab] = useState('inicio');
  const [isAuthenticated, setIsAuthenticated] = useState(false); 
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [activeTab]);

  const goBack = () => setActiveTab('inicio');

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