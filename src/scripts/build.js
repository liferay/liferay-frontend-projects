// Do this as the first thing so that any code reading it knows the right env.
process.env.BABEL_ENV = 'production';
process.env.NODE_ENV = 'production';

const CWD = process.cwd();

const {spawn} = require('cross-spawn');
const fs = require('fs');
const path = require('path');
const which = require('npm-which')(CWD);

const deepMerge = require('../utils/deep-merge');
const getUserConfig = require('../utils/get-user-config');
const {removeFromTemp, moveToTemp} = require('../utils/move-to-temp');

const TEMP_PATH = path.join(CWD, 'TEMP_LIFERAY_NPM_SCRIPTS');

const USER_BABEL_CONFIG = getUserConfig('.babelrc', 'babel');
const USER_BUNDLER_CONFIG = getUserConfig('.npmbundlerrc');
const USER_NPM_SCRIPTS_CONFIG = getUserConfig('.liferaynpmscriptsrc');

const BABEL_CONFIG = deepMerge(require('../config/babel'), USER_BABEL_CONFIG);
const BUILD_CONFIG = deepMerge(
	require('../config/liferay-npm-scripts'),
	getUserConfig('.liferaynpmscriptsrc')
).build;
const BUNDLER_CONFIG = deepMerge(
	require('../config/npm-bundler'),
	USER_BUNDLER_CONFIG
);

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
	const stringDependencies = BUILD_CONFIG.dependencies.join('|');

	spawn.sync(
		which.sync('metalsoy'),
		['--soyDeps', 'node_modules/+(com.liferay.frontend.js.web)/**/*.soy'],
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
