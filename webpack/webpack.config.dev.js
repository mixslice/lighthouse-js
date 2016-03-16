var path = require('path');
var webpack = require('webpack');

module.exports = {
  devtool: 'inline-source-map',
  entry: [
    'webpack-hot-middleware/client',
    './src/global'
  ],
  output: {
    path: path.resolve(__dirname, '../dist'),
    filename: 'lighthouse.global.js',
    publicPath: '/static/'
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoErrorsPlugin(),
    new webpack.DefinePlugin({
      __ENDPOINT_DEV__: JSON.stringify(process.env.ENDPOINT || "http://lighthouse.digitwalk.com"),
      __ENDPOINT_PROD__: JSON.stringify(process.env.ENDPOINT || "http://beta.lighthouse.digitwalk.com")
    }),
  ],
  module: {
    loaders: [
      {
        test: /\.js$/,
        loaders: ['babel'],
        exclude: /node_modules/
      }
    ]
  },
  resolve: {
    modulesDirectories: [
      'src',
      'node_modules'
    ],
    extensions: ['', '.json', '.js']
  }
};
