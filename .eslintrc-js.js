const path = require('path');

module.exports = {
	env: {
		node: true,
		jest: true,
	},
	extends: ['liferay'],
	root: true,
	rules: {
		'no-for-of-loops/no-for-of-loops': 'off',
		'no-return-assign': ['error', 'except-parens'],
		'notice/notice': [
			'error',
			{
				templateFile: path.join(__dirname, 'copyright.js'),
			},
		],
	},
};
