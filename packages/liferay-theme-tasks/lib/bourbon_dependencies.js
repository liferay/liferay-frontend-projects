'use strict';

let bourbon = require('node-bourbon');
let fs = require('fs-extra');
let path = require('path');

let themeUtil = require('./util');

let divert = require('./divert');

let formatPath = function(filePath) {
	return filePath.replace(/\\/g, '/');
};

exports.createBourbonFile = function() {
	let options = require('./options')();

	let pathSrc = options.pathSrc;

	let bourbonPath = bourbon.includePaths[0];

	let tmpDirPath = path.join(__dirname, '../tmp');

	if (!fs.existsSync(tmpDirPath)) {
		fs.mkdirSync(tmpDirPath);
	}

	let bourbonFilePath = path.join(__dirname, '../tmp/_bourbon.scss');

	let bourbonFile = [];

	let deprecatedMixinsFilePath = path.join(
		process.cwd(),
		pathSrc,
		'css',
		'_deprecated_mixins.scss'
	);

	if (fs.existsSync(deprecatedMixinsFilePath)) {
		bourbonFile.push('@import "');
		bourbonFile.push(formatPath(deprecatedMixinsFilePath));
		bourbonFile.push('";');
	}

	let mixinsPath = themeUtil.resolveDependency(
		divert('dependencies').getDependencyName('mixins'),
		'7.0'
	);

	bourbonFile.push('@import "');
	bourbonFile.push(formatPath(path.join(bourbonPath, 'bourbon')));
	bourbonFile.push('";');
	bourbonFile.push('@import "');
	bourbonFile.push(
		formatPath(path.join(mixinsPath, 'liferay/_bourbon_ext.scss'))
	);
	bourbonFile.push('";');

	fs.writeFileSync(bourbonFilePath, bourbonFile.join(''));

	return tmpDirPath;
};
