// ============================================
// LAYOUT.TSX - Estructura Principal de la UI
// ============================================
// Este componente define el diseño general de la aplicación:
// Header (con logo y botón de tema) + Contenido + Footer

// Importa iconos de lucide-react (librería de iconos SVG)
import { Scale, Moon, Sun } from 'lucide-react';

// Importa el hook personalizado para acceder al tema
import { useTheme } from '../contexts/ThemeContext';

// ============================================
// COMPONENTE LAYOUT
// ============================================
/**
 * Layout envuelve todo el contenido de la aplicación con un diseño consistente.
 * 
 * Estructura visual:
 * ┌─────────────────────────────────┐
 * │  HEADER (nav)                   │  ← Logo + Toggle tema
 * ├─────────────────────────────────┤
 * │                                 │
 * │  CONTENIDO (children)           │  ← Aquí va Wizard
 * │                                 │
 * ├─────────────────────────────────┤
 * │  FOOTER                         │  ← Copyright
 * └─────────────────────────────────┘
 * 
 * @param children - Contenido que se renderiza en el área principal (Wizard)
 */
export const Layout = ({ children }: { children: React.ReactNode }) => {
    // Obtiene el tema actual y la función para cambiarlo
    const { theme, toggleTheme } = useTheme();

    return (
        // ============================================
        // CONTENEDOR PRINCIPAL
        // ============================================
        // min-h-screen: altura mínima = 100% de la pantalla
        // bg-slate-50: fondo gris claro en modo light
        // dark:bg-slate-900: fondo gris oscuro en modo dark (solo si <html class="dark">)
        // relative: posicionamiento relativo (para el fondo decorativo)
        // overflow-hidden: oculta el overflow del div decorativo
        // transition-colors duration-300: animación suave al cambiar tema (300ms)
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 relative overflow-hidden transition-colors duration-300">

            {/* ============================================ */}
            {/* DECORACIÓN DE FONDO */}
            {/* ============================================ */}
            {/* Franja azul inclinada en la parte superior (efecto visual) */}
            {/* absolute: posición absoluta (se superpone al contenido) */}
            {/* top-0 left-0: esquina superior izquierda */}
            {/* w-full h-64: ancho completo, altura de 64 unidades (256px) */}
            {/* bg-justi-blue: color azul personalizado (#2563eb) */}
            {/* opacity-5: muy transparente en light mode */}
            {/* dark:opacity-10: un poco menos transparente en dark mode */}
            {/* -skew-y-3: inclina el div 3 grados en el eje Y */}
            {/* z-0: capa 0 (está detrás del contenido) */}
            <div className="absolute top-0 left-0 w-full h-64 bg-justi-blue opacity-5 dark:opacity-10 -skew-y-3 z-0 transition-opacity duration-300"></div>

            {/* ============================================ */}
            {/* HEADER / NAVEGACIÓN */}
            {/* ============================================ */}
            {/* relative z-10: posición relativa, capa 10 (sobre la decoración) */}
            {/* max-w-5xl: ancho máximo de 80rem (1280px) */}
            {/* mx-auto: centrado horizontalmente */}
            {/* px-6: padding horizontal de 6 unidades (24px) */}
            {/* py-6: padding vertical de 6 unidades (24px) */}
            {/* flex: display flex (layout flexible) */}
            {/* justify-between: espacio entre items (logo a la izquierda, info a la derecha) */}
            {/* items-center: alinea verticalmente al centro */}
            <nav className="relative z-10 max-w-5xl mx-auto px-6 py-6 flex justify-between items-center">

                {/* ============================================ */}
                {/* SECCIÓN IZQUIERDA: LOGO DE JUSTIBOT */}
                {/* ============================================ */}
                {/* flex: layout flex */}
                {/* items-center: alinea verticalmente */}
                {/* gap-2: espacio de 2 unidades (8px) entre ícono y texto */}
                <div className="flex items-center gap-2">
                    {/* Contenedor del ícono de balanza */}
                    {/* bg-justi-blue: fondo azul en light mode */}
                    {/* dark:bg-blue-500: fondo azul más brillante en dark mode */}
                    {/* p-2: padding de 2 unidades (8px) */}
                    {/* rounded-lg: bordes redondeados (8px) */}
                    <div className="bg-justi-blue dark:bg-blue-500 p-2 rounded-lg transition-colors duration-300">
                        {/* Ícono de balanza (símbolo de justicia) */}
                        {/* text-white: color blanco */}
                        {/* w-6 h-6: tamaño 6x6 unidades (24px x 24px) */}
                        <Scale className="text-white w-6 h-6" />
                    </div>

                    {/* Texto "JustiBot" */}
                    {/* text-xl: tamaño de fuente extra large */}
                    {/* font-bold: negrita */}
                    {/* text-slate-900: texto casi negro en light mode */}
                    {/* dark:text-white: texto blanco en dark mode */}
                    {/* tracking-tight: espaciado entre letras ajustado */}
                    <span className="text-xl font-bold text-slate-900 dark:text-white tracking-tight transition-colors duration-300">JustiBot</span>
                </div>

                {/* ============================================ */}
                {/* SECCIÓN DERECHA: INFO Y TOGGLE DE TEMA */}
                {/* ============================================ */}
                {/* flex: layout flex */}
                {/* items-center: alinea verticalmente */}
                {/* gap-4: espacio de 4 unidades (16px) entre elementos */}
                <div className="flex items-center gap-4">
                    {/* Texto descriptivo */}
                    {/* text-sm: tamaño de fuente pequeño */}
                    {/* font-medium: peso medio */}
                    {/* text-slate-500: gris en light mode */}
                    {/* dark:text-slate-400: gris más claro en dark mode */}
                    <div className="text-sm font-medium text-slate-500 dark:text-slate-400 transition-colors duration-300">Legal AI Assistant</div>

                    {/* ============================================ */}
                    {/* BOTÓN DE TOGGLE DE TEMA */}
                    {/* ============================================ */}
                    {/* onClick={toggleTheme}: al hacer clic, cambia entre light y dark */}
                    {/* p-2: padding */}
                    {/* rounded-lg: bordes redondeados */}
                    {/* bg-slate-200: fondo gris claro en light mode */}
                    {/* dark:bg-slate-700: fondo gris oscuro en dark mode */}
                    {/* hover:bg-slate-300: al pasar el mouse, gris más oscuro (light mode) */}
                    {/* dark:hover:bg-slate-600: al pasar el mouse, gris más claro (dark mode) */}
                    {/* transition-all duration-300: anima todos los cambios */}
                    {/* aria-label: etiqueta de accesibilidad para lectores de pantalla */}
                    <button
                        onClick={toggleTheme}
                        className="p-2 rounded-lg bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 transition-all duration-300"
                        aria-label="Toggle theme"
                    >
                        {/* Renderizado condicional del ícono */}
                        {/* Si theme === 'light', muestra Luna (para cambiar a dark) */}
                        {/* Si theme === 'dark', muestra Sol (para cambiar a light) */}
                        {theme === 'light' ? (
                            <Moon className="w-5 h-5 text-slate-700" />
                        ) : (
                            <Sun className="w-5 h-5 text-slate-300" />
                        )}
                    </button>
                </div>
            </nav>

            {/* ============================================ */}
            {/* CONTENIDO PRINCIPAL */}
            {/* ============================================ */}
            {/* Aquí se renderiza el contenido que se pasa como children */}
            {/* En este caso, children es <Wizard /> */}
            {/* relative z-10: posición relativa, capa 10 (sobre la decoración) */}
            {/* max-w-3xl: ancho máximo de 48rem (768px) */}
            {/* mx-auto: centrado horizontalmente */}
            {/* px-6: padding horizontal */}
            {/* pb-20: padding bottom grande (80px) */}
            <main className="relative z-10 max-w-3xl mx-auto px-6 pb-20">
                {children}
            </main>

            {/* ============================================ */}
            {/* FOOTER */}
            {/* ============================================ */}
            {/* text-center: texto centrado */}
            {/* text-slate-400: gris en light mode */}
            {/* dark:text-slate-500: gris más oscuro en dark mode */}
            {/* text-sm: tamaño pequeño */}
            {/* py-10: padding vertical grande */}
            <footer className="text-center text-slate-400 dark:text-slate-500 text-sm py-10 transition-colors duration-300">
                {/* new Date().getFullYear() obtiene el año actual dinámicamente */}
                {/* © es el símbolo de copyright */}
                <p>&copy; {new Date().getFullYear()} JustiBot Project. Made with AI.</p>
            </footer>
        </div>
    );
};

// ============================================
// NOTAS SOBRE TAILWIND CSS
// ============================================
// Tailwind usa clases utilitarias en lugar de CSS tradicional:
//
// Clases normales:
// - bg-slate-50: background color slate tono 50 (muy claro)
// - text-xl: font size extra large
// - p-2: padding de 2 unidades (8px)
//
// Clases condicionales (dark mode):
// - dark:bg-slate-900: solo se aplica si el elemento <html> tiene class="dark"
// - dark:text-white: texto blanco solo en dark mode
//
// Clases de hover:
// - hover:bg-slate-300: cambio de color al pasar el mouse
//
// Clases de transición:
// - transition-colors: anima cambios de color
// - duration-300: duración de 300ms
// - transition-all: anima TODOS los cambios de propiedades CSS
