var EXCLUDE = /node_modules/;

var sprite = require('sprite-webpack-plugin');

module.exports = {
	entry: "./src/scripts/entry.js",   //точка входа
	output: {
		filename: "./dist/bundle.js"    	//исходящий файл
	},

	devtool: "source-map",

	// watch: true,

	plugins: [
		new sprite({
			'source': './src/images/sprites/',
	        'imgPath': './dist/images/spritesheets/',
	        'cssPath': 'src/styles/',
			'processor': 'css',
			'orientation': 'horizontal'
		})
	],

	module: {
		loaders: [
			{
				test: /\.scss$/,
				loader: "style!css!sass",
				exclude: EXCLUDE,
			},
			{
				test: /\.css$/,
				loader: "style!css",
				exclude: EXCLUDE,
			},
			{
				test: /\.(ttf|png|jpg|jpeg|gif)$/,
				loader: 'url',
				exclude: EXCLUDE,
				query: {
					name: './dist/images/[name].[ext]?[hash]',
					limit: '10000'
				}
			},
			{
				test: /\.html$/,
				loader: 'html',			//turn template html document to string for appending to another element
				exclude: EXCLUDE
			}

		]
	}
};
