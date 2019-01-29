Loader.define(
	'local-require/sync',
	['module', 'require', 'local-require/a'],
	(module, require) => {
		module.exports = require('local-require/a').value;
	}
);
