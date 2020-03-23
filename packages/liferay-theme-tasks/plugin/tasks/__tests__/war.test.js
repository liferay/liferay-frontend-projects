/**
 * SPDX-FileCopyrightText: © 2017 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: MIT
 */

'use strict';

var {Gulp} = require('gulp');
var path = require('path');

const project = require('../../../lib/project');
const {cleanTempPlugin, setupTempPlugin} = require('../../../lib/test/util');
const {registerTasks} = require('../../index');

let tempPlugin;

beforeEach(() => {
	tempPlugin = setupTempPlugin({
		init: () => {},
		namespace: 'war-task',
		pluginName: 'test-plugin-layouttpl',
		version: '7.0',
	});
});

afterEach(() => {
	cleanTempPlugin(tempPlugin);
});

test('plugin:war should build war file', done => {
	registerTasks({
		gulp: new Gulp(),
	});

	project.gulp.runSequence('plugin:war', () => {
		expect(
			path.join(tempPlugin.tempPath, 'dist', 'test-plugin-layouttpl.war')
		).toBeFile();

		done();
	});
});

test('plugin:war should use name for war file and pathDist for alternative dist location', done => {
	registerTasks({
		distName: 'my-plugin-name',
		gulp: new Gulp(),
		pathDist: 'dist_alternative',
	});

	project.gulp.runSequence('plugin:war', () => {
		expect(
			path.join(
				tempPlugin.tempPath,
				'dist_alternative',
				'my-plugin-name.war'
			)
		).toBeFile();

		done();
	});
});
