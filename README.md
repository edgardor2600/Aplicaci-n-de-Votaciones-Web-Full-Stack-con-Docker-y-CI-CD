# Cats vs Dogs - Aplicación de Votaciones Full-Stack

Este proyecto es una aplicación web full-stack que permite a los usuarios votar por "Gatos" o "Perros" y ver los resultados en tiempo real. La aplicación está diseñada para ser ejecutada en contenedores Docker y cuenta con un flujo de Integración Continua (CI) utilizando GitHub Actions.

## Características

*   **Backend API:** Un servicio robusto construido con Flask (Python) que gestiona la lógica de negocio.
*   **Frontend:** Una interfaz de usuario interactiva (HTML, CSS, JS) para que los usuarios puedan votar y ver los resultados.
*   **Base de Datos:** PostgreSQL para persistir los datos de las votaciones.
*   **Contenerización:** Toda la aplicación (backend, frontend, base de datos) está orquestada con Docker y Docker Compose para un entorno de desarrollo y despliegue consistente.
*   **Integración Continua:** Workflows de GitHub Actions que ejecutan tests automáticamente en cada `push` y `pull request` a la rama `main`.

## Arquitectura y Tecnologías

| Componente      | Tecnología                  | Descripción                                                 |
| :-------------- | :-------------------------- | :---------------------------------------------------------- |
| **Backend**     | `Python`, `Flask`, `Gunicorn` | Provee la API REST para votar y consultar resultados.       |
| **Frontend**    | `HTML`, `CSS`, `JavaScript` | Interfaz de usuario para los votantes.                      |
| **Servidor Web**| `Nginx`                     | Sirve el frontend estático y actúa como proxy inverso para la API. |
| **Base de Datos** | `PostgreSQL`                | Almacena los votos de forma persistente.                    |
| **CI/CD**       | `GitHub Actions`            | Automatización de pruebas y builds.                         |
| **Orquestación**| `Docker`, `Docker Compose`  | Para un entorno de desarrollo y despliegue consistente.     |

## Estructura del Proyecto

```
practica-2/
├── .github/workflows/          # Workflows de CI con GitHub Actions
│   ├── backend-ci.yml
│   └── frontend-ci.yml
├── backend/
│   ├── app.py                  # Aplicación principal de Flask (API)
│   ├── requirements.txt        # Dependencias de Python
│   └── tests/
│       └── test_api.py         # Pruebas para la API
├── frontend/
│   ├── www/
│   │   ├── index.html
│   │   ├── css/styles.css
│   │   └── js/app.js
│   ├── nginx/
│   │   └── default.conf
│   └── Dockerfile
├── .gitignore
├── docker-compose.yml          # Orquestación de contenedores
├── init.sql                    # Script de inicialización para la BD
└── README.md                   # Este archivo
```

## Cómo Empezar

### Prerrequisitos

*   Docker
*   Docker Compose

### Ejecución

1.  **Clona el repositorio:**
    ```bash
    git clone <URL-DE-TU-REPOSITORIO>
    cd practica-2
    ```

2.  **Levanta los servicios con Docker Compose:**
    ```bash
    docker-compose up --build
    ```

3.  **Accede a la aplicación:**
    Abre tu navegador y visita `http://localhost`.

La aplicación estará disponible en el puerto 80. El backend estará disponible en el puerto 5000.

## API Endpoints

*   `GET /api/`: **Health Check**
    *   Verifica que la API está en funcionamiento.
    *   **Respuesta:** `{"status": "ok"}`

*   `GET /api/results`: **Obtener Resultados**
    *   Devuelve el conteo actual de votos.
    *   **Respuesta:** `{"cats": 0, "dogs": 0}`

*   `POST /api/vote/<option>`: **Emitir un Voto**
    *   Incrementa el contador para la opción especificada (`cats` o `dogs`).
    *   **Respuesta de éxito (201):** `{"ok": true, "voted": "cats"}`
    *   **Respuesta de error (400):** `{"error": "invalid option"}`

## Pruebas

Las pruebas se ejecutan automáticamente en el pipeline de CI/CD de GitHub Actions. También puedes ejecutarlas localmente.

### Pruebas del Backend

```bash
# Desde el directorio raíz
docker-compose exec backend pytest tests/test_api.py
```

### Pruebas del Frontend (E2E)

Las pruebas E2E se realizan con Playwright. Para ejecutarlas:

```bash
# Desde el directorio raíz
cd frontend
npm install
npx playwright test
```