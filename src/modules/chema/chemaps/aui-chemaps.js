'use strict';

import { log as logBase } from 'liferay/aui-base';

function log(text) {
	logBase('module aui-chemaps says via aui-base: ' + text);
}

export { log };
