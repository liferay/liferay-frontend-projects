var _ = require('lodash');
var async = require('async');
var fs = require('fs-extra');
var path = require('path');

var cwd = process.cwd();

var PATH_PACKAGE_JSON = path.resolve(cwd, 'package.json');

module.exports = function(data) {
	var packageJSON = require(PATH_PACKAGE_JSON);

	packageJSON = _.merge(packageJSON, data);

	fs.writeFileSync(PATH_PACKAGE_JSON, JSON.stringify(packageJSON, null, '\t'));
};