/**
 * SPDX-FileCopyrightText: © 2017 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: MIT
 */

'use strict';

const spawn = require('cross-spawn');
const replace = require('gulp-replace-task');

const project = require('../../../lib/project');

const {gulp} = project;

function upgradeConfig(targetVersion) {
	const dotTargetVersion = targetVersion + '.0';
	const underscoreTargetVersion = dotTargetVersion.replace(/\./g, '_');

	project.themeConfig.setConfig({
		version: targetVersion,
	});

	return gulp
		.src(
			'src/WEB-INF/+(liferay-plugin-package.properties|liferay-look-and-feel.xml)'
		)
		.pipe(
			replace({
				patterns: [
					{
						match: /(DTD Look and Feel )\d(?:\.\d+)+(\/\/EN)/g,
						replacement: '$1' + dotTargetVersion + '$2',
					},
					{
						match: /(liferay-look-and-feel_)\d(?:_\d+)+(\.dtd)/g,
						replacement: '$1' + underscoreTargetVersion + '$2',
					},
					{
						match: /(<version>).+(<\/version>)/g,
						replacement: '$1' + dotTargetVersion + '+$2',
					},
					{
						match: /(liferay-versions=)\d(?:\.\d+)+\+?/g,
						replacement: '$1' + dotTargetVersion + '+',
					},
				],
			})
		)
		.pipe(gulp.dest('src/WEB-INF'));
}

function upgradeDependencies(targetVersion, cb) {
	const devDependencies = require('../../../lib/devDependencies')['theme'][
		targetVersion
	];

	project.setDependencies(devDependencies.default, true);

	const npmInstall = spawn('npm', ['install']);

	npmInstall.stderr.pipe(process.stderr);
	npmInstall.stdout.pipe(process.stdout);

	npmInstall.on('close', cb);
}

module.exports = {
	upgradeConfig,
	upgradeDependencies,
};
