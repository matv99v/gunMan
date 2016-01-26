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
				loader: ExtractTextPlugin.extract("css!autoprefixer-loader!sass"),  //will extract sass styles to a separate .css file

				exclude: EXCLUDE,
			},
			{
				test: /\.css$/,
				// loader: "style!css",
				loader: ExtractTextPlugin.extract("css!autoprefixer-loader"),  //will extract sass styles to a separate .css file

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
				limit: '1',
				query: {
					name: './dist/images/[name].[ext]?[hash]',
				}
			},


		]

	},

	plugins: [
		new sprite({
			'source': './src/images/spriteSource/',
			'imgPath': './src/images/spriteSheets/',
			'cssPath': 'src/styles/',
			'processor': 'css',
			'orientation': 'horizontal',
			// 'multiFolders': 'true'
		}),

		new ExtractTextPlugin("./dist/style.css")

	],
};
