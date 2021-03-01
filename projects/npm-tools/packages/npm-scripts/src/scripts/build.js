/**
 * SPDX-FileCopyrightText: © 2019 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: BSD-3-Clause
 */

const fs = require('fs');
const path = require('path');

let buildSass = require('../sass/build');
let createBridges = require('../utils/createBridges');
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

const {build: BUILD_CONFIG, federation: FEDERATION_CONFIG} = getMergedConfig(
	'npmscripts'
);
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

if (!BUILD_CONFIG) {
	throw new Error('npmscripts.config.js is missing required "build" key');
}

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

	const runLegacyBuild =
		!FEDERATION_CONFIG || FEDERATION_CONFIG.runLegacyBuild !== false;

	if (inputPathExists && runLegacyBuild) {
		runBabel(
			BUILD_CONFIG.input,
			'--out-dir',
			BUILD_CONFIG.output,
			'--source-maps',
			'--extensions',
			'.cjs,.es,.es6,.js,.jsx,.mjs,.ts,.tsx'
		);
	}

	if (fs.existsSync('webpack.config.js') || FEDERATION_CONFIG) {
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

	if (FEDERATION_CONFIG) {
		createBridges(FEDERATION_CONFIG.bridges, BUILD_CONFIG.output);
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
