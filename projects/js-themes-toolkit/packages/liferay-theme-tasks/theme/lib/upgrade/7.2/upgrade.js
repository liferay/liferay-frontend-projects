/**
 * SPDX-FileCopyrightText: © 2017 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: MIT
 */

'use strict';

const {upgradeDependencies, upgradeConfig} = require('../common');
const devDependencies = require('../../../../lib/devDependencies')['theme'][
	'7.3.'
];
const project = require('../../../../lib/project');

const TARGET_VERSION = '7.3';

module.exports = function () {
	const {gulp} = project;
	const {runSequence} = gulp;

	const pkgJson = project.pkgJson;

	gulp.task('upgrade:dependencies', (cb) => {
		if (pkgJson.devDependencies['liferay-font-awesome']) {
			project.setDependencies(
				{
					'liferay-font-awesome':
						devDependencies.optional['liferay-font-awesome'],
				},
				true
			);
		}

		upgradeDependencies(TARGET_VERSION, cb);
	});

	gulp.task('upgrade:config', () => upgradeConfig(TARGET_VERSION));

	return function (cb) {
		const taskArray = ['upgrade:config', 'upgrade:dependencies'];

		taskArray.push(cb);

		runSequence(...taskArray);
	};
};
