const { pathsToModuleNameMapper } = require('ts-jest');
const { compilerOptions } = require('./tsconfig.json');

// Packages that ship ESM only. Node 20.19+ can require() those, but jest's module
// runtime cannot, so they have to be transpiled to CommonJS for tests.
const esmOnlyDependencies = ['uuid'];

module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
    '^.+\\.m?js$': ['ts-jest', { isolatedModules: true, tsconfig: { allowJs: true, module: 'commonjs' } }],
  },
  transformIgnorePatterns: [`/node_modules/(?!(${esmOnlyDependencies.join('|')})/)`],
  moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths, { prefix: '<rootDir>/src' }),
};
