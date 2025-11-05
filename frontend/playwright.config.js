// frontend/playwright.config.js
const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
  // Directorio donde se encuentran los tests
  testDir: './tests-e2e',

  // Tiempo máximo por test (evita cortes prematuros en CI)
  timeout: 30_000,

  // Config de aserciones (útil cuando la red del CI está un poco lenta)
  expect: {
    timeout: 7_000,
  },

  // No paralelizamos ahora
  workers: 1,
  fullyParallel: false,

  // Reporters (list siempre visible; HTML útil como artefacto si falla)
  reporter: [['list'] /*, ['html', { open: 'never' }] */],

  // Usar Chromium por defecto
  use: {
    browserName: 'chromium',
    baseURL: 'http://localhost:8080',
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
  },

  // Proyecto: Chromium (Desktop)
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  // Iniciar el servidor de frontend antes de los tests
  webServer: {
    command: 'npm run start',         // => http-server www -P http://localhost:5000
    port: 8080,
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,                  // espera hasta 60s en CI
  },
});
