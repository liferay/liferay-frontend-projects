const path = require('path');

module.exports = {
	env: {
		node: true,
		jest: true,
	},
	extends: [
		'liferay',
		'plugin:@typescript-eslint/eslint-recommended',
		'plugin:@typescript-eslint/recommended',
	],
	parser: '@typescript-eslint/parser',
	parserOptions: {
		project: './tsconfig.json',
	},
	plugins: ['@typescript-eslint'],
	root: true,
	rules: {
		'@typescript-eslint/await-thenable': 'error',
		'@typescript-eslint/no-explicit-any': [
			'error',
			{
				fixToUnknown: true,
			},
		],
		'@typescript-eslint/no-use-before-define': 'off',
		'liferay/no-dynamic-require': 'off',
		'no-console': 'off',
		'no-for-of-loops/no-for-of-loops': 'off',
		'no-return-assign': ['error', 'except-parens'],
		'notice/notice': [
			'error',
			{
				templateFile: path.join(__dirname, 'copyright.js'),
			},
		],
		'sort-keys': 'off',
	},
};
