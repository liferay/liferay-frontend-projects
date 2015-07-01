'use strict';

var _ = require('lodash');
var async = require('async');
var fs = require('fs-extra');
var path = require('path');

function writePackageJSON(json) {
	fs.writeFileSync(path.join(process.cwd(), 'package.json'), JSON.stringify(json, null, '\t'));
}

module.exports.getConfig = function(all) {
	var packageJSON = require(path.join(process.cwd(), 'package.json'));

	return all ? packageJSON : packageJSON.liferayTheme;
}

module.exports.removeDependencies = function(dependencies) {
	var packageJSON = require(path.join(process.cwd(), 'package.json'));

	_.forEach(packageJSON.dependencies, function(item, index) {
		if (dependencies.indexOf(index) > -1) {
			delete packageJSON.dependencies[index];
		}
	});

	writePackageJSON(packageJSON);
}

module.exports.setConfig = function(data, npmDependencies) {
	var packageJSON = require(path.join(process.cwd(), 'package.json'));

	var config = {};

	config[npmDependencies ? 'dependencies' : 'liferayTheme'] = data;

	if (data.themeletDependencies && packageJSON.liferayTheme) {
		packageJSON.liferayTheme.themeletDependencies = undefined;
	}

	packageJSON = _.merge(packageJSON, config);

	writePackageJSON(packageJSON);
};
