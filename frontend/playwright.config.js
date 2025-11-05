// playwright.config.js
const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
  // Directorio donde se encuentran los tests
  testDir: './tests-e2e',

  // Timeout extendido para CI
  timeout: 30000,
  
  // Prevenir que los tests se ejecuten en paralelo
  workers: 1,

  // Configuración global
  use: {
    browserName: 'chromium',
    baseURL: 'http://localhost:8080',
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
    // Tiempo extra para operaciones de red
    actionTimeout: 10000,
  },

  // Proyectos para diferentes navegadores
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  // Configuración del servidor web
  webServer: {
    // Usar http-server con proxy al backend
    command: 'npx http-server www -p 8080 -P http://localhost:5000 --cors',
    port: 8080,
    timeout: 60000,
    reuseExistingServer: !process.env.CI,
    stdout: 'pipe',
    stderr: 'pipe',
  },

  // Configuración de reportes
  reporter: [
    ['list'],
    ['html', { outputFolder: 'playwright-report', open: 'never' }]
  ],
});