/**
 * SPDX-FileCopyrightText: © 2021 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

const {format} = require('@liferay/js-toolkit-core');
const fs = require('fs');
const {
	default: project,
} = require('liferay-npm-build-tools-common/lib/project');

const {print, success} = format;

const buildDir = project.buildDir;
const distDir = project.jar.outputDir;

module.exports = function clean() {
	if (fs.existsSync(buildDir.asNative)) {
		fs.rmdirSync(buildDir.asNative, {recursive: true});
	}

	if (fs.existsSync(distDir.asNative)) {
		fs.rmdirSync(distDir.asNative, {recursive: true});
	}

	print(success`{Removed output directories}`);
};
