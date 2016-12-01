var Webpack = require('webpack');

var path = require('path');
var fs = require('fs');
var babelConfigFilePath = path.resolve(__dirname, '.babelrc');
var babelConfig = JSON.parse( fs.readFileSync(babelConfigFilePath) );

babelConfig.cacheDirectory = true;

module.exports = {
	entry: {
		// All submodules
		force: './src/force.js',

		// Individual submodules
		"force.service": ['./src/service.js'],
		"force.oauth": ['./src/oauth.js']
	},

	output: {
		path: './dist',
		filename: '[name].js',
		library: '[name]',
		libraryTarget: 'umd'
	},

	resolve: {
		root: path.resolve(__dirname),
		alias: {
			oauth: 'dist/force.oauth',
			service: 'dist/force.service',
		}
	},

	module: {
		loaders: [
			{
				test: /\.(js)$/,
				loader: 'babel-loader',
				exclude: [/node_modules/],
				query: babelConfig
			}
		]
	},

	plugins: [
		new Webpack.optimize.DedupePlugin(),
		new Webpack.optimize.AggressiveMergingPlugin(),
		new Webpack.optimize.UglifyJsPlugin({
			sourceMap: false,
			compress: {
				sequences: true,
				dead_code: true,
				conditionals: true,
				booleans: true,
				unused: true,
				if_return: true,
				join_vars: true,
				// drop_console: true
			},
			output: {
				comments: false
			}
		})
	]
};
