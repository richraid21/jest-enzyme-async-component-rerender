require('babel-register');

import webpack from 'webpack'
import path from 'path'

export default {
    entry: './src/index.js',
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'dist')
    },

    module: {
        loaders: [
            {
              test: /\.js$/,
              exclude: /(node_modules)/,
            loader: 'babel-loader',
                query: {
                  presets: ['react','env']
                }
              }
          ]
    }

}