module.exports = {
	env: {
		node: true,
		jest: true,
	},
	extends: '@liferay',
	root: true,
	rules: {
		'@liferay/liferay/no-dynamic-require': 'off',
		'no-console': 'off',
		'no-for-of-loops/no-for-of-loops': 'off',
		'no-return-assign': ['error', 'except-parens'],
		'sort-keys': 'off',
	},
};
