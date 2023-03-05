const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
// import * as path from "path";
// import HtmlWebpackPlugin from "html-webpack-plugin";

module.exports = {
  mode: "development",
  entry: './src/index.ts',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
    alias: {
      "@chart": path.resolve(__dirname, '../../../helpers/chart'),
    },
  },
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
  },
  plugins: [new HtmlWebpackPlugin({ 
    filename: 'index.html',
    template: './index.html'
  })],
};