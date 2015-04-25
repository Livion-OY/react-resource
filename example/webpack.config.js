'use strict';

module.exports.getConfig = function(type) {
  var path = require('path');
  var isDev = type === 'development';

  var config = {
    entry: './app/scripts/main.js',
    output: {
      path: __dirname,
      filename: 'main.js'
    },
    debug : isDev,
    module: {
      loaders: [{
        test: /\.jsx?$/,
        exclude: /node_modules/,
        loader: 'babel-loader'
      }]
    },
    resolve: {
      root: [ __dirname, path.join(__dirname, 'app')],
      modulesDirectories: ["node_modules", "scripts"]
    }
  };

  if (isDev) {
    config.devtool = '#source-map';
  }

  return config;
}
