module.exports = {
	extends: '../../.eslintrc.js',
	env: {
		amd: true,
		browser: true,
	},
	globals: {
		__CONFIG__: true,
		Liferay: true,
	},
	rules: {
		'require-jsdoc': 'off',
	},
};
