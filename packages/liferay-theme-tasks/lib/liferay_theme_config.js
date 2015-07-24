'use strict';

var _ = require('lodash');
var fs = require('fs-extra');
var path = require('path');

function getPackageJSON() {
	var packageJSONContent = fs.readFileSync(path.join(process.cwd(), 'package.json'), {
		encoding: 'utf8'
	});

	return JSON.parse(packageJSONContent);
}

function writePackageJSON(json) {
	fs.writeFileSync(path.join(process.cwd(), 'package.json'), JSON.stringify(json, null, '\t'));
}

module.exports.getConfig = function(all) {
	var packageJSON = getPackageJSON();

	return all ? packageJSON : packageJSON.liferayTheme;
};

module.exports.removeDependencies = function(dependencies) {
	var packageJSON = getPackageJSON();

	_.forEach(packageJSON.dependencies, function(item, index) {
		if (dependencies.indexOf(index) > -1) {
			delete packageJSON.dependencies[index];
		}
	});

	writePackageJSON(packageJSON);
};

module.exports.setConfig = function(data, npmDependencies) {
	var packageJSON = getPackageJSON();

	var config = {};

	config[npmDependencies ? 'dependencies' : 'liferayTheme'] = data;

	if (data.themeletDependencies && packageJSON.liferayTheme) {
		packageJSON.liferayTheme.themeletDependencies = undefined;
	}

	packageJSON = _.merge(packageJSON, config);

	writePackageJSON(packageJSON);
};
