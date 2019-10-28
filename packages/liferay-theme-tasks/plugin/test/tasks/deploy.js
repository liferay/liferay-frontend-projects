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
	'deploy-task',
	'test-plugin-layouttpl'
);

var deployPath = path.join(tempPath, '../appserver/deploy');

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

			var store = gulp.storage;

			store.set('deployPath', deployPath);

			fs.mkdirsSync(deployPath);

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

afterEach(() => {
	del.sync(path.join(deployPath, '**'), {
		force: true,
	});
});

test('deploy task should deploy war file to specified appserver', done => {
	runSequence('deploy', () => {
		assert.isFile(path.join(deployPath, 'test-plugin-layouttpl.war'));

		expect(gulp.storage.get('deployed')).toBe(true);

		done();
	});
});
