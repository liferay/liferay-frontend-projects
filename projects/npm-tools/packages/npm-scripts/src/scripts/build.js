/**
 * SPDX-FileCopyrightText: © 2019 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: BSD-3-Clause
 */

const fs = require('fs');
const path = require('path');
const rimraf = require('rimraf');

const getMergedConfig = require('../utils/getMergedConfig');
const minify = require('../utils/minify');
const runBabel = require('../utils/runBabel');
const runBundler = require('../utils/runBundler');
const setEnv = require('../utils/setEnv');
const {buildSoy, cleanSoy, soyExists, translateSoy} = require('../utils/soy');
const spawnSync = require('../utils/spawnSync');
const validateConfig = require('../utils/validateConfig');
const webpack = require('./webpack');

const BUILD_CONFIG = getMergedConfig('npmscripts', 'build');
const CWD = process.cwd();

///
// Runs the `liferay-npm-bridge-generator` executable and removes sourcemaps to
// ensure `liferay-npm-scripts build` is idempotent.
//
// In our common workflow right now, runBundler and runBridge can interact to
// create some kind of circular dependency where files keep being re-processed
// over and over or are only processed after the first pass.
//
// Given a typical config, where the bundler is configured to write output to
// "build/..." and the bridge generator is configured to read from "build/..."
// and write to "build/.../bridge":
//
// 1st pass
// - runBundler: operates on output folder (eg. "build/...")
// - runBridge: will expand output with an additional `bridge` folder (eg. "build/.../bridge")
//
// 2nd pass
// - runBundler: will now see `bridge` folder to process, generating sourcemaps
// - runBridge: depending on the configuration it can re-process previous `bridge`
// 				folders, so it's advised to always add `!**/bridge` inside the
//				`.npmbridgerc` `file-globs` configuration.
//
// To ensure output is the same after 1st and 2nd pass, we need to cleanup rogue
// sourcemaps in the bridge-generator output folder.
//
// See https://github.com/petershin/liferay-portal/pull/724 for more details.
//

function runBridge() {
	spawnSync('liferay-npm-bridge-generator');

	// Retrieves the `.npmbridgerc` configuration which we already know exists

	const bridgeConfig = JSON.parse(fs.readFileSync('.npmbridgerc', 'utf8'));

	Object.keys(bridgeConfig).forEach((moduleKey) => {
		const output = bridgeConfig[moduleKey].output;

		if (output) {
			rimraf.sync(`${output}/**/*.map`);
		}
	});
}

/**
 * Main script that runs all all specified build tasks synchronously.
 *
 * Babel and liferay-npm-bundler are always run,
 * liferay-npm-bridge-generator and webpack are run if the corresponding
 * ".npmbridgerc" and "webpack.config.js" files, respectively, are
 * present, and soy is run when soy files are detected.
 * `minify()` is run unless `NODE_ENV` is `development`.
 */
module.exports = async function () {
	setEnv('production');

	validateConfig(
		BUILD_CONFIG,
		['input', 'output', 'dependencies', 'temp'],
		'liferay-npm-scripts: `build`'
	);

	const useSoy = soyExists();

	if (useSoy) {
		buildSoy();
	}

	runBabel(
		BUILD_CONFIG.input,
		'--out-dir',
		BUILD_CONFIG.output,
		'--source-maps'
	);

	if (fs.existsSync(path.join(CWD, 'webpack.config.js'))) {
		webpack();
	}

	runBundler();

	translateSoy(BUILD_CONFIG.output);

	if (fs.existsSync(path.join(CWD, '.npmbridgerc'))) {
		runBridge();
	}

	if (useSoy) {
		cleanSoy();
	}

	if (process.env.NODE_ENV !== 'development') {
		await minify();
	}
};
