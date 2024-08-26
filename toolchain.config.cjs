/* eslint-env node, es2018 */
module.exports = {
  cjsBabelEnv: { forceAllTransforms: true },
  // esmBabelEnv: { targets: { node: 16 } },
  outputEsm: false, // disables ESM output (default: true)
  // esWrapper: true, // outputs ES module wrappers for CJS modules (default: false)
  // sourceMaps: false, // default is true (outputs .map files, also accepts 'inline' or 'both')
  scripts: {
    build: 'rsbuild build',
    'build:smoke-test': 'exit 0',
  },
}
