const webpack = require('webpack');

module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      const fallback = webpackConfig.resolve.fallback || {};
      Object.assign(fallback, {
        "crypto": require.resolve("crypto-browserify"),
        "stream": require.resolve("stream-browserify"),
        "http": require.resolve("stream-http"),
        "https": require.resolve("https-browserify"),
        "zlib": require.resolve("browserify-zlib"),
        "url": require.resolve("url/")
      })
      webpackConfig.resolve.fallback = fallback;
      webpackConfig.plugins = (webpackConfig.plugins || []).concat([
        new webpack.ProvidePlugin({
          process: 'process/browser',
          Buffer: ['buffer', 'Buffer']
        })
      ])
      return webpackConfig;
    }
  }
}