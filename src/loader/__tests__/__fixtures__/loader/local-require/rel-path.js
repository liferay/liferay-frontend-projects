Loader.define(
	'local-require/rel-path',
	['module', 'require', './a'],
	(module, require) => {
		module.exports = require('./a').value;
	}
);
