/**
 * SPDX-FileCopyrightText: © 2019 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: BSD-3-Clause
 */

const fs = require('fs');

const reporter = require('../src');

jest.mock('fs');

const failedTestReport = {
	numFailedTests: 1,
	numTotalTests: 1,
	startTime: 1000,
	testResults: [
		{
			failureMessage: null,
			testFilePath:
				'/foo/bar/liferay-portal/modules/apps/test-module/bar/Baz.js',
			testResults: [
				{
					duration: 46,

					// copied from a failed jest test

					failureMessages: [
						'Error: \u001b[2mexpect(\u001b[22m\u001b[31mreceived\u001b[39m\u001b[2m).toBe(\u001b[22m\u001b[32mexpected\u001b[39m\u001b[2m) // Object.is equality\u001b[22m\n\nExpected: \u001b[32mfalse\u001b[39m\nReceived: \u001b[31mtrue\u001b[39m\n    at Object.<anonymous> (/Users/bryceosterhaus/liferay/repos/liferay-portal/modules/apps/dynamic-data-mapping/dynamic-data-mapping-form-field-type/test/metal/js/KeyValue/KeyValue.es.js:70:18)\n    at Object.asyncFn (/Users/bryceosterhaus/liferay/repos/liferay-portal/modules/apps/dynamic-data-mapping/dynamic-data-mapping-form-field-type/node_modules/jest-jasmine2/build/jasmine_async.js:108:37)\n    at resolve (/Users/bryceosterhaus/liferay/repos/liferay-portal/modules/apps/dynamic-data-mapping/dynamic-data-mapping-form-field-type/node_modules/jest-jasmine2/build/queue_runner.js:56:12)\n    at new Promise (<anonymous>)\n    at mapper (/Users/bryceosterhaus/liferay/repos/liferay-portal/modules/apps/dynamic-data-mapping/dynamic-data-mapping-form-field-type/node_modules/jest-jasmine2/build/queue_runner.js:43:19)\n    at promise.then (/Users/bryceosterhaus/liferay/repos/liferay-portal/modules/apps/dynamic-data-mapping/dynamic-data-mapping-form-field-type/node_modules/jest-jasmine2/build/queue_runner.js:87:41)\n    at <anonymous>\n    at process._tickCallback (internal/process/next_tick.js:182:7)',
					],
					fullName: 'Field DocumentLibrary should not be readOnly',
				},
			],
		},
	],
};

const failedTestSuite = {
	numFailedTests: 0,
	numTotalTests: 1,
	startTime: 1000,
	testResults: [
		{
			failureMessage: 'Test Suite Failed to run',
			testFilePath:
				'/foo/bar/liferay-portal/modules/apps/test-module/bar/Baz.js',
			testResults: [],
		},
	],
};

const passedTestReport = {
	numFailedTests: 0,
	numTotalTests: 1,
	startTime: 1000,
	testResults: [
		{
			failureMessage: null,
			testFilePath:
				'/foo/bar/liferay-portal/modules/apps/test-module/bar/Baz.js',
			testResults: [
				{
					duration: 46,
					failureMessages: [],
					fullName: 'Field DocumentLibrary should not be readOnly',
				},
			],
		},
	],
};

describe('@liferay/jest-junit-reporter', () => {
	beforeEach(() => {
		jest.resetAllMocks();

		// Prevent user-specific context from appearing in snapshots.

		jest.spyOn(process, 'cwd').mockImplementation(() => 'reporter-tests');
	});

	afterEach(() => {
		jest.restoreAllMocks();
	});

	it('writes a file for a passing test', () => {
		reporter(passedTestReport);

		const xmlWritten = fs.writeFileSync.mock.calls[0][1];

		expect(xmlWritten).toMatchSnapshot();
	});

	it('writes a file for a failing test', () => {
		reporter(failedTestReport);

		const xmlWritten = fs.writeFileSync.mock.calls[0][1];

		expect(xmlWritten).toMatchSnapshot();
	});

	it('writes a file for a failing test suite', () => {
		reporter(failedTestSuite);

		const xmlWritten = fs.writeFileSync.mock.calls[0][1];

		expect(xmlWritten).toMatchSnapshot();
	});
});
