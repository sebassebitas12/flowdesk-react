module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.cjs'],
  transform: {},
  testMatch: ['**/*.test.js'],
  collectCoverageFrom: [
    'src/services/storageService.js',
    'src/hooks/useAutoSave.js',
    '!**/node_modules/**'
  ],
  coverageReporters: ['text', 'text-summary', 'html'],
  clearMocks: true
};
