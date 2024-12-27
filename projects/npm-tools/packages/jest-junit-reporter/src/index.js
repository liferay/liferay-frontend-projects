/**
 * SPDX-FileCopyrightText: © 2019 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: BSD-3-Clause
 */

'use strict';

const fs = require('fs');
const path = require('path');
const stripAnsi = require('strip-ansi');
const xml = require('xml');

const NEW_LINE = '\n';

const RELATIVE_APPS_DIR = '/modules/apps/';

const APPS_DIR = new RegExp('/.+' + RELATIVE_APPS_DIR, 'gm');

function formatDirectoryPath(dirPath) {
	return dirPath.replace(APPS_DIR, '').replace(/\//g, '.');
}

module.exports = (report) => {
	const generalMetrics = {
		_attr: {
			errors: 0,
			failures: report.numFailedTests,
			hostname: '',
			id: 0,
			name: 'Jest',
			package: formatDirectoryPath(process.cwd()),
			skipped: 0,
			tests: report.numTotalTests,
			time: 0,
			timestamp: report.startTime,
		},
	};

	const testResults = report.testResults
		.reduce((acc, suite) => {
			if (suite.testResults.length) {
				acc.push(
					...suite.testResults.map((test) => ({
						...test,
						testFilePath: suite.testFilePath,
					}))
				);
			}
			else if (suite.failureMessage) {
				acc.push({
					duration: 0,
					failureMessages: [suite.failureMessage],
					fullName: suite.testFilePath,
					testFilePath: suite.testFilePath,
				});
			}

			return acc;
		}, [])
		.map((testCase) => {
			const results = [
				{
					_attr: {
						classname: formatDirectoryPath(
							path.dirname(testCase.testFilePath)
						),
						name: testCase.fullName,
						time: testCase.duration / 1000,
					},
				},
			];

			if (testCase.failureMessages && testCase.failureMessages.length) {
				const failureMessageArr = testCase.failureMessages.map(
					(failureMessage) =>
						failureMessage
							.split(NEW_LINE)
							.map((message) =>
								stripAnsi(message).replace(APPS_DIR, '')
							)
				);

				results.push({
					failure: [
						{
							_attr: {
								message: failureMessageArr[0][0],
							},
						},
						failureMessageArr
							.map((failureMessage) =>
								failureMessage.join(NEW_LINE)
							)
							.join(NEW_LINE),
					],
				});
			}

			return {
				testcase: results,
			};
		});

	fs.writeFileSync(
		'TEST-frontend-js.xml',
		xml(
			{testsuite: [generalMetrics, ...testResults]},
			{declaration: true, indent: '  '}
		)
	);

	return report;
};
