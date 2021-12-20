const path = require('path');
const pconf = require('./package.json')
const webpack = require('webpack');
const VERSION_OUTPUTS = {
    vCurrent: "dist",
    v0_1_8: 'dist/0.1.8',
    v0_1_9: 'dist/0.1.9'
}
module.exports = {
    entry: './src/main.js',
    output: {
        filename: 'main.js',
        path: path.resolve(__dirname, VERSION_OUTPUTS.v0_1_9),
    },
    plugins: [
        new webpack.DefinePlugin({
            'process.env': {
                PACKAGE_VERSION: '"' + pconf.version + '"'
            }
        }),
    ],
    module: {
        rules: [
            {
                test: /\.(js|jsx)$/,
                exclude: /(node_modules|bower_components)/,
                loader: "babel-loader",
                options: { presets: ["@babel/env"] }
            },
            {
                test: /\.css$/,
                use: ["style-loader", "css-loader"]
            },
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
        ],
    },
    resolve: {
        extensions: ['*','.tsx', '.ts', '.js', ".jsx"],
    },
    mode: 'development',
    devServer: {
        static: './dist',
        port: 8081,
    },
    devtool: 'eval-source-map',
};
