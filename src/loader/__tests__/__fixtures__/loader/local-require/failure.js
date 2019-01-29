Loader.define(
	'local-require/failure',
	['module', 'require', 'missing-module'],
	(module, require) => {
		module.exports = require('missing-module');
	}
);
