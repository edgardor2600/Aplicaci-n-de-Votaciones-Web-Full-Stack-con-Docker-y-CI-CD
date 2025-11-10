# Cats vs Dogs - Aplicación de Votaciones Full-Stack

Este proyecto es una aplicación web full-stack que permite a los usuarios votar por "Gatos" o "Perros" y ver los resultados en tiempo real. La aplicación está diseñada para ser ejecutada en contenedores Docker y cuenta con un flujo de Integración Continua (CI) utilizando GitHub Actions.

## Características

*   **Backend API:** Un servicio robusto construido con Flask (Python) que gestiona la lógica de negocio.
*   **Frontend Moderno:** Una interfaz de usuario interactiva y moderna construida con HTML, CSS (Tailwind CSS) y JavaScript modular.
*   **Base de Datos:** PostgreSQL para persistir los datos de las votaciones.
*   **Contenerización:** Toda la aplicación (backend, frontend, base de datos) está orquestada con Docker y Docker Compose para un entorno de desarrollo y despliegue consistente.
*   **Integración Continua:** Workflows de GitHub Actions que ejecutan tests automáticamente en cada `push` y `pull request` a la rama `main`.

## Arquitectura y Tecnologías

| Componente      | Tecnología                  | Descripción                                                 |
| :-------------- | :-------------------------- | :---------------------------------------------------------- |
| **Backend**     | `Python`, `Flask`, `Gunicorn` | Provee la API REST para votar y consultar resultados.       |
| **Frontend**    | `HTML`, `Tailwind CSS`, `JavaScript` | Interfaz de usuario para los votantes.                      |
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
│   │   └── js/
│   │       ├── app.js          # Lógica principal del frontend
│   │       ├── api.js          # Cliente para la API del backend
│   │       └── components.js   # Componentes de la UI
│   ├── tests-e2e/
│   │   ├── main.spec.js        # Pruebas E2E de funcionalidad principal
│   │   └── ui.spec.js          # Pruebas E2E de la interfaz de usuario
│   ├── nginx/
│   │   └── default.conf
│   └── Dockerfile
├── .gitignore
├── docker-compose.yml          # Orquestación de contenedores
├── init.sql                    # Script de inicialización para la BD
└── README.md                   # Este archivo
```

## Frontend Detallado

El frontend ha sido rediseñado para ser más moderno, interactivo y mantenible.

*   **Diseño y Estilos:** Se utiliza **Tailwind CSS** para un diseño rápido y responsivo. La interfaz es ahora más atractiva visualmente, con animaciones y un tema oscuro.
*   **JavaScript Modular:** El código JavaScript se ha separado en tres archivos principales para una mejor organización:
    *   `api.js`: Contiene una clase `APIClient` que maneja toda la comunicación con el backend.
    *   `components.js`: Define componentes de la interfaz de usuario como las tarjetas de votación (`VotingCard`), el display de resultados (`ResultsDisplay`), notificaciones (`ToastNotification`) y el overlay de carga (`LoadingOverlay`).
    *   `app.js`: Es el punto de entrada que inicializa la aplicación, coordina los componentes y maneja el estado general.
*   **Interactividad:**
    *   **Votación Asíncrona:** Al votar, se muestra un overlay de "cargando" y se envía la petición al backend sin recargar la página.
    *   **Notificaciones Toast:** Se muestran notificaciones no intrusivas para confirmar el voto o mostrar errores.
    *   **Actualización en Tiempo Real:** Los resultados se actualizan automáticamente cada 3 segundos, consultando al backend. Esta funcionalidad puede ser pausada por el usuario.

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

Las pruebas End-to-End (E2E) verifican la funcionalidad completa del frontend desde la perspectiva del usuario. Se utilizan **Playwright** para simular interacciones en un navegador real.

*   `main.spec.js`: Contiene pruebas críticas sobre la funcionalidad principal, como emitir un voto y verificar que los resultados se actualicen correctamente.
*   `ui.spec.js`: Se enfoca en verificar que los elementos visuales de la interfaz de usuario se rendericen correctamente y que las animaciones básicas funcionen como se espera.

Para ejecutarlas localmente:

```bash
# Desde el directorio raíz
cd frontend
npm install
npx playwright test
```
