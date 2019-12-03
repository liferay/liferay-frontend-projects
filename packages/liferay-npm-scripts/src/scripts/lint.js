/**
 * © 2019 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: BSD-3-Clause
 */

const eslint = require('eslint');
const fs = require('fs');
const path = require('path');

const isJSP = require('../jsp/isJSP');
const lintJSP = require('../jsp/lintJSP');
const getMergedConfig = require('../utils/getMergedConfig');
const getPaths = require('../utils/getPaths');
const log = require('../utils/log');
const {SpawnError} = require('../utils/spawnSync');

const DEFAULT_OPTIONS = {
	fix: false,
	quiet: false
};

/**
 * File extensions that ESLint can process, either natively, or via our
 * `lintJSP()` wrapper.
 */
const EXTENSIONS = ['.js', '.jsp', '.jspf', '.ts', '.tsx'];

const IGNORE_FILE = '.eslintignore';

/**
 * ESLint wrapper.
 */
function lint(options = {}) {
	const {fix, quiet} = {
		...DEFAULT_OPTIONS,
		...options
	};

	const globs = fix
		? getMergedConfig('npmscripts', 'fix')
		: getMergedConfig('npmscripts', 'check');

	const paths = getPaths(globs, EXTENSIONS, IGNORE_FILE);

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

	const [jspPaths, jsPaths] = partitionArray(paths, isJSP);

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

	jspPaths.forEach(filePath => {
		// TODO: non-sync version to make use of I/O concurrency
		const contents = fs.readFileSync(filePath, 'utf8');

		const updated = lintJSP(
			contents,
			result => {
				report.results.push({
					...result,
					filePath: path.resolve(filePath)
				});
			},
			{fix, quiet}
		);

		if (fix && updated !== contents) {
			fs.writeFileSync(filePath, updated);
		}
	});

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
	let warnings = 0;

	results.forEach(result => {
		log(color.UNDERLINE + result.filePath + color.RESET);

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

				log(`  ${line}:${column}  ${type}  ${message}  ${label}`);
			}
		);

		log('');
	});

	const total = errors + warnings;

	const summary = [
		color.BOLD,
		color.RED,
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
			color.RED,
			'  ',
			pluralize('error', fixableErrorCount),
			' and ',
			pluralize('warning', fixableWarningCount),
			' potentially fixable with the `--fix` option.',
			color.RESET
		);
	}

	return summary.join('');
}

/**
 * Partitions `array` by passing each element to the supplied `predicate`
 * function.
 *
 * Returns a tuple of two arrays containing the elements which did and did not
 * satisfy the predicate, respectively.
 */
function partitionArray(array, predicate) {
	const a = [];
	const b = [];

	array.forEach(item => {
		if (predicate(item)) {
			a.push(item);
		} else {
			b.push(item);
		}
	});

	return [a, b];
}

function pluralize(word, count) {
	return `${count} ${word}${count === 1 ? '' : 's'}`;
}

module.exports = lint;
