'use strict';

import {log as logCore} from 'aui-core';

function log(text) {
	logCore('module aui-chemaps says via aui-core', text);
}

export {log};