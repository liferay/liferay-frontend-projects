'use strict';

import { log as logBase } from 'liferay/aui-base';
import { log as logCore } from 'liferay/aui-core';
import { log as logEvent } from 'liferay/aui-event';

function log(text) {
	logEvent('module aui-dialog says via aui-event: ' + text);
	logBase('in module aui-dialog logBase is available: ' + text);
	logCore('in module aui-dialog logCore is available: ' + text);
}

export { log };

// (function META() {
//     return {
//         condition: {
//             test: function() {
//                 return true;
//             },
//             trigger: 'nate'
//         },
//         path: 'nate.js'
//     };
// });
