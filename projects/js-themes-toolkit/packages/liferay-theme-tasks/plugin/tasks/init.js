/**
 * SPDX-FileCopyrightText: © 2017 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: MIT
 */

'use strict';

const path = require('path');

const project = require('../../lib/project');
const InitPrompt = require('../prompts/init_prompt');

module.exports = function () {
	const {gulp, store} = project;

	const {appServerPath, dockerContainerName} = store;

	gulp.task('plugin:init', (callback) => {
		InitPrompt.prompt(
			{
				appServerPathDefault: appServerPath
					? appServerPath.asNative
					: path.join(path.dirname(project.dir), 'tomcat'),
				dockerContainerNameDefault:
					dockerContainerName || 'liferay_portal_1',
				store,
			},
			callback
		);
	});

	gulp.task('init', gulp.series('plugin:init'));
};
