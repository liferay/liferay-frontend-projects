/**
 * SPDX-FileCopyrightText: © 2019 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: BSD-3-Clause
 */

const fs = require('fs');
const path = require('path');

const spawnSync = require('../utils/spawnSync');
const withTempFile = require('../utils/withTempFile');

const WEBPACK_CONFIG_FILE = 'webpack.config.js';
const WEBPACK_DEV_CONFIG_FILE = 'webpack.config.dev.js';

/**
 * Main function for running webpack within the liferay-portal repo.
 */
module.exports = function (...args) {
	const watch = args.indexOf('--watch');
	if (watch !== -1) {
		if (!fs.existsSync(WEBPACK_DEV_CONFIG_FILE)) {
			throw new Error(
				`--watch supplied but "${WEBPACK_DEV_CONFIG_FILE}" not found`
			);
		}
		else {

			// Cut out the "watch" argument; `splice()` would mutate, so create
			// a new array instead.

			const otherArgs = [
				...args.slice(0, watch),
				...args.slice(watch + 1),
			];

			withWebpackConfig(WEBPACK_DEV_CONFIG_FILE, (configFilePath) => {
				spawnSync('webpack', [
					'serve',
					'--config',
					configFilePath,
					...otherArgs,
				]);
			});
		}
	}
	else {
		withWebpackConfig(WEBPACK_CONFIG_FILE, (configFilePath) => {
			spawnSync('webpack', ['--config', configFilePath, ...args]);
		});
	}
};

function escapeLiteralString(str) {
	return str.replace(/\\/g, '\\\\');
}

function withWebpackConfig(filename, callback) {
	const mergeBabelLoaderOptionsPath = require.resolve(
		'../utils/mergeBabelLoaderOptions'
	);
	const webpackConfigPath = path.resolve(filename);

	const webpackConfig = `
		module.exports = require('${escapeLiteralString(mergeBabelLoaderOptionsPath)}')(
			require('${escapeLiteralString(webpackConfigPath)}')
		);
	`;

	withTempFile(filename, webpackConfig, callback);
}
