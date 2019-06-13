/**
 * © 2019 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: BSD-3-Clause
 */

const fs = require('fs');
const path = require('path');

const getMergedConfig = require('../utils/getMergedConfig');
const log = require('../utils/log');
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
 * Combine multiple Language.properties files to a single file for
 * liferay-lang-key-dev-loader to read from.
 * @param {Array} paths List of path strings to Language.properties files.
 */
function compileLanguageProperties(paths) {
	const PORTAL_LANG_PATH = path.join(
		PORTAL_ROOT,
		'/portal-impl/src/content/Language.properties'
	);

	const LANG_PATHS = [PORTAL_LANG_PATH, ...paths];

	// Used for keeping track of the current file being processed to show the
	// correct file that caused an error.
	let currentLangPath;

	try {
		const bufferArray = LANG_PATHS.filter(path => fs.existsSync(path)).map(
			path => {
				currentLangPath = path;

				return Buffer.concat([
					fs.readFileSync(path),
					Buffer.from('\n')
				]);
			}
		);

		const buffer = Buffer.concat(bufferArray);

		fs.writeFileSync(
			path.join(STORYBOOK_CONFIG_DIR_BUILD_PATH, 'Language.properties'),
			buffer.toString('utf8')
		);
	} catch (e) {
		log(`Failed to read lang key file: ${currentLangPath}`);

		// Write an empty file to prevent liferay-lang-key-dev-loader from
		// breaking the build if no file is found.
		fs.writeFileSync(
			path.join(STORYBOOK_CONFIG_DIR_BUILD_PATH, 'Language.properties'),
			''
		);
	}
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

	compileLanguageProperties(STORYBOOK_CONFIG.languagePaths);

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
