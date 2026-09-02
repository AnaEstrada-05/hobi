// Bandera compartida entre AuthFlow.jsx y App.jsx.
//
// El problema que resuelve: supabase.auth.signUp() crea una sesión real de
// inmediato en este proyecto (no exige confirmar el correo), lo cual
// dispara el listener global de onAuthStateChange en App.jsx — que hasta
// ahora asumía "si hay sesión, ya está autenticado, mándalo a Inicio".
// Eso hacía que un usuario nuevo saltara directo a Inicio sin pasar nunca
// por la pantalla de "elige tus tarjetas" que AuthFlow.jsx todavía no
// alcanzaba a mostrar.
//
// Mientras `inProgress` sea true, App.jsx ignora los cambios de sesión que
// vengan de este signUp() y deja que AuthFlow termine su propio flujo
// (elegir tarjetas) antes de decidir que el usuario ya "entró" a la app.
export const signupFlags = {
  inProgress: false,
};
