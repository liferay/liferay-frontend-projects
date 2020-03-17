/**
 * SPDX-FileCopyrightText: © 2017 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: MIT
 */

'use strict';

const fs = require('fs-extra');
const bourbon = require('node-bourbon');
const os = require('os');
const path = require('path');

const project = require('../../lib/project');
const themeUtil = require('../../lib/util');

const formatPath = function(filePath) {
	return filePath.replace(/\\/g, '/');
};

exports.createBourbonFile = function() {
	const {pathSrc} = project.options;

	const bourbonPath = bourbon.includePaths[0];

	const tmpDirPath = path.join(os.tmpdir(), 'tmp');

	if (!fs.existsSync(tmpDirPath)) {
		fs.mkdirSync(tmpDirPath);
	}

	const bourbonFilePath = path.join(tmpDirPath, '_bourbon.scss');

	const bourbonFile = [];

	const deprecatedMixinsFilePath = path.join(
		project.dir,
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
