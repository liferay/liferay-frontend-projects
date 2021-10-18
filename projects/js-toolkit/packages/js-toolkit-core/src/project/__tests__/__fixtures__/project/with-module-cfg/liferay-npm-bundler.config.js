module.exports = {
	packages: {
		'a-package': {
			'copy-plugins': ['a-config/my-copy-plugin'],
			'plugins': ['a-config/my-pre-plugin'],
			'.babelrc': {
				presets: ['a-config/my-babel-preset'],
				plugins: ['a-config/my-babel-plugin'],
			},
			'post-plugins': ['a-config/my-post-plugin'],
		},
	},
};
