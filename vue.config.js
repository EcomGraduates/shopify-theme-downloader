const webpack = require('webpack')

module.exports = {
  configureWebpack: {
    devtool: 'source-map',
    optimization: {
      splitChunks: {
        chunks: 'all'
      }
    }
  },
  pluginOptions: {
    electronBuilder: {
      builderOptions: {
        appId: 'com.electron.shopify-theme-downloader',
        mac: {
          category: 'public.app-category.developer-tools',
          gatekeeperAssess: false
        },
        linux: {
          category: 'Development'
        }
      }
    }
  }
}
