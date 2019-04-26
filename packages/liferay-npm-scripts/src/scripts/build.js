/**
 * © 2019 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: BSD-3-Clause
 */

const CWD = process.cwd();

const fs = require('fs');
const path = require('path');

const {removeBabelConfig, setBabelConfig} = require('../utils/babel');
const getMergedConfig = require('../utils/get-merged-config');
const {moveToTemp, removeFromTemp} = require('../utils/move-to-temp');
const {buildSoy, cleanSoy, soyExists} = require('../utils/soy');
const spawnSync = require('../utils/spawnSync');

const BUILD_CONFIG = getMergedConfig('npmscripts').build;
const BUNDLER_CONFIG = getMergedConfig('bundler');

/**
 * Compiles JavaScript files by running `babel` with merged config(user +
 * default) and source-maps enabled.
 */
function compileBabel() {
	setBabelConfig();

	spawnSync('babel', [
		BUILD_CONFIG.input,
		'--out-dir',
		BUILD_CONFIG.output,
		'--source-maps'
	]);

	removeBabelConfig();
}

/**
 * Creates a temporary npmbundler config(user + default) and then runs the
 * `liferay-npm-bundler` executable.
 */
function runBundler() {
	moveToTemp(CWD, '.npmbundlerrc');

	const RC_PATH = path.join(CWD, '.npmbundlerrc');

	fs.writeFileSync(RC_PATH, JSON.stringify(BUNDLER_CONFIG));

	spawnSync('liferay-npm-bundler');

	fs.unlinkSync(RC_PATH);

	removeFromTemp(CWD, '.npmbundlerrc');
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
 * Babel and liferay-npm-bundler are always run, liferay-npm-bridge-generator is
 * run if the corresponding .npmbridgerc config file is present, and soy is run
 * when soy files are detected.
 */
module.exports = function() {
	const useSoy = soyExists();

	if (useSoy) {
		buildSoy();
	}

	compileBabel();

	runBundler();

	if (fs.existsSync(path.join(CWD, '.npmbridgerc'))) {
		runBridge();
	}

	if (useSoy) {
		cleanSoy();
	}
};
