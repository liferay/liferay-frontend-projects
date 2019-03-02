'use strict';

module.exports = {
	env: {
		es6: true,
	},
	extends: ['eslint:recommended', require.resolve('eslint-config-prettier')],
	parserOptions: {
		ecmaVersion: 2017,
		sourceType: 'module',
	},
	plugins: ['liferayportal', 'no-only-tests'],
	rules: {
		'liferayportal/arrowfunction-newline': 'off',
		'no-console': 'off',
		'no-constant-condition': 'off',
		'no-empty': 'off',
		'no-only-tests/no-only-tests': 'error',
		'no-unused-expressions': 'error',
		'no-process-env': 'off',
		'comma-spacing': 'off',
		indent: ['error', 'tab'],
		'keyword-spacing': 'warn',
		'max-len': [
			'error',
			{
				code: 80,
				comments: 120,
				ignoreRegExpLiterals: true,
				ignoreStrings: true,
				ignoreTemplateLiterals: true,
				ignoreUrls: true,
				tabWidth: 4,
			},
		],
		'no-tabs': 'off',
		'arrow-parens': 'off', // Setting for Prettier
	},
};
