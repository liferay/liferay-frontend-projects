'use strict';

var _ = require('lodash');
var async = require('async');
var gutil = require('gulp-util');

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
	_addToSequence: function(sequence, fn) {
		if (_.isFunction(fn)) {
			sequence.push(function(cb) {
				if (fn.length) {
					fn(cb);
				}
				else {
					var stream = fn();

					if (stream && stream.on) {
						stream.on('end', cb);
					}
					else {
						cb();
					}
				}
			});
		}
	},

	_applyHooks: function() {
		var instance = this;

		var taskHookMap = this._getTaskHookMap();

		var gulp = this.gulp;

		var tasks = gulp.tasks;

		_.forEach(taskHookMap, function(hooks, taskName) {
			if (!tasks[taskName]) {
				return;
			}

			var task = tasks[taskName];

			var sequence = instance._createTaskSequence(task.fn, hooks);

			gulp.task(taskName, task.dep, function(cb) {
				async.series(sequence, cb);
			});
		});
	},

	_createTaskSequence: function(fn, hooks) {
		var instance = this;

		var sequence = [];

		_.forEach(hooks.before, function(hookFn, index) {
			instance._addToSequence(sequence, hookFn);
		});

		this._addToSequence(sequence, fn);

		_.forEach(hooks.after, function(hookFn, index) {
			instance._addToSequence(sequence, hookFn);
		});

		return sequence;
	},

	_getTaskHookMap: function() {
		var instance = this;

		var hooks = this.hooks;

		return _.reduce(hooks, function(taskHookMap, hook, name) {
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
		}, {});
	},

	_getTaskName: function(hookName) {
		var data = hookName.split(/:(.+)?/);

		return data;
	},

	_logHookRegister: function(name, fn) {
		if (_.isFunction(fn)) {
			gutil.log('Successfully registered', chalk.cyan(name), 'hook.');
		}
	},

	_registerHookFn: function() {
		if (_.isFunction(this.hookFn)) {
			this.hookFn(this.gulp, this.options);
		}
		else if (this.hookFn) {
			gutil.log(chalk.red('hookFn must be a function.'));
		}
	},

	_registerHookModule: function(moduleName) {
		try {
			var hookFn = require(moduleName);

			if (_.isFunction(hookFn)) {
				hookFn(this.gulp, this.options);
			}
			else {
				gutil.log(chalk.red(moduleName, 'does not return a function. All hook modules must return a function.'));
			}
		}
		catch (e) {
			gutil.log('There was an issue registering', moduleName);
		}
	},

	_registerHookModules: function() {
		var instance = this;

		var hookModules = this.hookModules;

		if (hookModules) {
			if (!_.isArray(hookModules)) {
				hookModules = [hookModules];
			}

			_.forEach(hookModules, this._registerHookModule.bind(this));
		}
	},

	_registerHooks: function() {
		var instance = this;

		var gulp = this.gulp;

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
	}
};

module.exports = RegisterHooks;
