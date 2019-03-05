module.exports = {
	env: {
		node: true,
		jest: true,
	},
	extends: 'liferay',
	root: true,
	rules: {
		'no-console': 'off',
		'no-for-of-loops/no-for-of-loops': 'off',
	},
};
