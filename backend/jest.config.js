module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testTimeout: 50000,
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  moduleFileExtensions: ['ts', 'js'],
  testMatch: ['**/tests/**/*.test.ts'],
  transformIgnorePatterns: ['/node_modules/'],
};
