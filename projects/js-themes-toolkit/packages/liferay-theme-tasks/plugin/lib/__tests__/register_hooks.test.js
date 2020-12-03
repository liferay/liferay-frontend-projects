/**
 * SPDX-FileCopyrightText: © 2017 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: MIT
 */

'use strict';

var {Gulp} = require('gulp');
var gutil = require('gulp-util');
var _ = require('lodash');
var path = require('path');
var sinon = require('sinon');

var RegisterHooks = require('../../lib/register_hooks');

var STR_NOT_A_FUNCTION = 'not a function';

var prototype;

beforeEach(() => {
	prototype = _.create(RegisterHooks.prototype);
});

test('_applyHooks should pass', done => {
	const gulp = new Gulp();

	prototype.gulp = gulp;

	// Prepare a function to trace task calls to the tasksTrace array
	const tasksTrace = [];
	const trace = (name, cb) => {
		tasksTrace.push(name);
		cb();
	};

	// Register tasks
	gulp.task('test2', cb => trace('test2', cb));
	gulp.task(
		'test',
		gulp.series(['test2'], cb => trace('test', cb))
	);

	// Register hooks
	prototype.hooks = {
		'after:test2': cb => trace('after:test2', cb),
		'after:test3': cb => trace('after:test3', cb),
		'before:test': cb => trace('before:test', cb),
		'invalid:test': cb => trace('invalid:test', cb),
	};

	gulp.task = sinon.spy();

	prototype._applyHooks();

	expect(gulp.task.calledTwice).toBe(true);

	const [taskName0, task0] = gulp.task.getCalls()[0].args;

	expect(taskName0).toBe('test2');

	const [taskName1, task1] = gulp.task.getCalls()[1].args;

	expect(taskName1).toBe('test');

	// Define a function to invoke gulp tasks
	const callTask = task =>
		new Promise(resolve => {
			tasksTrace.length = 0;

			task(() => resolve(tasksTrace));
		});

	// Call tasks and check their trace
	callTask(task0)
		.then(trace => expect(trace).toEqual(['test2', 'after:test2']))
		.then(() => callTask(task1))
		.then(trace => expect(trace).toEqual(['before:test', 'test2', 'test']))
		.then(() => done());
});

test('_getTaskHookMap should create valid taskHookMap', () => {
	prototype.hooks = {
		'after:build': _.noop,
		'before:deploy': _.noop,
		'somethingbuild:build': _.noop,
	};

	var taskHookMap = prototype._getTaskHookMap();

	expect(taskHookMap).toEqual({
		build: {
			after: _.noop,
		},
		deploy: {
			before: _.noop,
		},
	});
});

test('_getTaskName should split hook name into correct sections', () => {
	var array = prototype._getTaskName('after:build');

	expect(array[0]).toBe('after');
	expect(array[1]).toBe('build');

	array = prototype._getTaskName('after:build:src');

	expect(array[0]).toBe('after');
	expect(array[1]).toBe('build:src');

	array = prototype._getTaskName('something-else:build:base');

	expect(array[0]).toBe('something-else');
	expect(array[1]).toBe('build:base');
});

test('_logHookRegister should log message only if fn is a function', () => {
	gutil.log = sinon.spy();

	prototype._logHookRegister('test', _.noop);
	prototype._logHookRegister('test', STR_NOT_A_FUNCTION);

	expect(gutil.log.callCount).toBe(1);
});

test('_registerHookFn should register hookFn if it is a function and log message if defined as anything else', () => {
	gutil.log = sinon.spy();

	prototype._registerHookFn();

	expect(gutil.log.callCount).toBe(0);

	prototype.hookFn = STR_NOT_A_FUNCTION;

	prototype._registerHookFn();

	expect(gutil.log.callCount).toBe(1);

	prototype.gulp = 'gulp';
	prototype.hookFn = sinon.spy();
	prototype.options = 'options';

	prototype._registerHookFn();

	expect(gutil.log.callCount).toBe(1);
	expect(prototype.hookFn.calledWithExactly('gulp', 'options')).toBe(true);
});

test('_registerHookModule should register hook or log appropriate log messages', () => {
	gutil.log = sinon.spy();

	prototype._registerHookModule('non-existent-module');

	expect(gutil.log.calledWithMatch('There was an issue registering')).toBe(
		true
	);
	expect(gutil.log.callCount).toBe(1);

	// eslint-disable-next-line liferay/no-dynamic-require
	require(path.join(__dirname, 'fixtures', 'hook_modules', 'hook-module-1'));

	prototype.gulp = {
		hook: sinon.spy(),
	};

	prototype._registerHookModule(
		path.join(__dirname, 'fixtures', 'hook_modules', 'hook-module-1')
	);

	expect(prototype.gulp.hook.calledWith('before:build')).toBe(true);
	expect(prototype.gulp.hook.callCount).toBe(1);

	gutil.log.resetHistory();

	prototype._registerHookModule(
		path.join(__dirname, 'fixtures', 'hook_modules', 'hook-module-3')
	);

	expect(
		gutil.log.calledWithMatch(
			'does not return a function. All hook modules must return a function.'
		)
	).toBe(true);
	expect(gutil.log.callCount).toBe(1);
});

test('_registerHookModule should pass correct arguments to hook modules', () => {
	var hookModulePath = path.join(
		__dirname,
		'fixtures',
		'hook_modules',
		'hook-module-4'
	);

	// eslint-disable-next-line liferay/no-dynamic-require
	var moduleHook = require(hookModulePath)().resetHistory();

	prototype.gulp = 'gulp';
	prototype.options = 'options';

	prototype._registerHookModule(hookModulePath);

	expect(moduleHook.calledWithExactly('gulp', 'options')).toBe(true);
	expect(moduleHook.callCount).toBe(1);
});

test('_registerHookModules should accept single or multiple hook modules and register them', () => {
	var hookModule1Path = path.join(
		__dirname,
		'fixtures',
		'hook_modules',
		'hook-module-1'
	);
	var hookModule2Path = path.join(
		__dirname,
		'fixtures',
		'hook_modules',
		'hook-module-2'
	);
	var hookModule3Path = path.join(
		__dirname,
		'fixtures',
		'hook_modules',
		'hook-module-3'
	);

	prototype._registerHookModule = sinon.spy();
	prototype.hookModules = hookModule1Path;

	prototype._registerHookModules();

	expect(prototype._registerHookModule.calledWithMatch(hookModule1Path)).toBe(
		true
	);
	expect(prototype._registerHookModule.callCount).toBe(1);

	prototype._registerHookModule = sinon.spy();
	prototype.hookModules = [hookModule1Path, hookModule2Path, hookModule3Path];

	prototype._registerHookModules();

	expect(
		prototype._registerHookModule.getCall(0).calledWith(hookModule1Path)
	).toBe(true);
	expect(
		prototype._registerHookModule.getCall(1).calledWith(hookModule2Path)
	).toBe(true);
	expect(
		prototype._registerHookModule.getCall(2).calledWith(hookModule3Path)
	).toBe(true);
	expect(prototype._registerHookModule.callCount).toBe(3);
});

test('_registerHooks should create gulp.hook function that adds hook to hooks object', () => {
	prototype.gulp = new Gulp();

	prototype._registerHooks();

	expect(_.isFunction(prototype.gulp.hook)).toBe(true);

	prototype.hooks = {};

	prototype.gulp.hook('hook1', _.noop);
	prototype.gulp.hook('hook2', _.noop);
	prototype.gulp.hook('hook2', _.noop);

	expect(prototype.hooks.hook1).toEqual([_.noop]);
	expect(prototype.hooks.hook2).toEqual([_.noop, _.noop]);
});
