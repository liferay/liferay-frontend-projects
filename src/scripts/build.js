// Do this as the first thing so that any code reading it knows the right env.
process.env.BABEL_ENV = 'production';
process.env.NODE_ENV = 'production';

const {spawn} = require('cross-spawn');
const fs = require('fs');
const path = require('path');
const which = require('npm-which')(__dirname);

const deepMerge = require('../utils/deep-merge');
const getConfig = require('../utils/get-config');
const {remove, write} = require('../utils/write-temp');

const CWD = process.cwd();

const BUILD_CONFIG = deepMerge(
	require('../config/liferay-npm-scripts-rc'),
	getConfig('.liferaynpmscriptsrc')
).build;

const TEMP_PATH = path.join(__dirname, '../TEMP');

const CUSTOM_BABEL_CONFIG = getConfig('.babelrc', 'babel');
const CUSTOM_BUNDLER_CONFIG = getConfig('.npmbundlerrc');

const BABEL_CONFIG = deepMerge(require('../config/babel'), CUSTOM_BABEL_CONFIG);
const BUNDLER_CONFIG = deepMerge(
	require('../config/npm-bundler'),
	CUSTOM_BUNDLER_CONFIG
);

function compileBabel() {
	fs.writeFileSync(
		TEMP_PATH + '/babel-config.json',
		JSON.stringify(BABEL_CONFIG)
	);

	const args = [
		which.sync('babel'),
		path.join(CWD, BUILD_CONFIG.input),
		'--out-dir',
		path.join(CWD, BUILD_CONFIG.output),
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

	spawn.sync(which.sync('cross-env'), args, {
		cwd: __dirname,
		stdio: 'inherit'
	});
}

function buildSoy() {
	const stringDependencies = BUILD_CONFIG.dependencies.join('|');

	spawn.sync(
		which.sync('metalsoy'),
		['--soyDeps', `node_modules/+(${stringDependencies})/**/*.soy`],
		{cwd: CWD, stdio: 'inherit'}
	);
}

function runBundler() {
	write(CWD, '.npmbundlerrc');

	fs.writeFileSync(CWD + '/.npmbundlerrc', JSON.stringify(BUNDLER_CONFIG));

	spawn.sync(which.sync('liferay-npm-bundler'), [], {
		cwd: CWD,
		stdio: 'inherit'
	});

	remove(CWD, '.npmbundlerrc');
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
		buildSoy(config.dependencies);
	}

	compileBabel();

	if (useBundler) {
		runBundler();
	}

	if (useSoy) {
		cleanSoy();
	}
};
