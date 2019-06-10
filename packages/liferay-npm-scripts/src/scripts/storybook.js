/**
 * © 2019 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: BSD-3-Clause
 */

const path = require('path');
const getMergedConfig = require('../utils/get-merged-config');
const spawnSync = require('../utils/spawn-sync');

const STORYBOOK_CONFIG = getMergedConfig('npmscripts').storybook;

/**
 * Used for storybook/config.js to load stories from the current working
 * directory.
 */
const STORYBOOK_ENV_CWD = `STORYBOOK_CWD=${process.cwd()}`;

/**
 * Starts a storybook server for testing frontend components.
 */
module.exports = function() {
	const args = [
		'--port',
		STORYBOOK_CONFIG.port,
		'--config-dir',
		path.join(__dirname, '../storybook')
	];

	spawnSync(`${STORYBOOK_ENV_CWD} start-storybook`, args, {shell: true});
};
