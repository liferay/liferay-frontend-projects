/**
 * SPDX-FileCopyrightText: © 2017 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: MIT
 */

'use strict';

const path = require('path');

const project = require('../../lib/project');
const InitPrompt = require('../lib/prompts/init_prompt');

module.exports = function() {
	const {gulp, store} = project;

	gulp.task('plugin:init', cb => {
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

	gulp.task('init', gulp.series('plugin:init'));
};
