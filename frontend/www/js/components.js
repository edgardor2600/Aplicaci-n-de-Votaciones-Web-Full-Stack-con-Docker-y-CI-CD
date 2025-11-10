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

        // Efecto visual al pasar el mouse
        this.element.addEventListener('mouseenter', () => {
            this.element.classList.add('pulse');
        });
        this.element.addEventListener('mouseleave', () => {
            this.element.classList.remove('pulse');
        });
    }

    async handleVote() {
        const buttonText = this.button.querySelector('.button-text');
        if (!buttonText) return; // Safety check

        this.button.disabled = true;
        buttonText.textContent = 'Enviando...';

        try {
            const response = await app.vote(this.option);
            if (response?.ok) {
                const message = this.option === 'cats'
                    ? '¡Gracias por votar por los Gatos! 🐱'
                    : '¡Gracias por votar por los Perros! 🐶';
                app.showToast(message, 'success');
            }
        } catch (error) {
            app.showToast(error.message || 'Error al enviar voto', 'error');
        } finally {
            this.button.disabled = false;
            buttonText.textContent = `Votar por ${this.option === 'cats' ? 'Gatos' : 'Perros'}`;
        }
    }

    // Método para actualizar estado visual
    updateVisualState(state) {
        this.element.classList.remove('pulse');

        if (state === 'success') {
            // Define the appropriate ring color based on the card's option
            const ringColor = this.option === 'cats' ? 'ring-indigo-500' : 'ring-teal-500';
            
            // Add animation classes for a visual "pop"
            this.element.classList.add('ring-2', ringColor, 'scale-105');

            // Remove the animation classes after a short delay
            setTimeout(() => {
                this.element.classList.remove('ring-2', ringColor, 'scale-105');
            }, 700);
        } else if (state === 'error') {
            // Optional: Add a visual indicator for an error
            this.element.classList.add('ring-2', 'ring-red-500');
            setTimeout(() => {
                this.element.classList.remove('ring-2', 'ring-red-500');
            }, 700);
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

    updateResults(results) {
        const cats = results.cats ?? 0;
        const dogs = results.dogs ?? 0;
        const total = cats + dogs;

        this.updateCount(this.elements.catsCount, cats);
        this.updateCount(this.elements.dogsCount, dogs);
        this.updateCount(this.elements.totalVotes, total);

        const catsPercentage = this.calculatePercentage(cats, total);
        const dogsPercentage = this.calculatePercentage(dogs, total);

        if (this.elements.catsPercentage) {
            this.elements.catsPercentage.textContent = `${catsPercentage}%`;
        }
        if (this.elements.dogsPercentage) {
            this.elements.dogsPercentage.textContent = `${dogsPercentage}%`;
        }

        if (this.elements.catsBar) {
            this.elements.catsBar.style.width = `${catsPercentage}%`;
        }
        if (this.elements.dogsBar) {
            this.elements.dogsBar.style.width = `${dogsPercentage}%`;
        }
    }

    updateCount(element, value) {
        if (!element) return;
        element.textContent = String(value);
    }

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

    createToast(message, type) {
        const toast = document.createElement('div');
        toast.className = `toast toast--${type}`;
        // Accesibilidad + testing estable
        toast.setAttribute('data-testid', 'toast');
        toast.setAttribute('role', 'status');
        toast.setAttribute('aria-live', 'polite');
        
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
            <button class="toast-close" aria-label="Cerrar notificación">&times;</button>
        `;

        const closeBtn = toast.querySelector('.toast-close');
        closeBtn.addEventListener('click', () => {
            this.removeToast(toast);
        });

        return toast;
    }

    removeToast(toast) {
        toast.classList.add('removing');
        setTimeout(() => {
            toast.remove();
            this.toasts = this.toasts.filter(t => t !== toast);
        }, 300);
    }

    clear() {
        this.toasts.forEach(toast => this.removeToast(toast));
    }
}

class LoadingOverlay {
    constructor() {
        this.overlay = document.getElementById('loading-overlay');
        this.isVisible = false;
    }

    show(message = 'Cargando...') {
        console.log('LoadingOverlay.show() called with message:', message);
        const text = this.overlay.querySelector('.loading-text');
        if (text) text.textContent = message;
        // ✔️ fuerza visibilidad tanto por clase como por estilo inline
        this.overlay.classList.add('show');
        this.overlay.style.display = 'flex';
        this.overlay.setAttribute('aria-hidden', 'false');
        this.isVisible = true;
    }

    hide() {
        console.log('LoadingOverlay.hide() called');
        if (this.overlay) {
            // ✔️ fuerza ocultamiento por clase y por estilo inline
            this.overlay.classList.remove('show');
            this.overlay.style.display = 'none';
            this.overlay.setAttribute('aria-hidden', 'true');
            this.isVisible = false;
        }
    }

    isShowing() {
        return this.isVisible;
    }
}

window.VotingCard = VotingCard;
window.ResultsDisplay = ResultsDisplay;
window.ToastNotification = ToastNotification;
window.LoadingOverlay = LoadingOverlay;
