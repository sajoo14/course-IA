// ============================================
// WIZARD.TSX - El Corazón del Frontend
// ============================================
// Este componente gestiona todo el flujo de usuario de JustiBot.
// Funciona como una "Máquina de Estados" que cambia de pantalla según el progreso.

import { useState } from 'react';
import { Layout } from './Layout';
// Importación de iconos (lucide-react) para una UI moderna
import { ArrowRight, CheckCircle2, AlertCircle, FileText, Activity } from 'lucide-react';
// Importación de funciones para hablar con el Backend
import { createCase, finalizeCase, type UserData } from '../services/api';

// ============================================
// DEFINICIÓN DE PASOS (Steps)
// ============================================
// 'intro': Pantalla de bienvenida
// 'type_selection': Elección entre Salud o Multas
// 'facts': Donde el usuario cuenta su historia
// 'generating_draft': Pantalla de carga mientras la IA "piensa"
// 'preview': Vista previa del texto legal generado
// 'identity': Formulario de datos personales
// 'completed': Pantalla final con el botón de descarga
type Step = 'intro' | 'type_selection' | 'facts' | 'generating_draft' | 'preview' | 'identity' | 'completed';

export const Wizard = () => {
    // ============================================
    // ESTADOS DEL COMPONENTE (React Hooks)
    // ============================================

    // Paso actual del flujo
    const [step, setStep] = useState<Step>('intro');

    // Tipo de caso elegido ('health' o 'fine')
    const [caseType, setCaseType] = useState<'health' | 'fine' | null>(null);

    // Historia escrita por el usuario
    const [description, setDescription] = useState('');

    // ID del caso retornado por la base de datos (Backend)
    const [caseId, setCaseId] = useState<number | null>(null);

    // Estado de carga para los botones (evita doble clic)
    const [isLoading, setIsLoading] = useState(false);

    // El texto legal que nos devuelve la IA de Google (Gemini)
    const [generatedText, setGeneratedText] = useState('');

    // Datos personales del ciudadano (se piden al final)
    const [userData, setUserData] = useState<UserData>({
        citizen_name: '',
        citizen_id: '',
        city: '',
        email: ''
    });

    // ============================================
    // FUNCIONES DE NAVEGACIÓN Y LÓGICA
    // ============================================

    // Avanza de la intro a la selección de tipo
    const handleStart = () => setStep('type_selection');

    // Al elegir un tipo de caso, lo guarda y pasa a la pantalla de "Historia"
    const handleTypeSelect = (type: 'health' | 'fine') => {
        setCaseType(type);
        setStep('facts');
    };

    /**
     * PASO CRÍTICO: Envío de la historia al Backend e IA
     */
    const handleFactsSubmit = async () => {
        // Validación básica
        if (!description || !caseType) return;

        setIsLoading(true);
        setStep('generating_draft'); // Muestra el spinner de carga

        try {
            // Llamada al servicio API (services/api.ts)
            // Esto envía los datos al Backend (Python/FastAPI)
            const result = await createCase({ case_type: caseType, description });

            // Guardamos la respuesta del servidor
            setCaseId(result.id);
            setGeneratedText(result.generated_text || '');

            setIsLoading(false);
            // Avanzamos al Preview para que el usuario lea lo que la IA escribió
            setStep('preview');
        } catch (e) {
            console.error('Error al generar el caso:', e);
            setIsLoading(false);
            // En una app real, aquí mostraríamos un mensaje de error al usuario
        }
    };

    /**
     * PASO FINAL: Generación del PDF oficial
     */
    const handleIdentitySubmit = async () => {
        if (!caseId) return;
        setIsLoading(true);

        try {
            // Envía los datos personales al Backend para "sellar" el documento y crear el PDF
            const result = await finalizeCase(caseId, userData);
            console.log('Caso finalizado con éxito:', result);

            setIsLoading(false);
            setStep('completed'); // Vamos a la pantalla de éxito
        } catch (e) {
            console.error('Error al finalizar el caso:', e);
            setIsLoading(false);
        }
    };

    return (
        <Layout>
            {/* ============================================
                BARRA DE PROGRESO
                Indica visualmente en qué paso se encuentra el usuario
            ============================================ */}
            <div className="mb-12 flex justify-center gap-2">
                {['intro', 'type_selection', 'facts', 'preview', 'identity', 'completed'].map((s, i) => (
                    <div
                        key={s}
                        className={`h-2 rounded-full transition-all duration-500 ${
                            // Si el paso actual es este o uno posterior, píntalo de azul
                            ['intro', 'type_selection', 'facts', 'preview', 'identity', 'completed'].indexOf(step) >= i
                                ? 'w-12 bg-justi-blue dark:bg-blue-500'
                                : 'w-4 bg-slate-200 dark:bg-slate-700'
                            }`}
                    ></div>
                ))}
            </div>

            {/* CONTENEDOR PRINCIPAL DEL FORMULARIO */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 p-8 md:p-12 transition-all duration-300">

                {/* --- PANTALLA: INTRODUCCIÓN --- */}
                {step === 'intro' && (
                    <div className="text-center space-y-6">
                        <div className="w-20 h-20 bg-blue-50 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-6 transition-colors duration-300">
                            <ScaleIcon className="w-10 h-10 text-justi-blue dark:text-blue-400" />
                        </div>
                        <h1 className="text-4xl font-bold text-slate-900 dark:text-white transition-colors duration-300">Bienvenido a JustiBot</h1>
                        <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed max-w-lg mx-auto transition-colors duration-300">
                            Estoy aquí para ayudarte a defender tus derechos. Ya sea que te hayan negado atención médica o recibido una multa injusta, redactaré los documentos legales que necesitas, gratis y rápido.
                        </p>
                        <button onClick={handleStart} className="bg-justi-blue hover:bg-blue-700 text-white font-semibold py-4 px-8 rounded-xl inline-flex items-center gap-2 transition-transform active:scale-95 shadow-lg shadow-blue-200">
                            Iniciar Solicitud <ArrowRight className="w-5 h-5" />
                        </button>
                    </div>
                )}

                {/* --- PANTALLA: SELECCIÓN DE TIPO --- */}
                {step === 'type_selection' && (
                    <div className="space-y-8">
                        <h2 className="text-3xl font-bold text-slate-900 dark:text-white text-center transition-colors duration-300">¿En qué puedo ayudarte hoy?</h2>
                        <div className="grid md:grid-cols-2 gap-6">
                            {/* Opción Salud */}
                            <button
                                onClick={() => handleTypeSelect('health')}
                                className="group relative p-8 rounded-2xl border-2 border-slate-100 dark:border-slate-700 hover:border-justi-blue dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all text-left"
                            >
                                <div className="bg-red-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                    <Activity className="text-red-600 w-6 h-6" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 transition-colors duration-300">Acceso a Salud</h3>
                                <p className="text-slate-500 dark:text-slate-400 transition-colors duration-300">Medicamentos negados, demoras en citas o tratamientos rechazados por tu EPS.</p>
                            </button>

                            {/* Opción Multas */}
                            <button
                                onClick={() => handleTypeSelect('fine')}
                                className="group relative p-8 rounded-2xl border-2 border-slate-100 dark:border-slate-700 hover:border-justi-blue dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all text-left"
                            >
                                <div className="bg-orange-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                    <AlertCircle className="text-orange-600 w-6 h-6" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 transition-colors duration-300">Multas de Tránsito</h3>
                                <p className="text-slate-500 dark:text-slate-400 transition-colors duration-300">Fotomultas injustas, falta de notificación o violación al derecho de defensa.</p>
                            </button>
                        </div>
                    </div>
                )}

                {/* --- PANTALLA: HISTORIA / HECHOS --- */}
                {step === 'facts' && (
                    <div className="space-y-6 animate-fadeIn">
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white transition-colors duration-300">
                            {/* Texto dinámico según la elección previa */}
                            {caseType === 'health' ? 'Cuéntame sobre tu problema de salud' : 'Cuéntame sobre la multa de tránsito'}
                        </h2>
                        <p className="text-slate-500 dark:text-slate-400 transition-colors duration-300">
                            {caseType === 'health'
                                ? "Sé lo más detallado posible. Incluye fechas, nombres de entidades (ej. EPS Sanitas) y qué te negaron exactamente."
                                : "Proporciona detalles como la fecha de la multa, la ciudad y por qué crees que es injusta (ej. no te notificaron, no ibas conduciendo)."}
                        </p>
                        {/* Área de texto para la historia */}
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder={caseType === 'health'
                                ? "Ejemplo: Mi médico ordenó 'Losartan' hace 3 meses pero la farmacia dice que no hay existencias..."
                                : "Ejemplo: Recibí una notificación de fotomulta ayer por una infracción en Cali del 2023, pero nunca me llegó el aviso original..."}
                            className="w-full h-48 p-4 rounded-xl border border-slate-200 dark:border-slate-600 dark:bg-slate-700 focus:border-justi-blue dark:focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/50 outline-none resize-none text-slate-700 dark:text-slate-200 placeholder:text-slate-300 dark:placeholder:text-slate-500 transition-colors duration-300"
                        />
                        <div className="flex justify-end">
                            <button
                                onClick={handleFactsSubmit}
                                // Desactivado si el texto es muy corto
                                disabled={!description || description.length < 10}
                                className="bg-justi-blue hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-xl inline-flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Analizar Caso <ArrowRight className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                )}

                {/* --- PANTALLA: CARGANDO IA --- */}
                {step === 'generating_draft' && (
                    <div className="text-center py-20 space-y-6">
                        {/* Spinner animado */}
                        <div className="animate-spin w-16 h-16 border-4 border-blue-100 dark:border-slate-700 border-t-justi-blue dark:border-t-blue-500 rounded-full mx-auto transition-colors duration-300"></div>
                        <h3 className="text-2xl font-bold text-slate-900 dark:text-white transition-colors duration-300">Analizando tu caso...</h3>
                        <p className="text-slate-500 dark:text-slate-400 transition-colors duration-300">Consultando bases de datos legales y redactando argumentos.</p>
                    </div>
                )}

                {/* --- PANTALLA: VISTA PREVIA (AI PREVIEW) --- */}
                {step === 'preview' && (
                    <div className="space-y-6 animate-fadeIn">
                        <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-xl border border-blue-100 dark:border-blue-800 mb-6 transition-colors duration-300">
                            <h3 className="flex items-center gap-2 font-semibold text-blue-800 dark:text-blue-400 mb-2 transition-colors duration-300">
                                <FileText className="w-5 h-5" />
                                Vista Previa del Documento
                            </h3>
                            <p className="text-blue-700 dark:text-blue-300 text-sm transition-colors duration-300">
                                Esto es lo que he redactado para ti. Revísalo y si parece correcto, lo finalizaremos con tus datos reales.
                            </p>
                        </div>

                        {/* Caja de texto con el resultado de la IA */}
                        <div className="bg-slate-50 dark:bg-slate-700/50 p-6 rounded-xl border border-slate-200 dark:border-slate-600 max-h-96 overflow-y-auto transition-colors duration-300">
                            <div className="prose dark:prose-invert max-w-none">
                                <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed transition-colors duration-300">
                                    {generatedText}
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <button
                                onClick={() => setStep('facts')}
                                className="flex-1 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-semibold py-3 px-6 rounded-xl transition-all duration-300"
                            >
                                ← Editar mi historia
                            </button>
                            <button
                                onClick={() => setStep('identity')}
                                className="flex-1 bg-justi-blue hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl inline-flex items-center justify-center gap-2 transition-all duration-300"
                            >
                                Se ve bien, continuar <ArrowRight className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                )}

                {/* --- PANTALLA: IDENTIDAD / DATOS PERSONALES --- */}
                {step === 'identity' && (
                    <div className="space-y-6 animate-fadeIn">
                        <div className="bg-green-50 p-6 rounded-xl border border-green-100 mb-8">
                            <h3 className="flex items-center gap-2 font-semibold text-green-800 mb-2">
                                <CheckCircle2 className="w-5 h-5" /> Caso Validado
                            </h3>
                            <p className="text-green-700 text-sm">
                                He redactado con éxito los argumentos legales basados en tu historia. Ahora solo necesito tus datos para hacer el documento oficial.
                            </p>
                        </div>

                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white transition-colors duration-300">Datos Oficiales Finales</h2>
                        <div className="grid md:grid-cols-2 gap-4">
                            {/* Input: Nombre Completo */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 transition-colors duration-300">Nombre Completo</label>
                                <input
                                    type="text"
                                    className="w-full p-3 rounded-lg border border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white focus:border-justi-blue dark:focus:border-blue-500 outline-none transition-colors duration-300"
                                    value={userData.citizen_name}
                                    onChange={e => setUserData({ ...userData, citizen_name: e.target.value })}
                                />
                            </div>
                            {/* Input: Número de Cédula */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 transition-colors duration-300">Número de Cédula (C.C.)</label>
                                <input
                                    type="text"
                                    className="w-full p-3 rounded-lg border border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white focus:border-justi-blue dark:focus:border-blue-500 outline-none transition-colors duration-300"
                                    value={userData.citizen_id}
                                    onChange={e => setUserData({ ...userData, citizen_id: e.target.value })}
                                />
                            </div>
                            {/* Input: Ciudad */}
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 transition-colors duration-300">Ciudad de Residencia</label>
                                <input
                                    type="text"
                                    className="w-full p-3 rounded-lg border border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white focus:border-justi-blue dark:focus:border-blue-500 outline-none transition-colors duration-300"
                                    value={userData.city}
                                    onChange={e => setUserData({ ...userData, city: e.target.value })}
                                />
                            </div>
                        </div>

                        <button
                            onClick={handleIdentitySubmit}
                            disabled={isLoading || !userData.citizen_name || !userData.citizen_id || !userData.city}
                            className="w-full bg-justi-blue hover:bg-blue-700 text-white font-semibold py-4 rounded-xl mt-4 flex items-center justify-center gap-2 disabled:opacity-70"
                        >
                            {isLoading ? 'Finalizando PDF...' : 'Descargar PDF Oficial'}
                            {!isLoading && <FileText className="w-5 h-5" />}
                        </button>
                    </div>
                )}

                {/* --- PANTALLA: COMPLETADO /ÉXITO --- */}
                {step === 'completed' && (
                    <div className="text-center py-10 space-y-6 fade-in">
                        <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6 transition-colors duration-300">
                            <CheckCircle2 className="w-10 h-10 text-green-600 dark:text-green-400" />
                        </div>
                        <h2 className="text-3xl font-bold text-slate-900 dark:text-white transition-colors duration-300">¡Documento Listo!</h2>
                        <p className="text-slate-600 dark:text-slate-300 transition-colors duration-300">Tu documento legal ha sido generado exitosamente.</p>

                        {/* Link directo al PDF en la carpeta estática del backend */}
                        <a
                            href={`http://localhost:8000/static/case_${caseId}.pdf`}
                            target="_blank"
                            download
                            className="inline-flex items-center gap-2 bg-slate-900 text-white px-8 py-4 rounded-xl hover:bg-slate-800 transition-colors font-semibold"
                        >
                            <FileText className="w-5 h-5" />
                            Descargar PDF Ahora
                        </a>

                        <button
                            onClick={() => window.location.reload()}
                            className="block mx-auto text-slate-400 hover:text-slate-600 mt-8 text-sm"
                        >
                            Iniciar un nuevo caso
                        </button>
                    </div>
                )}

            </div>
        </Layout>
    );
};

// ============================================
// COMPONENTE AUXILIAR: Icono de Balanza
// ============================================
const ScaleIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1z" />
        <path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1z" />
        <path d="M7 21h10" />
        <path d="M12 3v18" />
        <path d="M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2" />
    </svg>
);
