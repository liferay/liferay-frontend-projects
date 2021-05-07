/**
 * SPDX-FileCopyrightText: © 2017 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: MIT
 */

'use strict';

const project = require('../../../../lib/project');

module.exports = () => {
	const {gulp} = project;

	gulp.task('upgrade:dependencies:liferay-frontend-common-css', (cb) => {
		project.removeDependencies(['liferay-frontend-common-css']);

		cb();
	});

	return {
		customTasks: ['upgrade:dependencies:liferay-frontend-common-css'],
		targetVersion: '7.4',
	};
};
