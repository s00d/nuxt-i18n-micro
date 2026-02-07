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
          jsx: 'preserve',
          jsxImportSource: 'solid-js',
        },
      },
    ],
  },
  moduleNameMapper: {
    '^@i18n-micro/core$': '<rootDir>/../core/src',
    '^@i18n-micro/types$': '<rootDir>/../types/src',
    '^@i18n-micro/devtools-ui$': '<rootDir>/tests/mocks/devtools-ui-mock.ts',
    '^solid-js$': '<rootDir>/tests/mocks/solid-js-mock.ts',
    '^solid-js/web$': '<rootDir>/tests/mocks/solid-web-mock.ts',
    '^solid-js/store$': '<rootDir>/tests/mocks/solid-store-mock.ts',
  },
  collectCoverageFrom: ['src/**/*.{ts,tsx}', '!src/**/*.d.ts'],
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
}
