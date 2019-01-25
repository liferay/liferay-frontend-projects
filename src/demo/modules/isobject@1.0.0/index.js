Liferay.Loader.define(
	'isobject@1.0.0/index',
	['module', 'require', 'isarray'],
	function(module, require) {
		module.exports =
			'Hello from isobject@1.0.0, isarray@1.0.0 says: ' +
			require('isarray');
	}
);
