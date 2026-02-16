module.exports = {
  roots: ['<rootDir>/tests'],
  testMatch: ['**/perf-benchmark.test.ts'],
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
}
