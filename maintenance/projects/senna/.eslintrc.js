const path = require('path');

module.exports = {
	env: {
		browser: true,
	},
	rules: {
		'@liferay/liferay/no-it-should': 'warn',
		'notice/notice': [
			'error',
			{
				templateFile: path.join(__dirname, 'copyright.js'),
			},
		],
	},
};
