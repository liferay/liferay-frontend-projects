/**
 * SPDX-FileCopyrightText: © 2019 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: BSD-3-Clause
 */

const fs = require('fs');
const path = require('path');

let buildSass = require('../sass/build');
let runTSC = require('../typescript/runTSC');
const createAmd2EsmExportsBridges = require('../utils/createAmd2EsmExportsBridges');
const createEsm2AmdExportsBridges = require('../utils/createEsm2AmdExportsBridges');
const createTempFile = require('../utils/createTempFile');
const getMergedConfig = require('../utils/getMergedConfig');
const instrument = require('../utils/instrument');
let minify = require('../utils/minify');
let runBabel = require('../utils/runBabel');
let runBridge = require('../utils/runBridge');
let runBundler = require('../utils/runBundler');
let runWebpackAsBundler = require('../utils/runWebpackAsBundler');
const setEnv = require('../utils/setEnv');
let {buildSoy, cleanSoy, soyExists, translateSoy} = require('../utils/soy');
const validateConfig = require('../utils/validateConfig');
let webpack = require('./webpack');

const CWD = process.cwd();

({
	buildSass,
	buildSoy,
	cleanSoy,
	minify,
	runBabel,
	runBridge,
	runBundler,
	runWebpackAsBundler,
	runTSC,
	soyExists,
	translateSoy,
	webpack,
} = instrument({
	buildSass,
	buildSoy,
	cleanSoy,
	minify,
	runBabel,
	runBridge,
	runBundler,
	runWebpackAsBundler,
	runTSC,
	soyExists,
	translateSoy,
	webpack,
}));

function pickItem(array, item) {
	const index = array.indexOf(item);

	if (index > -1) {
		array.splice(index, 1);

		return true;
	}
	else {
		return false;
	}
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
	const cssOnly = pickItem(args, '--css-only');
	const jsOnly = pickItem(args, '--js-only');

	const config = getMergedConfig('npmscripts');

	createTempFile('npmscripts.config.json', JSON.stringify(config, null, 2), {
		autoDelete: false,
	});

	const {build: BUILD_CONFIG} = config;

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

	if (!cssOnly) {
		const useSoy = soyExists();

		if (useSoy) {
			buildSoy();
		}

		if (inputPathExists) {
			const isTypeScript = fs.existsSync('tsconfig.json');

			if (isTypeScript) {
				await runTSC();
			}

			runBabel(
				BUILD_CONFIG.input,
				'--out-dir',
				BUILD_CONFIG.output,
				'--source-maps',
				'--extensions',
				'.cjs,.es,.es6,.js,.jsx,.mjs,.ts,.tsx'
			);
		}

		if (fs.existsSync('webpack.config.js')) {
			webpack(...args);
		}

		if (BUILD_CONFIG.bundler) {
			runBundler();
		}

		if (Array.isArray(BUILD_CONFIG.exports)) {
			await runWebpackAsBundler(BUILD_CONFIG);

			createEsm2AmdExportsBridges(
				CWD,
				BUILD_CONFIG.output,
				BUILD_CONFIG.exports
			);
		}
		else if (BUILD_CONFIG.exports) {
			createAmd2EsmExportsBridges(
				CWD,
				BUILD_CONFIG.output,
				BUILD_CONFIG.exports
			);
		}

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
	}

	if (!jsOnly) {
		if (inputPathExists) {
			buildSass(path.join(CWD, BUILD_CONFIG.input), {
				imports: BUILD_CONFIG.sassIncludePaths,
				outputDir: BUILD_CONFIG.output,
				rtl: true,
			});
		}
	}
};
