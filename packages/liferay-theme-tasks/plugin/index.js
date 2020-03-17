/**
 * SPDX-FileCopyrightText: © 2017 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: MIT
 */

'use strict';

const fs = require('fs');
const _ = require('lodash');
const path = require('path');

const project = require('../lib/project');
const {getArgv} = require('../lib/util');
const RegisterHooks = require('./lib/register_hooks');
const registerTaskDeploy = require('./tasks/deploy');
const registerTaskInit = require('./tasks/init');
const registerTaskVersion = require('./tasks/version');
const registerTaskWar = require('./tasks/war');

const CWD = process.cwd();

function processOptions(options) {
	var argv = getArgv();

	var distName = path.basename(CWD);

	var pkg;

	try {
		pkg = JSON.parse(
			fs.readFileSync(path.join(CWD, 'package.json'), 'utf8')
		);

		distName = pkg.name;
	} catch (e) {
		// Swallow.
	}

	distName = options.distName || distName;

	if (/\${/.test(distName) && pkg) {
		var distNameTemplate = _.template(distName);

		distName = distNameTemplate(pkg);
	}

	options.argv = argv;
	options.distName = distName;
	options.pathDist = options.pathDist || 'dist';
	options.rootDir = options.rootDir || 'docroot';
	options.storeConfig = {
		path: 'liferay-plugin.json',
		...options.storeConfig,
	};

	return options;
}

function registerTasks(options) {
	options = processOptions(options);

	project.options.init(options);
	project.gulp.init(options.gulp);
	project.store.open(path.join(CWD, options.storeConfig.path));

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
