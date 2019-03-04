Loader.define('issue-140/m1', ['module', 'require', 'issue-140/a'], function(
	module,
	require
) {
	module.exports = function() {
		const result = {};

		try {
			result.standard = 'standard:' + require('issue-140/a');
		} catch (err) {
			result.standard = err;
		}

		try {
			result.local = 'local:' + require('./a');
		} catch (err) {
			result.local = err;
		}

		try {
			result.mapped = 'mapped:' + require('mapped-issue-140/a');
		} catch (err) {
			result.mapped = err;
		}

		return result;
	};
});
