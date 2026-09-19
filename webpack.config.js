const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

module.exports = {
  mode: 'development',
  entry: './src/index.js',
  output: { path: path.resolve(__dirname, 'dist'), filename: '[name].bundle.js' },
  module: {
    rules: [{ test: /\.js$/, exclude: /node_modules/, use: { loader: 'babel-loader', options: { presets: ['@babel/preset-env'] } } }]
  },
  plugins: [
    new CleanWebpackPlugin(),
    new HtmlWebpackPlugin({ template: './public/index.html', filename: 'index.html' }),
    new CopyPlugin({ patterns: [{ from: 'public/app.js', to: 'app.js' }] })
  ],
  devServer: {
    static: { directory: path.join(__dirname, 'public') },
    compress: true,
    port: 8080,
    hot: true,
    open: true,
    proxy: [{ context: ['/api'], target: 'http://localhost:3000' }]
  },
  devtool: 'source-map'
};
