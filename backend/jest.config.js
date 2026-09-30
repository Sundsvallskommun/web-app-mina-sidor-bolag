const { pathsToModuleNameMapper } = require('ts-jest');
const { compilerOptions } = require('./tsconfig.json');

// Packages that ship ESM only. Node 20.19+ can require() those, but jest's module
// runtime cannot, so they have to be transpiled to CommonJS for tests.
// htmlparser2 and its dependency chain are pulled in by sanitize-html >= 2.17.2.
const esmOnlyDependencies = [
  'uuid',
  'htmlparser2',
  'entities',
  'domhandler',
  'domutils',
  'dom-serializer',
  'domelementtype',
];

module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
    '^.+\\.m?js$': ['ts-jest', { isolatedModules: true, tsconfig: { allowJs: true, module: 'commonjs' } }],
  },
  // `(.*/)?` also matches copies nested under another package's node_modules.
  transformIgnorePatterns: [`/node_modules/(?!(.*/)?(${esmOnlyDependencies.join('|')})/)`],
  moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths, { prefix: '<rootDir>/src' }),
};
