/**
 * SPDX-FileCopyrightText: © 2017 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: MIT
 */

'use strict';

const fs = require('fs-extra');
const {Gulp} = require('gulp');
const {
	default: FilePath,
} = require('liferay-npm-build-tools-common/lib/file-path');
const path = require('path');
const sinon = require('sinon');

const project = require('../../lib/project');
const {cleanTempPlugin, setupTempPlugin} = require('../../lib/test/util');
const {getArgv} = require('../../lib/util');
const {registerTasks} = require('../index');

let deployPath;
let gulp;
let tempPlugin;

beforeEach(() => {
	gulp = new Gulp();

	tempPlugin = setupTempPlugin({
		init: () => {},
		namespace: 'plugin',
		pluginName: 'test-plugin-layouttpl',
		version: '7.0',
	});

	deployPath = path.join(tempPlugin.tempPath, '..', 'appserver', 'deploy');
});

afterEach(() => {
	cleanTempPlugin(tempPlugin);
	fs.removeSync(deployPath);
});

test('registerTasks should invoke extension functions', done => {
	var extFunction = function(options) {
		expect(options).toEqual({
			argv: getArgv(),
			distName: 'test-plugin-layouttpl',
			extensions: [extFunction],
			gulp,
			pathDist: new FilePath('./dist'),
			rootDir: new FilePath('./docroot'),
			storeConfig: {
				name: 'LiferayPlugin',
				path: 'liferay-plugin.json',
			},
		});

		done();
	};

	registerTasks({
		extensions: extFunction,
		gulp,
	});
});

test('registerTasks should accept array of extension function', done => {
	var extFunction = function(options) {
		expect(options.gulp).toBe(gulp);

		done();
	};

	registerTasks({
		extensions: [extFunction],
		gulp,
	});
});

test('registerTasks should register hooks', done => {
	var hookSpy = sinon.spy();

	var hookFn = function(gulp) {
		gulp.hook('before:plugin:war', cb => {
			hookSpy('before:plugin:war');

			cb();
		});

		gulp.hook('after:plugin:war', cb => {
			hookSpy('after:plugin:war');

			cb();
		});

		gulp.hook('after:plugin:deploy', cb => {
			hookSpy('after:plugin:deploy');

			cb();
		});
	};

	registerTasks({
		gulp,
		hookFn,
	});

	project.store.deployPath = deployPath;

	project.gulp.runSequence('plugin:war', 'plugin:deploy', () => {
		expect(path.join(deployPath, 'test-plugin-layouttpl.war')).toBeFile();

		expect(project.store.deployed).toBe(true);

		expect(hookSpy.getCall(0).calledWith('before:plugin:war')).toBe(true);
		expect(hookSpy.getCall(1).calledWith('after:plugin:war')).toBe(true);
		expect(hookSpy.getCall(2).calledWith('after:plugin:deploy')).toBe(true);

		done();
	});
});

test('registerTasks should register hooks for extension tasks', done => {
	var hookSpy = sinon.spy();

	var hookFn = function(gulp) {
		gulp.hook('before:plugin:war', cb => {
			hookSpy('before:plugin:war');

			cb();
		});

		gulp.hook('after:my-custom:task', cb => {
			hookSpy('after:my-custom:task');

			cb();
		});
	};

	registerTasks({
		extensions(options) {
			options.gulp.task('my-custom:task', cb => {
				hookSpy('my-custom:task');

				cb();
			});
		},
		gulp,
		hookFn,
	});

	project.gulp.runSequence('plugin:war', 'my-custom:task', () => {
		expect(hookSpy.getCall(0).calledWith('before:plugin:war')).toBe(true);
		expect(hookSpy.getCall(1).calledWith('my-custom:task')).toBe(true);
		expect(hookSpy.getCall(2).calledWith('after:my-custom:task')).toBe(
			true
		);

		done();
	});
});

test('registerTasks should overwrite task', done => {
	var hookSpy = sinon.spy();

	var hookFn = function(gulp) {
		gulp.hook('before:plugin:war', cb => {
			hookSpy('before:plugin:war');

			cb();
		});

		gulp.task('plugin:war', cb => {
			hookSpy('plugin:war');

			cb();
		});
	};

	registerTasks({
		gulp,
		hookFn,
	});

	project.gulp.runSequence('plugin:war', () => {
		expect(hookSpy.getCall(0).calledWith('before:plugin:war')).toBe(true);
		expect(hookSpy.getCall(1).calledWith('plugin:war')).toBe(true);

		done();
	});
});

test('registerTasks should use distName as template if delimiters are present', done => {
	registerTasks({
		distName: '${name}-${version}-${liferayPlugin.version}',
		extensions(options) {
			expect(options.distName).toBe('test-plugin-layouttpl-1.2.3-7.0');

			done();
		},
		gulp,
	});
});
