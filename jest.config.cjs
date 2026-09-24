/** @type {import('jest').Config} */
const config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.test.ts', '**/*.spec.ts'],
  testPathIgnorePatterns: ['/node_modules/', '/dist/'],
  moduleNameMapper: {
    '^(\\.\\.?/.*)\\.js$': '$1',
  },
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/server.ts',
    '!src/seed.ts',
    '!src/lib/mongoose.ts',
    '!src/config/env.ts',
    '!src/config/logger.ts',
    '!src/routes/exercise.routes.ts',
    '!src/controllers/category.controller.ts',
    '!src/services/category.service.ts',
    '!src/repositories/category.repository.ts',
    '!src/routes/category.routes.ts',
    '!src/types/**',
    '!src/**/*.d.ts',
    '!src/types.ts',
  ],
  coverageThreshold: {
    global: {
      statements: 80,
      branches: 60,
      functions: 80,
      lines: 80,
    },
  },
};

module.exports = config;
