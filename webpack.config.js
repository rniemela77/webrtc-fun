// webpack.config.js
const path = require('path');

module.exports = {
  entry: './public/scripts/app.js',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'public/scripts'),
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
          },
        },
      },
    ],
  },
  devServer: {
    static: path.resolve(__dirname, 'public'),
  },
};
