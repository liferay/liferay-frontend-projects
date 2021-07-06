/**
 * SPDX-FileCopyrightText: © 2021 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

const fs = require('fs');
const {print, success} = require('liferay-npm-build-tools-common/lib/format');
const {
	default: project,
} = require('liferay-npm-build-tools-common/lib/project');

const buildDir = project.buildDir;
const distDir = project.jar.outputDir;

module.exports = function clean() {
	fs.rmdirSync(buildDir.asNative, {recursive: true});
	fs.rmdirSync(distDir.asNative, {recursive: true});

	print(success`{Removed output directories}`);
};
