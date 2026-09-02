import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Home, Wallet, Calculator, Bell, User } from 'lucide-react';

const NavItem = ({ icon, label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`flex flex-col items-center gap-1 transition-colors outline-none ${
      active ? 'text-blue-600' : 'text-slate-400'
    }`}
  >
    {icon}
    <span className="text-[10px] font-bold">{label}</span>
  </button>
);

// Antes recibía `activeTab`/`setActiveTab` desde App.jsx (estado en memoria,
// sin relación con la URL). Ahora resuelve la pestaña activa directo de la
// ruta actual y navega con react-router, para que la URL siempre refleje
// dónde está el usuario.
export const BottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav className="fixed bottom-0 w-full bg-white/80 backdrop-blur-lg border-t border-gray-100 flex justify-around pt-3 pb-8 px-4 z-50">
      <NavItem icon={<Home size={22} />} label="Inicio" active={location.pathname === '/'} onClick={() => navigate('/')} />
      <NavItem icon={<Wallet size={22} />} label="Wallet" active={location.pathname === '/wallet'} onClick={() => navigate('/wallet')} />
      <NavItem icon={<Calculator size={22} />} label="Calcular" active={location.pathname === '/calculadora'} onClick={() => navigate('/calculadora')} />
      <NavItem icon={<Bell size={22} />} label="Alertas" active={location.pathname === '/alertas'} onClick={() => navigate('/alertas')} />
      <NavItem icon={<User size={22} />} label="Perfil" active={location.pathname === '/perfil'} onClick={() => navigate('/perfil')} />
    </nav>
  );
};
