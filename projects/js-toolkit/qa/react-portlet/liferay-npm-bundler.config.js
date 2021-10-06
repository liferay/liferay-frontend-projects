module.exports = {
	'log-level': 'debug',
	webpack: {
		module: {
			rules: [
				{
					test: /\.css/,
					exclude: /node_modules/,
					use: {
						loader: 'css-loader',
					},
				},
				{
					test: /\.js$/,
					exclude: /node_modules/,
					use: {
						loader: 'babel-loader',
						options: {
							presets: [
								'@babel/preset-env',
								'@babel/preset-react',
							],
						},
					},
				},
				{
					test: /\.svg/,
					exclude: /node_modules/,
					use: {
						loader: 'svg-inline-loader',
					},
				},
			],
		},
	},
};
