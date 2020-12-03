/**
 * SPDX-FileCopyrightText: © 2017 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: MIT
 */

'use strict';

const project = require('../../lib/project');
const ExtendPrompt = require('../prompts/extend_prompt');

module.exports = function() {
	const {gulp} = project;

	gulp.task('extend', cb => {
		ExtendPrompt.prompt(cb);
	});
};
