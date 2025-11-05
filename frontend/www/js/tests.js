/**
 * Tests para la funcionalidad del Frontend
 * Utiliza Jest-like assertions para testing en browser
 */

class FrontendTests {
    constructor() {
        this.tests = [];
        this.passed = 0;
        this.failed = 0;
    }

    /**
     * Agrega un test a la lista
     * @param {string} name - Nombre del test
     * @param {function} testFn - Función del test
     */
    test(name, testFn) {
        this.tests.push({ name, testFn });
    }

    /**
     * Ejecuta todos los tests
     */
    async run() {
        console.log('🧪 Iniciando tests del frontend...\n');
        
        for (const test of this.tests) {
            try {
                await test.testFn();
                this.passed++;
                console.log(`✅ PASS: ${test.name}`);
            } catch (error) {
                this.failed++;
                console.log(`❌ FAIL: ${test.name}`);
                console.log(`   Error: ${error.message}`);
            }
        }
        
        console.log(`\n📊 Resultados: ${this.passed} passed, ${this.failed} failed`);
        return this.failed === 0;
    }

    /**
     * Verifica que un elemento exista en el DOM
     * @param {string} selector - Selector CSS
     * @param {string} message - Mensaje de error
     */
    static elementExists(selector, message = '') {
        const element = document.querySelector(selector);
        if (!element) {
            throw new Error(`Elemento no encontrado: ${selector} ${message}`);
        }
        return element;
    }

    /**
     * Verifica que un elemento tenga el texto esperado
     * @param {string} selector - Selector CSS
     * @param {string} expectedText - Texto esperado
     */
    static elementHasText(selector, expectedText) {
        const element = FrontendTests.elementExists(selector);
        if (!element.textContent.includes(expectedText)) {
            throw new Error(`Texto no encontrado. Esperado: "${expectedText}", Actual: "${element.textContent}"`);
        }
    }

    /**
     * Verifica que una función throwing error
     * @param {function} fn - Función a testear
     * @param {string} expectedError - Error esperado (opcional)
     */
    static async expectToThrow(fn, expectedError = '') {
        try {
            await fn();
            throw new Error('Se esperaba que la función tirara un error');
        } catch (error) {
            if (expectedError && !error.message.includes(expectedError)) {
                throw new Error(`Error inesperado. Esperado: "${expectedError}", Actual: "${error.message}"`);
            }
        }
    }
}

// Instancia global para tests
const frontendTests = new FrontendTests();

// Tests básicos de DOM y estructura
frontendTests.test('Estructura HTML - Header existe', () => {
    const header = FrontendTests.elementExists('.header');
    if (!header.querySelector('.logo')) {
        throw new Error('Logo no encontrado en el header');
    }
    if (!header.querySelector('.nav')) {
        throw new Error('Navegación no encontrada en el header');
    }
});

frontendTests.test('Estructura HTML - Sección de votación existe', () => {
    const votingSection = FrontendTests.elementExists('#votar');
    const catsCard = votingSection.querySelector('[data-option="cats"]');
    const dogsCard = votingSection.querySelector('[data-option="dogs"]');
    
    if (!catsCard) throw new Error('Card de gatos no encontrada');
    if (!dogsCard) throw new Error('Card de perros no encontrada');
});

frontendTests.test('Estructura HTML - Sección de resultados existe', () => {
    const resultsSection = FrontendTests.elementExists('#resultados');
    
    FrontendTests.elementExists('#cats-count', 'Contador de gatos');
    FrontendTests.elementExists('#dogs-count', 'Contador de perros');
    FrontendTests.elementExists('#cats-bar', 'Barra de gatos');
    FrontendTests.elementExists('#dogs-bar', 'Barra de perros');
});

frontendTests.test('Estructura HTML - Elementos de loading existen', () => {
    FrontendTests.elementExists('#loading-overlay', 'Overlay de carga');
    FrontendTests.elementExists('#toast-container', 'Contenedor de toasts');
});

frontendTests.test('JavaScript - Clases globales están definidas', () => {
    if (typeof window.APIClient !== 'function') {
        throw new Error('APIClient no está definido');
    }
    if (typeof window.VotingApp !== 'function') {
        throw new Error('VotingApp no está definido');
    }
    if (typeof window.ToastNotification !== 'function') {
        throw new Error('ToastNotification no está definido');
    }
});

frontendTests.test('JavaScript - Instancia de API Client se crea correctamente', () => {
    const api = new APIClient();
    if (api.baseUrl !== '/api') {
        throw new Error('Base URL incorrecta en APIClient');
    }
});

frontendTests.test('CSS - Variables CSS están definidas', () => {
    const rootStyles = getComputedStyle(document.documentElement);
    
    // Verificar algunas variables clave
    const primaryColor = rootStyles.getPropertyValue('--primary-color').trim();
    if (!primaryColor) {
        throw new Error('Variable --primary-color no encontrada');
    }
    
    const fontFamily = rootStyles.getPropertyValue('--font-family').trim();
    if (!fontFamily) {
        throw new Error('Variable --font-family no encontrada');
    }
});

frontendTests.test('API Client - Formato de números', () => {
    const formatted = APIClient.formatNumber(1234567);
    if (formatted !== '1.234.567') {
        throw new Error(`Formato de número incorrecto. Esperado: "1.234.567", Actual: "${formatted}"`);
    }
});

frontendTests.test('API Client - Cálculo de porcentajes', () => {
    const percentage = APIClient.calculatePercentage(25, 100);
    if (percentage !== 25) {
        throw new Error(`Porcentaje incorrecto. Esperado: 25, Actual: ${percentage}`);
    }
    
    // Test edge case
    const zeroPercentage = APIClient.calculatePercentage(0, 100);
    if (zeroPercentage !== 0) {
        throw new Error(`Porcentaje con cero incorrecto. Esperado: 0, Actual: ${zeroPercentage}`);
    }
});

// Exportar para uso en la consola del navegador
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { FrontendTests, frontendTests };
}