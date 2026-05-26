module.exports = {
  roots: ['<rootDir>/tests'],
  testMatch: ['**/?(*.)+(spec|test).[tj]s?(x)'],
  testPathIgnorePatterns: ['/node_modules/', 'perf-benchmark', '/tests/publish/'],
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
}
