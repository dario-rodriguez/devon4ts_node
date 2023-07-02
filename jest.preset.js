const nxPreset = require('@nx/jest/preset').default;

module.exports = {
  ...nxPreset,
  testMatch: [...nxPreset.testMatch, '!**/test.ts'],
  coverageReporters: ['clover', 'json', 'lcov', 'text'],
};
