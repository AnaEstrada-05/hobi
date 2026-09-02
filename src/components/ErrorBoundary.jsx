import React from 'react';
import { AlertTriangle, RotateCw } from 'lucide-react';

// Sin esto, cualquier excepción no controlada en el árbol de React (un dato
// inesperado de Supabase, una respuesta rara de Google Places, etc.)
// desmonta TODA la app y deja al usuario viendo una pantalla en blanco, sin
// explicación ni forma de recuperarse. Con testers externos —sin acceso a
// su consola— eso es indistinguible de "la app no sirve".
//
// Los Error Boundaries solo pueden ser class components: no existe todavía
// un hook equivalente a getDerivedStateFromError/componentDidCatch.
export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log mínimo para poder diagnosticar después — no hay un servicio de
    // telemetría todavía, pero al menos queda algo más que una pantalla en
    // blanco silenciosa.
    console.error('[Hobi ErrorBoundary] Excepción no controlada:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6">
          <div className="max-w-sm w-full text-center">
            <div className="mx-auto w-16 h-16 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-500 mb-6">
              <AlertTriangle size={28} />
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tighter">Algo salió mal</h1>
            <p className="text-sm text-slate-500 mt-2 leading-relaxed">
              Tuvimos un error inesperado. Ya quedó registrado — intenta recargar la página.
            </p>
            <button
              onClick={this.handleReload}
              className="mt-6 w-full bg-blue-600 text-white font-black text-sm py-4 rounded-2xl shadow-lg flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
            >
              <RotateCw size={18} /> Recargar
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
