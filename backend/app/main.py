# ============================================
# MAIN.PY - Punto de Entrada de la API
# ============================================
# Este archivo configura y arranca la aplicación FastAPI

# Importa FastAPI, el framework web principal
from fastapi import FastAPI

# Importa CORS para permitir peticiones desde el frontend (puerto 5173) al backend (puerto 8000)
from fastapi.middleware.cors import CORSMiddleware

# Importa StaticFiles para servir los PDFs generados como archivos estáticos
from fastapi.staticfiles import StaticFiles

# Importa 'engine' (conexión a PostgreSQL) y 'Base' (para crear tablas automáticamente)
from .core.database import engine, Base

# Importa las rutas/endpoints de la API (como /api/v1/cases/)
from .api import endpoints

# ============================================
# CREACIÓN DE TABLAS EN LA BASE DE DATOS
# ============================================
# Crea todas las tablas definidas en models.py si no existen
# Esto solo se ejecuta una vez al arrancar el servidor
Base.metadata.create_all(bind=engine)

# ============================================
# CREACIÓN DE LA APLICACIÓN FASTAPI
# ============================================
# Crea la instancia principal de FastAPI con un título para la documentación automática
# La documentación está disponible en http://localhost:8000/docs
app = FastAPI(title="JustiBot API")

# ============================================
# CONFIGURACIÓN DE CORS
# ============================================
# CORS (Cross-Origin Resource Sharing) permite que el frontend hable con el backend
# desde diferentes puertos (5173 → 8000)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],        # Permite peticiones desde cualquier origen (en producción, especificar dominios exactos)
    allow_credentials=True,      # Permite enviar cookies y headers de autenticación
    allow_methods=["*"],         # Permite todos los métodos HTTP (GET, POST, PUT, DELETE, etc.)
    allow_headers=["*"],         # Permite todos los headers HTTP
)

# ============================================
# MONTAJE DE ARCHIVOS ESTÁTICOS
# ============================================
# Monta la carpeta 'static' para que los PDFs sean accesibles vía HTTP
# Los PDFs estarán en http://localhost:8000/static/case_1.pdf
app.mount("/static", StaticFiles(directory="static"), name="static")

# ============================================
# INCLUSIÓN DE RUTAS
# ============================================
# Incluye todas las rutas definidas en endpoints.py con el prefijo /api/v1
# Ejemplo: la ruta POST /cases/ se convierte en POST /api/v1/cases/
app.include_router(endpoints.router, prefix="/api/v1")

# ============================================
# RUTA RAÍZ
# ============================================
# Ruta de bienvenida en http://localhost:8000/
@app.get("/")
def root():
    return {"message": "JustiBot API is running"}

# ============================================
# RUTA DE SALUD
# ============================================
# Ruta para verificar que el servidor está funcionando
# Útil para monitoreo y health checks en producción
@app.get("/health")
def health():
    return {"status": "healthy"}
