module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/src', '<rootDir>/tests'],
  testMatch: ['**/__tests__/**/*.ts', '**/?(*.)+(spec|test).ts'],
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  moduleNameMapper: {
    '^@i18n-micro/core$': '<rootDir>/../core/src',
    '^@i18n-micro/types$': '<rootDir>/../types/src',
  },
  collectCoverageFrom: ['src/**/*.ts', '!src/**/*.d.ts'],
}
