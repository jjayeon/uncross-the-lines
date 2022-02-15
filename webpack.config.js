const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
    devtool: "source-map",
    entry: "./src/index.js",
    output: {
        path: __dirname + "/build",
        publicPath: "/",
        filename: "bundle.js",
    },
    plugins: [
        new CleanWebpackPlugin(),
        new HtmlWebpackPlugin({
            title: "uncross the lines",
            template: "./src/index.html",
        }),
    ],
    devServer: {
        contentBase: "./build",
    },
};
