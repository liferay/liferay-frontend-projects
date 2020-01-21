/**
 * © 2019 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: BSD-3-Clause
 */

const eslint = require('eslint');
const fs = require('fs');
const path = require('path');
const stylelint = require('stylelint');

const isJSP = require('../jsp/isJSP');
const lintJSP = require('../jsp/lintJSP');
const getMergedConfig = require('../utils/getMergedConfig');
const getPaths = require('../utils/getPaths');
const hasExtension = require('../utils/hasExtension');
const log = require('../utils/log');
const {SpawnError} = require('../utils/spawnSync');

const DEFAULT_OPTIONS = {
	fix: false,
	quiet: false
};

/**
 * File extensions that we can process, either:
 *
 * - via ESLint (natively); or:
 * - via our `lintJSP()` wrapper; or:
 * - via stylelint (natively).
 */
const EXTENSIONS = {
	js: new Set(['.js', '.ts', '.tsx']),
	jsp: new Set(['.jsp', '.jspf']),
	scss: new Set(['.scss'])
};

const IGNORE_FILE = '.eslintignore';

/**
 * ESLint (etc) wrapper.
 */
async function lint(options = {}) {
	const {fix, quiet} = {
		...DEFAULT_OPTIONS,
		...options
	};

	const globs = fix
		? getMergedConfig('npmscripts', 'fix')
		: getMergedConfig('npmscripts', 'check');

	const extensions = [].concat(
		...Object.values(EXTENSIONS).map(set => Array.from(set))
	);

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
		ignorePattern: '!*'
	});

	const {default: jsPaths, jspPaths, scssPaths} = partitionArray(paths, {
		jspPaths: isJSP,
		scssPaths: isSCSS
	});

	let report;

	if (jsPaths.length) {
		report = cli.executeOnFiles(jsPaths);

		if (fix && jsPaths.length) {
			// This is what actually writes to the file-system.
			CLIEngine.outputFixes(report);
		}
	} else {
		report = {results: []};
	}

	for (const [paths, linter] of [
		[jspPaths, lintJSP],
		[scssPaths, lintSCSS]
	]) {
		for (const filePath of paths) {
			// TODO: non-sync version to make use of I/O concurrency
			const contents = fs.readFileSync(filePath, 'utf8');

			try {
				const updated = await linter(
					contents,
					result => {
						report.results.push({
							...result,
							filePath: path.resolve(filePath)
						});
					},
					{filePath, fix, quiet}
				);

				if (fix && updated !== contents) {
					fs.writeFileSync(filePath, updated);
				}
			} catch (error) {
				log(error);
			}
		}
	}

	// In `quiet` mode, keep only errors.
	// Otherwise keep both errors and warnings.
	// Filter out everything else.
	const results = (report.results || [])
		.map(result => {
			const messages = result.messages.filter(message => {
				return quiet ? message.severity === 2 : true;
			});

			if (result.messages.length === 0) {
				return null;
			}

			return {
				...result,
				messages
			};
		})
		.filter(Boolean);

	log(formatter(results));

	if (results.length) {
		throw new SpawnError();
	}
}

function color(name) {
	if (process.stdout.isTTY) {
		return (
			{
				BOLD: '\x1b[1m',
				RED: '\x1b[31m',
				RESET: '\x1b[0m',
				UNDERLINE: '\x1b[4m',
				YELLOW: '\x1b[33m'
			}[name] || ''
		);
	} else {
		return '';
	}
}

color.BOLD = color('BOLD');
color.RED = color('RED');
color.RESET = color('RESET');
color.UNDERLINE = color('UNDERLINE');
color.YELLOW = color('YELLOW');

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

	results.forEach(result => {
		output += color.UNDERLINE + result.filePath + color.RESET + '\n';

		result.messages.forEach(
			({column, fix, line, message, ruleId, severity}) => {
				if (severity === 2) {
					errors++;

					if (fix) {
						fixableErrorCount++;
					}
				} else {
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
			color.RESET
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

function isSCSS(filePath) {
	return hasExtension(filePath, EXTENSIONS.scss);
}

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

	config.plugins.push(
		path.resolve(__dirname, 'lint/stylelint/plugins/no-block-comments')
	);

	const {output, results} = await stylelint.lint({
		code: source,
		codeFilename: filePath,
		config,

		// Beware: if `fix` is true, stylelint will return the autofixed
		// source as `output`; when false, it will return an object
		// containing non-source metadata instead.
		fix,

		syntax: 'scss'
	});

	results.forEach(result => {
		// - "warnings" array contains both errors and warnings.
		// - "errored" is true if at least one problem of
		//   severity "error" is present.
		if (result.errored || (result.warnings.length && !quiet)) {
			messages.push(
				...result.warnings.map(
					({column, line, rule, severity, text}) => {
						if (severity === 'error') {
							errorCount++;
						} else if (quiet) {
							// In quiet mode, we only report errors, not warnings.
							return;
						} else {
							warningCount++;
						}

						return {
							column,
							// fix,
							line,
							message: text,
							ruleId: rule,
							severity: severity === 'error' ? 2 : 1
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
			warningCount
		});
	}

	return source;
}

/**
 * Partitions `array` by passing each element to the supplied
 * `predicates` functions. For each path, the search stops as soon as a
 * predicate match occurs; if no match is found the path is added to the
 * "default".
 */
function partitionArray(array, predicates) {
	const results = {
		default: []
	};

	Object.keys(predicates).forEach(key => {
		results[key] = [];
	});

	array.forEach(item => {
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
