/**
 * SPDX-FileCopyrightText: © 2019 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: BSD-3-Clause
 */

const {Linter} = require('eslint');

const processJSP = require('./processJSP');

const linter = new Linter();

const rules = {
	'no-debugger': 'error',
	'no-extra-boolean-cast': 'error',
};

const SEVERITY = {
	/* eslint-disable sort-keys */
	ERROR: 2,
	WARNING: 1,
	OFF: 0,
	/* eslint-enable sort-keys */
};

/**
 * Lints the JSP `source` string and returns (a possibly fixed version
 * of) the string.
 *
 * Calls the `onReport` callback with a diagnostic object.
 *
 * Currently, the only lintable elements are script tags.
 */
function lintJSP(source, onReport, options = {}) {
	const {fix, quiet} = options;

	return processJSP(source, {
		onLint: (input) => {
			let messages;
			let output;

			if (fix) {
				({messages, output} = linter.verifyAndFix(input, {rules}));
			}
			else {
				messages = linter.verify(input, {rules});
				output = input;
			}

			let errorCount = 0;
			let fixableErrorCount = 0;
			let fixableWarningCount = 0;
			let warningCount = 0;

			messages = messages.filter((message) => {
				if (message.severity === SEVERITY.ERROR) {
					errorCount++;

					if (message.fix) {
						fixableErrorCount++;
					}
				}
				else if (quiet) {

					// In quiet mode, we only report errors, not warnings.

					return false;
				}
				else {
					warningCount++;

					if (message.fix) {
						fixableWarningCount++;
					}
				}

				return true;
			});

			// Ensure trailing newline, matching Prettier's convention.

			source = output.endsWith('\n') ? output : `${output}\n`;

			if (messages.length) {
				onReport({
					errorCount,
					fixableErrorCount,
					fixableWarningCount,
					messages,
					source,
					warningCount,
				});
			}

			return source;
		},
	});
}

module.exports = lintJSP;
