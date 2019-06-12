/**
 * © 2019 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: BSD-3-Clause
 */

const CWD = process.cwd();

const fs = require('fs');
const path = require('path');

const getMergedConfig = require('../utils/getMergedConfig');
const moveToTemp = require('../utils/moveToTemp');
const removeFromTemp = require('../utils/removeFromTemp');
const setEnv = require('../utils/setEnv');
const {buildSoy, cleanSoy, soyExists} = require('../utils/soy');
const spawnSync = require('../utils/spawnSync');
const validateConfig = require('../utils/validateConfig');
const withBabelConfig = require('../utils/withBabelConfig');
const webpack = require('./webpack');

const BUILD_CONFIG = getMergedConfig('npmscripts', 'build');
const BUNDLER_CONFIG = getMergedConfig('bundler');

/**
 * Compiles JavaScript files by running `babel` with merged config(user +
 * default) and source-maps enabled.
 */
function compileBabel() {
	withBabelConfig(() => {
		spawnSync('babel', [
			BUILD_CONFIG.input,
			'--out-dir',
			BUILD_CONFIG.output,
			'--source-maps'
		]);
	});
}

/**
 * Creates a temporary npmbundler config(user + default) and then runs the
 * `liferay-npm-bundler` executable.
 */
function runBundler() {
	try {
		moveToTemp('.npmbundlerrc');

		const RC_PATH = path.join(CWD, '.npmbundlerrc');

		fs.writeFileSync(RC_PATH, JSON.stringify(BUNDLER_CONFIG));

		spawnSync('liferay-npm-bundler');

		fs.unlinkSync(RC_PATH);
	} finally {
		removeFromTemp('.npmbundlerrc');
	}
}

/**
 * Runs the `liferay-npm-bridge-generator` executable.
 */
function runBridge() {
	spawnSync('liferay-npm-bridge-generator');
}

/**
 * Main script that runs all all specified build tasks synchronously.
 *
 * Babel and liferay-npm-bundler are always run,
 * liferay-npm-bridge-generator and webpack are run if the corresponding
 * ".npmbridgerc" and "webpack.config.js" files, respectively, are
 * present, and soy is run when soy files are detected.
 */
module.exports = function() {
	setEnv('production');

	validateConfig(
		BUILD_CONFIG,
		['input', 'output', 'dependencies'],
		'liferay-npm-scripts: `build`'
	);

	const useSoy = soyExists();

	if (useSoy) {
		buildSoy();
	}

	compileBabel();

	if (fs.existsSync(path.join(CWD, 'webpack.config.js'))) {
		webpack();
	}

	runBundler();

	if (fs.existsSync(path.join(CWD, '.npmbridgerc'))) {
		runBridge();
	}

	if (useSoy) {
		cleanSoy();
	}
};
