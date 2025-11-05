// playwright.config.js
const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
  // Directorio donde se encuentran los tests
  testDir: './tests-e2e',

  // Prevenir que los tests se ejecuten en paralelo por ahora
  workers: 1,

  // Usar el navegador Chromium (Chrome) por defecto
  use: {
    browserName: 'chromium',
    baseURL: 'http://localhost:8080',
    screenshot: 'only-on-failure',
  },

  // Proyectos para diferentes navegadores
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  // Iniciar un servidor web local antes de ejecutar los tests
  webServer: {
    command: 'npm run start',
    port: 8080,
    reuseExistingServer: !process.env.CI,
  },
});
