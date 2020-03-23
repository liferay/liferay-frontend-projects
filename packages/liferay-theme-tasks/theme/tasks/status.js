/**
 * SPDX-FileCopyrightText: © 2017 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: MIT
 */

const project = require('../../lib/project');
const status = require('../lib/status');

function getStatus() {
	const {gulp} = project;

	gulp.task('status', cb => {
		// eslint-disable-next-line
		console.log(status(project.themeConfig.config));

		cb();
	});
}

module.exports = getStatus;
