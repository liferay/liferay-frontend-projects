/**
 * SPDX-FileCopyrightText: © 2019 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: BSD-3-Clause
 */

const fs = require('fs');
const parseArgs = require('minimist');
const path = require('path');

const spawnSync = require('../utils/spawnSync');
const withTempFile = require('../utils/withTempFile');

const WEBPACK_CONFIG_FILE = 'webpack.config.js';
const WEBPACK_DEV_CONFIG_FILE = 'webpack.config.dev.js';

/**
 * Main function for running webpack within the liferay-portal repo.
 */
module.exports = function (...argv) {
	const extraArgs = argv.filter(
		(arg) => !['--federation', '--watch'].includes(arg)
	);
	const args = parseArgs(argv);

	if (args.watch) {
		if (!fs.existsSync(WEBPACK_DEV_CONFIG_FILE)) {
			throw new Error(
				`--watch supplied but "${WEBPACK_DEV_CONFIG_FILE}" not found`
			);
		}

		withWebpackConfig(WEBPACK_DEV_CONFIG_FILE, {}, (configFilePath) => {
			spawnSync('webpack', [
				'serve',
				'--config',
				configFilePath,
				...extraArgs,
			]);
		});
	}
	else {
		const options = {
			federation: args.federation,
		};

		withWebpackConfig(WEBPACK_CONFIG_FILE, options, (configFilePath) => {
			spawnSync('webpack', ['--config', configFilePath, ...extraArgs]);
		});
	}
};

function escapeLiteralString(str) {
	return str.replace(/\\/g, '\\\\');
}

function withWebpackConfig(filename, {federation}, callback) {
	const tweakWebpackConfigPath = require.resolve(
		'../utils/tweakWebpackConfig'
	);
	const webpackConfigPath = path.resolve(filename);

	const webpackConfig = `
		const fs = require('fs');
		const tweakWebpackConfig = require('${escapeLiteralString(
			tweakWebpackConfigPath
		)}');

		const webpackConfigPath = '${escapeLiteralString(webpackConfigPath)}';

		let webpackConfig;

		if (fs.existsSync(webpackConfigPath)) {
			webpackConfig = require(webpackConfigPath);
		}

		module.exports = tweakWebpackConfig(
			webpackConfig,
			{
				federation: ${federation}
			}
		);
	`;

	withTempFile(filename, webpackConfig, callback);
}
