var webpack = require('webpack');

module.exports = {  
  entry: './src/asteroids.ts',
  output: {
    filename: './build/asteroids.js'
  },
  resolve: {
    extensions: ['', '.webpack.js', '.web.js', '.ts', '.js']
  },
  // plugins: [
  //   new webpack.optimize.UglifyJsPlugin()
  // ],
  module: {
    loaders: [
      { test: /\.ts$/, loader: 'ts' }
    ]
  }
}