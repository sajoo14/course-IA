# ⚖️ JustiBot

> **Made in Colombia 🇨🇴** | **Proyecto Educativo (Proof of Concept)**

![JustiBot Status](https://img.shields.io/badge/Status-Prototype-orange) ![Python](https://img.shields.io/badge/Backend-FastAPI-009688) ![React](https://img.shields.io/badge/Frontend-React_19-61DAFB) ![AI](https://img.shields.io/badge/AI-Gemini-8E75B2)

## 🇨🇴 Contexto: Democratizando la Justicia
**JustiBot** nace de una necesidad real en **Colombia**: el acceso a la justicia suele ser costoso y complejo para el ciudadano promedio. Muchas personas no saben cómo redactar una **Acción de Tutela** para reclamar salud, o un **Derecho de Petición** para solicitar información a entidades públicas.

Este proyecto es una iniciativa auténtica para explorar cómo la **Inteligencia Artificial** puede cerrar esa brecha, permitiendo a cualquier colombiano generar borradores legales con solo describir su problema en lenguaje natural.

> [!WARNING]
> **IMPORTANTE - DISCLAIMER LEGAL**
> Este proyecto es un **Prototipo Educativo a Baja Escala**.
> *   **NO es asesoramiento legal profesional.**
> *   Los documentos generados son **borradores** basados en modelos de lenguaje generalistas.
> *   El sistema **no cuenta con validación constitucional exhaustiva** ni reemplaza a un abogado.
> *   Úsalo solo con fines de prueba y aprendizaje.

---

## 🚀 Quick Start

### Requisitos Previos
*   [Docker](https://www.docker.com/) instalado y corriendo.
*   Una API Key de Google Gemini (Gratuita).

### Ejecución con Docker (Recomendado)

1.  **Clonar el repositorio**:
    ```bash
    git clone https://github.com/TU_USUARIO/justibot.git
    cd justibot
    ```

2.  **Configurar Variables de Entorno**:
    Crea un archivo `.env` en la carpeta `backend/` y pega tu llave:
    ```bash
    # En backend/.env
    OPENAI_API_KEY=tu_api_key_aqui
    ```

3.  **Correr el proyecto**:
    ```bash
    docker-compose -f infra/docker-compose.yml up --build
    ```

4.  **Acceder**:
    *   **Frontend**: [http://localhost:5173](http://localhost:5173)
    *   **Backend API**: [http://localhost:8000/docs](http://localhost:8000/docs)

---

## 🛠️ Stack Tecnológico

El proyecto utiliza una arquitectura moderna y desacoplada:

*   **Frontend**: React 19 (Vite) + TailwindCSS.
*   **Backend**: Python FastAPI.
*   **Base de Datos**: PostgreSQL 15.
*   **Inteligencia Artificial**: Google Gemini 1.5 Flash (vía `google-generativeai`).

---

## 📂 Estructura del Proyecto

```bash
projectIA/
├── 📂 backend/              # Lógica del servidor (FastAPI)
│   ├── 📂 app/
│   │   ├── 📂 core/         # Configuración (config.py)
│   │   ├── 📂 services/     # Lógica de IA (ai_service.py)
│   │   └── main.py          # Punto de entrada
│   ├── Dockerfile
│   └── requirements.txt
├── 📂 frontend/             # Interfaz de Usuario (React)
│   ├── 📂 src/
│   │   ├── 📂 components/   # Wizard, Layout
│   │   └── App.tsx
│   └── Dockerfile
├── 📂 infra/                # Orquestación
│   └── docker-compose.yml   # Definición de contenedores
└── README.md
```

## 📚 Documentación Adicional

Para profundizar en el desarrollo y la arquitectura:

*   [🤖 AGENTS.md](./AGENTS.md): Cómo usamos IA y "Agentic Workflows" para construir esto.
*   [🏗️ TECHNICAL_DOCS.md](./TECHNICAL_DOCS.md): Detalles de arquitectura, base de datos y API.

---

### Licencia
Este proyecto es de código abierto bajo la **Licencia GPL v3.0**. Esto asegura que cualquier mejora futura al proyecto permanezca siendo libre y de código abierto para la comunidad.
