/**
 * SPDX-FileCopyrightText: © 2019 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: BSD-3-Clause
 */

const eslint = require('eslint');
const fs = require('fs');
const path = require('path');

const isJSP = require('../jsp/isJSP');
const lintJSP = require('../jsp/lintJSP');
const color = require('../utils/color');
const getMergedConfig = require('../utils/getMergedConfig');
const getPaths = require('../utils/getPaths');
const inCurrentWorkingDirectory = require('../utils/inCurrentWorkingDirectory');
const log = require('../utils/log');
const resolvePluginsRelativeTo = require('../utils/resolveEslintPluginsRelativeTo');
const {SpawnError} = require('../utils/spawnSync');
const isSCSS = require('./lint/stylelint/isSCSS');
const lintSCSS = require('./lint/stylelint/lintSCSS');

const DEFAULT_OPTIONS = {
	fix: false,
	quiet: false,
};

/**
 * File extensions that we can process, either:
 *
 * - via ESLint (natively); or:
 * - via our `lintJSP()` wrapper; or:
 * - via stylelint (natively).
 */
const EXTENSIONS = {
	css: ['.css'],
	js: ['.js', '.ts', '.tsx'],
	jsp: ['.jsp', '.jspf'],
	scss: ['.scss'],
};

const IGNORE_FILE = '.eslintignore';

/**
 * ESLint (etc) wrapper.
 */
async function lint(options = {}) {
	await inCurrentWorkingDirectory(async () => {
		const {fix, quiet} = {
			...DEFAULT_OPTIONS,
			...options,
		};

		const globs = fix
			? getMergedConfig('npmscripts', 'fix')
			: getMergedConfig('npmscripts', 'check');

		const extensions = [].concat(...Object.values(EXTENSIONS));

		const paths = getPaths(globs, extensions, IGNORE_FILE);

		if (!paths.length) {
			return;
		}

		const config = getMergedConfig('eslint');

		const CLIEngine = eslint.CLIEngine;

		const cli = new CLIEngine({
			baseConfig: config,

			// Note that "fix: true" here does not actually write to the filesystem
			// (that happens below).
			//
			// - "fix: true": means fixes are not reported in the list of problems;
			//   results with possible fixes have an "output" property.
			// - "fix: false": means that they are reported; results with possible
			//   fixes do not have an "output" property, but
			//   `report.fixableErrorCount` and `report.fixableWarningCount` will be
			//   set.

			fix,

			// Avoid spurious warnings of the form, "File ignored by
			// default. Use a negated ignore pattern ... to override"

			ignorePattern: '!*',
			resolvePluginsRelativeTo,
		});

		const {default: jsPaths, jspPaths, scssPaths} = partitionArray(paths, {
			jspPaths: isJSP,
			scssPaths: isSCSS,
		});

		let report;

		if (jsPaths.length) {
			report = cli.executeOnFiles(jsPaths);

			if (fix && jsPaths.length) {

				// This is what actually writes to the file-system.

				CLIEngine.outputFixes(report);
			}
		}
		else {
			report = {results: []};
		}

		for (const [paths, linter] of [
			[jspPaths, lintJSP],
			[scssPaths, lintSCSS],
		]) {
			for (const filePath of paths) {

				// TODO: non-sync version to make use of I/O concurrency

				const contents = fs.readFileSync(filePath, 'utf8');

				try {
					const updated = await linter(
						contents,
						(result) => {
							report.results.push({
								...result,
								filePath: path.resolve(filePath),
							});
						},
						{filePath, fix, quiet}
					);

					if (fix && updated !== contents) {
						fs.writeFileSync(filePath, updated);
					}
				}
				catch (error) {
					log(error);
				}
			}
		}

		// In `quiet` mode, keep only errors.
		// Otherwise keep both errors and warnings.
		// Filter out everything else.

		const results = (report.results || [])
			.map((result) => {
				const messages = result.messages.filter((message) => {
					return quiet ? message.severity === 2 : true;
				});

				if (!result.messages.length) {
					return null;
				}

				return {
					...result,
					messages,
				};
			})
			.filter(Boolean);

		log(formatter(results));

		if (results.length) {
			throw new SpawnError();
		}
	});
}

/**
 * @see https://codepoints.net/U+2716?lang=en
 */
const HEAVY_MULTIPLICATION_X = '\u2716';

/**
 * Replacement for ESLint's `CLIEngine.getFormatter()`, because it doesn't know
 * how to print results related to JS extracted from JSP.
 */
function formatter(results) {
	let errors = 0;
	let fixableErrorCount = 0;
	let fixableWarningCount = 0;
	let output = '';
	let warnings = 0;

	results.forEach((result) => {
		output += color.UNDERLINE + result.filePath + color.RESET + '\n';

		result.messages.forEach(
			({column, fix, line, message, ruleId, severity}) => {
				if (severity === 2) {
					errors++;

					if (fix) {
						fixableErrorCount++;
					}
				}
				else {
					warnings++;

					if (fix) {
						fixableWarningCount++;
					}
				}

				const type =
					(severity === 2
						? color.RED + 'error'
						: color.YELLOW + 'warning') + color.RESET;

				const label = ruleId || 'syntax-error';

				output += `  ${line}:${column}  ${type}  ${message}  ${label}\n`;
			}
		);

		output += '\n';
	});

	const total = errors + warnings;

	if (total) {
		const summary = [
			color.BOLD,
			errors ? color.RED : color.YELLOW,
			HEAVY_MULTIPLICATION_X,
			' ',
			pluralize('problem', total),
			' ',
			`(${pluralize('error', errors)}, `,
			`${pluralize('warning', warnings)})`,
			color.RESET,
		];

		if (fixableErrorCount || fixableWarningCount) {
			summary.push(
				'\n',
				color.BOLD,
				errors ? color.RED : color.YELLOW,
				'  ',
				pluralize('error', fixableErrorCount),
				' and ',
				pluralize('warning', fixableWarningCount),
				' potentially fixable with the `--fix` option.',
				color.RESET
			);
		}

		output += summary.join('');
	}

	return output;
}

/**
 * Partitions `array` by passing each element to the supplied
 * `predicates` functions. For each path, the search stops as soon as a
 * predicate match occurs; if no match is found the path is added to the
 * "default".
 */
function partitionArray(array, predicates) {
	const results = {
		default: [],
	};

	Object.keys(predicates).forEach((key) => {
		results[key] = [];
	});

	array.forEach((item) => {
		let matched = false;

		for (const [key, predicate] of Object.entries(predicates)) {
			if (predicate(item)) {
				results[key].push(item);

				matched = true;

				break;
			}
		}

		if (!matched) {
			results.default.push(item);
		}
	});

	return results;
}

function pluralize(word, count) {
	return `${count} ${word}${count === 1 ? '' : 's'}`;
}

module.exports = lint;
