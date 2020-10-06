const path = require('path');

module.exports = {
	env: {
		node: true,
		jest: true,
	},
	rules: {
		'@liferay/liferay/no-dynamic-require': 'off',
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
