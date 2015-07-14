'use strict';

var fs = require('fs-extra');
var path = require('path');

exports.createBourbonFile = function(bourbonPath) {
	var tmpDirPath = path.join(__dirname, '../tmp');

	if (!fs.existsSync(tmpDirPath)) {
		fs.mkdirSync(tmpDirPath);
	}

	var bourbonFilePath = path.join(__dirname, '../tmp/_bourbon.scss');

	if (!fs.existsSync(bourbonFilePath)) {
		var bourbonFile = ['@import "'];

		bourbonFile.push(path.join(bourbonPath, 'bourbon'));
		bourbonFile.push('";');
		bourbonFile.push('@import "');
		bourbonFile.push(path.join(__dirname, '../node_modules/liferay-theme-mixins/liferay/_bourbon_ext'));
		bourbonFile.push('";');

		var deprecatedMixinsFilePath = path.join(__dirname, '../tmp/_deprecated.scss');

		if (fs.existsSync(deprecatedMixinsFilePath)) {
			bourbonFile.push('@import "');
			bourbonFile.push(deprecatedMixinsFilePath);
			bourbonFile.push('";');
		}

		fs.writeFileSync(bourbonFilePath, bourbonFile.join(''));
	}

	return tmpDirPath;
};