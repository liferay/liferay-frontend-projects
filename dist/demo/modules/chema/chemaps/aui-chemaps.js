define("liferay@1.0.0/chema/chemaps/aui-chemaps", ['exports', 'liferay/aui-base'], function (exports, _auiBase) {
	'use strict';

	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	exports.log = undefined;


	function log(text) {
		(0, _auiBase.log)('module aui-chemaps says via aui-base: ' + text);
	}

	exports.log = log;
});