// ============================================
// APP.TSX - Componente Principal de la Aplicación
// ============================================
// Este componente envuelve toda la aplicación con proveedores (providers)
// Los proveedores son componentes que dan contexto (datos compartidos) a todos sus hijos

// Importa el componente Wizard (el flujo paso a paso del usuario)
import { Wizard } from './components/Wizard';

// Importa el ThemeProvider (maneja el modo claro/oscuro)
import { ThemeProvider } from './contexts/ThemeContext';

// ============================================
// COMPONENTE PRINCIPAL
// ============================================
function App() {
  /**
   * Estructura de la aplicación:
   * 
   * <ThemeProvider>          ← Provee el contexto de tema (light/dark) a TODA la app
   *   <Wizard />             ← El flujo completo del usuario (intro → tipo → facts → preview → identity → completed)
   * </ThemeProvider>
   * 
   * ¿Por qué esta estructura?
   * 
   * 1. ThemeProvider está AFUERA porque:
   *    - Todo lo que esté dentro puede usar useTheme()
   *    - El toggle de modo oscuro funciona en todos los componentes
   *    - El tema se guarda en localStorage y persiste entre recargas
   * 
   * 2. Wizard está DENTRO porque:
   *    - Necesita acceso al tema para mostrar estilos dark:
   *    - Cuando el usuario cambia el tema, Wizard se re-renderiza automáticamente
   * 
   * Nota: Originalmente el plan incluía React Router para múltiples páginas,
   * pero como JustiBot es un flujo lineal (no necesita URLs diferentes),
   * se simplificó a un solo componente Wizard que maneja todos los pasos.
   */
  return (
    <ThemeProvider>
      <Wizard />
    </ThemeProvider>
  );
}

// Exporta App para que main.tsx pueda importarlo
export default App;
