# ============================================
# DATABASE.PY - Configuración de la Base de Datos
# ============================================
# Este archivo gestiona la conexión a PostgreSQL usando SQLAlchemy

# Importa create_engine para crear la conexión a PostgreSQL
from sqlalchemy import create_engine

# Importa declarative_base para crear la clase base de todos los modelos
from sqlalchemy.ext.declarative import declarative_base

# Importa sessionmaker para crear sesiones de base de datos
from sqlalchemy.orm import sessionmaker

# Importa la configuración que contiene DATABASE_URL
from .config import settings

# ============================================
# MOTOR DE BASE DE DATOS
# ============================================
# Crea el 'motor' que maneja la conexión a PostgreSQL
# Este motor se usa para ejecutar consultas SQL
# La URL viene de settings.DATABASE_URL (postgresql://postgres:postgres@db:5432/justibot)
engine = create_engine(settings.DATABASE_URL)

# ============================================
# FÁBRICA DE SESIONES
# ============================================
# SessionLocal es una "fábrica" de sesiones
# Cada vez que llamas SessionLocal(), obtienes una nueva sesión de base de datos
# Una sesión es como una "conversación" con la base de datos
# 
# Parámetros:
# - autocommit=False: Las transacciones se confirman manualmente con db.commit()
# - autoflush=False: No envía cambios automáticamente a la DB antes de cada query
# - bind=engine: Asocia esta fábrica con el motor de PostgreSQL
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# ============================================
# CLASE BASE PARA MODELOS
# ============================================
# Todos los modelos (como LegalCase) heredarán de esta clase Base
# Esto le dice a SQLAlchemy que estas clases representan tablas en la DB
Base = declarative_base()

# ============================================
# FUNCIÓN PARA OBTENER SESIÓN DE BD
# ============================================
def get_db():
    """
    Función generadora que proporciona una sesión de base de datos.
    
    Esta función se usa con 'Depends' de FastAPI:
    @app.post("/casos/")
    def crear_caso(db: Session = Depends(get_db)):
        # Aquí 'db' es una sesión activa
    
    Funcionamiento:
    1. Crea una nueva sesión con SessionLocal()
    2. La 'entrega' (yield) al endpoint que la solicitó
    3. Cuando el endpoint termina, cierra la sesión automáticamente
    
    Esto asegura que:
    - Cada petición HTTP tiene su propia sesión de DB
    - Las sesiones siempre se cierran (incluso si hay errores)
    """
    # Paso 1: Crear una nueva sesión
    db = SessionLocal()
    
    try:
        # Paso 2: Entregar la sesión al código que la solicitó
        yield db
    finally:
        # Paso 3: Cerrar la sesión cuando todo termine
        # Esto se ejecuta SIEMPRE, incluso si hubo errores
        db.close()
