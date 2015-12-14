var EXCLUDE = /node_modules/;
var ExtractTextPlugin = require("extract-text-webpack-plugin");   //plugin for extracting to a separate file


var sprite = require('sprite-webpack-plugin');

module.exports = {
	entry: "./src/scripts/entry.js",   //точка входа
	output: {
		filename: "./dist/bundle.js"    	//исходящий файл
	},

	devtool: "source-map",

	// watch: true,



	module: {
		loaders: [
			{
				test: /\.scss$/,
				// loader: "style!css!sass",
				loader: ExtractTextPlugin.extract("css!sass"),  //will extract sass styles to a separate .css file

				exclude: EXCLUDE,
			},
			{
				test: /\.css$/,
				// loader: "style!css",
				loader: ExtractTextPlugin.extract("css"),  //will extract sass styles to a separate .css file

				exclude: EXCLUDE,
			},
			{
				test: /\.html$/,
				loader: 'html',			//turn template html document to string for appending to another element
				exclude: EXCLUDE
			},

			{
				test: /\.(ttf|png|jpg|jpeg|gif)$/,
				loader: 'url',
				exclude: EXCLUDE,
				query: {
					name: './dist/images/[name].[ext]?[hash]',
					// limit: '1'
				}
			}

		]

	},


	plugins: [
		new sprite({
			'source': './src/images/sprites/',
			'imgPath': './src/images/misc/',
			'cssPath': 'src/styles/',
			'processor': 'css',
			'orientation': 'horizontal'
		}),

		new ExtractTextPlugin("./dist/style.css")

	],
};
