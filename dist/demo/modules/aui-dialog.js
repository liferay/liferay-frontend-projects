define("liferay@1.0.0/aui-dialog", ['exports', 'liferay/aui-base', 'liferay/aui-core', 'liferay/aui-event'], function (exports, _auiBase, _auiCore, _auiEvent) {
	'use strict';

	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	exports.log = undefined;


	function log(text) {
		(0, _auiEvent.log)('module aui-dialog says via aui-event: ' + text);
		(0, _auiBase.log)('in module aui-dialog logBase is available: ' + text);
		(0, _auiCore.log)('in module aui-dialog logCore is available: ' + text);
	}

	exports.log = log;
});