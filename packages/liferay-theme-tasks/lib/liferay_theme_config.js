const _ = require('lodash');
const fs = require('fs-extra');
const path = require('path');

function getConfig(all, alternatePath) {
	let packageJSON = getPackageJSON(alternatePath);

	return all ? packageJSON : packageJSON.liferayTheme;
}

function removeConfig(settings) {
	let packageJSON = getPackageJSON();

	packageJSON.liferayTheme = _.omit(packageJSON.liferayTheme, settings);

	writePackageJSON(packageJSON);
}

function removeDependencies(dependencies) {
	let packageJSON = getPackageJSON();

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
	let packageJSON = getPackageJSON();

	let selector = devDependencies ? 'devDependencies' : 'dependencies';

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
