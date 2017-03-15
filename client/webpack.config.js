const webpack = require('webpack');

const libraryName = 'scormRte';

//TODO: add whatwg-fetch and, mayby, promise-polyfill

module.exports = {
  entry: {
    //'scorm-api' : ['./src/api/scorm-api.js'],
    'scorm-rte' : ['./src/player/scorm-player.js'] //, 'whatwg-fetch']
  },
  output: {
    path: __dirname + '/dist',
    filename: "[name].js",
    library: libraryName,
  },
  module: {
    loaders: [
      {
        test: /\.js$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
        query: {
          presets: ['es2015'],
          plugins: ['add-module-exports']
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
