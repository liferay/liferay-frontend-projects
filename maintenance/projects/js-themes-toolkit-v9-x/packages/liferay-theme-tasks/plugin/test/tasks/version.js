/**
 * SPDX-FileCopyrightText: © 2017 Liferay, Inc. <https://liferay.com>
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
	'version-task',
	'test-plugin-layouttpl'
);

var initCwd = process.cwd();
var registerTasks;
var runSequence;

beforeAll((done) => {
	fs.copy(
		path.join(__dirname, '../fixtures/plugins/test-plugin-layouttpl'),
		tempPath,
		(err) => {
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

afterAll((done) => {
	del([path.join(tempPath, '**')], {
		force: true,
	}).then(() => {
		process.chdir(initCwd);

		done();
	});
});

test('plugin:version should add package.json version to liferay-plugin-package.properties', (done) => {
	runSequence('plugin:version', () => {
		assert.fileContentMatch(
			path.join(
				tempPath,
				'docroot/WEB-INF/liferay-plugin-package.properties'
			),
			/module-version=1\.2\.3/
		);

		done();
	});
});

test('plugin:version should add package.json version to liferay-plugin-package.properties', (done) => {
	var pkgPath = path.join(tempPath, 'package.json');

	// eslint-disable-next-line @liferay/no-dynamic-require
	var pkg = require(pkgPath);

	pkg.version = '1.2.4';

	fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, '\t'));

	runSequence('plugin:version', () => {
		assert.fileContentMatch(
			path.join(
				tempPath,
				'docroot/WEB-INF/liferay-plugin-package.properties'
			),
			/module-version=1\.2\.4/
		);

		done();
	});
});
