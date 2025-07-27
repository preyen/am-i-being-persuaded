const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
  mode: 'development',//'production', // or 'development' for easier debugging
  entry: {
    popup: './popup.js',
    content: './content.js',
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist'), // Output to a 'dist' folder
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        { from: 'popup.html', to: 'popup.html' },
        { from: 'manifest.json', to: 'manifest.json' },
        { from: 'icons/', to: 'icons/' }, // Copy your icons folder
        // Add other static assets if you have them (e.g., CSS files)
      ],
    }),
  ],
};