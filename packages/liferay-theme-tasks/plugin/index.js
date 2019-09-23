/**
 * © 2017 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: MIT
 */

'use strict';

var help = require('gulp-help');
var storage = require('gulp-storage');
var _ = require('lodash');
var path = require('path');

var RegisterHooks = require('./lib/register_hooks');

var CWD = process.cwd();

module.exports.registerTasks = function(options) {
	options = require('./lib/options')(options);

	var gulp = options.gulp;

	gulp = help(options.gulp);

	storage(gulp);

	var store = gulp.storage;

	store.create(
		options.storeConfig.name,
		path.join(CWD, options.storeConfig.path)
	);

	var tasks = require('./tasks/index');

	_.forEach(tasks, task => {
		task(options);
	});

	if (options.extensions) {
		if (!_.isArray(options.extensions)) {
			options.extensions = [options.extensions];
		}

		_.forEach(options.extensions, extension => {
			extension(options);
		});
	}

	RegisterHooks.hook(gulp, {
		hookFn: options.hookFn,
		hookModules: options.hookModules,
		options,
	});
};
