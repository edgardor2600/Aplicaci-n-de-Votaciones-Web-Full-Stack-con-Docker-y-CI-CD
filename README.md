# Cats vs Dogs - Aplicación de Votaciones Full-Stack

Este proyecto es una aplicación web full-stack que permite a los usuarios votar por "Gatos" o "Perros" y ver los resultados en tiempo real. La aplicación está diseñada para ser ejecutada en contenedores Docker y cuenta con un flujo de Integración Continua (CI) utilizando GitHub Actions.

## Características

*   **Backend API (Implementado):** Un servicio robusto construido con Flask (Python) que gestiona la lógica de negocio.
*   **Base de Datos (Implementado):** PostgreSQL para persistir los datos de las votaciones.
*   **Integración Continua (Implementado):** Un workflow de GitHub Actions que ejecuta tests automáticamente en cada `push` y `pull request` a la rama `main`.
*   **Frontend (Planeado):** Una interfaz de usuario sencilla (HTML, CSS, JS) para interactuar con la API.
*   **Contenerización (Planeado):** Toda la aplicación (backend, frontend, base de datos) será orquestada con Docker y Docker Compose.

## Arquitectura y Tecnologías.

| Componente | Tecnología | Descripción |
| :--- | :--- | :--- |
| **Backend** | `Python`, `Flask`, `Gunicorn` | Provee la API REST para votar y consultar resultados. |
| **Base de Datos** | `PostgreSQL` | Almacena los votos de forma persistente. |
| **Dependencias Python** | `psycopg2-binary`, `pytest` | Driver de base de datos y framework de testing. |
| **CI/CD** | `GitHub Actions` | Automatización de pruebas y (futuramente) builds. |
| **Frontend (Futuro)** | `HTML`, `CSS`, `JavaScript`, `Nginx` | Interfaz de usuario para los votantes. |
| **Orquestación (Futuro)**| `Docker`, `Docker Compose` | Para un entorno de desarrollo y despliegue consistente. |

## Estructura del Proyecto

```
practica-2/
├── .github/workflows/main.yml  # Workflow de CI con GitHub Actions
├── backend/
│   ├── app.py                  # Aplicación principal de Flask (API)
│   ├── requirements.txt        # Dependencias de Python
│   └── tests/
│       └── test_api.py         # Pruebas para la API
├── frontend/                   # (Aún no desarrollado)
├── .gitignore                  # Archivos ignorados por Git
├── init.sql                    # Script de inicialización para la BD
└── README.md                   # Este archivo
```

## Cómo Empezar (Backend Actual)

### Prerrequisitos

*   Python 3.9+
*   PostgreSQL instalado y corriendo.
*   Git

### Instalación y Configuración

1.  **Clona el repositorio:**
    ```bash
    git clone <URL-DE-TU-REPOSITORIO>
    cd practica-2
    ```

2.  **Instala las dependencias del backend:**
    ```bash
    pip install -r backend/requirements.txt
    ```

3.  **Configura la base de datos:**
    *   Crea una base de datos en PostgreSQL.
    *   Ejecuta el script `init.sql` para crear la tabla `votes` e inicializar los contadores.
        ```sql
        -- Ejemplo con psql
        psql -U tu_usuario -d tu_base_de_datos -f init.sql
        ```

4.  **Configura las variables de entorno:**
    La aplicación se configura mediante variables de entorno. Crea un archivo `.env` en la raíz del proyecto (este archivo está en el `.gitignore`, por lo que no se subirá al repositorio) o expórtalas en tu terminal.

    ```
    export DB_HOST="localhost"
    export DB_NAME="votes"
    export DB_USER="tu_usuario"
    export DB_PASS="tu_contraseña"
    ```

### Ejecutar el Backend

Para iniciar el servidor de desarrollo de Flask:

```bash
export FLASK_APP=backend/app.py
flask run
```

La API estará disponible en `http://127.0.0.1:5000`.

## API Endpoints

*   `GET /`: **Health Check**
    *   Verifica que la API está en funcionamiento.
    *   **Respuesta:** `{"status": "ok"}`

*   `GET /results`: **Obtener Resultados**
    *   Devuelve el conteo actual de votos.
    *   **Respuesta:** `{"cats": 0, "dogs": 0}`

*   `POST /vote/<option>`: **Emitir un Voto**
    *   Incrementa el contador para la opción especificada (`cats` o `dogs`).
    *   **Respuesta de éxito (201):** `{"ok": true, "voted": "cats"}`
    *   **Respuesta de error (400):** `{"error": "invalid option"}`

## Pruebas

Para ejecutar las pruebas automatizadas, asegúrate de tener las variables de entorno de la base de datos de prueba configuradas y ejecuta `pytest`:

```bash
pytest backend/tests/test_api.py
```
.

