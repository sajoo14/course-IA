# ============================================
# MODELS.PY - Modelos de Base de Datos (Tablas)
# ============================================
# Este archivo define la estructura de las tablas en PostgreSQL usando SQLAlchemy

# Importa los tipos de columnas de SQLAlchemy
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Enum

# Importa relationship para relaciones entre tablas (no usado actualmente)
# Importa declarative_base para crear la clase base
from sqlalchemy.orm import relationship, declarative_base

# Importa datetime para timestamps
from datetime import datetime

# Importa enum de Python para tipos enumerados
import enum

# Crea la clase base para todos los modelos
# Nota: Esto debería importarse de database.py, pero aquí se redefine
Base = declarative_base()

# ============================================
# ENUM: TIPOS DE CASO
# ============================================
class CaseType(str, enum.Enum):
    """
    Enum que define los tipos de casos legales que JustiBot puede manejar.
    
    Hereda de str y enum.Enum para que se comporte como string en la DB.
    
    Valores posibles:
        - HEALTH: Casos de salud (Tutelas)
        - FINE: Casos de multas (Derechos de Petición)
    """
    HEALTH = "health"  # Casos de negación de servicios de salud, medicamentos, etc.
    FINE = "fine"      # Casos de multas de tránsito injustas

# ============================================
# MODELO: CASO LEGAL
# ============================================
class LegalCase(Base):
    """
    Modelo que representa un caso legal en la base de datos.
    
    Esta tabla almacena TODA la información de un caso:
    - Lo que el usuario describe
    - Lo que la IA genera
    - Los datos personales del ciudadano
    - El PDF resultante
    
    Flujo de llenado de campos:
    1. CREACIÓN: case_type, description, generated_text se llenan inmediatamente
    2. PREVIEW: Usuario revisa generated_text
    3. FINALIZACIÓN: citizen_name, citizen_id, city, pdf_path se llenan al final
    """
    
    # Define el nombre de la tabla en PostgreSQL
    __tablename__ = "legal_cases"

    # ============================================
    # CAMPOS DE METADATOS
    # ============================================
    # ID único del caso (auto-incremental)
    # primary_key=True: Este es el identificador único
    # index=True: Crea un índice para búsquedas rápidas
    id = Column(Integer, primary_key=True, index=True)
    
    # Timestamp de cuando se creó el caso
    # default=datetime.utcnow: Se llena automáticamente al crear
    # utcnow (no utcnow()) evita llamar la función en import time
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # ============================================
    # DATOS DEL USUARIO (Se llenan AL FINAL)
    # ============================================
    # Estos campos son nullable=True porque no se piden al principio
    # Solo se llenan cuando el usuario decide continuar después del preview
    
    # Nombre completo del ciudadano (ej: "Juan Pérez García")
    citizen_name = Column(String, nullable=True)
    
    # Número de cédula (ej: "1234567890")
    citizen_id = Column(String, nullable=True)
    
    # Ciudad de residencia (ej: "Bogotá", "Medellín")
    city = Column(String, nullable=True)
    
    # Email (opcional, no se usa actualmente en la app)
    email = Column(String, nullable=True)
    
    # ============================================
    # DETALLES DEL CASO (Se llenan AL INICIO)
    # ============================================
    # Tipo de caso (health o fine)
    # nullable=False: DEBE tener un valor (obligatorio)
    # Enum(CaseType): Solo acepta valores de CaseType.HEALTH o CaseType.FINE
    case_type = Column(Enum(CaseType), nullable=False)
    
    # Descripción del problema en palabras del usuario
    # Text: Permite textos largos (sin límite de caracteres)
    # Esta es la "historia" que el usuario escribe en el formulario
    description = Column(Text, nullable=False)
    
    # ============================================
    # CONTENIDO GENERADO (Por la IA y el sistema)
    # ============================================
    # Texto legal generado por Gemini
    # nullable=True porque se genera DESPUÉS de crear el caso
    # Este campo se llena cuando ai_service.generate_legal_text() retorna
    generated_text = Column(Text, nullable=True)
    
    # Ruta del archivo PDF generado (ej: "case_1.pdf")
    # nullable=True porque se genera al FINALIZAR el caso
    # Este campo se llena cuando pdf_service.create_pdf() retorna
    pdf_path = Column(String, nullable=True)
    
    # ============================================
    # ESTADO DEL CASO
    # ============================================
    # Estado actual del caso en el flujo
    # default="draft": Todos los casos empiezan como borrador
    # 
    # Posibles valores:
    # - "draft": Caso recién creado, esperando que IA genere texto
    # - "generating": IA está procesando (no usado actualmente)
    # - "completed": Caso finalizado, PDF generado
    status = Column(String, default="draft")
