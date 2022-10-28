/**
 * SPDX-FileCopyrightText: © 2019 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: BSD-3-Clause
 */

/* eslint-disable @liferay/no-dynamic-require */

const fs = require('fs');
const path = require('path');

let buildSass = require('../sass/build');
let runTSC = require('../typescript/runTSC');
const {isCacheValid, setCache} = require('../utils/buildArtifacts');
const createAmd2EsmExportsBridges = require('../utils/createAmd2EsmExportsBridges');
const createEsm2AmdCustomBridges = require('../utils/createEsm2AmdCustomBridges');
const createEsm2AmdExportsBridges = require('../utils/createEsm2AmdExportsBridges');
const createEsm2AmdIndexBridge = require('../utils/createEsm2AmdIndexBridge');
const createTempFile = require('../utils/createTempFile');
const expandGlobs = require('../utils/expandGlobs');
const getMergedConfig = require('../utils/getMergedConfig');
const instrument = require('../utils/instrument');
const log = require('../utils/log');
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
	runTSC,
	runWebpackAsBundler,
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
	runTSC,
	runWebpackAsBundler,
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

const ROOT_CONFIGS = [
	'/.babelrc.js',
	'/.npmbridgerc',
	'/.npmbundlerrc',
	'/liferay-npm-bundler.config.js',
	'/npmscripts.config.js',
	'/package.json',
	'/tsconfig.json',
	'/webpack.config.js',
];

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
	const forceBuild = pickItem(args, '--force');

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

	const srcFiles = expandGlobs(
		[
			path.join(BUILD_CONFIG.input, '**/*.js'),
			path.join(BUILD_CONFIG.input, '**/*.jsx'),
			path.join(BUILD_CONFIG.input, '**/*.ts'),
			path.join(BUILD_CONFIG.input, '**/*.tsx'),
			path.join(BUILD_CONFIG.input, '**/*.json'),
			path.join(BUILD_CONFIG.input, '**/*.css'),
			path.join(BUILD_CONFIG.input, '**/*.scss'),
			...ROOT_CONFIGS,
		],
		[
			'**/types/**',
			'**/__tests__/**',
			'/build/**',
			'/classes/**',
			'/node_modules/**',
		]
	);

	const pkgJson = require(path.resolve('package.json'));

	const skipBuild =
		!forceBuild &&
		!jsOnly &&
		!cssOnly &&
		isCacheValid(pkgJson.name, srcFiles);

	if (skipBuild) {
		log(
			`BUILD JS: Skipped, no changes detected. (To force build, remove '.npmscripts/buildinfo.json')`
		);
	}
	else if (!cssOnly) {
		log(
			`BUILD JS: ${
				forceBuild
					? 'Not using previous build.'
					: 'No previous build detected.'
			}`
		);

		const useSoy = soyExists();

		if (useSoy) {
			buildSoy();
		}

		if (inputPathExists) {
			const isTypeScript = fs.existsSync('tsconfig.json');

			if (isTypeScript && BUILD_CONFIG.tsc !== false) {
				await runTSC();
			}

			if (BUILD_CONFIG.babel !== false) {
				const ignores = [];

				if (BUILD_CONFIG.babel?.ignores) {
					BUILD_CONFIG.babel.ignores.forEach((ignore) => {
						ignores.push('--ignore');
						ignores.push(ignore);
					});
				}

				runBabel(
					BUILD_CONFIG.input,
					'--out-dir',
					BUILD_CONFIG.output,
					'--source-maps',
					'--extensions',
					'.cjs,.es,.es6,.js,.jsx,.mjs,.ts,.tsx',
					...ignores
				);
			}
		}

		if (fs.existsSync('webpack.config.js')) {
			webpack(...args);
		}

		if (BUILD_CONFIG.bundler) {
			runBundler();
		}

		if (Array.isArray(BUILD_CONFIG.exports) || BUILD_CONFIG.main) {
			fs.mkdirSync(BUILD_CONFIG.output, {recursive: true});

			if (!BUILD_CONFIG.bundler) {
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
			}

			await runWebpackAsBundler(
				CWD,
				BUILD_CONFIG,
				getMergedConfig('babel')
			);

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

			createEsm2AmdExportsBridges(CWD, BUILD_CONFIG, manifest);

			createEsm2AmdCustomBridges(CWD, BUILD_CONFIG, manifest);

			fs.writeFileSync(
				path.join(BUILD_CONFIG.output, 'manifest.json'),
				JSON.stringify(manifest, null, '\t'),
				'utf8'
			);
		}
		else if (BUILD_CONFIG.exports) {

			// TODO: remove this once migration to webpack is done

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
			if (skipBuild) {
				log(
					`BUILD SASS: Skipped, no changes detected. (To force build, remove '.npmscripts/buildinfo.json')`
				);
			}
			else {
				log(
					`BUILD SASS: ${
						forceBuild
							? 'Not using previous build.'
							: 'No previous build detected.'
					}`
				);

				buildSass(path.join(CWD, BUILD_CONFIG.input), {
					imports: BUILD_CONFIG.sassIncludePaths,
					outputDir: BUILD_CONFIG.output,
					rtl: true,
				});
			}
		}
	}

	if (!skipBuild) {
		setCache(pkgJson.name, srcFiles, BUILD_CONFIG.output);
	}
};
