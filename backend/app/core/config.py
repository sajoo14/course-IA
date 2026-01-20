# ============================================
# CONFIG.PY - Configuración de Variables de Entorno
# ============================================
# Este archivo centraliza TODA la configuración del proyecto
# Usa Pydantic para validar que las variables de entorno existan y tengan el formato correcto

# Importa BaseSettings de Pydantic (valida y gestiona configuración)
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    """
    Clase que define todas las variables de configuración del proyecto.
    Pydantic lee automáticamente estas variables desde:
    1. Archivo .env (si existe)
    2. Variables de entorno del sistema
    3. Valores por defecto especificados aquí
    """
    
    # ============================================
    # INFORMACIÓN DEL PROYECTO
    # ============================================
    PROJECT_NAME: str = "JustiBot API"  # Nombre del proyecto (usado en documentación)
    VERSION: str = "0.1.0"              # Versión actual de la API
    API_V1_STR: str = "/api/v1"         # Prefijo de todas las rutas (ej: /api/v1/cases/)
    
    # ============================================
    # CONFIGURACIÓN DE BASE DE DATOS
    # ============================================
    # URL de conexión a PostgreSQL
    # Formato: postgresql://usuario:contraseña@host:puerto/nombre_db
    # 'db' es el nombre del servicio de PostgreSQL en docker-compose.yml
    DATABASE_URL: str = "postgresql://postgres:postgres@db:5432/justibot"
    
    # ============================================
    # CONFIGURACIÓN DE IA (Google Gemini)
    # ============================================
    # API Key de Gemini (viene de variable de entorno OPENAI_API_KEY)
    # IMPORTANTE: Esta debe estar definida en docker-compose.yml o en .env
    OPENAI_API_KEY: str = ""
    
    # Modelo de IA a usar (gemini-1.5-flash es rápido y económico)
    OPENAI_MODEL: str = "gemini-1.5-flash"
    
    # URL base de la API de Gemini
    OPENAI_BASE_URL: str = "https://generativelanguage.googleapis.com/v1beta"

    class Config:
        """
        Configuración de Pydantic
        """
        # Busca un archivo llamado .env en el directorio raíz del proyecto
        # Si existe, carga las variables de ahí
        env_file = ".env"

# ============================================
# INSTANCIA GLOBAL DE CONFIGURACIÓN
# ============================================
# Crea una instancia única de Settings que se importa en otros archivos
# Ejemplo de uso en otro archivo: from .config import settings
settings = Settings()
