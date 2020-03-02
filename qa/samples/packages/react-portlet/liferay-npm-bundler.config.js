module.exports = {
	imports: {
		'react-provider': {
			react: '^16.8.6',
			'react-dom': '^16.8.6',
		},
	},
	webpack: {
		module: {
			rules: [
				{
					test: /\.js$/,
					exclude: /node_modules/,
					use: {
						loader: 'babel-loader',
						options: {
							presets: ['env', 'react'],
						},
					},
				},
				{
					test: /\.css$/,
					use: ['style-loader', 'css-loader'],
				},
			],
		},
	},
	'log-level': 'debug',
};
