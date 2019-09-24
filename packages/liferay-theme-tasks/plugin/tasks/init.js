/**
 * © 2017 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: MIT
 */

'use strict';

var path = require('path');

var InitPrompt = require('../lib/init_prompt');

var TASK_PLUGIN_INIT = 'plugin:init';

module.exports = function(options) {
	var gulp = options.gulp;

	var store = gulp.storage;

	gulp.task(TASK_PLUGIN_INIT, cb => {
		new InitPrompt(
			{
				appServerPathDefault:
					store.get('appServerPath') ||
					path.join(path.dirname(process.cwd()), 'tomcat'),
				dockerContainerNameDefault:
					store.get('dockerContainerName') || 'liferay_portal_1',
				store,
			},
			cb
		);
	});

	gulp.task('init', [TASK_PLUGIN_INIT]);
};
