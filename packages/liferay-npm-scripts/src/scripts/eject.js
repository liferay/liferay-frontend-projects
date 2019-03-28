/**
 * © 2019 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: BSD-3-Clause
 */

const CWD = process.cwd();

const fs = require('fs');
const path = require('path');
const rimraf = require('rimraf');
const sortKeys = require('sort-keys');

const {soyExists} = require('./soy');
const generateSoyDependencies = require('../utils/generate-soy-dependencies');
const getMergedConfig = require('../utils/get-merged-config');
const spawnSync = require('../utils/spawnSync');

const BABEL_CONFIG = getMergedConfig('babel');
const NPM_SCRIPTS_CONFIG = getMergedConfig('npmscripts');
const BUNDLER_CONFIG = getMergedConfig('bundler');
const JEST_CONFIG = getMergedConfig('jest');

const projectPackage = require(path.join(CWD, 'package.json'));
const scriptsDependencies = require(path.join(__dirname, '../../package.json'))
	.dependencies;

/**
 * Helper for generating the npm `build` script
 * @param {Object} config Options derived from file structure
 * @returns {string}
 */
function generateBuildScript(config) {
	let retStr = '';

	if (config.soy) {
		retStr += `metalsoy --soyDeps "${generateSoyDependencies(
			NPM_SCRIPTS_CONFIG.build.dependencies
		)}" && `;
	}

	retStr += `cross-env NODE_ENV=production babel --source-maps -d ${
		NPM_SCRIPTS_CONFIG.build.output
	} ${NPM_SCRIPTS_CONFIG.build.input}`;

	retStr += ' && liferay-npm-bundler';

	if (config.bridge) {
		retStr += ' && liferay-npm-bridge-generator';
	}

	if (config.soy) {
		retStr += '&& npm run cleanSoy';
	}

	return retStr;
}

/**
 * Main function for ejecting configuration to package.json and configuration
 */
module.exports = function() {
	const config = {
		bridge: fs.existsSync(path.join(CWD, '.npmbridgerc')),
		soy: soyExists()
	};

	// Write config for babel
	if (!projectPackage.babel) {
		fs.writeFileSync(
			path.join(CWD, '.babelrc'),
			JSON.stringify(BABEL_CONFIG, null, '\t')
		);
	} else {
		projectPackage.babel = BABEL_CONFIG;
	}

	// Write config for jest
	if (fs.existsSync(path.join(CWD, 'jest.config.js'))) {
		fs.writeFileSync(
			path.join(CWD, 'jest.config.js'),
			JSON.stringify(JEST_CONFIG, null, '\t')
		);
	} else {
		projectPackage.jest = JEST_CONFIG;
	}

	// Write config file for bundler
	fs.writeFileSync(
		path.join(CWD, '.npmbundlerrc'),
		JSON.stringify(BUNDLER_CONFIG, null, '\t')
	);

	// Set initial npm scripts
	projectPackage.scripts = {
		build: generateBuildScript(config),
		format: `csf ${NPM_SCRIPTS_CONFIG.format.join(' ')} --inline-edit`,
		lint: `csf ${NPM_SCRIPTS_CONFIG.lint.join(' ')}`,
		test: 'jest'
	};

	// Set initial devDependencies for package.json
	const newDevDependencies = {
		'@babel/cli': scriptsDependencies['@babel/cli'],
		'@babel/preset-env': scriptsDependencies['@babel/preset-env'],
		'check-source-formatting':
			scriptsDependencies['check-source-formatting'],
		'cross-env': scriptsDependencies['cross-env'],
		jest: scriptsDependencies['jest'],
		'liferay-jest-junit-reporter':
			scriptsDependencies['liferay-jest-junit-reporter'],
		'liferay-npm-bundler': scriptsDependencies['liferay-npm-bundler'],
		'liferay-npm-bundler-preset-liferay-dev':
			scriptsDependencies['liferay-npm-bundler-preset-liferay-dev']
	};

	// Additional if soy is used
	if (config.soy) {
		newDevDependencies['metal-tools-soy'] =
			scriptsDependencies['metal-tools-soy'];
		newDevDependencies['rimraf'] = scriptsDependencies['rimraf'];

		projectPackage.scripts.cleanSoy = 'rimraf src/**/*.soy.js';
	}

	// Additional if bridge is used
	if (config.bridge) {
		newDevDependencies['liferay-npm-bridge-generator'] =
			scriptsDependencies['liferay-npm-bridge-generator'];
	}

	projectPackage.devDependencies = sortKeys({
		...newDevDependencies,
		...projectPackage.devDependencies
	});

	// Remove liferay-npm-scripts dependency
	delete projectPackage.devDependencies['liferay-npm-scripts'];

	// Write new package.json
	fs.writeFileSync(
		path.join(CWD, 'package.json'),
		JSON.stringify(projectPackage, null, '\t')
	);

	// Remove .liferaynpmscriptsrc configuration
	fs.unlinkSync(path.join(CWD, '.liferaynpmscriptsrc'));

	// Remove old node_modules and re-install node_modules with new dependencies
	rimraf.sync(path.join(CWD, 'node_modules'));
	spawnSync('npm', ['install']);
};
