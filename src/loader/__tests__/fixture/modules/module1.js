define('module1', ['exports', 'module2', 'module3'], function(__exports__) {
	'use strict';
	function module1log(text) {
		console.log('module1 says', text);
	}
	__exports__.module1log = module1log;
});
