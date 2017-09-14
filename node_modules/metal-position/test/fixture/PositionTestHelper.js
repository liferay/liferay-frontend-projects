'use strict';

var PositionTestHelper = {
	/**
	 * Replaces the given test function with an empty one if this is running
	 * on Safari Mobile.
	 * @param {!function()} testFn
	 * @return {!function()}
	 */
	skipSafariMobile(testFn) {
		var userAgent = window.navigator.userAgent;
		if (userAgent.match(/iPad/i) || userAgent.match(/iPhone/i)) {
			return function() {};
		} else {
			return testFn;
		}
	}
};

export default PositionTestHelper;
