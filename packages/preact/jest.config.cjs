module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/src', '<rootDir>/tests'],
  testMatch: ['**/__tests__/**/*.{ts,tsx}', '**/?(*.)+(spec|test).{ts,tsx}'],
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        tsconfig: {
          module: 'commonjs',
          jsx: 'react-jsx',
          jsxImportSource: 'preact',
        },
      },
    ],
    '^.+\\.m?js$': [
      'babel-jest',
      {
        presets: [['@babel/preset-env', { modules: 'cjs' }]],
      },
    ],
  },
  moduleNameMapper: {
    '^@i18n-micro/core$': '<rootDir>/../core/src',
    '^@i18n-micro/types$': '<rootDir>/../types/src',
    '^@i18n-micro/devtools-ui$': '<rootDir>/tests/mocks/devtools-ui-mock.ts',
    '^react$': 'preact/compat',
    '^react-dom$': 'preact/compat',
    '^preact/jsx-runtime$': 'preact/jsx-runtime',
  },
  transformIgnorePatterns: ['node_modules/(?!(preact|@testing-library/preact|@preact|preact-render-to-string)/)'],
  testEnvironmentOptions: {
    customExportConditions: [''],
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  collectCoverageFrom: ['src/**/*.{ts,tsx}', '!src/**/*.d.ts'],
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
}
