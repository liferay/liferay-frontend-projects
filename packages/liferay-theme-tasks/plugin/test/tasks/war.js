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

var gulp = new Gulp();

chai.use(require('chai-fs'));

var assert = chai.assert;

var tempPath = path.join(
	os.tmpdir(),
	'liferay-plugin-tasks',
	'war-task',
	'test-plugin-layouttpl'
);

var initCwd = process.cwd();
var registerTasks;
var runSequence;

beforeAll(function(done) {
	fs.copy(
		path.join(__dirname, '../fixtures/plugins/test-plugin-layouttpl'),
		tempPath,
		function(err) {
			if (err) {
				throw err;
			}

			process.chdir(tempPath);

			registerTasks = require('../../index').registerTasks;

			registerTasks({
				gulp,
			});

			runSequence = require('run-sequence').use(gulp);

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

test('plugin:war should build war file', function(done) {
	runSequence('plugin:war', function() {
		assert.isFile(path.join(tempPath, 'dist', 'test-plugin-layouttpl.war'));

		done();
	});
});

test('plugin:war should use name for war file and pathDist for alternative dist location', function(done) {
	gulp = new Gulp();

	registerTasks({
		distName: 'my-plugin-name',
		gulp,
		pathDist: 'dist_alternative',
	});

	runSequence = require('run-sequence').use(gulp);

	runSequence('plugin:war', function() {
		assert.isFile(
			path.join(tempPath, 'dist_alternative', 'my-plugin-name.war')
		);

		done();
	});
});
