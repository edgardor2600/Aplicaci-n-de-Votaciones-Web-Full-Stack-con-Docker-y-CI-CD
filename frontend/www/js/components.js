/**
 * Componentes reutilizables de la UI
 * Gestiona elementos interactivos como botones, notificaciones, etc.
 */

class VotingCard {
    constructor(element) {
        this.element = element;
        this.option = element.dataset.option;
        this.button = element.querySelector('.vote-btn');
        this.setupEventListeners();
    }

    setupEventListeners() {
        if (this.button) {
            this.button.addEventListener('click', () => this.handleVote());
        }
    }

    async handleVote() {
        this.button.disabled = true;
        this.button.textContent = 'Enviando voto...';
        
        try {
            const response = await app.vote(this.option);
            this.showSuccessMessage();
            app.refreshResults(); // Actualizar resultados después del voto
        } catch (error) {
            this.showErrorMessage(error.message);
        } finally {
            this.button.disabled = false;
            this.button.textContent = `Votar por ${this.option === 'cats' ? 'Gatos' : 'Perros'}`;
        }
    }

    showSuccessMessage() {
        const message = this.option === 'cats' 
            ? '¡Gracias por votar por los Gatos! 🐱' 
            : '¡Gracias por votar por los Perros! 🐶';
        app.showToast(message, 'success');
    }

    showErrorMessage(error) {
        const message = `Error al enviar voto: ${error}`;
        app.showToast(message, 'error');
    }

    // Método para actualizar estado visual
    updateVisualState(state) {
        this.element.classList.remove('pulse');
        
        if (state === 'success') {
            setTimeout(() => {
                this.element.classList.add('pulse');
            }, 100);
        }
    }
}

class ResultsDisplay {
    constructor() {
        this.elements = {
            catsCount: document.getElementById('cats-count'),
            dogsCount: document.getElementById('dogs-count'),
            catsPercentage: document.getElementById('cats-percentage'),
            dogsPercentage: document.getElementById('dogs-percentage'),
            catsBar: document.getElementById('cats-bar'),
            dogsBar: document.getElementById('dogs-bar'),
            totalVotes: document.getElementById('total-votes')
        };
    }

    /**
     * Actualiza la visualización de resultados
     * @param {object} results - {cats: number, dogs: number}
     */
    updateResults(results) {
        const cats = results.cats || 0;
        const dogs = results.dogs || 0;
        const total = cats + dogs;

        // Actualizar contadores
        this.updateCount(this.elements.catsCount, cats);
        this.updateCount(this.elements.dogsCount, dogs);
        this.updateCount(this.elements.totalVotes, total);

        // Actualizar porcentajes
        const catsPercentage = this.calculatePercentage(cats, total);
        const dogsPercentage = this.calculatePercentage(dogs, total);

        this.elements.catsPercentage.textContent = `${catsPercentage}%`;
        this.elements.dogsPercentage.textContent = `${dogsPercentage}%`;

        // Actualizar barras de progreso
        this.updateBar(this.elements.catsBar, catsPercentage);
        this.updateBar(this.elements.dogsBar, dogsPercentage);
    }

    /**
     * Actualiza un contador con animación
     * @param {HTMLElement} element - Elemento DOM
     * @param {number} value - Valor nuevo
     */
    updateCount(element, value) {
        const currentValue = parseInt(element.textContent) || 0;
        const increment = Math.ceil((value - currentValue) / 20);
        
        if (currentValue === value) return;

        const timer = setInterval(() => {
            const newValue = Math.min(currentValue + increment, value);
            element.textContent = APIClient.formatNumber(newValue);
            
            if (newValue >= value) {
                clearInterval(timer);
            }
        }, 50);
    }

    /**
     * Actualiza el ancho de una barra de progreso
     * @param {HTMLElement} element - Elemento de la barra
     * @param {number} percentage - Porcentaje (0-100)
     */
    updateBar(element, percentage) {
        element.style.width = `${percentage}%`;
    }

    /**
     * Calcula el porcentaje
     * @param {number} count - Cantidad
     * @param {number} total - Total
     * @returns {number} Porcentaje
     */
    calculatePercentage(count, total) {
        if (total === 0) return 0;
        return Math.round((count / total) * 100);
    }
}

class ToastNotification {
    constructor() {
        this.container = document.getElementById('toast-container');
        this.toasts = [];
    }

    /**
     * Muestra una notificación toast
     * @param {string} message - Mensaje
     * @param {string} type - Tipo: 'success', 'error', 'warning', 'info'
     * @param {number} duration - Duración en ms (por defecto 3000)
     */
    show(message, type = 'info', duration = 3000) {
        const toast = this.createToast(message, type);
        this.container.appendChild(toast);
        this.toasts.push(toast);

        // Animación de entrada
        setTimeout(() => toast.classList.add('show'), 100);

        // Auto-remove
        setTimeout(() => {
            this.removeToast(toast);
        }, duration);
    }

    /**
     * Crea un elemento toast
     * @param {string} message - Mensaje
     * @param {string} type - Tipo de notificación
     * @returns {HTMLElement} Elemento toast
     */
    createToast(message, type) {
        const toast = document.createElement('div');
        toast.className = `toast toast--${type}`;
        
        const icons = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️'
        };

        toast.innerHTML = `
            <div class="toast-content">
                <span class="toast-icon">${icons[type] || icons.info}</span>
                <span class="toast-message">${message}</span>
            </div>
            <button class="toast-close">&times;</button>
        `;

        // Event listener para cerrar manualmente
        const closeBtn = toast.querySelector('.toast-close');
        closeBtn.addEventListener('click', () => {
            this.removeToast(toast);
        });

        return toast;
    }

    /**
     * Remueve un toast con animación
     * @param {HTMLElement} toast - Elemento toast
     */
    removeToast(toast) {
        toast.classList.add('removing');
        
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
            this.toasts = this.toasts.filter(t => t !== toast);
        }, 300);
    }

    /**
     * Limpia todos los toasts
     */
    clear() {
        this.toasts.forEach(toast => {
            this.removeToast(toast);
        });
    }
}

class LoadingOverlay {
    constructor() {
        this.overlay = document.getElementById('loading-overlay');
        this.isVisible = false;
    }

    /**
     * Muestra el overlay de carga
     * @param {string} message - Mensaje opcional
     */
    show(message = 'Cargando...') {
        const text = this.overlay.querySelector('.loading-text');
        if (text) {
            text.textContent = message;
        }
        this.overlay.classList.add('show');
        this.isVisible = true;
    }

    /**
     * Oculta el overlay de carga
     */
    hide() {
        this.overlay.classList.remove('show');
        this.isVisible = false;
    }

    /**
     * Verifica si el overlay está visible
     * @returns {boolean}
     */
    isShowing() {
        return this.isVisible;
    }
}

// Exportar clases para uso global
window.VotingCard = VotingCard;
window.ResultsDisplay = ResultsDisplay;
window.ToastNotification = ToastNotification;
window.LoadingOverlay = LoadingOverlay;