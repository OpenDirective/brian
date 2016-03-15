const webpack = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const path = require('path');

// build / run options
const PRODUCTION = (process.env.NODE_ENV == 'production');
const USEHOT = (!PRODUCTION && process.env.DEV_USEHOT == 'true');
const USESOURCEMAPS = true;

const srcDir = path.resolve(__dirname, 'src');
const distDir = path.resolve(__dirname, 'dist');

// common config
const config = {
  entry: [
          path.resolve(srcDir, 'js/main.js')
  ],
  output: {
    path: path.resolve(distDir, 'js/'),
    filename: 'bundle.js'
  },
  module: {
    loaders: [
      {
        test: /\.js$/,
        loader: 'babel',
        include: srcDir,
        exclude: /node_modules/,
        query: {
          presets: ['es2015']
        }
      }
    ]
  },
  plugins: [
            new CopyWebpackPlugin([{ from: srcDir, to: '..' }],
                                  { ignore: [{glob: 'js/**/*'}] }),
            new webpack.NoErrorsPlugin()
  ]
};

// Target specific config
if (PRODUCTION) {
	if (USESOURCEMAPS) {
    config.devtool = 'source-map';
  }
  config.plugins.push(new webpack.optimize.UglifyJsPlugin({minimize: true}));
}
else
{
	if (USESOURCEMAPS) {
    config.devtool = 'inline-source-map';
  }
  config.devServer = {
    contentBase: srcDir,
    publicPath: "/js/",
    hot: USEHOT
   };
  config.entry.push('webpack-dev-server/client?http://localhost:8080');
  if (USEHOT) {
    config.plugins.push(new webpack.HotModuleReplacementPlugin());
    config.entry.push('webpack/hot/dev-server');
  }

};

module.exports = config;
