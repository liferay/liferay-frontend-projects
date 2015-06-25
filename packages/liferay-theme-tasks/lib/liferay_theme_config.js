'use strict';

var _ = require('lodash');
var async = require('async');
var fs = require('fs-extra');
var path = require('path');

var cwd = process.cwd();

var PATH_PACKAGE_JSON = path.resolve(cwd, 'package.json');

module.exports.getConfig = function() {
	var packageJSON = require(PATH_PACKAGE_JSON);

	return packageJSON.liferayTheme;
}

module.exports.setConfig = function(data, npmDependencies) {
	var packageJSON = require(PATH_PACKAGE_JSON);

	var config = {};

	config[npmDependencies ? 'dependencies' : 'liferayTheme'] = data;

	if (data.themeletDependencies && packageJSON.liferayTheme) {
		packageJSON.liferayTheme.themeletDependencies = undefined;
	}

	packageJSON = _.merge(packageJSON, config);

	fs.writeFileSync(PATH_PACKAGE_JSON, JSON.stringify(packageJSON, null, '\t'));
};
