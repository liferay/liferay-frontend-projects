/**
 * © 2017 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: MIT
 */

const _ = require('lodash');
const fs = require('fs-extra');
const path = require('path');

function getConfig(all) {
	const packageJSON = getPackageJSON();

	return all ? packageJSON : packageJSON.liferayTheme;
}

function removeConfig(settings) {
	const packageJSON = getPackageJSON();

	packageJSON.liferayTheme = _.omit(packageJSON.liferayTheme, settings);

	writePackageJSON(packageJSON);
}

function removeDependencies(dependencies) {
	const packageJSON = getPackageJSON();

	deleteDependencies(packageJSON.dependencies, dependencies);
	deleteDependencies(packageJSON.devDependencies, dependencies);

	writePackageJSON(packageJSON);
}

function setConfig(config) {
	let packageJSON = getPackageJSON();

	if (packageJSON.liferayTheme) {
		if (config.baseTheme) {
			packageJSON.liferayTheme.baseTheme = undefined;
		}

		if (config.themeletDependencies) {
			packageJSON.liferayTheme.themeletDependencies = undefined;
		}
	}

	packageJSON = _.merge(packageJSON, {
		liferayTheme: config,
	});

	writePackageJSON(packageJSON);
}

function setDependencies(dependencies, devDependencies) {
	const packageJSON = getPackageJSON();

	const selector = devDependencies ? 'devDependencies' : 'dependencies';

	if (!packageJSON[selector]) {
		packageJSON[selector] = {};
	}

	_.merge(packageJSON[selector], dependencies);

	writePackageJSON(packageJSON);
}

module.exports = {
	getConfig,
	removeConfig,
	removeDependencies,
	setConfig,
	setDependencies,
};

function deleteDependencies(sourceDependencies, deletedDependencies) {
	_.forEach(sourceDependencies, function(item, index) {
		if (deletedDependencies.indexOf(index) > -1) {
			delete sourceDependencies[index];
		}
	});
}

function getPackageJSON() {
	return require(path.resolve('package.json'));
}

function writePackageJSON(json) {
	fs.writeFileSync('package.json', JSON.stringify(json, null, '\t'));
}
