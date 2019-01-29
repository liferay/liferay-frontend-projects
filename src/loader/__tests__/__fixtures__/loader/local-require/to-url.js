Loader.define(
	'local-require/to-url',
	['module', 'require'],
	(module, require) => {
		module.exports = require.toUrl('local-require/to-url');
	}
);
