/**
 * © 2017 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: MIT
 */

'use strict';

var chai = require('chai');
var del = require('del');
var fs = require('fs-extra');
var Gulp = require('gulp').Gulp;
var os = require('os');
var path = require('path');
var sinon = require('sinon');

var {getArgv} = require('../../lib/util');

var gulp = new Gulp();

chai.use(require('chai-fs'));

var assert = chai.assert;

var tempPath = path.join(
	os.tmpdir(),
	'liferay-plugin-tasks',
	'test-plugin-layouttpl'
);

var deployPath = path.join(tempPath, '../appserver/deploy');

var initCwd = process.cwd();
var registerTasks;
var runSequence;

beforeAll(function(done) {
	fs.copy(
		path.join(__dirname, './fixtures/plugins/test-plugin-layouttpl'),
		tempPath,
		function(err) {
			if (err) {
				throw err;
			}

			process.chdir(tempPath);

			registerTasks = require('../index').registerTasks;

			registerTasks({
				gulp,
			});

			runSequence = require('run-sequence').use(gulp);

			var store = gulp.storage;

			store.set('deployPath', deployPath);

			fs.mkdirsSync(deployPath);

			done();
		}
	);
});

afterAll(function(done) {
	del([path.join(tempPath, '**')], {
		force: true,
	}).then(function() {
		process.chdir(initCwd);

		done();
	});
});

afterEach(function() {
	del.sync(path.join(deployPath, '**'), {
		force: true,
	});
});

test('registerTasks should invoke extension functions', function(done) {
	gulp = new Gulp();

	var extFunction = function(options) {
		expect(options).toEqual({
			argv: getArgv(),
			distName: 'test-plugin-layouttpl',
			extensions: [extFunction],
			gulp,
			pathDist: 'dist',
			rootDir: 'docroot',
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

test('registerTasks should accept array of extension function', function(done) {
	gulp = new Gulp();

	var extFunction = function(options) {
		expect(options.gulp).toBe(gulp);

		done();
	};

	registerTasks({
		extensions: [extFunction],
		gulp,
	});
});

test('registerTasks should register hooks', function(done) {
	gulp = new Gulp();

	var hookSpy = sinon.spy();

	var hookFn = function(gulp) {
		gulp.hook('before:plugin:war', function(cb) {
			hookSpy('before:plugin:war');

			cb();
		});

		gulp.hook('after:plugin:war', function(cb) {
			hookSpy('after:plugin:war');

			cb();
		});

		gulp.hook('after:plugin:deploy', function(cb) {
			hookSpy('after:plugin:deploy');

			cb();
		});
	};

	registerTasks({
		gulp,
		hookFn,
	});

	gulp.storage.set('deployPath', deployPath);

	runSequence = require('run-sequence').use(gulp);

	runSequence('plugin:war', 'plugin:deploy', function() {
		assert.isFile(path.join(deployPath, 'test-plugin-layouttpl.war'));

		expect(gulp.storage.get('deployed')).toBe(true);

		expect(hookSpy.getCall(0).calledWith('before:plugin:war')).toBe(true);
		expect(hookSpy.getCall(1).calledWith('after:plugin:war')).toBe(true);
		expect(hookSpy.getCall(2).calledWith('after:plugin:deploy')).toBe(true);

		done();
	});
});

test('registerTasks should register hooks for extension tasks', function(done) {
	gulp = new Gulp();

	var hookSpy = sinon.spy();

	var hookFn = function(gulp) {
		gulp.hook('before:plugin:war', function(cb) {
			hookSpy('before:plugin:war');

			cb();
		});

		gulp.hook('after:my-custom:task', function(cb) {
			hookSpy('after:my-custom:task');

			cb();
		});
	};

	registerTasks({
		extensions(options) {
			options.gulp.task('my-custom:task', function(cb) {
				hookSpy('my-custom:task');

				cb();
			});
		},
		gulp,
		hookFn,
	});

	runSequence = require('run-sequence').use(gulp);

	runSequence('plugin:war', 'my-custom:task', function() {
		expect(hookSpy.getCall(0).calledWith('before:plugin:war')).toBe(true);
		expect(hookSpy.getCall(1).calledWith('my-custom:task')).toBe(true);
		expect(hookSpy.getCall(2).calledWith('after:my-custom:task')).toBe(
			true
		);

		done();
	});
});

test('registerTasks should overwrite task', function(done) {
	gulp = new Gulp();

	var hookSpy = sinon.spy();

	var hookFn = function(gulp) {
		gulp.hook('before:plugin:war', function(cb) {
			hookSpy('before:plugin:war');

			cb();
		});

		gulp.task('plugin:war', function(cb) {
			hookSpy('plugin:war');

			cb();
		});
	};

	registerTasks({
		gulp,
		hookFn,
	});

	runSequence = require('run-sequence').use(gulp);

	runSequence('plugin:war', function() {
		expect(hookSpy.getCall(0).calledWith('before:plugin:war')).toBe(true);
		expect(hookSpy.getCall(1).calledWith('plugin:war')).toBe(true);

		done();
	});
});

test('registerTasks should use distName as template if delimiters are present', function(done) {
	gulp = new Gulp();

	registerTasks({
		distName: '${name}-${version}-${liferayPlugin.version}',
		extensions(options) {
			expect(options.distName).toBe('test-plugin-layouttpl-1.2.3-7.0');

			done();
		},
		gulp,
	});
});
