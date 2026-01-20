# ============================================
# AI_SERVICE.PY - Servicio de Inteligencia Artificial
# ============================================
# Este archivo maneja TODA la comunicación con Google Gemini (el cerebro de JustiBot)

# Importa la librería oficial de Google Generative AI (Gemini)
import google.generativeai as genai

# Importa la configuración que contiene la API key de Gemini
from ..core.config import settings

# ============================================
# CONFIGURACIÓN DE GEMINI
# ============================================
# Configura Gemini con nuestra API key (viene de variables de entorno)
# Esto solo se ejecuta una vez cuando se importa este módulo
genai.configure(api_key=settings.OPENAI_API_KEY)

# ============================================
# FUNCIÓN PRINCIPAL: GENERACIÓN DE TEXTO LEGAL
# ============================================
async def generate_legal_text(case_type: str, description: str) -> str:
    """
    Función de IA con credenciales directas.
    """
    
    # ============================================
    # PROMPT DEL SISTEMA (INSTRUCCIONES PARA LA IA)
    # ============================================
    # Este es el "cerebro" de JustiBot: le dice a Gemini cómo debe comportarse
    system_prompt = """
    Eres JustiBot, un abogado experto colombiano potenciado con IA.
    Tu trabajo es redactar documentos legales formales basándote en descripciones informales de usuarios.

    IMPORTANTE: Detecta el idioma de la 'User Story'.
    - Si la User Story está en ESPAÑOL, el OUTPUT del documento legal DEBE estar en ESPAÑOL.
    - Si la User Story está en ENGLISH, el OUTPUT del documento legal DEBE estar en ENGLISH.
    
    Tipos de documentos a generar:
    - Si el request es 'health': redacta una 'Acción de Tutela' (protege derechos fundamentales de salud)
    - Si el request es 'fine': redacta un 'Derecho de Petición' (solicitud formal a autoridad)
    
    Reglas de generación:
    - Genera SOLO el cuerpo de los argumentos legales
    - NO incluyas placeholders para nombre/ID (eso se agrega después en el PDF)
    - Usa terminología legal formal apropiada para el idioma elegido
    - Cita artículos de leyes colombianas cuando sea posible
      Ejemplo: "De conformidad con el artículo 49 de la Constitución Política..."
    - Mantén un tono empático pero profesional
    """
    
    # ============================================
    # CONSTRUCCIÓN DEL PROMPT COMPLETO
    # ============================================
    # Combina las instrucciones del sistema con los datos específicos del usuario
    # El formato es importante: Gemini entiende mejor con esta estructura
    user_prompt = f"System Instruction: {system_prompt}\n\nCase Type: {case_type}\nUser Story: {description}"
    
    # ============================================
    # LLAMADA A GEMINI (CON MANEJO DE ERRORES)
    # ============================================
    try:
        # ==================================================================================
        # ESTRATEGIA DE SELECCIÓN DINÁMICA DE MODELO (AUTO-DISCOVERY)
        # ==================================================================================
        # MOTIVO:
        # Algunos usuarios/regiones reciben errores 404 al intentar acceder a modelos específicos
        # hardcodeados (como 'gemini-1.5-flash' o 'gemini-pro') debido a restricciones de cuenta
        # o cambios en la API de Google sin previo aviso.
        #
        # SOLUCIÓN:
        # En lugar de "adivinar" el nombre del modelo, esta lógica consulta directamente a la API
        # (genai.list_models) qué modelos están disponibles y habilitados para esta API KEY específica.
        # Seleccionamos automáticamente el primer modelo capaz de generar texto (generateContent).
        # Esto garantiza que el sistema siempre funcione con lo que Google nos ofrezca,
        # haciendo la aplicación robusta a cambios futuros de versiones.
        # ==================================================================================
        
        available_models = []
        for m in genai.list_models():
            if 'generateContent' in m.supported_generation_methods:
                available_models.append(m.name)
        
        if not available_models:
             raise Exception("No generative models available for this API Key.")
             
        # Usamos el primer modelo disponible (ej: 'models/gemini-pro')
        # Google suele devolver una lista, y el primero suele ser el default recomendado.
        model_name = available_models[0].name if hasattr(available_models[0], 'name') else available_models[0]
        
        # Log para fines de depuración: permite ver en consola cuál modelo se terminó usando.
        print(f"--- MODELO SELECCIONADO AUTOMATICAMENTE: {model_name} ---") 
             
        # Crear una instancia del modelo Gemini seleccionado dinámicamente
        model = genai.GenerativeModel(model_name)
        
        # PASO 2: Enviar el prompt a Gemini y esperar la respuesta
        # generate_content() es la función que hace la "magia" de la IA
        # Internamente:
        # 1. Envía el prompt a los servidores de Google
        # 2. Gemini procesa el texto con sus modelos de lenguaje
        # 3. Genera una respuesta coherente y contextual
        # 4. Retorna la respuesta como objeto
        response = model.generate_content(user_prompt)
        
        # PASO 3: Extraer solo el texto de la respuesta
        # response.text contiene el texto generado
        # Ignoramos metadatos como tokens usados, tiempo de generación, etc.
        return response.text
        
    except Exception as e:
        # Debugging
        with open("ai_error.log", "a") as f:
            f.write(f"\n--- HARDCODED ATTEMPT ERROR ---\n")
            f.write(f"Key used: AIzaSyAG... (Hardcoded)\n")
            f.write(f"Model used: {model_name}\n")
            f.write(f"Exception: {str(e)}\n")
            
        print(f"AI Error: {e}")
        return f"Error generating legal text. Please try again later. (Error logged)"
