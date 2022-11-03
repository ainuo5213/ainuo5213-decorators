const path = require('path')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const MovationWebpackPlugin = require('./webpack-plugins/movation')
function resolveEntry(pkg) {
  return path.join(__dirname, 'packages', pkg, 'src/index.ts')
}
module.exports = {
  mode: 'production',
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
  plugins: [new CleanWebpackPlugin(), new MovationWebpackPlugin()]
}
