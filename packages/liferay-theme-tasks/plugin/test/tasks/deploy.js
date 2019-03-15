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
	'deploy-task',
	'test-plugin-layouttpl'
);

var deployPath = path.join(tempPath, '../appserver/deploy');

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

test('deploy task should deploy war file to specified appserver', function(done) {
	runSequence('deploy', function() {
		assert.isFile(path.join(deployPath, 'test-plugin-layouttpl.war'));

		expect(gulp.storage.get('deployed')).toBe(true);

		done();
	});
});
