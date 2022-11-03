const path = require('path')
const MovationWebpackPlugin = require('./webpack-plugins/movation')
function resolveEntry(pkg) {
  return path.join(__dirname, 'packages', pkg, 'src/index.ts')
}
console.log(resolveEntry('core'))
module.exports = {
  mode: 'development',
  entry: {
    core: resolveEntry('core'),
    parameter: resolveEntry('parameter'),
    route: resolveEntry('route'),
    validate: resolveEntry('validate')
  },
  output: {
    filename: '[name].js',
    path: __dirname + '/dist'
  },
  module: {
    rules: [{ test: /.ts$/, use: 'ts-loader' }]
  },
  plugins: [new MovationWebpackPlugin()]
}
