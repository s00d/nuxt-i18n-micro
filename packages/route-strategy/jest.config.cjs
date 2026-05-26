module.exports = {
  roots: ['<rootDir>/tests'],
  testMatch: ['**/?(*.)+(spec|test).[tj]s?(x)'],
  testPathIgnorePatterns: ['/node_modules/', '/tests/publish/'],
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
}
