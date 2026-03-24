const rules = require('./webpack.rules');

rules.push({
  test: /\.css$/,
  use: [{ loader: 'style-loader' }, { loader: 'css-loader' }],
});


rules.push({
  test: /\.(png|jpg|jpeg|gif|svg)$/,
  type: 'asset/resource',
});

module.exports = {
  entry: './src/index.jsx',   
  module: {
    rules,
  },
  resolve: {
    extensions: ['.js', '.jsx'],       
  },
};