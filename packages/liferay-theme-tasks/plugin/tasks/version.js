/**
 * SPDX-FileCopyrightText: © 2017 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: MIT
 */

'use strict';

const fs = require('fs');
const gutil = require('gulp-util');

const project = require('../../lib/project');

var chalk = gutil.colors;

var REGEX_MODULE_VERSION = /module-version=([0-9.]+)/;

module.exports = function() {
	const {gulp} = project;

	gulp.task('plugin:version', done => {
		var npmPackageVersion = JSON.parse(
			fs.readFileSync('package.json', 'utf8')
		).version;

		var pluginPackagePropertiesPath = project.options.rootDir.join(
			'WEB-INF',
			'liferay-plugin-package.properties'
		).asNative;

		fs.readFile(
			pluginPackagePropertiesPath,
			{
				encoding: 'utf8',
			},
			(err, result) => {
				if (err) {
					throw err;
				}

				var moduleVersion = result.match(REGEX_MODULE_VERSION);

				if (moduleVersion && moduleVersion[1] != npmPackageVersion) {
					result = result.replace(
						REGEX_MODULE_VERSION,
						(_match, _g1) => {
							return 'module-version=' + npmPackageVersion;
						}
					);

					logWarning();
				} else if (!moduleVersion) {
					result += '\nmodule-version=' + npmPackageVersion;
				}

				fs.writeFileSync(pluginPackagePropertiesPath, result);

				done();
			}
		);
	});
};

function logWarning() {
	gutil.log(
		chalk.yellow('Warning:'),
		'the value of',
		chalk.cyan('module-version'),
		'in',
		chalk.cyan('liferay-plugin-package.properties'),
		'does not match version in',
		chalk.cyan('package.json') + '.',
		'Using version from',
		chalk.cyan('package.json')
	);
}
