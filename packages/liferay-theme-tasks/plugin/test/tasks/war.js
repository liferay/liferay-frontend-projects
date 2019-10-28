/**
 * © 2017 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: MIT
 */

'use strict';

var chai = require('chai');
var chaiFs = require('chai-fs');
var del = require('del');
var fs = require('fs-extra');
var {Gulp} = require('gulp');
var os = require('os');
var path = require('path');

var gulp = new Gulp();

chai.use(chaiFs);

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

beforeAll(done => {
	fs.copy(
		path.join(__dirname, '../fixtures/plugins/test-plugin-layouttpl'),
		tempPath,
		err => {
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

afterAll(done => {
	del([path.join(tempPath, '**')], {
		force: true,
	}).then(() => {
		process.chdir(initCwd);

		done();
	});
});

test('plugin:war should build war file', done => {
	runSequence('plugin:war', () => {
		assert.isFile(path.join(tempPath, 'dist', 'test-plugin-layouttpl.war'));

		done();
	});
});

test('plugin:war should use name for war file and pathDist for alternative dist location', done => {
	gulp = new Gulp();

	registerTasks({
		distName: 'my-plugin-name',
		gulp,
		pathDist: 'dist_alternative',
	});

	runSequence = require('run-sequence').use(gulp);

	runSequence('plugin:war', () => {
		assert.isFile(
			path.join(tempPath, 'dist_alternative', 'my-plugin-name.war')
		);

		done();
	});
});
