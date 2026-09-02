import React from 'react';
import { ExternalLink } from 'lucide-react';
import { logCardApplicationClick } from '../services/cardApplications';

// Antes no existía ninguna forma de solicitar la tarjeta recomendada — la
// app solo mostraba cuál conviene, pero no llevaba a ningún lado. Sin esto
// es imposible generar el ingreso por comisión CPA del que depende el
// modelo de negocio. Ver issue KIN-150.
//
// Si la tarjeta todavía no tiene `affiliate_url` en Cards_Master (p. ej.
// mientras Ana se inscribe a los programas de afiliados de cada banco),
// el botón simplemente no se muestra — es preferible no mostrar nada a
// mostrarle a un usuario real un botón que no lleva a ningún lado.
export const ApplyCardButton = ({ cardId, affiliateUrl, source, className = '' }) => {
  if (!affiliateUrl) return null;

  const handleClick = () => {
    logCardApplicationClick(cardId, source);
    window.open(affiliateUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <button
      onClick={handleClick}
      className={`w-full flex items-center justify-center gap-2 bg-blue-600 text-white font-black text-xs uppercase tracking-wider py-3.5 rounded-2xl active:scale-[0.98] transition-transform hover:bg-blue-700 ${className}`}
    >
      Solicitar esta tarjeta
      <ExternalLink size={14} />
    </button>
  );
};
