module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.cjs'],
  transform: {
    '^.+\\.jsx?$': ['babel-jest', { configFile: './babel.config.cjs' }]
  },
  testMatch: ['**/*.test.js', '**/*.test.jsx'],
  collectCoverageFrom: [
    'src/services/storageService.js',
    'src/hooks/useAutoSave.js',
    '!**/node_modules/**'
  ],
  coverageReporters: ['text', 'text-summary', 'html'],
  clearMocks: true
};
