/**
 * © 2019 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: BSD-3-Clause
 */

const fse = require('fs-extra');
const path = require('path');
const getMergedConfig = require('../utils/get-merged-config');
const spawnSync = require('../utils/spawn-sync');

const TEMP_DIR_NAME = 'TEMP-stories';

const CONFIG_PATH = path.join(process.cwd(), TEMP_DIR_NAME);
const STORYBOOK_CONFIG = getMergedConfig('npmscripts').storybook;

/**
 * Remove the temporary directory created that stored the storybook configs
 * while storybook was running.
 */
function cleanup() {
	fse.removeSync(CONFIG_PATH);
}

/**
 * Starts a storybook server for testing frontend components.
 */
module.exports = function() {
	process.stdin.resume();

	fse.ensureDirSync(CONFIG_PATH);

	fse.copySync(path.join(__dirname, '../storybook'), CONFIG_PATH);

	const args = [
		'--port',
		STORYBOOK_CONFIG.port,
		'--config-dir',
		TEMP_DIR_NAME
	];

	// Run the cleanup function when storybook is exited with `ctr+c`.
	process.on('SIGINT', cleanup);

	spawnSync('start-storybook', args);
};
