/**
 * © 2017 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: MIT
 */

'use strict';

const bourbon = require('node-bourbon');
const fs = require('fs-extra');
const path = require('path');

const themeUtil = require('./util');

const formatPath = function(filePath) {
	return filePath.replace(/\\/g, '/');
};

exports.createBourbonFile = function() {
	const options = require('./options')();

	const pathSrc = options.pathSrc;

	const bourbonPath = bourbon.includePaths[0];

	const tmpDirPath = path.join(__dirname, '../tmp');

	if (!fs.existsSync(tmpDirPath)) {
		fs.mkdirSync(tmpDirPath);
	}

	const bourbonFilePath = path.join(__dirname, '../tmp/_bourbon.scss');

	const bourbonFile = [];

	const deprecatedMixinsFilePath = path.join(
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

	const mixinsPath =
		themeUtil.getCustomDependencyPath('liferay-frontend-common-css') ||
		path.dirname(require.resolve('liferay-frontend-common-css'));

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
