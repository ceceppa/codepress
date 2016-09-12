/* eslint-disable */

'use strict';
var webpack = require('webpack');

var APP = __dirname + '/app';
var PROD = JSON.parse(process.env.PROD_ENV || '0');
module.exports = {
    context: APP,
    entry: './modules/index.js',
    output: {
      path: APP,
      filename: PROD ? 'app.bundle.min.js' : 'app.bundle.js'
    },
    plugins: PROD ? [
      new webpack.optimize.UglifyJsPlugin({
        compress: { warnings: false }
      })
    ] : []
};
