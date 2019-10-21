module.exports = [
	{
		devtool: 'source-map',
		mode: 'development',
		entry: './src/index.js',
		output: {
			filename: 'webpack.js',
		},
	},
	{
		devtool: 'source-map',
		mode: 'development',
		entry: './build/index.js',
		output: {
			filename: 'bundler.js',
		},
	},
];
