const webpack = require('webpack')

console.log(process.env.VUE_APP_GH_OWNER)

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
        appId: 'com.electron.shopify-themekit-ui',
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
