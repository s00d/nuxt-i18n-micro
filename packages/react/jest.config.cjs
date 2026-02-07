module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/src', '<rootDir>/tests'],
  testMatch: ['**/__tests__/**/*.{ts,tsx}', '**/?(*.)+(spec|test).{ts,tsx}'],
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        useESM: true,
        tsconfig: {
          module: 'esnext',
        },
      },
    ],
  },
  moduleNameMapper: {
    '^@i18n-micro/core$': '<rootDir>/../core/src',
    '^@i18n-micro/types$': '<rootDir>/../types/src',
    '^@i18n-micro/devtools-ui$': '<rootDir>/tests/mocks/devtools-ui-mock.ts',
    '\\.vue$': '<rootDir>/tests/mocks/vue-mock.ts',
  },
  collectCoverageFrom: ['src/**/*.{ts,tsx}', '!src/**/*.d.ts'],
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
}
