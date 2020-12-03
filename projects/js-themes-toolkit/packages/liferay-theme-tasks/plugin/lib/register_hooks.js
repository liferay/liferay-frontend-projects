/**
 * SPDX-FileCopyrightText: © 2017 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: MIT
 */

'use strict';

var gutil = require('gulp-util');
var _ = require('lodash');

var chalk = gutil.colors;

var RegisterHooks = function(gulp, config) {
	this.gulp = gulp;
	this.hookFn = config.hookFn;
	this.hookModules = config.hookModules;
	this.hooks = {};
	this.options = config.options;

	this._registerHooks();
};

RegisterHooks.hook = function(gulp, config) {
	return new RegisterHooks(gulp, config);
};

RegisterHooks.prototype = {
	_applyHooks() {
		var instance = this;

		var taskHookMap = this._getTaskHookMap();

		var gulp = this.gulp;

		var tasks = gulp.registry().tasks();

		_.forEach(taskHookMap, (hooks, taskName) => {
			if (!tasks[taskName]) {
				return;
			}

			var task = tasks[taskName];

			var sequence = instance._createGulpSeries(task, hooks);

			gulp.task(taskName, sequence);
		});
	},

	_createGulpSeries(fn, hooks) {
		const {gulp} = this;

		let before = hooks.before || [];

		if (!Array.isArray(before)) {
			before = [before];
		}

		let after = hooks.after || [];

		if (!Array.isArray(after)) {
			after = [after];
		}

		return gulp.series(...before, fn, ...after);
	},

	_getTaskHookMap() {
		var instance = this;

		var hooks = this.hooks;

		return _.reduce(
			hooks,
			(taskHookMap, hook, name) => {
				var data = instance._getTaskName(name);

				var when = data[0];
				var taskName = data[1];

				if (when != 'after' && when != 'before') {
					return taskHookMap;
				}

				if (!taskHookMap[taskName]) {
					taskHookMap[taskName] = {};
				}

				taskHookMap[taskName][when] = hook;

				return taskHookMap;
			},
			{}
		);
	},

	_getTaskName(hookName) {
		var data = hookName.split(/:(.+)?/);

		return data;
	},

	_logHookRegister(name, fn) {
		if (_.isFunction(fn)) {
			gutil.log('Successfully registered', chalk.cyan(name), 'hook.');
		}
	},

	_registerHookFn() {
		if (_.isFunction(this.hookFn)) {
			this.hookFn(this.gulp, this.options);
		} else if (this.hookFn) {
			gutil.log(chalk.red('hookFn must be a function.'));
		}
	},

	_registerHookModule(moduleName) {
		try {
			// eslint-disable-next-line liferay/no-dynamic-require
			var hookFn = require(moduleName);

			if (_.isFunction(hookFn)) {
				hookFn(this.gulp, this.options);
			} else {
				gutil.log(
					chalk.red(
						moduleName,
						'does not return a function. All hook modules must return a function.'
					)
				);
			}
		} catch (e) {
			gutil.log('There was an issue registering', moduleName);
		}
	},

	_registerHookModules() {
		var hookModules = this.hookModules;

		if (hookModules) {
			if (!_.isArray(hookModules)) {
				hookModules = [hookModules];
			}

			_.forEach(hookModules, this._registerHookModule.bind(this));
		}
	},

	_registerHooks() {
		var instance = this;

		this.gulp.hook = function(name, fn) {
			var hooks = instance.hooks;

			if (!hooks[name]) {
				hooks[name] = [];
			}

			hooks[name].push(fn);
		};

		this._registerHookModules();

		this._registerHookFn();

		this._applyHooks();
	},
};

module.exports = RegisterHooks;
