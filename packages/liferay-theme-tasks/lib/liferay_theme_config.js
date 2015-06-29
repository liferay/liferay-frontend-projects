'use strict';

var _ = require('lodash');
var async = require('async');
var fs = require('fs-extra');
var path = require('path');

var cwd = process.cwd();

var PATH_PACKAGE_JSON = path.resolve(cwd, 'package.json');

function writePackageJSON(json) {
	fs.writeFileSync(PATH_PACKAGE_JSON, JSON.stringify(json, null, '\t'));
}

module.exports.getConfig = function(all) {
	var packageJSON = require(PATH_PACKAGE_JSON);

	return all ? packageJSON : packageJSON.liferayTheme;
}

module.exports.removeDependencies = function(dependencies) {
	var packageJSON = require(PATH_PACKAGE_JSON);

	_.forEach(packageJSON.dependencies, function(item, index) {
		if (dependencies.indexOf(index) > -1) {
			packageJSON.dependencies[index] = undefined;
		}
	});

	writePackageJSON(packageJSON);
}

module.exports.setConfig = function(data, npmDependencies) {
	var packageJSON = require(PATH_PACKAGE_JSON);

	var config = {};

	config[npmDependencies ? 'dependencies' : 'liferayTheme'] = data;

	if (data.themeletDependencies && packageJSON.liferayTheme) {
		packageJSON.liferayTheme.themeletDependencies = undefined;
	}

	packageJSON = _.merge(packageJSON, config);

	writePackageJSON(packageJSON);
};
