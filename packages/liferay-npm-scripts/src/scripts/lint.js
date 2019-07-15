/**
 * © 2019 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: BSD-3-Clause
 */

const eslint = require('eslint');
const fs = require('fs');
const path = require('path');

const expandGlobs = require('../utils/expandGlobs');
const filterChangedFiles = require('../utils/filterChangedFiles');
const filterGlobs = require('../utils/filterGlobs');
const findRoot = require('../utils/findRoot');
const getMergedConfig = require('../utils/getMergedConfig');
const log = require('../utils/log');
const preprocessGlob = require('../utils/preprocessGlob');
const readIgnoreFile = require('../utils/readIgnoreFile');
const {SpawnError} = require('../utils/spawnSync');

const DEFAULT_OPTIONS = {
	fix: false,
	quiet: false
};

/**
 * File extensions that ESLint can process.
 */
const EXTENSIONS = ['.js', '.ts', '.tsx'];

/**
 * ESLint wrapper.
 */
function lint(options = {}) {
	const {fix, quiet} = {
		...DEFAULT_OPTIONS,
		...options
	};

	const unfilteredGlobs = fix
		? getMergedConfig('npmscripts', 'fix')
		: getMergedConfig('npmscripts', 'check');

	const globs = filterGlobs(unfilteredGlobs, ...EXTENSIONS);

	if (!globs.length) {
		const extensions = EXTENSIONS.join(', ');

		log(
			`No globs applicable to ${extensions} files specified: globs can be configured via npmscripts.config.js`
		);

		return;
	}

	const root = findRoot();
	const ignoreFile = path.join(root || '.', '.eslintignore');

	const ignores = fs.existsSync(ignoreFile) ? readIgnoreFile(ignoreFile) : [];

	// Turn "{src,test}/*" into ["src/*", "test/*"]:
	const preprocessedGlobs = [];

	globs.forEach(glob => preprocessedGlobs.push(...preprocessGlob(glob)));

	const expandedGlobs = expandGlobs(preprocessedGlobs, ignores);

	const paths = filterChangedFiles(expandedGlobs);

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

	const report = cli.executeOnFiles(paths);

	let fixed = 0;

	if (fix) {
		fixed = report.results.reduce((count, result) => {
			return result.output ? count + 1 : count;
		}, 0);

		// This is what actually writes to the file-system.
		CLIEngine.outputFixes(report);
	}

	// TODO: could pass "junit" in CI
	const formatter = cli.getFormatter();

	if (quiet) {
		const errors = CLIEngine.getErrorResults(report.results);

		log(formatter(errors));
	} else {
		log(formatter(report.results));
	}

	const plural = (word, count) => (count === 1 ? word : `${word}s`);

	const summary = [
		`ESLint checked ${paths.length} ${plural('file', paths.length)}`,
		`found ${report.errorCount} ${plural('error', report.errorCount)}`,
		`found ${report.warningCount} ${plural('warning', report.warningCount)}`
	];

	const autofixable = report.fixableWarningCount + report.fixableErrorCount;

	if (autofixable) {
		summary.push(
			`${autofixable} ${plural(
				'issue',
				autofixable
			)} potentially fixable with lint:fix`
		);
	}

	if (fixed) {
		summary.push(`fixed issues in ${fixed} ${plural('file', fixed)}`);
	}

	if (report.errorCount) {
		throw new SpawnError(summary.join(', '));
	} else {
		log(summary.join(', '));
	}
}

module.exports = lint;
