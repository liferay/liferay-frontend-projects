const {spawn} = require('cross-spawn');
const fs = require('fs');
const path = require('path');
const rimraf = require('rimraf');
const deepMerge = require('../utils/deep-merge');
const getConfig = require('../utils/get-config');

const CWD = process.cwd();

const DEFAULT_INPUT = path.join(CWD, 'src/main/resources/META-INF/resources');
const DEFAULT_OUTPUT = path.join(CWD, 'classes/META-INF/resources');
const TEMP_PATH = path.join(__dirname, '../TEMP');

const CUSTOM_BABEL_CONFIG = getConfig('.babelrc', 'babel');

const BABEL_CONFIG = deepMerge(require('../config/babel'), CUSTOM_BABEL_CONFIG);

function spawnProcessSync(binLocation, args) {
	spawn.sync(binLocation, args, {cwd: __dirname, stdio: 'inherit'});
}

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
		DEFAULT_INPUT,
		'--out-dir',
		DEFAULT_OUTPUT,
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

const generateSoyDependencies = dependencies => {
	const stringDependencies = dependencies.join('|');

	return `node_modules/+(${stringDependencies})/**/*.soy`;
};

function buildSoy(dependencies) {
	spawnProcessSync(path.join(__dirname, '../node_modules/.bin/metalsoy'), [
		'--soyDeps',
		generateSoyDependencies(dependencies)
	]);
}

function runBundler() {
	spawn.sync(
		path.join(__dirname, '../node_modules/.bin/liferay-npm-bundler'),
		[],
		{cwd: CWD, stdio: 'inherit'}
	);
}

function runBridge() {
	spawnProcessSync(
		path.join(
			__dirname,
			'../node_modules/.bin/liferay-npm-bridge-generator'
		)
	);
}

function cleanSoy() {
	spawnProcessSync(path.join(__dirname, '../node_modules/.bin/rimraf'), [
		'src/**/*.soy.js'
	]);
}

module.exports = function(flags, config) {
	const useBundler = fs.existsSync(path.join(CWD, '.npmbundlerrc'));
	const useBridge = fs.existsSync(path.join(CWD, '.npmbridgerc'));
	const useSoy = flags.soy;

	if (useSoy) {
		buildSoy(config.dependencies);
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

	rimraf.sync(TEMP_PATH);
};
