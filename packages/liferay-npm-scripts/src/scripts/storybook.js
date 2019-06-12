/**
 * © 2019 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: BSD-3-Clause
 */

const fs = require('fs');
const path = require('path');
const getMergedConfig = require('../utils/getMergedConfig');
const spawnSync = require('../utils/spawnSync');

const BABEL_CONFIG = getMergedConfig('babel');
const STORYBOOK_CONFIG = getMergedConfig('npmscripts').storybook;

const STORYBOOK_CONFIG_DIR_PATH = path.join(__dirname, '../storybook');

const STORYBOOK_CONFIG_DIR_BUILD_PATH = path.join(
	__dirname,
	'../../build/storybook'
);

const PORTAL_ROOT = process.cwd().split('/modules')[0];

/**
 * Copies storybook config files into the build path.
 * @param {Array} files The list of files to copy.
 */
function copyStorybookConfigFiles(files) {
	files.forEach(function(file) {
		fs.copyFileSync(
			path.join(STORYBOOK_CONFIG_DIR_PATH, file),
			path.join(STORYBOOK_CONFIG_DIR_BUILD_PATH, file)
		);
	});
}

/**
 * Starts a storybook server for testing frontend components.
 */
module.exports = function() {
	// Create directory to store built storybook configs.
	fs.mkdirSync(STORYBOOK_CONFIG_DIR_BUILD_PATH, {recursive: true});

	// Generate custom babel config using current working directory's .babelrc.
	fs.writeFileSync(
		path.join(STORYBOOK_CONFIG_DIR_BUILD_PATH, '.babelrc'),
		JSON.stringify(BABEL_CONFIG)
	);

	copyStorybookConfigFiles([
		'addons.js',
		'config.js',
		'middleware.js',
		'preview-head.html',
		'webpack.config.js'
	]);

	const args = [
		// Set port that storybook will use to run the server on.
		'--port',
		STORYBOOK_CONFIG.port,

		// Set directory where the storybook config files are.
		'--config-dir',
		STORYBOOK_CONFIG_DIR_BUILD_PATH,

		// Set portal root directory to retrieve static resources from.
		'--static-dir',
		PORTAL_ROOT
	];

	spawnSync('start-storybook', args);
};
