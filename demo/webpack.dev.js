const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
module.exports = {
    mode: 'development',
    entry: {
        test:'./demo/src/test.js',
        main1: ['./demo/src/scss/basic.scss', './demo/src/scss/basic2.scss'],
        'TEST/INDEX': ['./demo/src/scss/basic.scss', './demo/src/scss/basic2.scss']
        /*     singleFile: './src/scss/basic2.scss',
        importFile: './src/scss/index.scss' */
    },
    devtool: 'source-map',
    output: {
        path: path.resolve(__dirname, 'assets'),
        filename: '[name].js'
    },
    module: {
        rules: [
            /**
             * Running Babel on JS files.
             */
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                  
                }
            },
            {
                test: /\.scss$/,

                use: [
                    MiniCssExtractPlugin.loader,
                    {
                        loader: 'css-loader?-url',
                        options: { sourceMap: true }
                    },
                    {
                        loader: 'postcss-loader',
                        options: { sourceMap: true }
                    },
                    {
                        loader: 'sass-loader',
                        options: { sourceMap: true }
                    }
                ]
            }
        ]
    },
    plugins: [new MiniCssExtractPlugin()]
};
