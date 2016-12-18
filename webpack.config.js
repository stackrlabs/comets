var webpack = require('webpack');

var isProd = (process.env.NODE_ENV !== 'dev');

console.log('NODE_ENV', process.env.NODE_ENV);
console.log('NODE_ENV === dev', process.env.NODE_ENV === 'dev');

function getPlugins() {
    var plugins = [];

    plugins.push(new webpack.DefinePlugin({
        'process.env': {
            'NODE_ENV': process.env.NODE_ENV
        }
    }));

    if (isProd) {
        plugins.push(new webpack.optimize.UglifyJsPlugin({
            minimize: true,
            sourceMap: false,
            output: {
                comments: false
            },
            compressor: {
                warnings: false
            }
        }));
    }

    return plugins;
}

module.exports = {  
  entry: './src/asteroids.ts',
  output: {
    filename: './build/asteroids.js'
  },
  resolve: {
    extensions: ['', '.webpack.js', '.web.js', '.ts', '.js']
  },
  plugins: getPlugins(),
  module: {
    loaders: [
      { test: /\.ts$/, loader: 'ts' }
    ]
  }
}