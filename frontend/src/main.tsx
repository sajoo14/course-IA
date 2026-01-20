// ============================================
// MAIN.TSX - Punto de Entrada del Frontend
// ============================================
// Este es el PRIMER archivo que se ejecuta cuando cargas http://localhost:5173
// Su único trabajo es: montar la aplicación React en el DOM

// Importa StrictMode, un wrapper que ayuda a detectar problemas en desarrollo
import { StrictMode } from 'react'

// Importa createRoot, la función para "montar" React en el HTML
import { createRoot } from 'react-dom/client'

// Importa los estilos globales de Tailwind CSS
import './index.css'

// Importa el componente principal de la aplicación
import App from './App.tsx'

// ============================================
// MONTAJE DE LA APLICACIÓN
// ============================================
// Paso 1: Busca el elemento HTML con id="root"
// Este elemento está definido en /frontend/index.html: <div id="root"></div>
// El ! le dice a TypeScript "confía en mí, este elemento existe"
const rootElement = document.getElementById('root')!

// Paso 2: Crea un "root" de React en ese elemento
// createRoot es la nueva API de React 18+ para renderizar apps
createRoot(rootElement).render(
  // StrictMode es un wrapper que:
  // - Detecta efectos secundarios no deseados
  // - Advierte sobre APIs obsoletas de React
  // - Ejecuta algunos efectos dos veces (solo en desarrollo) para encontrar bugs
  // IMPORTANTE: StrictMode solo afecta el modo desarrollo, no producción
  <StrictMode>
    {/* App es el componente raíz de toda la aplicación */}
    <App />
  </StrictMode>,
)

// ============================================
// FLUJO DE EJECUCIÓN
// ============================================
// 1. Vite carga index.html
// 2. index.html tiene: <script type="module" src="/src/main.tsx"></script>
// 3. Este archivo se ejecuta
// 4. createRoot monta React en <div id="root">
// 5. <App /> se renderiza
// 6. App renderiza el resto de componentes (Layout, Wizard, etc.)
