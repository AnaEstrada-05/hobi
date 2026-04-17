import React from 'react';
import { Mail, Lock, User, Chrome, Apple, ArrowLeft } from 'lucide-react';
import { InputGroup, ActionButton, SocialButton } from '../pages/AuthComponents';

export const AuthForm = ({ mode, onBack, onSuccess }) => (
  <div className="flex-1 flex flex-col justify-center px-8 z-10">
    <div className="max-w-md mx-auto w-full">
      <button onClick={onBack} className="mb-8 p-3 bg-white/10 rounded-full text-white w-fit leading-none flex items-center justify-center">
        <ArrowLeft size={20} />
      </button>

      <h2 className="text-4xl font-black text-white tracking-tighter mb-2">
        {mode === 'login' ? 'Bienvenido de vuelta' : 'Crea tu perfil'}
      </h2>
      <p className="text-blue-100/60 font-bold uppercase text-[10px] tracking-[0.2em] mb-8">
        {mode === 'login' ? 'Ingresa tus datos' : 'Únete a la comunidad'}
      </p>

      <div className="space-y-4">
        {mode === 'signup' && <InputGroup icon={<User size={18}/>} placeholder="Nombre completo" />}
        <InputGroup icon={<Mail size={18}/>} placeholder="Email" type="email" />
        <InputGroup icon={<Lock size={18}/>} placeholder="Contraseña" type="password" />
        
        <ActionButton 
          text={mode === 'login' ? 'ENTRAR' : 'REGISTRARME'} 
          variant="white" 
          onClick={onSuccess} 
        />

        <div className="py-6 flex items-center gap-4 text-white/20 text-[9px] font-black uppercase tracking-[0.3em]">
          <div className="h-[1px] bg-white/10 flex-1" /> O <div className="h-[1px] bg-white/10 flex-1" />
        </div>

        <SocialButton icon={<Chrome size={20}/>} text="Google" onClick={onSuccess} />
        <SocialButton icon={<Apple size={22}/>} text="Apple ID" onClick={onSuccess} />
      </div>
    </div>
  </div>
);