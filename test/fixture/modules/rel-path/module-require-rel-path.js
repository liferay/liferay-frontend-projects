define(
	'rel-path/module-require-rel-path',
	['exports', 'require', './sibling', '../module7'],
	function(exports, require, sibling, module7) {
		'use strict';
		exports.resolvedDot = require('./sibling') === sibling;
		exports.resolvedDot2 = require('../module7') === module7;
	}
);
