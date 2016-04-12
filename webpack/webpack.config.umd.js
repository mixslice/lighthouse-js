var path = require('path');
var webpack = require('webpack');

module.exports = {
  debug: false,
  entry: [
    './src/lighthouse'
  ],
  output: {
    path: path.resolve(__dirname, '../dist'),
    filename: 'lighthouse.umd.js',
    libraryTarget: "umd"
  },
  plugins: [
    new webpack.optimize.OccurenceOrderPlugin(),
    new webpack.DefinePlugin({
      __ENDPOINT__: JSON.stringify(process.env.ENDPOINT || "http://lighthouse.digitwalk.com"),
      'process.env': {
        'NODE_ENV': JSON.stringify('production')
      }
    }),
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        warnings: false
      },
      output: {
        comments: false
      }
    })
  ],
  module: {
    loaders: [
      {
        test: /\.js$/,
        loaders: ['babel']
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
