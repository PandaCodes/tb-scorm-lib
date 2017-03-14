const webpack = require('webpack');

const libraryName = 'scorm-rte';

module.exports = {
  entry: {
    'scorm-api' : ['./src/api/scorm-api.js', 'whatwg-fetch'],
    'scorm' : ['./src/player/scorm-player.js', './src/api/scorm-api.js', 'whatwg-fetch']
  },
  output: {
    path: __dirname + '/lib',
    filename: "[name].js",
    library: libraryName,
    libraryTarget: 'umd',
    umdNamedDefine: true
  },
  module: {
    loaders: [
      {
        test: /\.js$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
        query: {
          presets: ['es2015']
        }
      },
      {
        enforce: "pre",
        test: /\.js$/,
        loader: "eslint-loader",
        exclude: /node_modules/,
        options: {
          fix: true
        }
      }
    ]
  },
  resolve: {
    extensions: ['.js']
  }
};
