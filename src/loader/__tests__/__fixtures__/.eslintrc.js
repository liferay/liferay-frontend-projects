module.exports = {
	extends: '../.eslintrc.js',
	env: {
		amd: true,
		browser: true,
	},
	globals: {
		Loader: true,
	},
	rules: {
		'require-jsdoc': 'off',
	},
};
