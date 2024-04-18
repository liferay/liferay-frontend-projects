/**
 * SPDX-FileCopyrightText: © 2019 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: BSD-3-Clause
 */

/* eslint-disable @liferay/no-dynamic-require */

const fs = require('fs');
const path = require('path');

let buildSass = require('../sass/build');
let runTSC = require('../typescript/runTSC');
const createEsm2AmdExportsBridges = require('../utils/createEsm2AmdExportsBridges');
const createEsm2AmdIndexBridge = require('../utils/createEsm2AmdIndexBridge');
const createTempFile = require('../utils/createTempFile');
const getMergedConfig = require('../utils/getMergedConfig');
const instrument = require('../utils/instrument');
const parseBnd = require('../utils/parseBnd');
let runWebpackAsBundler = require('../utils/runWebpackAsBundler');
const setEnv = require('../utils/setEnv');
const validateConfig = require('../utils/validateConfig');
let webpack = require('./webpack');

const CWD = process.cwd();

({buildSass, runTSC, runWebpackAsBundler, webpack} = instrument({
	buildSass,
	runTSC,
	runWebpackAsBundler,
	webpack,
}));

/**
 * Main script that runs all all specified build tasks synchronously.
 *
 * Babel and liferay-npm-bundler are run unless the disable flag is set,
 * liferay-npm-bridge-generator and webpack are run if the corresponding
 * ".npmbridgerc" and "webpack.config.js" files, respectively, are
 * present.
 * `minify()` is run unless `NODE_ENV` is `development`.
 */
module.exports = async function (...args) {
	const bnd = parseBnd();
	if (bnd && bnd['Fragment-Host']) {
		throw new Error(
			'`liferay-npm-scripts build` is not compatible with OSGI fragment modules, see LPD-19872.'
		);
	}

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
		['input', 'output', 'temp'],
		'liferay-npm-scripts: `build`'
	);

	const inputPathExists = fs.existsSync(BUILD_CONFIG.input);

	const pkgJson = require(path.resolve('package.json'));

	if (inputPathExists) {
		const isTypeScript = fs.existsSync('tsconfig.json');

		if (isTypeScript && BUILD_CONFIG.tsc !== false) {
			await runTSC();
		}
	}

	if (fs.existsSync('webpack.config.js')) {
		webpack(...args);
	}

	if (Array.isArray(BUILD_CONFIG.exports) || BUILD_CONFIG.main) {
		fs.mkdirSync(BUILD_CONFIG.output, {recursive: true});

		const newPkgJson = {
			...pkgJson,
		};

		newPkgJson.main = 'index.js';
		delete newPkgJson.dependencies;
		delete newPkgJson.devDependencies;

		fs.writeFileSync(
			path.join(BUILD_CONFIG.output, 'package.json'),
			JSON.stringify(newPkgJson, null, '\t'),
			'utf8'
		);

		await runWebpackAsBundler(CWD, BUILD_CONFIG, getMergedConfig('babel'));

		let manifest;

		try {
			manifest = require(path.resolve(
				BUILD_CONFIG.output,
				'manifest.json'
			));
		}
		catch (error) {
			manifest = {
				packages: {
					'/': {
						dest: {
							dir: '.',
							id: '/',
							name: pkgJson.name,
							version: pkgJson.version,
						},
						modules: {},
						src: {
							id: '/',
							name: pkgJson.name,
							version: pkgJson.version,
						},
					},
				},
			};
		}

		if (BUILD_CONFIG.main) {
			createEsm2AmdIndexBridge(CWD, BUILD_CONFIG, manifest);
		}

		if (BUILD_CONFIG.exports) {
			createEsm2AmdExportsBridges(CWD, BUILD_CONFIG, manifest);
		}

		fs.writeFileSync(
			path.join(BUILD_CONFIG.output, 'manifest.json'),
			JSON.stringify(manifest, null, '\t'),
			'utf8'
		);
	}

	if (inputPathExists) {
		buildSass(path.join(CWD, BUILD_CONFIG.input), {
			imports: BUILD_CONFIG.sassIncludePaths,
			outputDir: BUILD_CONFIG.output,
			rtl: true,
		});
	}
};
