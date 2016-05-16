const webpack = require('webpack')
const merge = require('webpack-merge')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const path = require('path')

// build / run options
const PRODUCTION = (process.env.NODE_ENV === 'production')
const USEHOT = (!PRODUCTION && process.env.DEV_USEHOT === 'true')
const USESOURCEMAPS = true

console.log(`PRODUCTION: ${PRODUCTION}`)
console.log(`USEHOT: ${USEHOT}`)
console.log(`USESOURCEMAPS: ${USESOURCEMAPS}`)

const PATHS = {
  src: path.join(__dirname, 'src'),
  js: path.join(__dirname, 'src', 'js'),
  img: path.join(__dirname, 'src', 'img'),
  css: path.join(__dirname, 'src', 'css'),
  dist: path.join(__dirname, 'dist')
}

// common config
const common = {
  target: 'web',

  entry: {
    "indexEntry": path.join(PATHS.js, 'main.js'),
    "assistEntry": path.join(PATHS.js, 'assist-main.js'),
    "activityEntry": path.join(PATHS.js, 'activity-main.js')
  },

  output: {
    path: path.join(PATHS.dist, 'js/'),
    filename: '[name].js',
  },

  module: {
    loaders: [
      {
        test: /\.js$/,
        loader: 'babel',
        include: PATHS.js,
        exclude: /node_modules/,
        query: {
          presets: ['es2015'],
          plugins: ['transform-object-rest-spread'],
          compact : true
        }
      }
    ]
  },

  stats: {colors: true},

  plugins: [
  ]
}

var config = {} // get weird errors about block scope let

// Target specific config
if (PRODUCTION) {
  config = merge(common, {
    devtool: (USESOURCEMAPS) ? 'source-map' : common.devtool,
    module: {
      loaders: [{
        test: /\.css$/,
        loader: ExtractTextPlugin.extract('style', 'css'),
        include: PATHS.css
      }]
    },

    plugins: [
              new CopyWebpackPlugin([{from: path.join(PATHS.src, 'favicon.ico'), to: '..'},
                                     {from: path.join(PATHS.src, 'manifest.json'), to: '..'},
                                     {from: path.join(PATHS.src, 'CNAME'), to: '..'},
                                     {from: path.join(PATHS.src, 'img'), to: '../img'}, // abs paths to: don't work
                                     {from: path.join(PATHS.src, 'js/vendor'), to: './vendor'}]), // abs paths to: don't work
       new HtmlWebpackPlugin({filename: path.join(PATHS.dist, 'activity.html'),
                          template: path.join(PATHS.src, 'activity.html'),
                          inject: true,
                          chunks: ['activityEntry']
                        }),
              new HtmlWebpackPlugin({filename: path.join(PATHS.dist, 'assist.html'),
                          template: path.join(PATHS.src, 'assist.html'),
                          inject: true,
                          chunks: ['assistEntry']
                        }),
              new HtmlWebpackPlugin({filename: path.join(PATHS.dist, 'index.html'),
                        template: path.join(PATHS.src, 'index.html'),
                        inject: true,
                        chunks: ['indexEntry']
                        }),

              new webpack.NoErrorsPlugin(),
              new ExtractTextPlugin('../css/[name].css'),
              new webpack.optimize.UglifyJsPlugin({minimize: true})
    ]
  })
} else {
  config = merge(common, {
    devtool: (USESOURCEMAPS) ? 'inline-source-map' : common.devtool,
    debug: true,
    devServer: {
      contentBase: PATHS.src,
      hot: USEHOT,
      inline: true,
      stats: 'errors-only',
      host: process.env.HOST || '0.0.0.0',
      port: process.env.PORT || '8080',
      historyApiFallback: {
        index: '/'
      }
    },
    module: {
      loaders: [
        {
          test: /\.css$/,
          loaders: ['style', 'css'],
          include: PATHS.css,
        }
      ]
    },

    plugins: [
      new HtmlWebpackPlugin({filename: 'index.html',
                              template: path.join(PATHS.src, 'index.html'),
                              inject: true,
                              chunks: ['indexEntry']
                            }),
      new HtmlWebpackPlugin({filename: 'assist.html',
                              template: path.join(PATHS.src, 'assist.html'),
                              inject: true,
                              chunks: ['assistEntry']
                            }),
      new HtmlWebpackPlugin({filename: 'activity.html',
                              template: path.join(PATHS.src, 'activity.html'),
                              inject: true,
                              chunks: ['activityEntry']
                            })
    ]
  })

  if (USEHOT) {
    config.plugins.push(new webpack.HotModuleReplacementPlugin())
  }
}

module.exports = config
