/**
 * SPDX-FileCopyrightText: © 2017 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: MIT
 */

'use strict';

var fs = require('fs');
var gutil = require('gulp-util');
var path = require('path');

var chalk = gutil.colors;

var REGEX_MODULE_VERSION = /module-version=([0-9.]+)/;

module.exports = function (options) {
	var gulp = options.gulp;

	gulp.task('plugin:version', (done) => {
		var npmPackageVersion = JSON.parse(
			fs.readFileSync('package.json', 'utf8')
		).version;

		var pluginPackgePropertiesPath = path.join(
			options.rootDir,
			'WEB-INF',
			'liferay-plugin-package.properties'
		);

		fs.readFile(
			pluginPackgePropertiesPath,
			{
				encoding: 'utf8',
			},
			(err, result) => {
				if (err) {
					throw err;
				}

				var moduleVersion = result.match(REGEX_MODULE_VERSION);

				if (moduleVersion && moduleVersion[1] !== npmPackageVersion) {
					result = result.replace(
						REGEX_MODULE_VERSION,
						(_match, _g1) => {
							return 'module-version=' + npmPackageVersion;
						}
					);

					logWarning();
				}
				else if (!moduleVersion) {
					result += '\nmodule-version=' + npmPackageVersion;
				}

				fs.writeFileSync(pluginPackgePropertiesPath, result);

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
