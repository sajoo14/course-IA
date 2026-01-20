// ============================================
// API.TS - Cliente HTTP para Comunicación con el Backend
// ============================================
// Este archivo centraliza TODAS las llamadas HTTP al backend
// Usa axios para hacer peticiones HTTP de forma sencilla

// Importa axios, una librería popular para hacer peticiones HTTP
import axios from 'axios';

// ============================================
// CONFIGURACIÓN DE LA URL BASE
// ============================================
// Define la URL del backend
// import.meta.env.VITE_API_URL viene de variables de entorno (.env)
// Si no está definida, usa http://localhost:8000/api/v1 por defecto
// 
// En producción, esto sería algo como: https://api.justibot.com/api/v1
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

// ============================================
// TIPOS DE DATOS (TypeScript)
// ============================================
// Define el tipo de datos del usuario
// Esto le dice a TypeScript qué campos debe tener el objeto
export type UserData = {
    citizen_name: string;    // Nombre completo (ej: "Juan Pérez")
    citizen_id: string;      // Número de cédula (ej: "1234567890")
    city: string;            // Ciudad (ej: "Bogotá")
    email?: string;          // Email (opcional, el ? significa que puede no existir)
};

// ============================================
// FUNCIÓN 1: CREAR UN CASO
// ============================================
/**
 * Crea un nuevo caso legal en el backend.
 * 
 * Flujo:
 * 1. Usuario llena el formulario (tipo de caso + descripción)
 * 2. Frontend llama a esta función
 * 3. Esta función hace POST al backend
 * 4. Backend llama a la IA para generar texto legal
 * 5. Backend guarda el caso en PostgreSQL
 * 6. Backend retorna el caso con el texto generado
 * 7. Esta función retorna los datos al componente que la llamó
 * 
 * @param data - Objeto con case_type ("health" o "fine") y description
 * @returns Promise con el caso creado (incluye id y generated_text)
 * 
 * Ejemplo de uso en un componente:
 * ```typescript
 * const result = await createCase({
 *   case_type: "health",
 *   description: "Me negaron mis medicinas"
 * });
 * console.log(result.id); // 1
 * console.log(result.generated_text); // "De conformidad con..."
 * ```
 */
export const createCase = async (data: { case_type: string; description: string }) => {
    // Hace una petición POST a /api/v1/cases/
    // axios.post automáticamente:
    // - Convierte el objeto 'data' a JSON
    // - Agrega el header Content-Type: application/json
    // - Envía la petición al backend
    // - Espera la respuesta
    const response = await axios.post(`${API_URL}/cases/`, data);

    // response.data contiene el JSON que el backend retornó
    // Ejemplo: { id: 1, case_type: "health", description: "...", generated_text: "...", ... }
    return response.data;
};

// ============================================
// FUNCIÓN 2: FINALIZAR UN CASO
// ============================================
/**
 * Finaliza un caso agregando datos del usuario y generando el PDF.
 * 
 * Flujo:
 * 1. Usuario ve el preview del texto legal
 * 2. Usuario decide continuar y llena sus datos (nombre, ID, ciudad)
 * 3. Frontend llama a esta función
 * 4. Esta función hace PUT al backend
 * 5. Backend actualiza el caso con los datos del usuario
 * 6. Backend genera el PDF con FPDF
 * 7. Backend retorna el caso con la ruta del PDF
 * 8. Esta función retorna los datos al componente
 * 
 * @param caseId - ID del caso a finalizar (ej: 1)
 * @param userData - Objeto con nombre, ID, ciudad y email (opcional)
 * @returns Promise con el caso finalizado (incluye pdf_path)
 * 
 * Ejemplo de uso en un componente:
 * ```typescript
 * const result = await finalizeCase(1, {
 *   citizen_name: "Juan Pérez",
 *   citizen_id: "1234567890",
 *   city: "Bogotá"
 * });
 * console.log(result.pdf_path); // "case_1.pdf"
 * ```
 */
export const finalizeCase = async (caseId: number, userData: UserData) => {
    // Hace una petición PUT a /api/v1/cases/{caseId}/finalize
    // PUT se usa para ACTUALIZAR recursos existentes
    // 
    // Template literal: `${API_URL}/cases/${caseId}/finalize`
    // Si caseId = 1, la URL será: http://localhost:8000/api/v1/cases/1/finalize
    const response = await axios.put(`${API_URL}/cases/${caseId}/finalize`, userData);

    // Retorna los datos del caso finalizado
    return response.data;
};

// ============================================
// MANEJO DE ERRORES (IMPLÍCITO)
// ============================================
// Nota: Estas funciones NO manejan errores explícitamente
// Si axios falla (ej: backend caído, error 500, timeout), lanza una excepción
// El componente que llama estas funciones debe manejar los errores con try/catch
//
// Ejemplo en un componente:
// try {
//   const result = await createCase({...});
// } catch (error) {
//   console.error("Error:", error);
//   // Mostrar mensaje de error al usuario
// }
