define("liferay@1.0.0/ambrin/aui-ambrin", ['exports', 'liferay/aui-core'], function (exports, _auiCore) {
	'use strict';

	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	exports.log = undefined;


	function log(text) {
		(0, _auiCore.log)('module aui-chemaps says via aui-core: ' + text);
	}

	exports.log = log;
});