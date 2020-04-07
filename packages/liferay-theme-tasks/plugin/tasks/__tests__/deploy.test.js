/**
 * SPDX-FileCopyrightText: © 2017 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: MIT
 */

'use strict';

const {Gulp} = require('gulp');
const path = require('path');

const project = require('../../../lib/project');
const {cleanTempPlugin, setupTempPlugin} = require('../../../lib/test/util');
const {registerTasks} = require('../../index');

let deployPath;
let tempPlugin;

beforeEach(() => {
	tempPlugin = setupTempPlugin({
		init: () =>
			registerTasks({
				gulp: new Gulp(),
			}),
		namespace: 'deploy-task',
		pluginName: 'test-plugin-layouttpl',
		version: '7.0',
	});

	deployPath = path.join(tempPlugin.tempPath, '..', 'appserver', 'deploy');

	const {store} = project;

	store.deployPath = deployPath;
});

afterEach(() => {
	cleanTempPlugin(tempPlugin);
});

test('deploy task should deploy war file to specified appserver', done => {
	project.gulp.runSequence('deploy', () => {
		expect(path.join(deployPath, 'test-plugin-layouttpl.war')).toBeFile();

		expect(project.store.deployed).toBe(true);

		done();
	});
});
