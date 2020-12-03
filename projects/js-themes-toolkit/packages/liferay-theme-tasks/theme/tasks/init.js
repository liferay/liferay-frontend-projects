/**
 * SPDX-FileCopyrightText: © 2017 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: MIT
 */

'use strict';

const project = require('../../lib/project');

module.exports = function() {
	const {gulp} = project;

	gulp.task('init', gulp.series('plugin:init'));
};
