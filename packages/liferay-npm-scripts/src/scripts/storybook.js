/**
 * © 2019 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: BSD-3-Clause
 */

const fs = require('fs');
const os = require('os');
const path = require('path');

const getMergedConfig = require('../utils/getMergedConfig');
const log = require('../utils/log');
const spawnSync = require('../utils/spawnSync');

const BABEL_CONFIG = getMergedConfig('babel');
const STORYBOOK_CONFIG = getMergedConfig('npmscripts').storybook;

const NODE_PATHS = [
	path.join(__dirname, '../../../../node_modules'),
	path.join(__dirname, '../../node_modules')
];

const STORYBOOK_CONFIG_DIR_PATH = path.join(__dirname, '../storybook');

const STORYBOOK_CONFIG_FILES = [
	'addons.js',
	'config.js',
	'frontend-js-web.mock.js',
	'middleware.js',
	'preview-head.html',
	'webpack.config.js'
];

const PORTAL_ROOT = process.cwd().split('/modules')[0];

/**
 * Builds the string used for defining the NODE_PATH environment.
 * On Windows, NODE_PATH is delimited by semicolons (;) instead of colons.
 * @returns {String}
 */
function buildNodePath() {
	return NODE_PATHS.join(process.platform === 'win32' ? ';' : ':');
}

/**
 * Copies storybook config files into the build path.
 * @param {String} buildPath Path to the build directory.
 * @param {Array} files The list of files to copy.
 */
function copyStorybookConfigFiles(buildPath, files) {
	files.forEach(function(file) {
		fs.copyFileSync(
			path.join(STORYBOOK_CONFIG_DIR_PATH, file),
			path.join(buildPath, file)
		);
	});
}

/**
 * Combine multiple Language.properties files to a single file for
 * liferay-lang-key-dev-loader to read from.
 * @param {String} buildPath Path to the build directory.
 * @param {Array} paths List of path strings to Language.properties files.
 */
function compileLanguageProperties(buildPath, paths) {
	const PORTAL_LANG_PATH = path.join(
		PORTAL_ROOT,
		'/portal-impl/src/content/Language.properties'
	);

	const LANG_PATHS = [PORTAL_LANG_PATH, ...paths];

	const output = [];

	LANG_PATHS.filter(fs.existsSync).forEach(langPath => {
		try {
			output.push(fs.readFileSync(langPath).toString());
		} catch (error) {
			log(
				`Failed to read lang key file "${langPath}" due to error: ${error}`
			);
		}
	});

	fs.writeFileSync(
		path.join(buildPath, 'Language.properties'),
		output.join('\n')
	);
}

/**
 * Starts a storybook server for testing frontend components.
 */
function storybook() {
	// Create directory to store built storybook configs.
	const buildPath = fs.mkdtempSync(path.join(os.tmpdir(), 'storybook-'));

	log(`Building storybook files to: ${buildPath}`);

	// Generate custom babel config using current working directory's .babelrc.
	fs.writeFileSync(
		path.join(buildPath, '.babelrc'),
		JSON.stringify(BABEL_CONFIG)
	);

	// Write storybook config to a file for storybook files to access.
	fs.writeFileSync(
		path.join(buildPath, 'storybook-config.json'),
		JSON.stringify(STORYBOOK_CONFIG)
	);

	copyStorybookConfigFiles(buildPath, STORYBOOK_CONFIG_FILES);

	compileLanguageProperties(buildPath, STORYBOOK_CONFIG.languagePaths);

	const args = [
		// Set port that storybook will use to run the server on.
		'--port',
		STORYBOOK_CONFIG.port,

		// Set directory where the storybook config files are.
		'--config-dir',
		buildPath,

		// Set portal root directory to retrieve static resources from.
		'--static-dir',
		PORTAL_ROOT
	];

	spawnSync('start-storybook', args, {
		env: {
			...process.env,
			NODE_PATH: buildNodePath()
		}
	});
}

module.exports = storybook;
