const path = require('path');
const {spawn} = require('child_process');

const CWD = process.cwd();

const DEFAULT_INPUT = 'src/main/resources/META-INF/resources';
const DEFAULT_OUTPUT = 'classes/META-INF/resources';

function spawnProcess(binLocation, args) {
	const spawnedProcess = spawn(binLocation, args);

	spawnedProcess.stdout.on('data', function(data) {
		process.stdout.write(data);
	});

	spawnedProcess.stderr.on('data', function(data) {
		process.stdout.write(data);
	});
}

function compileBabel() {
	spawnProcess(path.join(__dirname, '../node_modules/.bin/babel'), [
		DEFAULT_INPUT,
		'--source-maps',
		'--out-dir',
		DEFAULT_OUTPUT
	]);
}

function buildSoy() {
	spawnProcess(path.join(__dirname, '../node_modules/.bin/metalsoy'), [
		'--soyDeps',
		generateSoyDependencies()
	]);
}

function runBundler() {
	spawnProcess(
		path.join(__dirname, '../node_modules/.bin/liferay-npm-bundler')
	);
}

function runBridge() {
	spawnProcess(
		path.join(
			__dirname,
			'../node_modules/.bin/liferay-npm-bridge-generator'
		)
	);
}

function cleanSoy() {
	spawnProcess(
		path.join(__dirname, '../node_modules/.bin/rifraf', ['src/**/*.soy.js'])
	);
}

module.exports = function(flags) {
	const isSoy = flags.soy;

	if (soy) {
		buildSoy();
	}

	compileBabel();
	runBundler();

	if (bridge) {
		runBridge();
	}

	if (soy) {
		cleanSoy();
	}
};
