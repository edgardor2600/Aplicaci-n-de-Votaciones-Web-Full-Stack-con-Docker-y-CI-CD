/**
 * Aplicación principal Cats vs Dogs
 * Coordina toda la funcionalidad de la aplicación
 */

class VotingApp {
    constructor() {
        this.isInitialized = false;
        this.resultsDisplay = null;
        this.toastNotification = null;
        this.loadingOverlay = null;
        this.votingCards = [];
        this.updateInterval = null;
        this.autoRefresh = true;
        this.refreshInterval = 3000; // 3 segundos
    }

    /**
     * Inicializa la aplicación
     */
    async init() {
        try {
            console.log('🐾 Inicializando aplicación Cats vs Dogs...');

            // Verificar conectividad con el servidor
            await this.checkServerHealth();

            // Inicializar componentes
            this.initializeComponents();

            // Configurar event listeners
            this.setupEventListeners();

            // Cargar resultados iniciales
            await this.refreshResults();

            // Iniciar actualización automática
            this.startAutoRefresh();

            // Marcar como inicializado
            this.isInitialized = true;
            this.showToast('¡Aplicación lista! 🎉', 'success', 2000);

            console.log('✅ Aplicación inicializada correctamente');

        } catch (error) {
            console.error('❌ Error al inicializar la aplicación:', error);
            this.showToast('Error al conectar con el servidor', 'error');
        }
    }

    /**
     * Verifica que el servidor esté funcionando
     */
    async checkServerHealth() {
        try {
            const response = await apiClient.healthCheck();
            if (response.status !== 'ok') {
                throw new Error('Servidor no responde correctamente');
            }
            console.log('✅ Servidor responde correctamente');
        } catch (error) {
            console.error('❌ Error de conectividad:', error);
            throw new Error('No se puede conectar con el servidor');
        }
    }

    /**
     * Inicializa todos los componentes
     */
    initializeComponents() {
        // Inicializar display de resultados
        this.resultsDisplay = new ResultsDisplay();

        // Inicializar notificaciones
        this.toastNotification = new ToastNotification();

        // Inicializar overlay de carga
        this.loadingOverlay = new LoadingOverlay();

        // Inicializar cards de votación
        this.initializeVotingCards();

        console.log('✅ Componentes inicializados');
    }

    /**
     * Inicializa las tarjetas de votación
     */
    initializeVotingCards() {
        const cards = document.querySelectorAll('.voting-card');
        this.votingCards = Array.from(cards).map(card => new VotingCard(card));
        console.log(`✅ ${this.votingCards.length} tarjetas de votación inicializadas`);
    }

    /**
     * Configura event listeners globales
     */
    setupEventListeners() {
        // Smooth scroll para navegación
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const target = document.querySelector(link.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth' });
                }
            });
        });

        // Botón para pausar/reanudar auto-refresh
        this.setupAutoRefreshToggle();

        // Manejar visibilidad de la página
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.stopAutoRefresh();
            } else {
                this.startAutoRefresh();
            }
        });

        console.log('✅ Event listeners configurados');
    }

    /**
     * Configura el toggle de auto-refresh
     */
    setupAutoRefreshToggle() {
        // Crear botón de toggle en la sección de resultados
        const resultsContainer = document.querySelector('.results-container');
        if (resultsContainer) {
            const toggleButton = document.createElement('button');
            toggleButton.className = 'refresh-toggle';
            toggleButton.innerHTML = '🔄 Auto-refresh: ON';
            toggleButton.addEventListener('click', () => {
                this.toggleAutoRefresh();
            });
            
            resultsContainer.appendChild(toggleButton);
        }
    }

    /**
     * Envía un voto
     * @param {string} option - Opción a votar ('cats' o 'dogs')
     */
    async vote(option) {
        this.loadingOverlay.show('Enviando voto...');
        
        try {
            const response = await apiClient.vote(option);
            
            if (response.ok) {
                // Actualizar visual del card voteado
                const votedCard = this.votingCards.find(card => card.option === option);
                if (votedCard) {
                    votedCard.updateVisualState('success');
                }
                
                // Actualizar resultados inmediatamente
                await this.refreshResults();
                
                return response;
            } else {
                throw new Error(response.error || 'Error al enviar voto');
            }
            
        } catch (error) {
            const userMessage = apiErrorHandler.handle(error);
            throw new Error(userMessage);
        } finally {
            this.loadingOverlay.hide();
        }
    }

    /**
     * Actualiza los resultados desde el servidor
     */
    async refreshResults() {
        try {
            const results = await apiClient.getResults();
            this.resultsDisplay.updateResults(results);
        } catch (error) {
            console.error('Error al obtener resultados:', error);
            // Solo mostrar error si no es un error de conectividad temporal
            if (!error.message.includes('fetch')) {
                this.showToast('Error al cargar resultados', 'warning');
            }
        }
    }

    /**
     * Inicia la actualización automática de resultados
     */
    startAutoRefresh() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
        }
        
        this.updateInterval = setInterval(() => {
            if (this.autoRefresh && this.isInitialized) {
                this.refreshResults();
            }
        }, this.refreshInterval);
        
        console.log('✅ Auto-refresh iniciado');
    }

    /**
     * Detiene la actualización automática
     */
    stopAutoRefresh() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
        }
        console.log('⏸️ Auto-refresh detenido');
    }

    /**
     * Toggle del auto-refresh
     */
    toggleAutoRefresh() {
        this.autoRefresh = !this.autoRefresh;
        
        if (this.autoRefresh) {
            this.startAutoRefresh();
            this.showToast('Auto-refresh activado', 'success', 1500);
        } else {
            this.stopAutoRefresh();
            this.showToast('Auto-refresh desactivado', 'info', 1500);
        }

        // Actualizar botón de toggle
        const toggleButton = document.querySelector('.refresh-toggle');
        if (toggleButton) {
            toggleButton.innerHTML = `🔄 Auto-refresh: ${this.autoRefresh ? 'ON' : 'OFF'}`;
        }
    }

    /**
     * Muestra una notificación toast
     * @param {string} message - Mensaje
     * @param {string} type - Tipo ('success', 'error', 'warning', 'info')
     * @param {number} duration - Duración en ms
     */
    showToast(message, type = 'info', duration = 3000) {
        if (this.toastNotification) {
            this.toastNotification.show(message, type, duration);
        }
    }

    /**
     * Destruye la aplicación y limpia recursos
     */
    destroy() {
        this.stopAutoRefresh();
        this.isInitialized = false;
        console.log('🗑️ Aplicación destruida');
    }
}

// Crear instancia global de la aplicación
const app = new VotingApp();

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    app.init();
});

// Manejar cierre de ventana/pestaña
window.addEventListener('beforeunload', () => {
    app.destroy();
});

// Exportar para debugging en consola
window.app = app;