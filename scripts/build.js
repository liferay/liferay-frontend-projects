const {spawn} = require('cross-spawn');
const fs = require('fs');
const path = require('path');
const rimraf = require('rimraf');

const deepMerge = require('../utils/deep-merge');
const getConfig = require('../utils/get-config');
const {remove, write} = require('../utils/write-temp');

const CWD = process.cwd();

const BUILD_CONFIG = deepMerge(
	require('../config/liferay-npm-scripts-rc'),
	getConfig('.liferaynpmscriptsrc')
).build;

const DEFAULT_INPUT = path.join(CWD, 'src/main/resources/META-INF/resources');
const DEFAULT_OUTPUT = path.join(CWD, 'classes/META-INF/resources');
const TEMP_PATH = path.join(__dirname, '../TEMP');

const CUSTOM_BABEL_CONFIG = getConfig('.babelrc', 'babel');
const BUNDLER_RC = getConfig('.npmbundlerrc');

const BABEL_CONFIG = deepMerge(require('../config/babel'), CUSTOM_BABEL_CONFIG);
const BUNDLER_CONFIG = deepMerge(require('../config/npm-bundler'), BUNDLER_RC);

function compileBabel() {
	if (!fs.existsSync(TEMP_PATH)) {
		fs.mkdirSync(TEMP_PATH);
	}

	fs.writeFileSync(
		TEMP_PATH + '/babel-config.json',
		JSON.stringify(BABEL_CONFIG)
	);

	const args = [
		'NODE_ENV=production',
		path.join(__dirname, '../node_modules/.bin/babel'),
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

	spawn.sync(path.join(__dirname, '../node_modules/.bin/cross-env'), args, {
		cwd: __dirname,
		stdio: 'inherit'
	});
}

function buildSoy() {
	const stringDependencies = BUILD_CONFIG.dependencies.join('|');

	spawn.sync(
		path.join(__dirname, '../node_modules/.bin/metalsoy'),
		['--soyDeps', `node_modules/+(${stringDependencies})/**/*.soy`],
		{cwd: CWD, stdio: 'inherit'}
	);
}

function runBundler() {
	write(CWD, '.npmbundlerrc');

	fs.writeFileSync(CWD + '/.npmbundlerrc', JSON.stringify(BUNDLER_CONFIG));

	spawn.sync(
		path.join(__dirname, '../node_modules/.bin/liferay-npm-bundler'),
		[],
		{cwd: CWD, stdio: 'inherit'}
	);

	remove(CWD, '.npmbundlerrc');
}

function cleanSoy() {
	spawn.sync(
		path.join(__dirname, '../node_modules/.bin/rimraf'),
		['src/**/*.soy.js'],
		{cwd: CWD, stdio: 'inherit'}
	);
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

	rimraf.sync(TEMP_PATH);
};
