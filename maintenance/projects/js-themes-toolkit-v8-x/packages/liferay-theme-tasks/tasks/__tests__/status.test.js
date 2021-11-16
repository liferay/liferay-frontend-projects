/**
 * SPDX-FileCopyrightText: © 2017 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: MIT
 */

const testUtil = require('../../test/util');

const initCwd = process.cwd();

let runSequence;

beforeEach(() => {
	testUtil.hideConsole();

	const config = testUtil.copyTempTheme({
		namespace: 'status_task',
		registerTasks: true,
	});

	runSequence = config.runSequence;
});

afterEach(() => {
	testUtil.cleanTempTheme('base-theme', '7.0', 'status_task', initCwd);

	testUtil.restoreConsole();
});

it('status task should print base theme/themelet information', (done) => {
	runSequence('status', done);
});
