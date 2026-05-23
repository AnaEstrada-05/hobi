import React from 'react';
import { ActionButton, LogoHeader } from './AuthComponents';

export const AuthLanding = ({ onSelectLogin, onSelectSignup }) => (
  <div className="flex-1 flex flex-col justify-center px-8 z-10">
    <div className="max-w-md mx-auto w-full text-center">
      <LogoHeader title="Hobi" subtitle="Maximiza cada compra" />
      <div className="space-y-4 mt-12">
        <ActionButton text="INICIAR SESIÓN" variant="white" onClick={onSelectLogin} />
        <ActionButton text="CREAR CUENTA" onClick={onSelectSignup} />
      </div>
    </div>
  </div>
);