import React from 'react';
import { Zap, ChevronRight } from 'lucide-react';

export const LogoHeader = ({ title, subtitle }) => (
  <div className="mb-10 text-center flex flex-col items-center">
    <div className="bg-white/20 w-20 h-20 rounded-[2.2rem] backdrop-blur-xl border border-white/20 flex items-center justify-center mb-6 shadow-2xl">
      <Zap className="text-white fill-white" size={38} />
    </div>
    <h1 className="text-5xl font-black text-white tracking-tighter leading-none mb-3">{title}</h1>
    <p className="text-blue-100/70 font-bold uppercase text-[10px] tracking-[0.2em]">{subtitle}</p>
  </div>
);

export const ActionButton = ({ text, onClick, variant = "outline" }) => (
  <button 
    onClick={onClick} 
    className={`w-full py-5 rounded-[1.8rem] font-black text-sm tracking-widest active:scale-[0.97] transition-all shadow-xl ${
      variant === "white" ? "bg-white text-blue-600" : "bg-white/5 text-white border border-white/10"
    }`}
  >
    {text}
  </button>
);

export const InputGroup = ({ icon, ...props }) => (
  <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md rounded-[1.8rem] px-6 border border-white/10 focus-within:bg-white/20 transition-all shadow-inner">
    <div className="text-white/40">{icon}</div>
    <input {...props} className="w-full bg-transparent py-5 font-bold text-white placeholder:text-white/30 outline-none text-sm" />
  </div>
);

export const SocialButton = ({ icon, text, onClick }) => (
  <button onClick={onClick} className="w-full py-5 px-6 bg-white/10 backdrop-blur-xl rounded-[1.8rem] border border-white/10 font-black text-white text-sm flex items-center justify-between group active:scale-[0.98] transition-all hover:bg-white/15">
    <div className="flex items-center gap-4">
      <div className="bg-white/10 p-2.5 rounded-xl shadow-inner">{icon}</div>
      <span className="tracking-tight">Entrar con {text}</span>
    </div>
    <ChevronRight size={18} className="text-white/30" />
  </button>
);