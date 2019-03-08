const _ = require('lodash');
const colors = require('ansi-colors');
const log = require('fancy-log');

const lfrThemeConfig = require('./liferay_theme_config');
const lookup = require('./lookup');

// This array contains all theme versions supported for non-upgrade tasks
const supportedThemeVersions = ['7.0', '7.1', '7.2'];

// This array contains all theme versions supported for upgrade tasks
const supportedUpgradeVersions = ['7.0'];

function doctor({
	themeConfig = null,
	haltOnMissingDeps = false,
	tasks = [],
} = {}) {
	themeConfig = themeConfig || lfrThemeConfig.getConfig(true);

	if (!themeConfig) {
		return;
	}

	const liferayVersion = themeConfig.liferayTheme.version;

	assertTasksSupported(themeConfig.liferayTheme.version, tasks);

	let dependencies = themeConfig.dependencies || {};

	if (!_.isEmpty(themeConfig.devDependencies)) {
		dependencies = _.defaults(dependencies, themeConfig.devDependencies);
	}

	if (!_.isUndefined(themeConfig.liferayTheme.supportCompass)) {
		lfrThemeConfig.removeConfig(['supportCompass']);
	}

	const missingDeps = getMissingDeps(liferayVersion, dependencies);
	if (missingDeps.length) {
		logMissingDeps(missingDeps);
	}

	checkDependencySources(themeConfig.liferayTheme);

	if (haltOnMissingDeps) {
		haltTask(missingDeps);
	}
}

module.exports = {
	doctor,
};

/**
 * Check if a given array of tasks is supported for the current theme version.
 * @param {String} version the theme version
 * @param {Array} tasks the list of tasks requested through the CLI
 * @throws if any of the tasks is not supported in the given version
 */
function assertTasksSupported(version, tasks) {
	for (let i = 0; i < tasks.length; i++) {
		const task = tasks[i];

		switch (task) {
			case 'help':
			case 'init':
				break;

			case 'upgrade':
				if (supportedUpgradeVersions.indexOf(version) == -1) {
					throw new Error(
						`Task '${task}' is not supported for themes with ` +
							`version '${version}' in this version of ` +
							`'liferay-theme-tasks'`
					);
				}
				break;

			default:
				if (supportedThemeVersions.indexOf(version) == -1) {
					throw new Error(
						`Task '${task}' is not supported for themes with ` +
							`version '${version}' in this version of ` +
							`'liferay-theme-tasks'`
					);
				}
				break;
		}
	}
}

function checkDependencySources(liferayTheme) {
	const baseTheme = liferayTheme.baseTheme;
	const themeletDependencies = liferayTheme.themeletDependencies;

	const localDependencies = [];

	if (_.isObject(baseTheme) && baseTheme.path) {
		localDependencies.push(baseTheme);
	}

	if (themeletDependencies) {
		_.forEach(themeletDependencies, function(item) {
			if (item.path) {
				localDependencies.push(item);
			}
		});
	}

	if (localDependencies.length) {
		logLocalDependencies(localDependencies);
	}
}

function getMissingDeps(version, actualDependencies) {
	switch (version) {
		case '6.2':
		case '7.0':
		case '7.1': {
			// Only a loose check for these older versions, because the
			// only task you can do with them anyway is an upgrade from
			// 7.1 to 7.2.
			const name = `liferay-theme-deps-${version}`;
			if (actualDependencies.hasOwnProperty(name)) {
				return [];
			} else {
				return [[name, '*']];
			}
		}

		case '7.2': {
			const requiredDependencies = lookup('devDependencies', '7.2');
			return Object.keys(requiredDependencies)
				.map(name => {
					const requiredVersion = requiredDependencies[name];
					if (actualDependencies[name] !== requiredVersion) {
						return [name, requiredVersion];
					}
				})
				.filter(Boolean);
		}

		default:
			throw new Error(`Unrecognized version ${version}`);
	}
}

function haltTask(missingDeps) {
	const count = missingDeps.length;
	if (count > 0) {
		const dependencies = count === 1 ? 'dependency' : 'dependencies';
		throw new Error(`Missing ${count} theme ${dependencies}`);
	}
}

function logLocalDependencies(localDependencies) {
	const dependenciesString = _.map(localDependencies, function(item) {
		return item.name;
	}).join(', ');

	log(
		colors.yellow('Warning:'),
		'you have dependencies that are installed from local modules. These should only be used for development purposes. Do not publish this npm module with those dependencies!'
	);
	log(colors.yellow('Local module dependencies:'), dependenciesString);
}

function logMissingDeps(dependencies) {
	const dependenciesAndVersions = dependencies.map(([name, version]) => {
		return `${name}@${version}`;
	});
	log(
		colors.red('Warning:'),
		'You must install the correct dependencies, please run',
		colors.cyan('npm i --save-dev ' + dependenciesAndVersions.join(' ')),
		'from your theme directory.'
	);
}
