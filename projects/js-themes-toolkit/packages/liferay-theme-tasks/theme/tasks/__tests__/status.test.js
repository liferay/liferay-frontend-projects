/**
 * SPDX-FileCopyrightText: © 2017 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: MIT
 */

const {Gulp} = require('gulp');
const sinon = require('sinon');

const project = require('../../../lib/project');
const {cleanTempTheme, setupTempTheme} = require('../../../lib/test/util');
const {registerTasks} = require('../../index');

let tempTheme;

beforeEach(() => {
	tempTheme = setupTempTheme({
		init: () => registerTasks({gulp: new Gulp()}),
		namespace: 'status_task',
	});
});

afterEach(() => {
	cleanTempTheme(tempTheme);
});

it('status task should print base theme/themelet information', done => {
	const savedConsole = global.console;

	global.console = {
		log: sinon.spy(),
	};

	project.gulp.runSequence('status', () => {
		const calls = global.console.log.getCalls();

		global.console = savedConsole;

		expect(calls).toHaveLength(1);
		expect(calls[0].args).toMatchSnapshot();

		done();
	});
});
