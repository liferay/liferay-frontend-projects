'use strict';

let _ = require('lodash');
let fs = require('fs-extra');
let path = require('path');

function deleteDependencies(sourceDependencies, deletedDependencies) {
	_.forEach(sourceDependencies, function(item, index) {
		if (deletedDependencies.indexOf(index) > -1) {
			delete sourceDependencies[index];
		}
	});
}

function getPackageJSON(alternatePath) {
	alternatePath = alternatePath || process.cwd();

	let packageJSONContent = fs.readFileSync(
		path.join(alternatePath, 'package.json'),
		{
			encoding: 'utf8',
		}
	);

	return JSON.parse(packageJSONContent);
}

function writePackageJSON(json) {
	fs.writeFileSync(
		path.join(process.cwd(), 'package.json'),
		JSON.stringify(json, null, '\t')
	);
}

module.exports.getConfig = function(all, alternatePath) {
	let packageJSON = getPackageJSON(alternatePath);

	return all ? packageJSON : packageJSON.liferayTheme;
};

module.exports.removeConfig = function(settings) {
	let packageJSON = getPackageJSON();

	packageJSON.liferayTheme = _.omit(packageJSON.liferayTheme, settings);

	writePackageJSON(packageJSON);
};

module.exports.removeDependencies = function(dependencies) {
	let packageJSON = getPackageJSON();

	deleteDependencies(packageJSON.dependencies, dependencies);
	deleteDependencies(packageJSON.devDependencies, dependencies);

	writePackageJSON(packageJSON);
};

module.exports.setConfig = function(config) {
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
};

module.exports.setDependencies = function(dependencies, devDependencies) {
	let packageJSON = getPackageJSON();

	let selector = devDependencies ? 'devDependencies' : 'dependencies';

	if (!packageJSON[selector]) {
		packageJSON[selector] = {};
	}

	_.merge(packageJSON[selector], dependencies);

	writePackageJSON(packageJSON);
};
