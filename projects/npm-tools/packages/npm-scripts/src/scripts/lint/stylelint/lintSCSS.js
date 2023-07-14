/**
 * SPDX-FileCopyrightText: © 2019 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: BSD-3-Clause
 */

const fs = require('fs');
const path = require('path');
const stylelint = require('stylelint');

const getMergedConfig = require('../../../utils/getMergedConfig');

async function lintSCSS(source, onReport, options = {}) {
	const {filePath, fix, quiet} = options;

	const messages = [];

	let errorCount = 0;
	let warningCount = 0;

	// These two are here for symmetry with ESLint; however, stylelint
	// doesn't tell us which problems are autofixable and there is no
	// totally reliable way to guess, so these counts will always be
	// (possibly innaccurately) zero.

	const fixableErrorCount = 0;
	const fixableWarningCount = 0;

	const config = getMergedConfig('stylelint');

	const plugins = path.resolve(__dirname, 'plugins');

	fs.readdirSync(plugins).forEach((plugin) => {
		if (/^([a-z]+-)*[a-z]+\.js$/.test(plugin)) {
			const name = path.basename(plugin, path.extname(plugin));

			config.plugins.push(path.join(plugins, name));
		}
	});

	const {output, results} = await stylelint.lint({
		code: source,
		codeFilename: filePath,
		config,

		// Beware: if `fix` is true, stylelint will return the autofixed
		// source as `output`; when false, it will return an object
		// containing non-source metadata instead.

		fix,

		syntax: path.extname(filePath).replace('.', ''),
	});

	results.forEach((result) => {

		// - "warnings" array contains both errors and warnings.
		// - "errored" is true if at least one problem of
		//   severity "error" is present.

		if (result.errored || (result.warnings.length && !quiet)) {
			messages.push(
				...result.warnings.map(
					({column, line, rule, severity, text}) => {
						if (severity === 'error') {
							errorCount++;
						}
						else if (quiet) {

							// In quiet mode, we only report errors, not warnings.

							return;
						}
						else {
							warningCount++;
						}

						return {
							column,

							// fix,

							line,
							message: text,
							ruleId: rule,
							severity: severity === 'error' ? 2 : 1,
						};
					}
				)
			);
		}
	});

	// Ensure trailing newline, matching Prettier's convention.

	source = fix ? (output.endsWith('\n') ? output : `${output}\n`) : source;

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
}

module.exports = lintSCSS;
