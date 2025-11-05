/**
 * API Client para comunicación con el backend Flask
 * Maneja todas las llamadas a la API REST del servidor
 */

class APIClient {
    constructor(baseUrl = '/api') {
        this.baseUrl = baseUrl;
        this.defaultHeaders = {
            'Content-Type': 'application/json',
        };
    }

    /**
     * Realiza una petición HTTP genérica
     * @param {string} endpoint - Endpoint de la API
     * @param {object} options - Opciones de la petición
     * @returns {Promise} Respuesta de la API
     */
    async request(endpoint, options = {}) {
        const url = `${this.baseUrl}${endpoint}`;
        
        const config = {
            method: 'GET',
            headers: { ...this.defaultHeaders, ...options.headers },
            ...options,
        };

        // Agregar body si existe
        if (config.method !== 'GET' && options.data) {
            config.body = JSON.stringify(options.data);
        }

        try {
            const response = await fetch(url, config);
            
            // Verificar si la respuesta es exitosa
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({
                    error: `HTTP Error ${response.status}`
                }));
                throw new Error(errorData.error || `HTTP Error ${response.status}`);
            }

            // Parsear respuesta JSON
            return await response.json();
        } catch (error) {
            console.error(`API Request failed: ${url}`, error);
            throw error;
        }
    }

    /**
     * Health check del servidor
     * @returns {Promise<object>} Estado del servidor
     */
    async healthCheck() {
        return this.request('/');
    }

    /**
     * Obtiene los resultados de las votaciones
     * @returns {Promise<object>} Resultados {cats: number, dogs: number}
     */
    async getResults() {
        return this.request('/results');
    }

    /**
     * Envía un voto
     * @param {string} option - Opción a votar ('cats' o 'dogs')
     * @returns {Promise<object>} Respuesta del voto
     */
    async vote(option) {
        if (!['cats', 'dogs'].includes(option)) {
            throw new Error('Opción inválida. Debe ser "cats" o "dogs"');
        }
        
        return this.request(`/vote/${option}`, {
            method: 'POST',
        });
    }

    /**
     * Formatea números para mostrar con separadores de miles
     * @param {number} num - Número a formatear
     * @returns {string} Número formateado
     */
    static formatNumber(num) {
        return new Intl.NumberFormat('es-ES').format(num);
    }

    /**
     * Calcula el porcentaje de votos
     * @param {number} count - Cantidad de votos
     * @param {number} total - Total de votos
     * @returns {number} Porcentaje (0-100)
     */
    static calculatePercentage(count, total) {
        if (total === 0) return 0;
        return Math.round((count / total) * 100);
    }
}

/**
 * Gestor de errores de la API
 */
class APIErrorHandler {
    constructor() {
        this.errorMessages = {
            'Network Error': 'Error de conexión. Verifica tu conexión a internet.',
            'Failed to fetch': 'No se pudo conectar con el servidor.',
        };
    }

    /**
     * Maneja errores de la API y muestra mensajes apropiados
     * @param {Error} error - Error capturado
     * @returns {string} Mensaje de error para el usuario
     */
    handle(error) {
        const message = error.message;
        
        // Errores conocidos
        if (this.errorMessages[message]) {
            return this.errorMessages[message];
        }

        // Errores HTTP
        if (message.includes('HTTP Error')) {
            const statusCode = parseInt(message.split(' ').pop());
            switch (statusCode) {
                case 400:
                    return 'Solicitud inválida. Verifica los datos enviados.';
                case 404:
                    return 'El recurso solicitado no fue encontrado.';
                case 500:
                    return 'Error interno del servidor. Intenta más tarde.';
                default:
                    return `Error del servidor (${statusCode}). Intenta más tarde.`;
            }
        }

        // Errores de red/conexión
        if (message.includes('fetch') || message.includes('network')) {
            return 'Error de conexión. Verifica que el servidor esté funcionando.';
        }

        // Error genérico
        return 'Ha ocurrido un error inesperado. Intenta más tarde.';
    }
}

// Instancia global del cliente API
const apiClient = new APIClient();
const apiErrorHandler = new APIErrorHandler();

// Exportar para uso en otros módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { APIClient, APIErrorHandler, apiClient };
}