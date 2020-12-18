/**
 * SPDX-FileCopyrightText: © 2019 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: BSD-3-Clause
 */

const path = require('path');

const getMergedConfig = require('./getMergedConfig');

/**
 * Get the path to the project's `main` module.
 *
 * @return {string} the path to the file
 */
module.exports = function () {
	const buildConfig = getMergedConfig('npmscripts', 'build');

	/* eslint-disable-next-line @liferay/liferay/no-dynamic-require */
	const packageJson = require(path.resolve('package.json'));
	const main = packageJson.main || 'index.js';

	return path.join(
		buildConfig.input,
		path.sep === '\\' ? main.replace(/\//g, '\\') : main
	);
};
