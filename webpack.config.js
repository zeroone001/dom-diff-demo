const path = require('path');

module.exports = {
  entry: './src/index.js',
  output: {
    publicPath: 'resources',
    filename: 'bundle.js',
  },
  devServer: {
      contentBase: path.join(__dirname, 'public'),
      port: 8088
  }

};
