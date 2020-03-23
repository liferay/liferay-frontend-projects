/**
 * SPDX-FileCopyrightText: © 2017 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: MIT
 */

'use strict';

const {Gulp} = require('gulp');
const _ = require('lodash');

const project = require('../../../lib/project');
const {cleanTempPlugin, setupTempPlugin} = require('../../../lib/test/util');
const {registerTasks} = require('../../index');
const InitPrompt = require('../../prompts/init_prompt');

let tempPlugin;

beforeEach(() => {
	tempPlugin = setupTempPlugin({
		init: () => registerTasks({gulp: new Gulp()}),
		namespace: 'init-task',
		pluginName: 'test-plugin-layouttpl',
		version: '7.0',
	});
});

afterEach(() => {
	cleanTempPlugin(tempPlugin);
});

test('plugin:init should prompt user for appserver information', done => {
	const savedPrompt = InitPrompt.prompt;

	let promptCalled = false;

	InitPrompt.prompt = (config, cb) => {
		promptCalled = true;

		expect(config.store).toEqual(project.store);
		expect(_.endsWith(config.appServerPathDefault, 'tomcat')).toBe(true);

		cb();
	};

	project.gulp.runSequence('plugin:init', () => {
		expect(promptCalled).toBe(true);

		InitPrompt.prompt = savedPrompt;

		done();
	});
});
