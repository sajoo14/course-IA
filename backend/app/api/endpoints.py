# ============================================
# ENDPOINTS.PY - Rutas de la API REST
# ============================================
# Este archivo define TODAS las rutas HTTP que el frontend puede llamar
# Es el "controlador" que coordina el flujo: recibe peticiones → llama servicios → retorna respuestas

# Importa herramientas de FastAPI
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks

# Importa Session para interactuar con la base de datos
from sqlalchemy.orm import Session

# Importa la función get_db que proporciona sesiones de DB
from ..core.database import get_db

# Importa los modelos (tablas) y esquemas (validación)
from ..models import models, schemas

# Importa los servicios de IA y PDF
from ..services import ai_service, pdf_service

# ============================================
# CREACIÓN DEL ROUTER
# ============================================
# APIRouter es como una "sub-aplicación" que agrupa rutas relacionadas
# En main.py esto se incluye con: app.include_router(router, prefix="/api/v1")
# Entonces todas las rutas aquí tendrán el prefijo /api/v1
router = APIRouter()

# ==================================================================================
# RUTA 1: CREAR UN NUEVO CASO
# ==================================================================================
@router.post("/cases/", response_model=schemas.CaseResponse)
async def create_case(case_in: schemas.CaseCreate, db: Session = Depends(get_db)):
    """
    Endpoint para crear un nuevo caso legal.
    
    MÉTODO: POST
    URL: /api/v1/cases/
    
    Flujo:
    1. Usuario envía tipo de caso y descripción
    2. Backend llama a la IA para generar texto legal
    3. Backend guarda el caso en la base de datos
    4. Backend retorna el caso con el texto generado
    
    Request Body (JSON):
    {
        "case_type": "health",
        "description": "Me negaron mis medicinas para la diabetes"
    }
    
    Response (JSON):
    {
        "id": 1,
        "case_type": "health",
        "description": "Me negaron mis medicinas...",
        "status": "draft",
        "generated_text": "De conformidad con el artículo 49...",
        "pdf_url": null
    }
    
    Parámetros:
        case_in: Datos del caso (validados automáticamente por Pydantic)
        db: Sesión de base de datos (inyectada automáticamente por Depends)
    
    Retorna:
        CaseResponse: El caso recién creado con el texto de la IA
    """
    
    # PASO 1: Generar texto legal con IA
    # ===========================================
    # Llama a Gemini para convertir la descripción informal en un documento legal formal
    # Esta es una llamada async (puede tomar 2-5 segundos)
    # 
    # Ejemplo:
    #   Input: "Me negaron mis medicinas"
    #   Output: "De conformidad con el artículo 49 de la Constitución..."
    generated_text = await ai_service.generate_legal_text(case_in.case_type, case_in.description)
    
    # PASO 2: Guardar el caso en la base de datos
    # ===========================================
    # Crea un nuevo objeto LegalCase con los datos
    db_case = models.LegalCase(
        case_type=case_in.case_type,      # "health" o "fine"
        description=case_in.description,   # Historia del usuario
        generated_text=generated_text,     # Texto generado por la IA
        status="draft"                     # Estado inicial
    )
    
    # Agrega el objeto a la sesión (lo marca para guardar)
    db.add(db_case)
    
    # Confirma la transacción (guarda en la DB)
    # Esto ejecuta el INSERT INTO legal_cases...
    db.commit()
    
    # Refresca el objeto para obtener valores generados por la DB (como el id)
    db.refresh(db_case)
    
    # PASO 3: Retornar el caso creado
    # ===========================================
    # FastAPI automáticamente convierte db_case a JSON usando schemas.CaseResponse
    # Gracias a "from_attributes = True" en el schema
    return db_case

# ==================================================================================
# RUTA 2: FINALIZAR UN CASO (AGREGAR DATOS Y GENERAR PDF)
# ==================================================================================
@router.put("/cases/{case_id}/finalize", response_model=schemas.CaseResponse)
def finalize_case(case_id: int, user_data: schemas.CaseUpdate, db: Session = Depends(get_db)):
    """
    Endpoint para finalizar un caso agregando datos del usuario y generando el PDF.
    
    MÉTODO: PUT
    URL: /api/v1/cases/{case_id}/finalize
    
    Flujo:
    1. Usuario ya vio el preview del texto legal
    2. Usuario decide continuar y envía sus datos personales
    3. Backend actualiza el caso con los datos
    4. Backend genera el PDF
    5. Backend marca el caso como "completed"
    6. Backend retorna el caso con la ruta del PDF
    
    Request Body (JSON):
    {
        "citizen_name": "Juan Pérez",
        "citizen_id": "1234567890",
        "city": "Bogotá",
        "email": "juan@example.com"
    }
    
    Response (JSON):
    {
        "id": 1,
        "case_type": "health",
        "description": "Me negaron...",
        "status": "completed",
        "generated_text": "De conformidad...",
        "pdf_url": "case_1.pdf"
    }
    
    Parámetros:
        case_id: ID del caso a finalizar (viene de la URL)
        user_data: Datos personales del usuario (validados por Pydantic)
        db: Sesión de base de datos
    
    Retorna:
        CaseResponse: El caso finalizado con la ruta del PDF
        
    Errores:
        404: Si el caso no existe
    """
    
    # PASO 1: Buscar el caso en la base de datos
    # ===========================================
    # Hace una consulta SQL: SELECT * FROM legal_cases WHERE id = case_id
    db_case = db.query(models.LegalCase).filter(models.LegalCase.id == case_id).first()
    
    # Verifica que el caso exista
    if not db_case:
        # Si no existe, retorna error 404
        # HTTPException hace que FastAPI retorne automáticamente:
        # {
        #   "detail": "Case not found"
        # }
        # con status code 404
        raise HTTPException(status_code=404, detail="Case not found")
    
    # PASO 2: Actualizar datos del usuario
    # ===========================================
    # user_data.dict(exclude_unset=True) convierte el schema a diccionario
    # exclude_unset=True solo incluye campos que el usuario envió
    # Esto permite actualizar solo algunos campos si quieres
    #
    # Ejemplo:
    #   user_data.dict() = {"citizen_name": "Juan", "citizen_id": "123", ...}
    #   Itera sobre cada par clave-valor
    #   setattr(db_case, "citizen_name", "Juan") asigna el valor al objeto
    for key, value in user_data.dict(exclude_unset=True).items():
        setattr(db_case, key, value)
    
    # PASO 3: Generar el PDF
    # ===========================================
    # Llama al servicio de PDF con:
    # - ID del caso (para el nombre del archivo)
    # - Texto legal generado por la IA
    # - Datos del ciudadano (nombre, cédula, ciudad)
    pdf_filename = pdf_service.create_pdf(
        case_id=db_case.id,                    # ej: 1
        content=db_case.generated_text,        # Texto legal
        user_name=db_case.citizen_name,        # "Juan Pérez"
        user_id=db_case.citizen_id,            # "1234567890"
        city=db_case.city                      # "Bogotá"
    )
    # pdf_filename será algo como "case_1.pdf"
    
    # PASO 4: Actualizar el caso con la ruta del PDF
    # ===========================================
    db_case.pdf_path = pdf_filename    # Guarda el nombre del PDF
    db_case.status = "completed"       # Marca el caso como completado
    
    # Confirma los cambios en la DB
    # Esto ejecuta: UPDATE legal_cases SET pdf_path = ..., status = ... WHERE id = ...
    db.commit()
    
    # Refresca el objeto con los valores actualizados de la DB
    db.refresh(db_case)
    
    # PASO 5: Retornar el caso finalizado
    # ===========================================
    return db_case

# ==================================================================================
# RUTA 3: OBTENER UN CASO ESPECÍFICO (OPCIONAL)
# ==================================================================================
@router.get("/cases/{case_id}", response_model=schemas.CaseResponse)
def get_case(case_id: int, db: Session = Depends(get_db)):
    """
    Endpoint para obtener un caso específico por su ID.
    
    MÉTODO: GET
    URL: /api/v1/cases/{case_id}
    
    Uso:
    Esta ruta no se usa actualmente en el frontend, pero está disponible
    para debugging o futuras funcionalidades (ej: historial de casos).
    
    Response (JSON):
    {
        "id": 1,
        "case_type": "health",
        "description": "Me negaron...",
        "status": "completed",
        "generated_text": "De conformidad...",
        "pdf_url": "case_1.pdf"
    }
    
    Parámetros:
        case_id: ID del caso a buscar (viene de la URL)
        db: Sesión de base de datos
    
    Retorna:
        CaseResponse: El caso solicitado
        
    Errores:
        404: Si el caso no existe
    """
    
    # Busca el caso en la base de datos
    db_case = db.query(models.LegalCase).filter(models.LegalCase.id == case_id).first()
    
    # Verifica que existe
    if not db_case:
        raise HTTPException(status_code=404, detail="Case not found")
    
    # Retorna el caso
    return db_case
