'use strict';

var _ = require('lodash');
var fs = require('fs-extra');
var path = require('path');

function deleteDependencies(sourceDependencies, deletedDependencies) {
	_.forEach(sourceDependencies, function(item, index) {
		if (deletedDependencies.indexOf(index) > -1) {
			delete sourceDependencies[index];
		}
	});
}

function getPackageJSON(alternatePath) {
	alternatePath = alternatePath || process.cwd();

	var packageJSONContent = fs.readFileSync(path.join(alternatePath, 'package.json'), {
		encoding: 'utf8'
	});

	return JSON.parse(packageJSONContent);
}

function writePackageJSON(json) {
	fs.writeFileSync(path.join(process.cwd(), 'package.json'), JSON.stringify(json, null, '\t'));
}

module.exports.getConfig = function(all, alternatePath) {
	var packageJSON = getPackageJSON(alternatePath);

	return all ? packageJSON : packageJSON.liferayTheme;
};

module.exports.removeDependencies = function(dependencies) {
	var packageJSON = getPackageJSON();

	deleteDependencies(packageJSON.dependencies, dependencies);
	deleteDependencies(packageJSON.devDependencies, dependencies);

	writePackageJSON(packageJSON);
};

module.exports.setConfig = function(config) {
	var packageJSON = getPackageJSON();

	if (config.themeletDependencies && packageJSON.liferayTheme) {
		packageJSON.liferayTheme.themeletDependencies = undefined;
	}

	packageJSON = _.merge(packageJSON, {
		liferayTheme: config
	});

	writePackageJSON(packageJSON);
};

module.exports.setDependencies = function(dependencies, devDependencies) {
	var packageJSON = getPackageJSON();

	var selector = devDependencies ? 'devDependencies' : 'dependencies';

	if (!packageJSON[selector]) {
		packageJSON[selector] = {};
	}

	_.merge(packageJSON[selector], dependencies);

	writePackageJSON(packageJSON);
};
