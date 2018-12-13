// Do this as the first thing so that any code reading it knows the right env.
process.env.BABEL_ENV = 'production';
process.env.NODE_ENV = 'production';

const CWD = process.cwd();

const {spawn} = require('cross-spawn');
const fs = require('fs');
const path = require('path');
const which = require('npm-which')(CWD);

const generateSoyDependencies = require('../utils/generate-soy-dependencies');
const getMergedConfig = require('../utils/get-merged-config');
const {removeFromTemp, moveToTemp} = require('../utils/move-to-temp');

const TEMP_PATH = path.join(CWD, 'TEMP_LIFERAY_NPM_SCRIPTS');

const BABEL_CONFIG = getMergedConfig('babel');
const BUILD_CONFIG = getMergedConfig('npmscripts').build;
const BUNDLER_CONFIG = getMergedConfig('bundler');

function compileBabel() {
	fs.writeFileSync(
		TEMP_PATH + '/babel-config.json',
		JSON.stringify(BABEL_CONFIG)
	);

	const args = [
		BUILD_CONFIG.input,
		'--out-dir',
		BUILD_CONFIG.output,
		'--config-file',
		TEMP_PATH + '/babel-config.json',
		'--source-maps'
	];

	if (BABEL_CONFIG.presets.length) {
		args.concat('--presets', BABEL_CONFIG.presets.join(' '));
	}

	if (BABEL_CONFIG.plugins.length) {
		args.concat('--plugins', BABEL_CONFIG.plugins.join(' '));
	}

	spawn.sync(which.sync('babel'), args, {
		cwd: CWD,
		stdio: 'inherit'
	});
}

function buildSoy() {
	spawn.sync(
		which.sync('metalsoy'),
		['--soyDeps', generateSoyDependencies(BUILD_CONFIG.dependencies)],
		{cwd: CWD, stdio: 'inherit'}
	);
}

function runBundler() {
	moveToTemp(CWD, '.npmbundlerrc');

	const RC_PATH = path.join(CWD, '.npmbundlerrc');

	fs.writeFileSync(RC_PATH, JSON.stringify(BUNDLER_CONFIG));

	spawn.sync(which.sync('liferay-npm-bundler'), [], {
		cwd: CWD,
		stdio: 'inherit'
	});

	fs.unlinkSync(RC_PATH);

	removeFromTemp(CWD, '.npmbundlerrc');
}

function cleanSoy() {
	spawn.sync(which.sync('rimraf'), ['src/**/*.soy.js'], {
		cwd: CWD,
		stdio: 'inherit'
	});
}

module.exports = function(flags, config) {
	const useBundler = flags.bundler;
	const useSoy = flags.soy;

	if (useSoy) {
		buildSoy();
	}

	compileBabel();

	if (useBundler) {
		runBundler();
	}

	if (useSoy) {
		cleanSoy();
	}
};
