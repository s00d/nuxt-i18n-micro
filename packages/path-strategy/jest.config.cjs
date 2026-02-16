module.exports = {
  roots: ['<rootDir>/tests'],
  testMatch: ['**/?(*.)+(spec|test).[tj]s?(x)'],
  testPathIgnorePatterns: ['/node_modules/', 'perf-benchmark'],
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
}
