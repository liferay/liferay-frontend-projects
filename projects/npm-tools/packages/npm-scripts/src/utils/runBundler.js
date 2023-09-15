/**
 * SPDX-FileCopyrightText: © 2019 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: BSD-3-Clause
 */

const createTempFile = require('./createTempFile');
const getMergedConfig = require('./getMergedConfig');
const spawnSync = require('./spawnSync');
const withTempFile = require('./withTempFile');

/**
 * Runs liferay-npm-bundler with given args and uses a temp .npmbundlerrc file
 */
function runBundler(...args) {
	const config = getMergedConfig('bundler');

	createTempFile('npmbundlerrc.json', JSON.stringify(config, null, 2), {
		autoDelete: false,
	});

	// Support for Node 20

	process.env.NODE_OPTIONS = '--no-experimental-fetch';

	withTempFile(
		'.npmbundlerrc',
		JSON.stringify(config),
		(npmbundlerRcPath) => {
			spawnSync('liferay-npm-bundler', [
				'--config',
				npmbundlerRcPath,
				...args,
			]);
		}
	);
}

module.exports = runBundler;
