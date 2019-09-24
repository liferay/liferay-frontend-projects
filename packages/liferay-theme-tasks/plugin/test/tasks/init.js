/**
 * © 2017 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: MIT
 */

'use strict';

var del = require('del');
var fs = require('fs-extra');
var {Gulp} = require('gulp');
var _ = require('lodash');
var os = require('os');
var path = require('path');
var sinon = require('sinon');

var gulp = new Gulp();

var tempPath = path.join(
	os.tmpdir(),
	'liferay-plugin-tasks',
	'init-task',
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

test('plugin:init should prompt user for appserver information', () => {
	var InitPrompt = require('../../lib/init_prompt');

	var _prompt = InitPrompt.prototype._prompt;

	InitPrompt.prototype._prompt = sinon.spy();

	runSequence('plugin:init', _.noop);

	expect(InitPrompt.prototype._prompt.calledOnce).toBe(true);

	var args = InitPrompt.prototype._prompt.getCall(0).args;

	expect(args[0].store).toEqual(gulp.storage);
	expect(_.endsWith(args[0].appServerPathDefault, 'tomcat')).toBe(true);

	InitPrompt.prototype._prompt = _prompt;
});
