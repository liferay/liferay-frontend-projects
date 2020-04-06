/**
 * SPDX-FileCopyrightText: © 2017 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: MIT
 */

'use strict';

const _ = require('lodash');
const path = require('path');

const checkNodeVersion = require('../lib/checkNodeVersion');
const project = require('../lib/project');
const {getArgv} = require('../lib/util');
const RegisterHooks = require('./lib/register_hooks');
const registerTaskDeploy = require('./tasks/deploy');
const registerTaskInit = require('./tasks/init');
const registerTaskVersion = require('./tasks/version');
const registerTaskWar = require('./tasks/war');

checkNodeVersion();

function processOptions(options) {
	var argv = getArgv();

	var distName =
		options.distName || project.pkgJson.name || path.basename(project.dir);

	if (/\${/.test(distName) && project.pkgJson) {
		var distNameTemplate = _.template(distName);

		distName = distNameTemplate(project.pkgJson);
	}

	options.argv = argv;
	options.distName = distName;
	options.pathDist = options.pathDist || './dist';
	options.rootDir = options.rootDir || './docroot';
	options.storeConfig = {
		name: 'LiferayPlugin',
		path: 'liferay-plugin.json',
		...options.storeConfig,
	};

	return options;
}

function registerTasks(options = {}) {
	options = processOptions(options);

	project.init(options);

	registerTaskInit();
	registerTaskDeploy();
	registerTaskVersion();
	registerTaskWar();

	if (options.extensions) {
		if (!_.isArray(options.extensions)) {
			options.extensions = [options.extensions];
		}

		_.forEach(options.extensions, extension => {
			extension(options);
		});
	}

	RegisterHooks.hook(project.gulp, {
		hookFn: options.hookFn,
		hookModules: options.hookModules,
		options,
	});
}

module.exports = {
	registerTasks,
};
