const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = {
    entry: './src/index.js',
    resolve: {
	extensions: ['*', '.js']
    },
    plugins: [
	new CleanWebpackPlugin(),
	new HtmlWebpackPlugin({
	    title: "robert's face is ugly",
	    template: './src/index.html'
	})
    ],
    output: {
	path: __dirname + '/dist',
	publicPath: '/',
	filename: 'bundle.js'
    },
    devServer: {
	contentBase: './dist'
    }
};
