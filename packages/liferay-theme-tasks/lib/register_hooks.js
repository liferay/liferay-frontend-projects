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

	this._registerHooks();
};

RegisterHooks.hook = function(gulp, config) {
	return new RegisterHooks(gulp, config);
};

RegisterHooks.prototype = {
	_addToSequence: function(sequence, fn) {
		if (_.isFunction(fn)) {
			sequence.push(function(cb) {
				fn.length ? fn(cb) : fn().on('end', cb);
			});
		}
	},

	_logHookRegister: function(name, fn) {
		if (_.isFunction(fn)) {
			gutil.log('Successfully registered', chalk.cyan(name), 'hook.');
		}
	},

	_overwriteGulpTask: function() {
		var instance = this;

		var gulp = this.gulp;
		var hooks = this.hooks;

		var gulpTask = gulp.task;

		gulp.task = function(name, deps, fn) {
			var afterName = 'after:' + name;
			var beforeName = 'before:' + name;

			var afterHook = hooks[afterName];
			var beforeHook = hooks[beforeName];

			if (gulp.tasks[name]) {
				gutil.log('Using custom', chalk.cyan(name), 'task.');

				return;
			}

			if (!afterHook && !beforeHook) {
				gulpTask.apply(this, arguments);
			}
			else {
				if (!fn && _.isFunction(deps)) {
					fn = deps;
					deps = [];
				}

				instance._logHookRegister(afterName, afterHook);
				instance._logHookRegister(beforeName, beforeHook);

				gulpTask.call(this, name, deps, function(cb) {
					var sequence = [];

					instance._addToSequence(sequence, beforeHook);
					instance._addToSequence(sequence, fn);
					instance._addToSequence(sequence, afterHook);

					async.series(sequence, cb);
				});
			}
		};
	},

	_registerHookFn: function() {
		if (_.isFunction(this.hookFn)) {
			this.hookFn(this.gulp);
		}
		else if (this.hookFn) {
			gutil.log(chalk.red('hookFn must be a function.'));
		}
	},

	_registerHookModule: function(moduleName) {
		try {
			var hookFn = require(moduleName);

			if (_.isFunction(hookFn)) {
				hookFn(this.gulp);
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
			instance.hooks[name] = fn;
		};

		this._registerHookModules();

		this._registerHookFn();

		this._overwriteGulpTask();
	}
};

module.exports = RegisterHooks;
