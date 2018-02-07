'use strict';

define('e', ['e-1'], function(e1) {
	return function() {
		e1('e defined via e-1');
	};
});
