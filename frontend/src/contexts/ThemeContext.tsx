// ============================================
// THEMECONTEXT.TSX - Manejo del Modo Oscuro
// ============================================
// Este archivo implementa el Context API de React para compartir el tema (light/dark)
// por toda la aplicación sin tener que pasar props manualmente

// Importa hooks de React necesarios
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

// ============================================
// TIPOS DE DATOS (TypeScript)
// ============================================
// Define los dos temas posibles
type Theme = 'light' | 'dark';

// Define la forma del contexto (qué datos y funciones expone)
interface ThemeContextType {
    theme: Theme;              // Tema actual ('light' o 'dark')
    toggleTheme: () => void;   // Función para cambiar entre light y dark
}

// ============================================
// CREACIÓN DEL CONTEXTO
// ============================================
// Crea el contexto inicialmente sin valor (undefined)
// Esto será llenado por ThemeProvider más abajo
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// ============================================
// PROVEEDOR DEL TEMA (ThemeProvider)
// ============================================
/**
 * Componente que provee el contexto de tema a todos sus hijos.
 * Debe envolver la aplicación completa para que todos los componentes tengan acceso al tema.
 * 
 * Uso en App.tsx:
 * <ThemeProvider>
 *   <Wizard />
 * </ThemeProvider>
 */
export const ThemeProvider = ({ children }: { children: ReactNode }) => {
    // ============================================
    // ESTADO DEL TEMA CON INICIALIZACIÓN INTELIGENTE
    // ============================================
    // useState con una función de inicialización
    // Esta función solo se ejecuta UNA VEZ al montar el componente
    const [theme, setTheme] = useState<Theme>(() => {
        // PASO 1: Intenta cargar el tema guardado en localStorage
        // Si el usuario ya eligió un tema antes, úsalo
        const stored = localStorage.getItem('justibot-theme') as Theme;
        if (stored) return stored;

        // PASO 2: Si no hay tema guardado, detecta la preferencia del sistema
        // window.matchMedia pregunta al navegador/OS: "¿el usuario prefiere modo oscuro?"
        // Esto respeta la configuración del sistema operativo del usuario
        // En Windows: Configuración → Personalización → Colores → "Modo de aplicación predeterminado"
        // En Mac: System Preferences → General → Appearance
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    });

    // ============================================
    // EFECTO: APLICAR EL TEMA AL DOM
    // ============================================
    // useEffect se ejecuta cada vez que 'theme' cambia
    useEffect(() => {
        // Obtiene el elemento <html> del documento
        const root = document.documentElement;

        // Agrega o quita la clase 'dark' del <html>
        // Tailwind CSS usa esta clase para aplicar estilos dark:
        // Ejemplo: dark:bg-slate-900 solo se aplica si <html class="dark">
        if (theme === 'dark') {
            root.classList.add('dark');    // <html class="dark">
        } else {
            root.classList.remove('dark'); // <html class="">
        }

        // Guarda el tema en localStorage para que persista entre recargas
        // La próxima vez que el usuario abra la app, recuperará este valor
        localStorage.setItem('justibot-theme', theme);
    }, [theme]); // El efecto se re-ejecuta cada vez que 'theme' cambia

    // ============================================
    // FUNCIÓN: ALTERNAR TEMA
    // ============================================
    // Función que cambia entre light y dark
    const toggleTheme = () => {
        setTheme(prev => prev === 'light' ? 'dark' : 'light');
        // prev es el valor anterior de theme
        // Si era 'light', cambia a 'dark'
        // Si era 'dark', cambia a 'light'
    };

    // ============================================
    // RENDERIZADO DEL PROVEEDOR
    // ============================================
    // ThemeContext.Provider hace que el valor { theme, toggleTheme } esté disponible
    // para todos los componentes hijos que usen useTheme()
    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

// ============================================
// HOOK PERSONALIZADO: useTheme
// ============================================
/**
 * Hook personalizado para acceder al tema desde cualquier componente.
 * 
 * Uso en un componente:
 * ```typescript
 * const { theme, toggleTheme } = useTheme();
 * 
 * // Leer el tema actual
 * console.log(theme); // 'light' o 'dark'
 * 
 * // Cambiar el tema
 * <button onClick={toggleTheme}>Cambiar tema</button>
 * ```
 * 
 * IMPORTANTE: Solo puede usarse dentro de un componente que esté
 * envuelto por <ThemeProvider>. Si no, lanzará un error.
 */
export const useTheme = () => {
    // Intenta obtener el contexto
    const context = useContext(ThemeContext);

    // Si no hay contexto, significa que useTheme() se llamó fuera de ThemeProvider
    if (!context) {
        throw new Error('useTheme must be used within ThemeProvider');
    }

    // Retorna el contexto (que contiene theme y toggleTheme)
    return context;
};

// ============================================
// FLUJO COMPLETO DEL TEMA
// ============================================
// 1. App.tsx envuelve todo en <ThemeProvider>
// 2. ThemeProvider lee localStorage o preferencia del sistema
// 3. ThemeProvider crea estado con el tema inicial
// 4. ThemeProvider agrega/quita clase 'dark' del <html>
// 5. Cualquier componente usa useTheme() para leer/cambiar el tema
// 6. Layout.tsx usa useTheme() para mostrar el botón de toggle
// 7. Usuario hace clic en el botón → toggleTheme() se ejecuta
// 8. setTheme() actualiza el estado
// 9. useEffect() detecta el cambio y actualiza el <html>
// 10. Tailwind re-aplica estilos con dark:
// 11. La UI se actualiza instantáneamente
// 12. localStorage guarda la preferencia
