/**
 * SPDX-FileCopyrightText: © 2019 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: BSD-3-Clause
 */

const fs = require('fs');
const path = require('path');

let buildSass = require('../sass/build');
let createBridges = require('../utils/createBridges');
const createTempFile = require('../utils/createTempFile');
const getMergedConfig = require('../utils/getMergedConfig');
const instrument = require('../utils/instrument');
let minify = require('../utils/minify');
let runBabel = require('../utils/runBabel');
let runBridge = require('../utils/runBridge');
let runBundler = require('../utils/runBundler');
const setEnv = require('../utils/setEnv');
let {buildSoy, cleanSoy, soyExists, translateSoy} = require('../utils/soy');
const validateConfig = require('../utils/validateConfig');
let webpack = require('./webpack');

const CWD = process.cwd();

({
	buildSass,
	buildSoy,
	cleanSoy,
	createBridges,
	minify,
	runBabel,
	runBridge,
	runBundler,
	soyExists,
	translateSoy,
	webpack,
} = instrument({
	buildSass,
	buildSoy,
	cleanSoy,
	createBridges,
	minify,
	runBabel,
	runBridge,
	runBundler,
	soyExists,
	translateSoy,
	webpack,
}));

/**
 * Main script that runs all all specified build tasks synchronously.
 *
 * Babel and liferay-npm-bundler are run unless the disable flag is set,
 * liferay-npm-bridge-generator and webpack are run if the corresponding
 * ".npmbridgerc" and "webpack.config.js" files, respectively, are
 * present, and soy is run when soy files are detected.
 * `minify()` is run unless `NODE_ENV` is `development`.
 */
module.exports = async function (...args) {
	const config = getMergedConfig('npmscripts');

	createTempFile('npmscripts.config.json', JSON.stringify(config, null, 2), {
		autoDelete: false,
	});

	const {build: BUILD_CONFIG, federation} = config;

	if (!BUILD_CONFIG) {
		throw new Error('npmscripts.config.js is missing required "build" key');
	}

	setEnv('production');

	validateConfig(
		BUILD_CONFIG,
		['input', 'output', 'dependencies', 'temp'],
		'liferay-npm-scripts: `build`'
	);

	const inputPathExists = fs.existsSync(BUILD_CONFIG.input);

	const useSoy = soyExists();

	if (useSoy) {
		buildSoy();
	}

	const runLegacyBuild = !federation || federation.mode != 'default';

	if (inputPathExists && runLegacyBuild) {
		runBabel(
			BUILD_CONFIG.input,
			'--out-dir',
			BUILD_CONFIG.output,
			'--source-maps'
		);
	}

	const runFederationBuild = federation && federation.mode !== 'disabled';

	if (fs.existsSync('webpack.config.js') || runFederationBuild) {
		webpack(...args);
	}

	if (runLegacyBuild) {
		runBundler();
	}
	else {
		const {output} = BUILD_CONFIG;

		fs.copyFileSync('package.json', path.join(output, 'package.json'));
		fs.writeFileSync(path.join(output, 'manifest.json'), '{}');
	}

	if (runFederationBuild) {
		createBridges(federation.bridges, BUILD_CONFIG.output);
	}

	translateSoy(BUILD_CONFIG.output);

	if (fs.existsSync(path.join(CWD, '.npmbridgerc'))) {
		runBridge();
	}

	if (useSoy) {
		cleanSoy();
	}

	if (inputPathExists) {
		buildSass(path.join(CWD, BUILD_CONFIG.input), {
			imports: BUILD_CONFIG.sassIncludePaths,
			outputDir: BUILD_CONFIG.output,
			rtl: true,
		});
	}

	if (process.env.NODE_ENV !== 'development') {
		await minify();
	}
};
