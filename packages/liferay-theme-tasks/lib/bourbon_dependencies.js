'use strict';

var bourbon = require('node-bourbon');
var fs = require('fs-extra');
var path = require('path');
var themeUtil = require('./util');
var versionMap = require('./version_map');

var formatPath = function(filePath) {
	return filePath.replace(/\\/g, '/');
};

exports.createBourbonFile = function(forceCreation) {
	var bourbonPath = bourbon.includePaths[0];

	var tmpDirPath = path.join(__dirname, '../tmp');

	if (!fs.existsSync(tmpDirPath)) {
		fs.mkdirSync(tmpDirPath);
	}

	var bourbonFilePath = path.join(__dirname, '../tmp/_bourbon.scss');

	var bourbonFile = [];

	var deprecatedMixinsFilePath = path.join(__dirname, '../tmp/_deprecated.scss');

	if (fs.existsSync(deprecatedMixinsFilePath)) {
		bourbonFile.push('@import "');
		bourbonFile.push(formatPath(deprecatedMixinsFilePath));
		bourbonFile.push('";');
	}

	var mixinsPath = themeUtil.resolveDependency(versionMap.getDependencyName('mixins'), '7.0');

	bourbonFile.push('@import "');
	bourbonFile.push(formatPath(path.join(bourbonPath, 'bourbon')));
	bourbonFile.push('";');
	bourbonFile.push('@import "');
	bourbonFile.push(formatPath(path.join(mixinsPath, 'liferay/_bourbon_ext.scss')));
	bourbonFile.push('";');

	fs.writeFileSync(bourbonFilePath, bourbonFile.join(''));

	return tmpDirPath;
};
