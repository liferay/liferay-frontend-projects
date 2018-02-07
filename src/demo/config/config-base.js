/* global __CONFIG__: true */

__CONFIG__ = {
	url: 'http://localhost:3000/combo?',
	basePath: '/modules',
	combine: true,
	paths: {
		'jquery': 'http://code.jquery.com/jquery-2.1.3.min.js',
		'liferay@1.0.0': '.',
	},
};
__CONFIG__.maps = {
	'liferay': 'liferay@1.0.0',
	'liferay2': 'liferay@1.0.0',
	'liferay@1.0.0/package': {
		value: 'liferay@1.0.0/package/index',
		exactMatch: true,
	},
};
