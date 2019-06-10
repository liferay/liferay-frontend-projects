/**
 * © 2019 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: BSD-3-Clause
 */

const fs = require('fs');
const spawnSync = require('../utils/spawnSync');
const withBabelConfig = require('../utils/withBabelConfig');

const WATCH_CONFIG_FILE = 'webpack.config.dev.js';

function spawn(command, args) {
	withBabelConfig(() => spawnSync(command, args));
}

/**
 * Main function for running webpack within the liferay-portal repo.
 */
module.exports = function(...args) {
	const watch = args.indexOf('--watch');
	if (watch !== -1) {
		if (!fs.existsSync(WATCH_CONFIG_FILE)) {
			throw new Error(
				`--watch supplied but "${WATCH_CONFIG_FILE}" not found`
			);
		} else {
			// Cut out the "watch" argument; `splice()` would mutate, so create
			// a new array instead.
			const otherArgs = [
				...args.slice(0, watch),
				...args.slice(watch + 1)
			];

			spawn('webpack-dev-server', [
				'--config',
				WATCH_CONFIG_FILE,
				...otherArgs
			]);
		}
	} else {
		spawn('webpack', args);
	}
};
