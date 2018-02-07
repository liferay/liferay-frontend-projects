'use strict';

define(['f-1'], function(f1) {
	return function() {
		f1('e defined via f-1');
	};
});
