// Do this as the first thing so that any code reading it knows the right env.
process.env.BABEL_ENV = 'production';
process.env.NODE_ENV = 'production';

const CWD = process.cwd();

const spawnSync = require('../utils/spawnSync');
const fs = require('fs');
const path = require('path');
const which = require('npm-which')(CWD);

const generateSoyDependencies = require('../utils/generate-soy-dependencies');
const getMergedConfig = require('../utils/get-merged-config');
const {moveToTemp, removeFromTemp,} = require('../utils/move-to-temp');

const BABEL_CONFIG = getMergedConfig('babel');
const BUILD_CONFIG = getMergedConfig('npmscripts').build;
const BUNDLER_CONFIG = getMergedConfig('bundler');

/**
 * Compiles javascript files by running `babel` bin with merged config(user + default) and source-maps enabled
 */
function compileBabel() {
	moveToTemp(CWD, '.babelrc', 'babel');

	const RC_PATH = path.join(CWD, '.babelrc');

	fs.writeFileSync(RC_PATH, JSON.stringify(BABEL_CONFIG));

	spawnSync(which.sync('babel'), [
		BUILD_CONFIG.input,
		'--out-dir',
		BUILD_CONFIG.output,
		'--source-maps',
	]);

	fs.unlinkSync(RC_PATH);

	removeFromTemp(CWD, '.babelrc', 'babel');
}

/**
 * Compiles soy files by running `metalsoy` bin with specified soy dependencies
 */
function buildSoy() {
	spawnSync(which.sync('metalsoy'), [
		'--soyDeps',
		generateSoyDependencies(BUILD_CONFIG.dependencies),
	]);
}

/**
 * Creates a temporary npmbundler config(user + default) and then runs `liferay-npm-bundler` bin
 */
function runBundler() {
	moveToTemp(CWD, '.npmbundlerrc');

	const RC_PATH = path.join(CWD, '.npmbundlerrc');

	fs.writeFileSync(RC_PATH, JSON.stringify(BUNDLER_CONFIG));

	spawnSync(which.sync('liferay-npm-bundler'));

	fs.unlinkSync(RC_PATH);

	removeFromTemp(CWD, '.npmbundlerrc');
}

/**
 * Runs `liferay-npm-bridge-generator` bin
 */
function runBridge() {
	spawnSync(which.sync('liferay-npm-bridge-generator'));
}

/**
 * Removes any generated soy.js files
 */
function cleanSoy() {
	spawnSync(which.sync('rimraf'), ['src/**/*.soy.js',]);
}

/**
 * Main script that runs all all specified build tasks synchronously.
 * Babel is always run and the user can also include flags to run soy and bundler.
 */
module.exports = function(flags) {
	const useBridge = flags.bridge;
	const useBundler = flags.bundler;
	const useSoy = flags.soy;

	if (useSoy) {
		buildSoy();
	}

	compileBabel();

	if (useBundler) {
		runBundler();
	}

	if (useBridge) {
		runBridge();
	}

	if (useSoy) {
		cleanSoy();
	}
};
