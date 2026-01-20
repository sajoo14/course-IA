# ============================================
# SCHEMAS.PY - Esquemas de Validación con Pydantic
# ============================================
# Este archivo define los "contratos" de datos entre el frontend y el backend
# Pydantic valida automáticamente que los datos cumplan el formato correcto

# Importa BaseModel, la clase base para todos los esquemas de Pydantic
from pydantic import BaseModel

# Importa Optional para campos que pueden ser None
from typing import Optional

# Importa CaseType del modelo de base de datos
from .models import CaseType

# ============================================
# SCHEMA: CREAR UN CASO
# ============================================
class CaseCreate(BaseModel):
    """
    Esquema para CREAR un nuevo caso legal.
    
    Este es el payload que el frontend envía en POST /api/v1/cases/
    Solo pide lo MÍNIMO necesario para empezar.
    
    Ejemplo de JSON que envía el frontend:
    {
        "case_type": "health",
        "description": "Me negaron mis medicinas para la diabetes"
    }
    
    Pydantic valida automáticamente:
    - case_type debe ser "health" o "fine" (valores de CaseType)
    - description debe ser un string y no puede estar vacío
    """
    # Tipo de caso (health o fine)
    case_type: CaseType
    
    # Descripción del problema del usuario
    # Puede ser tan largo como el usuario quiera
    description: str

# ============================================
# SCHEMA: ACTUALIZAR UN CASO (DATOS DEL USUARIO)
# ============================================
class CaseUpdate(BaseModel):
    """
    Esquema para ACTUALIZAR un caso con los datos personales del usuario.
    
    Este es el payload que el frontend envía en PUT /api/v1/cases/{id}/finalize
    Se envía DESPUÉS de que el usuario ve el preview y decide continuar.
    
    Ejemplo de JSON que envía el frontend:
    {
        "citizen_name": "Juan Pérez",
        "citizen_id": "1234567890",
        "city": "Bogotá",
        "email": "juan@example.com"
    }
    
    Pydantic valida automáticamente:
    - Los 3 primeros campos deben ser strings y no estar vacíos
    - email es opcional (puede ser None o no estar presente)
    """
    # Nombre completo del ciudadano
    citizen_name: str
    
    # Número de cédula de ciudadanía
    citizen_id: str
    
    # Ciudad de residencia
    city: str
    
    # Email (opcional)
    # Optional[str] = None significa: "puede ser string o None, por defecto es None"
    email: Optional[str] = None

# ============================================
# SCHEMA: RESPUESTA DE UN CASO
# ============================================
class CaseResponse(BaseModel):
    """
    Esquema para las RESPUESTAS que el backend envía al frontend.
    
    Este esquema se usa en:
    - POST /api/v1/cases/ (retorna el caso recién creado)
    - PUT /api/v1/cases/{id}/finalize (retorna el caso finalizado)
    - GET /api/v1/cases/{id} (retorna un caso específico)
    
    Ejemplo de JSON que el backend retorna:
    {
        "id": 1,
        "case_type": "health",
        "description": "Me negaron mis medicinas...",
        "status": "completed",
        "generated_text": "De conformidad con el artículo 49...",
        "pdf_url": "case_1.pdf"
    }
    
    Notas:
    - generated_text y pdf_url son Optional porque:
      * generated_text puede ser None si la IA falló
      * pdf_url solo existe después de finalizar el caso
    """
    # ID único del caso en la base de datos
    id: int
    
    # Tipo de caso (health o fine)
    case_type: CaseType
    
    # Descripción original del usuario
    description: str
    
    # Estado actual del caso (draft, generating, completed)
    status: str
    
    # Texto legal generado por la IA
    # Optional porque puede ser None si hubo un error
    generated_text: Optional[str] = None
    
    # URL o nombre del archivo PDF
    # Optional porque solo existe después de finalizar
    # Ejemplo: "case_1.pdf"
    pdf_url: Optional[str] = None

    # ============================================
    # CONFIGURACIÓN DE PYDANTIC
    # ============================================
    class Config:
        """
        Configuración especial de Pydantic para este schema.
        """
        # from_attributes = True permite que Pydantic lea atributos de objetos SQLAlchemy
        # Sin esto, Pydantic solo puede leer diccionarios
        # Con esto, podemos hacer: CaseResponse.from_orm(db_case)
        # y Pydantic automáticamente convierte el objeto LegalCase en JSON
        from_attributes = True
