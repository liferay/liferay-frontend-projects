'use strict';

var _ = require('lodash');
var async = require('async');
var chai = require('chai');
var EventEmitter = require('events').EventEmitter;
var gulp = require('gulp');
var gutil = require('gulp-util');
var path = require('path');
var RegisterHooks = require('../../lib/register_hooks');
var sinon = require('sinon');

var assert = chai.assert;

var STR_NOT_A_FUNCTION = 'not a function';

describe('RegisterHooks', function() {
	var prototype;

	beforeEach(function() {
		prototype = _.create(RegisterHooks.prototype);
	});

	describe('_addToSequence', function() {
		it('should add function to sequence differently based on if cb is expected or stream is returned', function(done) {
			var sequence = [];

			var spy = sinon.spy();

			prototype._addToSequence(sequence, function(cb) {
				spy();

				cb();
			});

			prototype._addToSequence(sequence, function() {
				var eventEmitter = new EventEmitter();

				setTimeout(function() {
					spy();

					eventEmitter.emit('end');
				}, 200);

				return eventEmitter;
			});

			prototype._addToSequence(sequence, STR_NOT_A_FUNCTION);

			assert.equal(sequence.length, 2);

			async.series(sequence, function() {
				assert.equal(spy.callCount, 2);

				done();
			});
		});
	});

	describe('_logHookRegister', function() {
		it('should log message only if fn is a function', function(done) {
			gutil.log = sinon.spy();

			prototype._logHookRegister('test', _.noop);
			prototype._logHookRegister('test', STR_NOT_A_FUNCTION);

			assert.equal(gutil.log.callCount, 1);

			done();
		});
	});

	describe('_overwriteGulpTask', function() {
		it('should fallback to original gulp.task if hooks are not present', function(done) {
			prototype.gulp = {
				tasks: {}
			};
			prototype.hooks = {};

			var gulpTaskSpy = sinon.spy();

			var gulpTask = function(name, deps, fn) {
				fn = fn || deps;

				prototype.gulp.tasks[name] = fn;

				gulpTaskSpy.apply(this, arguments);
			};

			prototype.gulp.task = gulpTask;

			prototype._overwriteGulpTask();

			var task1Spy = sinon.spy();

			prototype.gulp.task('task1', task1Spy);

			assert.equal(gulpTaskSpy.callCount, 1);
			assert(gulpTaskSpy.calledWith('task1', task1Spy), 'original task1Spy was used rather than series since no hooks were registered');

			prototype.gulp.tasks['task1']();

			assert.equal(task1Spy.callCount, 1);

			done();
		});

		it('should create async.series for every task with registered hooks', function(done) {
			prototype.gulp = gulp;

			var runSequence = require('run-sequence').use(gulp);

			var hookSpy = sinon.spy();

			prototype.hooks = {
				'after:task1': function(cb) {
					hookSpy('after:task1');

					cb();
				},
				'before:task3': function(cb) {
					hookSpy('before:task3');

					cb();
				}
			};

			prototype._overwriteGulpTask();

			prototype.gulp.task('task1', function(cb) {
				hookSpy('task1');

				cb();
			});

			prototype.gulp.task('task2', function(cb) {
				hookSpy('task2');

				cb();
			});

			prototype.gulp.task('task3', function(cb) {
				hookSpy('task3');

				cb();
			});

			runSequence('task1', 'task2', 'task3', function() {
				assert(hookSpy.getCall(0).calledWith('task1'));
				assert(hookSpy.getCall(1).calledWith('after:task1'));
				assert(hookSpy.getCall(2).calledWith('task2'));
				assert(hookSpy.getCall(3).calledWith('before:task3'));
				assert(hookSpy.getCall(4).calledWith('task3'));

				assert.equal(hookSpy.callCount, 5);

				done();
			});
		});
	});

	describe('_registerHookFn', function() {
		it('should register hookFn if it is a function and log message if defined as anything else', function(done) {
			gutil.log = sinon.spy();

			prototype._registerHookFn();

			assert.equal(gutil.log.callCount, 0);

			prototype.hookFn = STR_NOT_A_FUNCTION;

			prototype._registerHookFn();

			assert.equal(gutil.log.callCount, 1);

			prototype.gulp = 'gulp';
			prototype.hookFn = sinon.spy();

			prototype._registerHookFn();

			assert.equal(gutil.log.callCount, 1);
			assert(prototype.hookFn.calledWith('gulp'));

			done();
		});
	});

	describe('_registerHookModule', function() {
		it('should register hook or log appropriate log messages', function(done) {
			gutil.log = sinon.spy();

			prototype._registerHookModule('non-existent-module');

			assert(gutil.log.calledWithMatch('There was an issue registering'));
			assert.equal(gutil.log.callCount, 1);

			var moduleHook = require(path.join(__dirname, '../fixtures/hook_modules/hook-module-1'));

			prototype.gulp = {
				hook: sinon.spy()
			};

			prototype._registerHookModule(path.join(__dirname, '../fixtures/hook_modules/hook-module-1'));

			assert(prototype.gulp.hook.calledWith('before:build'));
			assert.equal(prototype.gulp.hook.callCount, 1);

			gutil.log = sinon.spy();

			prototype._registerHookModule(path.join(__dirname, '../fixtures/hook_modules/hook-module-3'));

			assert(gutil.log.calledWithMatch('does not return a function. All hook modules must return a function.'));
			assert.equal(gutil.log.callCount, 1);

			done();
		});
	});

	describe('_registerHookModules', function() {
		it('should accept single or multiple hook modules and register them', function(done) {
			var hookModule1Path = path.join(__dirname, '../fixtures/hook_modules/hook-module-1');
			var hookModule2Path = path.join(__dirname, '../fixtures/hook_modules/hook-module-2');
			var hookModule3Path = path.join(__dirname, '../fixtures/hook_modules/hook-module-3');

			prototype._registerHookModule = sinon.spy();
			prototype.hookModules = hookModule1Path;

			prototype._registerHookModules();

			assert(prototype._registerHookModule.calledWithMatch(hookModule1Path));
			assert.equal(prototype._registerHookModule.callCount, 1);

			prototype._registerHookModule = sinon.spy();
			prototype.hookModules = [hookModule1Path, hookModule2Path, hookModule3Path];

			prototype._registerHookModules();

			assert(prototype._registerHookModule.getCall(0).calledWith(hookModule1Path), 'called with module 1 path');
			assert(prototype._registerHookModule.getCall(1).calledWith(hookModule2Path), 'called with module 2 path');
			assert(prototype._registerHookModule.getCall(2).calledWith(hookModule3Path), 'called with module 3 path');
			assert.equal(prototype._registerHookModule.callCount, 3);

			done();
		});
	});

	describe('_registerHooks', function() {
		it('should create gulp.hook function that adds hook to hooks object', function(done) {
			prototype.gulp = {};
			prototype._registerHooks();

			assert(_.isFunction(prototype.gulp.hook))

			prototype.hooks = {};

			prototype.gulp.hook('hook1', _.noop);
			prototype.gulp.hook('hook2', _.noop);

			assert.equal(prototype.hooks.hook1, _.noop);
			assert.equal(prototype.hooks.hook2, _.noop);

			done();
		});
	});
});
