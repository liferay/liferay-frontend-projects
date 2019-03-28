/**
 * © 2019 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: BSD-3-Clause
 */

const CWD = process.cwd();

const spawnSync = require('../utils/spawnSync');
const fs = require('fs');
const path = require('path');

const {buildSoy, cleanSoy, soyExists} = require('./soy');
const {removeBabelConfig, setBabelConfig} = require('./babel');
const getMergedConfig = require('../utils/get-merged-config');
const {moveToTemp, removeFromTemp} = require('../utils/move-to-temp');

const BUILD_CONFIG = getMergedConfig('npmscripts').build;
const BUNDLER_CONFIG = getMergedConfig('bundler');

/**
 * Compiles javascript files by running `babel` bin with merged config(user + default) and source-maps enabled
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
 * Creates a temporary npmbundler config(user + default) and then runs `liferay-npm-bundler` bin
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
 * Runs `liferay-npm-bridge-generator` bin
 */
function runBridge() {
	spawnSync('liferay-npm-bridge-generator');
}

/**
 * Main script that runs all all specified build tasks synchronously.
 * Babel is always run and the user can also include flags to run soy and bundler.
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
