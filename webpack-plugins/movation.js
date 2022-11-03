const pluginName = 'ConsoleLogOnBuildWebpackPlugin'

module.exports = class MovationWebpackPlugin {
  apply(compiler) {
    compiler.hooks.afterEmit.tap(pluginName, (compilation) => {
      console.log('webpack 构建过程开始！')
    })
  }
}
