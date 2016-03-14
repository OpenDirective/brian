const webpack = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const path = require('path');

const ENV = process.env.NODE_ENV;
const USEHOT = false;

const srcDir = path.resolve(__dirname, 'src');
const distDir = path.resolve(__dirname, 'dist');

module.exports = {
  entry: [
             path.resolve(srcDir, 'js/main.js')
  ],
  output: {
    path: path.resolve(distDir, 'js/'),
    publicPath: "/js/",
    filename: 'bundle.js',
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
            new CopyWebpackPlugin([{ from: srcDir, to: distDir }],
                                  { ignore: [{glob: 'js/**/*'}] })
  ],
  devServer: {
    contentBase: srcDir,
    hot: USEHOT
  }
};

if (ENV == 'production') {
  module.exports.plugins.push(new webpack.optimize.UglifyJsPlugin({minimize: true}));
}
else
{
  module.exports.plugins.push(new webpack.SourceMapDevToolPlugin());
  module.exports.entry.push('webpack-dev-server/client?http://localhost:8080');
  if (USEHOT) {
    module.exports.plugins.push(new webpack.HotModuleReplacementPlugin());
    module.exports.entry.push('webpack/hot/dev-server');
  }
};
