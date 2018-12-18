const CWD = process.cwd();

const fs = require('fs');
const path = require('path');
const rimraf = require('rimraf');
const sortKeys = require('sort-keys');
const which = require('npm-which')(CWD);

const generateSoyDependencies = require('../utils/generate-soy-dependencies');
const getMergedConfig = require('../utils/get-merged-config');
const spawnSync = require('../utils/spawnSync');

const BABEL_CONFIG = getMergedConfig('babel');
const NPM_SCRIPTS_CONFIG = getMergedConfig('npmscripts');
const BUNDLER_CONFIG = getMergedConfig('bundler');

const projectPackage = require(path.join(CWD, 'package.json'));
const scriptsDependencies = require(path.join(__dirname, '../../package.json'))
	.dependencies;

/**
 * Helper for generating the npm `build` script
 * @param {Object} flags Flags included via CLI
 * @returns {string}
 */
function generateBuildScript(flags) {
	let retStr = '';

	if (flags.soy) {
		retStr += `metalsoy --soyDeps \"${generateSoyDependencies(
			NPM_SCRIPTS_CONFIG.build.dependencies
		)}\" && `;
	}

	retStr += `cross-env NODE_ENV=production babel --source-maps -d ${
		NPM_SCRIPTS_CONFIG.build.output
	} ${NPM_SCRIPTS_CONFIG.build.input}`;

	if (flags.bundler) {
		retStr += ' && liferay-npm-bundler';
	}

	if (flags.soy) {
		retStr += '&& npm run cleanSoy';
	}

	return retStr;
}

/**
 * Main function for ejecting configuration to package.json and configuration
 */
module.exports = function() {
	const flags = projectPackage.scripts.build
		.match(/(?<=--)(?:\w+)/g)
		.reduce((prev, cur) => ({...prev, [cur]: true}), {});

	// Write config for babel
	if (!projectPackage.babel) {
		fs.writeFileSync(
			path.join(CWD, '.babelrc'),
			JSON.stringify(BABEL_CONFIG, null, '\t')
		);
	} else {
		projectPackage.babel = BABEL_CONFIG;
	}

	// Write config file for bundler
	if (flags.bundler) {
		fs.writeFileSync(
			path.join(CWD, '.npmbundlerrc'),
			JSON.stringify(BUNDLER_CONFIG, null, '\t')
		);
	}

	// Set initial npm scripts
	projectPackage.scripts = {
		build: generateBuildScript(flags),
		format: `csf ${NPM_SCRIPTS_CONFIG.format.join(' ')} --inline-edit`,
		lint: `csf ${NPM_SCRIPTS_CONFIG.lint.join(' ')}`
	};

	// Set initial devDependencies for package.json
	const newDevDependencies = {
		'babel-cli': scriptsDependencies['babel-cli'],
		'babel-preset-env': scriptsDependencies['babel-preset-env'],
		'cross-env': scriptsDependencies['cross-env'],
		'check-source-formatting':
			scriptsDependencies['check-source-formatting']
	};

	// Additional if --soy flag is included
	if (flags.soy) {
		newDevDependencies['metal-tools-soy'] =
			scriptsDependencies['metal-tools-soy'];
		newDevDependencies['rimraf'] = scriptsDependencies['rimraf'];

		projectPackage.scripts.cleanSoy = 'rimraf src/**/*.soy.js';
	}

	// Additional if --bundler flag is included
	if (flags.bundler) {
		newDevDependencies['liferay-npm-bundler'] =
			scriptsDependencies['liferay-npm-bundler'];
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
